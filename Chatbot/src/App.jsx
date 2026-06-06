import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import './App.css';

// --- FIREBASE IMPORTS ---
import { auth, db } from './firebase'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function App() {
  // --- 🎨 THEME STATE ---
  const [isLightMode, setIsLightMode] = useState(false);

  // --- 🔐 AUTHENTICATION STATES ---
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authError, setAuthError] = useState("");

  // --- ☁️ CLOUD DATABASE STATES ---
  const [sessions, setSessions] = useState([]); 
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Input States
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [extractedPdfText, setExtractedPdfText] = useState("");
  
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null); // <-- ADD THIS LINE

  const activeSession = sessions.find(s => s.id === currentSessionId);
  const chatHistory = activeSession ? activeSession.history : [];

  // ==========================================
  // CLOUD DATABASE LOGIC
  // ==========================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().sessions?.length > 0) {
            setSessions(docSnap.data().sessions);
            setCurrentSessionId(docSnap.data().sessions[0].id);
          } else {
            const newId = Date.now().toString();
            setSessions([{ id: newId, title: "New Chat", history: [] }]);
            setCurrentSessionId(newId);
          }
        } catch (error) {
          console.error("Firebase Database Error:", error);
          const newId = Date.now().toString();
          setSessions([{ id: newId, title: "Offline Chat", history: [] }]);
          setCurrentSessionId(newId);
        }
      } else {
        setSessions([]);
        setCurrentSessionId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && sessions.length > 0) {
      setDoc(doc(db, "users", user.uid), { sessions: sessions });
    }
  }, [sessions, user]);

  // --- 🔐 LOGIN/SIGNUP LOGIC ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = () => signOut(auth);

  // --- 📂 SIDEBAR LOGIC ---
  const startNewChat = () => {
    const newSession = { id: Date.now().toString(), title: "New Chat", history: [] };
    setSessions([newSession, ...sessions]); 
    setCurrentSessionId(newSession.id);
    clearPdf();
    setInputText("");
  };

  const deleteSession = (idToDel, e) => {
    e.stopPropagation(); 
    const updatedSessions = sessions.filter(s => s.id !== idToDel);
    if (updatedSessions.length === 0) {
      const newSession = { id: Date.now().toString(), title: "New Chat", history: [] };
      setSessions([newSession]);
      setCurrentSessionId(newSession.id);
    } else {
      setSessions(updatedSessions);
      if (currentSessionId === idToDel) setCurrentSessionId(updatedSessions[0].id);
    }
  };

