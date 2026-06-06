import cv2
from deepface import DeepFace
import firebase_admin
from firebase_admin import credentials, firestore

# 1. Initialize Firebase Connection
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# 2. Collect User Details
print("--- New User Registration (DeepFace) ---")
user_id = input("Enter User ID (e.g., EMP001): ")
user_name = input("Enter Full Name: ")

# 3. Capture Face via Webcam
cap = cv2.VideoCapture(0)
print("\nLook at the camera and press 's' to snap a photo, or 'q' to quit.")

face_encoding = None

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab camera frame. Check your webcam.")
        break
        
    cv2.imshow("Registration - Press 's' to capture", frame)
    
    key = cv2.waitKey(1) & 0xFF
    
    # Press 's' to snap a picture
    if key == ord('s'):
        try:
            print("\nProcessing image and extracting facial features...")
            
            # DeepFace.represent extracts the facial embedding vector
            # We use enforce_detection=True to make sure a face is actually there
            predictions = DeepFace.represent(
                img_path=frame, 
                model_name="VGG-Face", 
                enforce_detection=True
            )
            
            # Extract the numerical embedding array
            face_encoding = predictions[0]["embedding"]
            print("Face captured and encoded successfully!")
            break
            
        except Exception as e:
            print(f"\nError: Could not process face. Make sure your face is clearly visible and well-lit.")
            print("Please try snapping the photo again.")
            continue
        
    # Press 'q' to abort
    elif key == ord('q'):
        break

# Clean up webcam windows
cap.release()
cv2.destroyAllWindows()

# 4. Upload to Firestore Database
if face_encoding is not None:
    print("Saving data to Firebase...")
    
    # Target the 'users' collection, using the user_id as the document name
    doc_ref = db.collection('users').document(user_id)
    doc_ref.set({
        'name': user_name,
        'user_id': user_id,
        'face_encoding': face_encoding
    })
    
    print(f"\nSuccess! {user_name} is now registered in the cloud database.")
else:
    print("\nRegistration cancelled.")