# 🔌 Machine Learning API Backend

## 📌 Project Overview
This project serves as the deployment architecture for the machine learning models developed during my AI/ML Internship. It utilizes **Flask** to create a lightweight, production-ready RESTful web service that wraps trained predictive models (like the Spam Classifier) into callable API endpoints.

By decoupling the machine learning logic from the client-side interface, this backend allows web applications, mobile apps, or third-party services to securely send data and receive real-time AI predictions over standard HTTP networks.

## ⚙️ Tech Stack
* **Language:** Python 3
* **Web Framework:** Flask
* **Machine Learning:** Scikit-learn (`sklearn`)
* **Model Serialization:** Joblib / Pickle
* **Data Formatting:** JSON (JavaScript Object Notation)
* **Testing:** Postman

## 🧠 Architecture & Workflow
The API follows a standard client-server request cycle optimized for machine learning inference:

1. **Global Deserialization:** Upon server startup, the application loads the pre-trained model binaries (`.pkl` or `.joblib`) and vectorizers into global memory. This prevents the heavy models from reloading on every single request, drastically reducing latency.
2. **Endpoint Routing:** Exposes specific `POST` routes (e.g., `/predict_spam`) designed to accept incoming data payloads.
3. **Data Validation & Parsing:** Safely parses the incoming JSON request, extracts the target features (e.g., text strings), and handles missing data gracefully with `400 Bad Request` fallbacks.
4. **Inference Execution:** Passes the parsed data through the loaded vectorizer/scaler and feeds it into the model for prediction.
5. **JSON Response Formulation:** Maps the numerical prediction arrays back to human-readable labels (e.g., `1` -> "Spam") and returns a structured JSON payload with a `200 OK` status.

## 💻 How to Run Locally

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/AI-ML_Internship_Project.git](https://github.com/your-username/AI-ML_Internship_Project.git)
cd AI-ML_Internship_Project/04-API-Development
```

### 2. Install Dependencies
Ensure you have Python installed, then install the necessary libraries:
```bash
pip install flask scikit-learn joblib numpy
```

### 3. Verify Model Files
Ensure that your pre-trained model files (e.g., `spam_model.pkl` and `vectorizer.pkl`) are located in the same root directory as your `app.py` file so the server can load them.

### 4. Start the Server
Launch the Flask development server:
```bash
python app.py
```
The server will typically start locally at `http://127.0.0.1:5000/`.

## 📡 API Endpoint Reference

### Spam Classification Endpoint
* **Path:** `/predict_spam`
* **Method:** `POST`
* **Content-Type:** `application/json`

**Sample Request:**
```json
{
  "text": "Congratulations! You've been selected for a free gift card. Click here to claim."
}
```

**Sample Response:**
```json
{
  "original_text": "Congratulations! You've been selected for a free gift card. Click here to claim.",
  "prediction": "Spam"
}
```

## 📈 Key Learnings
* **Model Serialization:** Mastered saving machine learning models to disk and reloading them without losing state or accuracy.
* **REST API Best Practices:** Learned to handle HTTP request methods, parse JSON effectively, and write safe `try-except` blocks to prevent server crashes on bad inputs.
* **Deployment Bridging:** Gained hands-on experience bridging the gap between data science environments (Jupyter) and software engineering environments (Flask APIs).
