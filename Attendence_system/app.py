from flask import Flask, render_template, Response, jsonify
import cv2
from deepface import DeepFace
import firebase_admin
from firebase_admin import credentials, firestore
import numpy as np
import time
import os

app = Flask(__name__)

# ==========================================
# 1. INITIALIZE FIREBASE & LOAD KNOWN USERS
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
key_path = os.path.join(BASE_DIR, 'serviceAccountKey.json') 

# Initialize Firebase (with check to prevent double-init errors)
if not firebase_admin._apps:
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)
db = firestore.client()

print("Fetching registered users from Firebase...")
users_ref = db.collection('users').stream()
known_users = []

for doc in users_ref:
    data = doc.to_dict()
    known_users.append({
        'user_id': data['user_id'],
        'name': data['name'],
        'encoding': np.array(data['face_encoding'])
    })
print(f"Loaded {len(known_users)} users into memory.")

# ==========================================
# 2. FACE MATCHING HELPER
# ==========================================
def find_best_match(live_embedding, known_users, threshold=0.40):
    """Compares live face against database using Cosine Distance."""
    best_match = None
    min_dist = float('inf')
    live_emb = np.array(live_embedding)

    for user in known_users:
        known_emb = user['encoding']
        
        # Calculate Cosine Distance
        a_norm = np.linalg.norm(live_emb)
        b_norm = np.linalg.norm(known_emb)
        similarity = np.dot(live_emb, known_emb) / (a_norm * b_norm)
        distance = 1 - similarity

        if distance < min_dist:
            min_dist = distance
            if distance <= threshold:
                best_match = user

    return best_match, min_dist

# ==========================================
# 3. LIVE VIDEO GENERATOR (THE ENGINE)
# ==========================================
camera = cv2.VideoCapture(0)

# Memory for cooldowns
last_logged_time = {} 
COOLDOWN_SECONDS = 3600  # Only log the same person once per hour

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        
        try:
            # Extract face embedding from live frame
            predictions = DeepFace.represent(frame, model_name="VGG-Face", enforce_detection=False)
            
            if len(predictions) > 0 and predictions[0].get("face_confidence", 0) > 0.8:
                live_encoding = predictions[0]["embedding"]
                
                # Find a match
                match, distance = find_best_match(live_encoding, known_users)
                
                if match:
                    name = match['name']
                    user_id = match['user_id']
                    
                    # Draw UI on the camera feed
                    cv2.rectangle(frame, (50, 50), (250, 100), (0, 255, 0), -1)
                    cv2.putText(frame, f"Match: {name}", (60, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                    
                    # Check cooldown before logging
                    current_time = time.time()
                    if user_id not in last_logged_time or (current_time - last_logged_time[user_id]) > COOLDOWN_SECONDS:
                        print(f"Logging attendance for {name}...")
                        db.collection('attendance').add({
                            'user_id': user_id,
                            'name': name,
                            'timestamp': firestore.SERVER_TIMESTAMP,
                            'status': 'Present'
                        })
                        last_logged_time[user_id] = current_time
                        print("Logged successfully!")
                else:
                    cv2.putText(frame, "Unknown Face", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        except Exception as e:
            # DeepFace might throw an error if the frame is blurry
            pass
            
        # Encode the modified frame to stream to the web UI
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# ==========================================
# 4. WEB DASHBOARD ROUTES
# ==========================================
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    # Streams the camera feed to the UI
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/get_recent_attendance')
def get_recent_attendance():
    """Fetches the latest 10 attendance records from Firestore for the UI"""
    try:
        logs_ref = db.collection('attendance').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(10)
        docs = logs_ref.stream()
        
        recent_logs = []
        for doc in docs:
            data = doc.to_dict()
            time_str = data['timestamp'].strftime("%I:%M %p") if data.get('timestamp') else "Just now"
            
            recent_logs.append({
                "name": data.get('name', 'Unknown'),
                "time": time_str,
                "status": data.get('status', 'Present')
            })
            
        return jsonify(recent_logs)
    except Exception as e:
        print(f"Error fetching logs: {e}")
        return jsonify([])

if __name__ == '__main__':
    app.run(debug=True, port=5000)