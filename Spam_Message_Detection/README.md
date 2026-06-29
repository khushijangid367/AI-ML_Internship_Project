# 📨 Spam vs. Non-Spam Mail Classifier

## 📌 Project Overview
This project is a Natural Language Processing (NLP) machine learning application that automatically classifies incoming text messages or emails as either **Spam** (unwanted/promotional) or **Ham** (legitimate/safe). 

Developed as part of an AI/ML Internship, this project demonstrates the complete machine learning lifecycle for textual data: from text preprocessing and numerical vectorization to training a supervised classifier and evaluating its predictive accuracy.

## ⚙️ Tech Stack
* **Language:** Python 3
* **Data Processing:** Pandas, NumPy
* **Machine Learning & NLP:** Scikit-learn (`sklearn`)
* **Core Algorithms:** Logistic Regression
* **Feature Extraction:** `CountVectorizer` or `TfidfVectorizer`

## 🧠 Methodology & Machine Learning Pipeline
Computers cannot read raw text directly, so the pipeline transforms textual strings into numerical mathematical structures:

1. **Data Preprocessing:** * Cleans the raw dataset by converting all text to lowercase.
   * Removes punctuation, special characters, and common stop words (e.g., "and", "the", "is") that do not contribute to semantic meaning.
2. **Feature Extraction (Vectorization):** * Implements a vectorization strategy (such as TF-IDF or Bag-of-Words) to break text strings down into tokenized words.
   * Converts those tokens into a sparse matrix of numerical word frequencies, mapping out exactly which terms heavily correlate with spam behavior.
3. **Model Training:** * Splits the data into a training set ($80\%$) and a testing set ($20\%$).
   * Trains a classification model (such as a Logistic Regression classifier) on the structured textual features.
4. **Performance Evaluation:** * Evaluates the model on unseen test data using metric metrics: Accuracy, Precision, Recall, and an F1-Score.

## 💻 How to Run Locally

### 1. Clone the Repository
```bash
git clone [https://github.com/khushijangid367/AI-ML_Internship_Project.git](https://github.com/khushijangid367/AI-ML_Internship_Project.git)
cd AI-ML_Internship_Project/02-Spam-Classifier
```

### 2. Install Dependencies
Make sure you have Python installed, then run the required libraries:
```bash
pip install pandas numpy scikit-learn
```

### 3. Run the Script or Notebook
If using a standard Python script version:
```bash
python main.py
```
If using a Jupyter Notebook version, open it in your environment and run the cells sequentially to observe data transformations and final accuracy validation charts.

## 📈 Key Learnings
* **Text as Numerical Data:** Mastered the core concept of text vectorization and how to transform unstructured natural language into structured matrices fit for machine learning models.
* **Feature Engineering:** Developed an intuition for data preparation steps like stop-word filtering and case normalization to significantly minimize noisy features.
* **Classification Tuning:** Learned how to interpret precision and recall scores specifically tailored to spam filtration, minimizing dangerous "false positives" (marking an important message as spam).