const toggleVoiceInput = () => {
    // 1. If we are already listening, shut the microphone off safely
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    // 2. Otherwise, boot the microphone up
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser does not support Voice Input. Please try Google Chrome.");
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; // Save it to memory so we can stop it later
    
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => setInputText((prev) => (prev ? `${prev} ${event.results[0][0].transcript}` : event.results[0][0].transcript));
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") return;
    setPdfName(file.name);
    setIsLoading(true);
    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: e.target.result });
        const pdf = await loadingTask.promise;
        let completeText = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          completeText += textContent.items.map(item => item.str).join(" ") + " ";
        }
        setExtractedPdfText(completeText);
      } catch (error) {
        alert("Failed to read the PDF content.");
        setPdfName("");
      } finally {
        setIsLoading(false);
      }
    };
    fileReader.readAsArrayBuffer(file);
  };

  const clearPdf = () => {
    setPdfName("");
    setExtractedPdfText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- 🤖 GEMINI API LOGIC ---
  async function generateAnswer() {
    if (!inputText.trim() && !extractedPdfText) return;
    const userQuery = inputText;
    const documentContext = extractedPdfText;
    const updatedTitle = activeSession.title === "New Chat" && userQuery 
      ? userQuery.substring(0, 25) + "..." : activeSession.title;
    let displayPrompt = userQuery;
    if (pdfName) displayPrompt = `[Attached PDF: ${pdfName}]\n${userQuery}`;
    const userMessage = { role: "user", text: displayPrompt };
    
    setSessions(prevSessions => prevSessions.map(s => 
      s.id === currentSessionId ? { ...s, title: updatedTitle, history: [...s.history, userMessage] } : s
    ));
    setInputText("");
    clearPdf();
    setIsLoading(true);

    try {
      const apiHistory = chatHistory.map(msg => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.text }]
      }));
      let finalMessageBody = userQuery;
      if (documentContext) finalMessageBody = `Document Context:\n${documentContext}\n\nUser Question: ${userQuery || "Summarize this document."}`;
      apiHistory.push({ role: "user", parts: [{ text: finalMessageBody }] });

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        method: "POST",
        data: { "contents": apiHistory }
      });
      
      const aiText = response.data.candidates[0].content.parts[0].text;
      setSessions(prevSessions => prevSessions.map(s => 
        s.id === currentSessionId ? { ...s, history: [...s.history, { role: "ai", text: aiText }] } : s
      ));
    } catch (error) {
      setSessions(prevSessions => prevSessions.map(s => 
        s.id === currentSessionId ? { ...s, history: [...s.history, { role: "ai", text: "Error connecting to AI." }] } : s
      ));
    } finally {
      setIsLoading(false);
    }
  }

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="auth-container">
        <form onSubmit={handleAuth} className="auth-box">
          <h2>{isLoginMode ? "Welcome Back" : "Create Account"}</h2>
          {authError && <p className="error-text">{authError}</p>}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="auth-btn">{isLoginMode ? "Log In" : "Sign Up"}</button>
          <p onClick={() => setIsLoginMode(!isLoginMode)} className="toggle-auth">
            {isLoginMode ? "Need an account? Sign up" : "Already have an account? Log in"}
          </p>
        </form>
      </div>
    );
  }

  if (sessions.length === 0) return <div className="app-layout"><div className="empty-state">Loading your chats...</div></div>;

  return (
    <div className={`app-layout ${isLightMode ? 'light-theme' : ''}`}>
      {/* --- SIDEBAR --- */}
      <div className="sidebar">
        <button className="new-chat-btn" onClick={startNewChat}>+ New Chat</button>
        
        {/* THEME TOGGLE BUTTON */}
        <button 
          className="new-chat-btn" 
          onClick={() => setIsLightMode(!isLightMode)}
          style={{ marginBottom: '10px' }}
        >
          {isLightMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>

        <div className="session-list">
          {sessions.map(session => (
            <div 
              key={session.id} 
              className={`session-item ${session.id === currentSessionId ? 'active' : ''}`}
              onClick={() => setCurrentSessionId(session.id)}
            >
              <span className="session-title">{session.title}</span>
              <button className="delete-btn" onClick={(e) => deleteSession(session.id, e)}>🗑️</button>
            </div>
          ))}
        </div>
        <button className="logout-btn" onClick={handleLogout} style={{marginTop: '10px'}}>🚪 Logout</button>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="chat-container">
        <div className="chat-history">
          {chatHistory.length === 0 ? (
            <div className="empty-state"><h3>How can I help you today?</h3></div>
          ) : (
            chatHistory.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <pre>{message.text}</pre>
              </div>
            ))
          )}
          {isLoading && <div className="message ai"><p>Typing...</p></div>}
        </div>

        {pdfName && (
          <div className="pdf-tray">
            <span>📄 {pdfName} loaded</span>
            <button onClick={clearPdf} className="clear-pdf-btn">✕</button>
          </div>
        )}

        <div className="input-area">
          <input type="file" accept="application/pdf" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
          
          <div className="action-buttons">
            <button onClick={() => fileInputRef.current.click()} disabled={isLoading}>📎 Attach PDF</button>
            <button onClick={toggleVoiceInput} className={isListening ? "listening-active" : ""} disabled={isLoading}>
  {isListening ? "🛑 Stop Listening" : "🎤 Voice"}
</button>
          </div>
          
          <div className="input-wrapper">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); 
                  if (!isLoading) generateAnswer();
                }
              }}
              placeholder={pdfName ? "Ask something about the PDF..." : "Ask me anything..."}
              rows="1"
            />
            <button className="send-btn" onClick={generateAnswer} disabled={isLoading || (!inputText.trim() && !extractedPdfText)}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;