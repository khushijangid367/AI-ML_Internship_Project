try:
    from flask import Flask, request, jsonify
except ImportError:
    raise ImportError("Flask is required to run this application. Install it with 'pip install flask'.")
import joblib

app = Flask(__name__)

# 1. Load your trained model and vectorizer
# Make sure your actual .pkl files are in the same directory
model = joblib.load('spam_model.pkl')
vectorizer = joblib.load('vectorizer.pkl')

@app.route('/predict_spam', methods=['POST'])
def predict():
    try:
        # 2. Get the JSON data sent from the user/Postman
        data = request.get_json()
        message = data.get('text', '')

        if not message:
            return jsonify({'error': 'No text provided'}), 400

        # 3. Process the text and make a prediction
        vectorized_text = vectorizer.transform([message])
        prediction = model.predict(vectorized_text)[0] # e.g., 1 for spam, 0 for ham

        # 4. Map the numerical prediction to a readable string
        result = "Spam" if prediction == 1 else "Not Spam"

        # 5. Return the result as a JSON response
        return jsonify({
            'original_text': message,
            'prediction': result
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the server on port 5000
    app.run(debug=True, port=5000)