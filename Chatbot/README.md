# 🤖 Interactive AI Chatbot (Gemini 3.5 Flash)

## 📌 Project Overview
This project is a real-time, context-aware conversational AI web application built using **React (Vite)** and powered by Google's **Gemini 3.5 Flash** Large Language Model. It features a responsive chat interface that maintains conversation history, allowing the AI to remember previous context and provide highly accurate, contextual responses.

This project was developed as part of an AI/ML Internship to demonstrate proficiency in frontend API integration, state management, and securing environment variables.

## ⚙️ Tech Stack
* **Frontend Framework:** React.js (Bootstrapped with Vite for optimized performance)
* **API Integration:** Axios (for handling HTTP POST requests)
* **AI Engine:** Google Gemini 3.5 Flash API
* **State Management:** React `useState` hooks

## 🚀 Key Features
* **Contextual Memory:** The application maps and stores the entire conversation history, dynamically injecting past messages into the API payload so the AI remembers prior interactions.
* **Role-Based Payload Formatting:** Dynamically transforms internal state roles (`user` vs `ai`) into Google's required schema (`user` vs `model`) before transmission.
* **Loading States:** Implemented UI feedback (disabling inputs and showing "Typing...") while awaiting network responses to ensure a smooth user experience.
* **Secure Environment Variables:** Utilizes Vite's strict environment variable protocols (`VITE_`) to keep API keys separate from the core application logic.

## 🧠 Technical Architecture & Logic
The core logic of the application revolves around managing an array of message objects:
1. **User Input:** When a user submits a message, it is appended to the `chatHistory` state.
2. **Payload Construction:** The app iterates through the history and maps the data into the exact JSON structure required by Google's Generative AI API:
   ```json
   {
     "role": "model",
     "parts": [{ "text": "Message content" }]
   }
   ```
3. **API Call:** An asynchronous Axios POST request is made to the Gemini endpoint, securely passing the API key via URL parameters.
4. **State Update:** The response text is extracted from the deeply nested JSON return object and appended to the UI.

## 💻 How to Run Locally

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd <your-chatbot-folder-name>
```

### 2. Install Dependencies
```bash
npm install
npm install axios
```

### 3. Configure Environment Variables
Create a file named exactly `.env` in the root folder of this project (at the same level as your `package.json`). Add your Google AI Studio API key:

```text
VITE_GEMINI_API_KEY=your_api_key_here
```
*(Note: Never push your `.env` file to a public repository! Ensure it is listed in your `.gitignore`)*

### 4. Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to the `localhost` URL provided in the terminal (usually `http://localhost:5173`) to start chatting!

## 📈 Key Learnings
During this project, I overcame several technical hurdles:

* **Frontend Security Rules:** Learned how modern build tools (like Vite) intentionally block standard environment variables to prevent accidental leaks, requiring the `VITE_` prefix and `import.meta.env` for access.
* **API Model Routing:** Handled `400 Bad Request` errors by debugging network tabs and identifying the correct model endpoints (`gemini-3.5-flash` vs legacy models).
