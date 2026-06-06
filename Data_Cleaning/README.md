# 🧹 Data Cleaning & Preprocessing Pipeline

## 📌 Project Overview
This project focuses on the foundational step of any machine learning pipeline: Data Cleaning and Exploratory Data Analysis (EDA). Working with raw, unstructured data, I developed a Python-based preprocessing pipeline within a Jupyter Notebook to systematically identify and resolve data quality issues. 

The ultimate goal of this project was to transform a messy dataset into a clean, normalized, and highly structured format ready for downstream predictive modeling and statistical analysis.

## ⚙️ Tech Stack
* **Language:** Python 3
* **Environment:** Jupyter Notebook (`.ipynb`)
* **Core Libraries:** * `pandas` (Data manipulation and structuring)
  * `matplotlib` & `seaborn` (Data visualization and outlier detection)

## 🧠 Methodology & Data Processing
The notebook follows a strict, sequential pipeline to ensure data integrity:

1. **Data Ingestion & Auditing:**
   * Loaded the raw dataset and performed an initial audit using `.info()` and `.describe()` to identify data types, missing values, and statistical anomalies.
2. **Handling Missing Values:**
   * Identified null/NaN values across critical columns. 
   * Applied targeted imputation strategies (e.g., filling missing numerical values with the median/mean, and categorical values with the mode) rather than aggressively dropping rows, preserving dataset size.
3. **Deduplication & Standardization:**
   * Removed duplicate records and dropping Not_Useful_Column to prevent model bias.
   * Standardized text formatting (e.g., converting strings to lowercase, stripping trailing spaces) and ensured consistent datetime formatting.
4. **Removed Irrelevant Features:**
   *  Streamlined the dataset by removing irrelevant features, reducing noise and improving processing efficiency.
5. **Feature Export:**
   * Exported the finalized, cleaned dataframe to a new `.csv` file, ensuring it is primed for immediate use in model training.

## 💻 How to Run Locally

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd <your-data-cleaning-folder-name>
```

### 2. Set Up Your Environment
It is recommended to use a virtual environment:
```bash
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install pandas numpy matplotlib seaborn jupyter
```

### 4. Launch the Notebook
```bash
jupyter notebook
```
Open `Data_cleaning.ipynb` in your browser and run the cells sequentially to see the transformation from raw to clean data!

## 📈 Key Learnings
* **Data Integrity:** Gained a deep understanding of how poor data quality directly impacts machine learning performance (Garbage In, Garbage Out).
* **Pandas Proficiency:** Mastered advanced Pandas functions for vectorized operations, making the cleaning process highly efficient on larger datasets.
