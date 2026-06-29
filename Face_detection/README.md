# 📸 Real-Time Face Detection System

## 📌 Project Overview
This project is a real-time Computer Vision application that detects human faces through a live webcam feed. Built using Python and OpenCV, the system captures video frames, processes them into grayscale, and applies a pre-trained machine learning classifier to identify facial structures. 

This project was developed as part of an AI/ML Internship to demonstrate proficiency in handling live media streams, working with computer vision libraries, and deploying lightweight object detection models.

## ⚙️ Tech Stack
* **Language:** Python 3
* **Computer Vision Library:** OpenCV (`opencv-python`)
* **Detection Algorithm:** Haar Cascade Classifier (`haarcascade_frontalface_default.xml`)

## 🧠 Methodology & Core Logic
The application follows a continuous processing loop to achieve real-time detection:

1. **Video Ingestion:** Utilizes `cv2.VideoCapture()` to establish a connection with the primary webcam and capture the live video stream frame-by-frame.
2. **Grayscale Conversion:** Since color data is unnecessary for structural shape detection and slows down processing, each frame is immediately converted from BGR to grayscale using `cv2.cvtColor()`.
3. **Haar Cascade Classification:** * Loads the pre-trained `haarcascade_frontalface_default.xml` file, which contains the mathematical representations of facial features (eyes, nose bridge, etc.).
   * Applies the `.detectMultiScale()` function to scan the grayscale frame and return the `(x, y, width, height)` coordinates of any detected faces.
4. **Visual Rendering:** Uses `cv2.rectangle()` to draw a dynamic, colored bounding box around the detected coordinates directly onto the live colored video feed.
5. **Memory Management:** Includes a secure exit protocol (`cv2.waitKey`) to safely release the camera hardware and destroy background windows when the application is terminated.

## 💻 How to Run Locally

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/AI-ML_Internship_Project.git](https://github.com/your-username/AI-ML_Internship_Project.git)
cd AI-ML_Internship_Project/05-Face-Detection
```

### 2. Install Dependencies
Ensure you have Python installed, then run:
```bash
pip install opencv-python
```

### 3. Ensure the Cascade File is Present
Make sure the `haarcascade_frontalface_default.xml` file is located in the exact same directory as your main Python script. (The script relies on this local file to run the detection math).

### 4. Run the Application
```bash
python main.py
```
*(Note: Your operating system may prompt you to grant camera permissions to your terminal. You must allow this for the script to work).* To exit the video stream, ensure the camera window is selected and press the designated exit key (usually `Esc` or `q`, depending on the script configuration).

## 📈 Key Learnings
* **Hardware Integration:** Learned how to bridge Python code with physical hardware (webcams) to process continuous, live data streams.
* **Algorithmic Efficiency:** Gained an understanding of why preprocessing steps (like converting images to grayscale) are crucial for optimizing CPU performance in real-time frame analysis.
* **Haar Cascades:** Learned the mechanics of sliding window detection and how pre-trained XML data translates into spatial object recognition.
