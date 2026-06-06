import cv2
from deepface import DeepFace
import firebase_admin
from firebase_admin import credentials, firestore
import numpy as np
from datetime import datetime
import time

# 1. Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
# Check if already initialized to avoid errors if running in interactive environments
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

# 2. Fetch Known Users from Database
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

# 3. Helper Function to Find a Match
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

# 4. Start Live Video Feed
cap = cv2.VideoCapture(0)
print("\nStarting live attendance system... Press 'q' to quit.")

# To prevent spamming Firebase with 30 logs per second
last_logged_time = {} 
COOLDOWN_SECONDS = 3600  # Only log the same person once per hour

while True:
    ret, frame = cap.read()
    if not ret:
        break
        
    try:
        # Extract face embedding from live frame
        # enforce_detection=False prevents crashes when no face is on screen
        predictions = DeepFace.represent(frame, model_name="VGG-Face", enforce_detection=False)
        
        if len(predictions) > 0 and predictions[0].get("face_confidence", 0) > 0.8:
            live_encoding = predictions[0]["embedding"]
            
            # Find a match
            match, distance = find_best_match(live_encoding, known_users)
            
            if match:
                name = match['name']
                user_id = match['user_id']
                
                # Draw a green box and name
                cv2.rectangle(frame, (50, 50), (250, 100), (0, 255, 0), -1)
                cv2.putText(frame, f"Match: {name}", (60, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                
                # Check cooldown before logging to Firebase
                current_time = time.time()
                if user_id not in last_logged_time or (current_time - last_logged_time[user_id]) > COOLDOWN_SECONDS:
                    
                    print(f"Logging attendance for {name}...")
                    db.collection('attendance').add({
                        'user_id': user_id,
                        'name': name,
                        'timestamp': firestore.SERVER_TIMESTAMP
                    })
                    last_logged_time[user_id] = current_time
                    print("Logged successfully!")
            else:
                # Draw a red box for unknown faces
                cv2.putText(frame, "Unknown Face", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

    except Exception as e:
        # DeepFace might throw an error if the frame is blurry
        pass
        
    cv2.imshow("Live Attendance", frame)
    
    # Remember to click the window before pressing 'q'!
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()