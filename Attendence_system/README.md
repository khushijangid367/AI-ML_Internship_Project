📸 AI/ML Real-Time Facial Recognition Attendance System

An advanced, automated attendance tracking pipeline that utilizes Computer Vision and Deep Learning to identify individuals in real-time. This system detects faces via a live webcam feed, extracts facial encodings, compares them against a known database, and logs attendance automatically to a Firebase Cloud database.

🚀 Key Features

Real-Time Detection: Processes live video feeds using OpenCV.

Deep Learning Encodings: Utilizes the DeepFace library (VGG-Face model) to generate highly accurate mathematical representations (embeddings) of faces.

Cloud Integration: Syncs seamlessly with Google Firebase Firestore to store registered users and log attendance timestamps globally.

Anti-Spam Cooldown Logic: Includes an intelligent 60-minute cooldown algorithm to prevent database spam, ensuring users are only logged once per hour even if they remain in the camera frame.

Live UI Feedback: Renders live bounding boxes and identity confidence tags directly onto the video feed.

🛠️ Technology Stack

Language: Python 3.x

Computer Vision: OpenCV (cv2)

AI / Deep Learning: DeepFace

Database & Cloud: Firebase Firestore (NoSQL), Firebase Admin SDK

Data Handling: NumPy

📁 Project Structure

app.py: The main web application/dashboard entry point for serving the attendance interface.

main.py: The live real-time recognition engine and database logger.

register.py: The onboarding script for capturing and encoding new faces.

templates/: Directory containing the HTML templates for the web frontend.

serviceAccountKey.json: Firebase database credentials (must be added manually, ignored in Git for security).

.gitignore: Local rules to prevent pushing sensitive keys and Python caches.

⚙️ Installation & Setup

Clone the repository:

git clone [https://github.com/khushijangid367/AI-ML_Internship_Project.git](https://github.com/khushijangid367/AI-ML_Internship_Project.git)
cd AI-ML_Internship_Project/Attendance_system


Install required dependencies:

pip install opencv-python deepface firebase-admin numpy flask


Configure Firebase:

Create a project in the Firebase Console.

Set up a Firestore Database.

Go to Project Settings -> Service Accounts -> Generate New Private Key.

Rename the downloaded file to serviceAccountKey.json and place it in the Attendance_system folder.

Note: Never upload your serviceAccountKey.json to GitHub!

🧑‍💻 Usage

1. Register a New User

Before the system can recognize someone, they must be registered in the database. Run the registration script and follow the on-screen prompts:

python register.py


2. Start the Live Attendance Scanner

Once users are registered in Firebase, launch the main recognition engine:

python main.py


The webcam will activate.

Recognized faces will be boxed in Green with their name, and logged to Firebase.

Unrecognized faces will be boxed in Red as "Unknown".

Press the q key while focused on the video window to safely quit the application.

3. Launch the Dashboard

To view the data on the web interface, run the app server:

python app.py


🧠 How the Matching Algorithm Works

When a face is detected in the live feed, the system generates a live vector array. It then fetches all known user arrays from Firebase and calculates the Cosine Distance between the live face and the database faces. If the distance falls below a strict threshold (e.g., < 0.40), it is declared a match.
