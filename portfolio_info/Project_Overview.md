# Credit Risk Prediction System - Project Summary

## Overview
This is a complete end-to-end machine learning system for predicting customer loan default risk. The system classifies applicants into High Risk or Low Risk categories to help financial institutions make better credit approval decisions.

## Tech Stack & Architecture
- Core Technologies: Python, PostgreSQL, Pandas, NumPy, Scikit-Learn, XGBoost, FastAPI
- Architecture: CSV files → PostgreSQL Database → Feature Engineering → Feature Store → ML Pipeline → FastAPI API → Real-time Predictions
- Storage: PostgreSQL database with multiple tables and feature stores
- Deployment: FastAPI with Swagger documentation for REST API

## Key Features Implemented

### Data Engineering
- Loaded 11 source files into PostgreSQL database
- Created feature engineering pipeline
- Built customer-level feature store (feature_store.customer_training_dataset)

### Machine Learning
- Multiple models: Logistic Regression, Random Forest, XGBoost
- Comprehensive preprocessing: missing value handling, label encoding, train/test splits
- Model evaluation with metrics: Accuracy, Precision, Recall, F1 Score, ROC-AUC
- Pre-trained XGBoost model ready for inference

### Deployment
- FastAPI REST API with Swagger UI
- Real-time customer risk prediction endpoint
- Error handling and customer-not-found scenarios

## Directory Structure

api/                          # FastAPI application
├── app.py                   # Main API endpoints
└── __init__.py              # Package initialization

scripts/                      # Core ML and database operations
├── database.py              # PostgreSQL connection setup
├── feature_fetcher.py       # Database query utilities
├── predictor.py             # Main prediction logic with model loading
├── predict.py               # Simple prediction script
├── extract_training_data.py # Data extraction utilities
├── testing_labels.py        # Label encoder inspection
└── test_fetch.py            # Feature fetching test

notebooks/                    # Data analysis and preprocessing
├── 01_EDA.ipynb             # Exploratory Data Analysis
└── 02_Data_Preprocessing.ipynb # Preprocessing pipeline

docs/                         # Comprehensive project documentation
├── 01_Executive_Summary.md
├── 02_Business_Understanding.md
├── 03_Technical_Architecture.md
├── 04_Feature_Engineering.md
├── 05_Model_Development.md
├── 06_Deployment.md
└── 07_Challenges_and_Learnings.md

load_application_train.py     # CSV to PostgreSQL data loader
requirements.txt              # Python dependencies
README.md                     # Project documentation
test_psycopg.py               # PostgreSQL connection test

## Critical Files & Functionality

API Endpoint (api/app.py)
- GET /: Health check - returns {"message": "Credit Risk API Running"}
- GET /predict/{customer_id}: Returns prediction with probability and risk classification

Prediction Logic (scripts/predictor.py)
- Loads pre-trained model artifacts (XGBoost model, feature columns, label encoders, imputers)
- Queries database for customer features using feature_store.customer_training_dataset
- Applies preprocessing: column renaming, label encoding, numeric conversion
- Returns structured response: customer_id, default_probability, prediction

Database Operations
- PostgreSQL connection using SQLAlchemy with psycopg2
- Database schema includes feature_store.customer_training_dataset table
- Connection string: postgresql+psycopg2://postgres:Leodas@localhost:5432/credit_risk_db

## Current State & Improvements Needed

### Completed
- Complete ML pipeline from data ingestion to deployment
- Comprehensive documentation and analysis notebooks
- Real-time prediction API with Swagger
- Multiple ML model implementations and evaluation

### Future Improvements (per README)
- Dockerization
- Hyperparameter Tuning
- Model Monitoring
- CI/CD Pipeline
- Cloud Deployment

## Sample API Response
{
  "customer_id": 100002,
  "default_probability": 0.88,
  "prediction": "High Risk"
}

## Dependencies
All Python packages are listed in requirements.txt:
- pandas, numpy, scikit-learn, xgboost, sqlalchemy, psycopg2-binary, fastapi, uvicorn, joblib, jupyter, notebook

This project represents a production-ready credit risk prediction system with full documentation, testing, and deployment capabilities.