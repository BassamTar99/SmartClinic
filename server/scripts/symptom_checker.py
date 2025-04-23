import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# Load dataset
path = "path_to_dataset"
train_data = pd.read_csv(os.path.join(path, "dataset.csv"))

# Features and target
X_train_data = train_data.drop('prognosis', axis=1)
y_train_data = train_data['prognosis']

# Encode target
label_encoder = LabelEncoder()
y_train_encoded = label_encoder.fit_transform(y_train_data)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X_train_data, y_train_encoded, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# Save model and encoder
joblib.dump(model, 'symptom_checker_model.pkl')
joblib.dump(label_encoder, 'symptom_checker_label_encoder.pkl')

# Define preprocessing function
def preprocess_input(symptoms_text):
    symptom_columns = X_train_data.columns.tolist()
    symptom_vector = [1 if symptom in symptoms_text.lower() else 0 for symptom in symptom_columns]
    return symptom_vector

# Define specialists
prognosis_specialists = {
    'Fungal infection': 'Dermatologist',
    'Allergy': 'Allergist',
    # Add more mappings here
}

# Generate case report
def generate_case_report(symptoms_text, predicted_disease):
    return {
        "patient_case": {
            "symptoms": symptoms_text,
            "predicted_disease": predicted_disease,
        },
        "doctor_recommendation": {
            "specialist": prognosis_specialists.get(predicted_disease, 'General Practitioner')
        }
    }

# Predict disease
def predict_disease(symptoms_text):
    symptom_vector = preprocess_input(symptoms_text)
    model = joblib.load('symptom_checker_model.pkl')
    label_encoder = joblib.load('symptom_checker_label_encoder.pkl')
    prognosis_encoded = model.predict([symptom_vector])
    prognosis = label_encoder.inverse_transform(prognosis_encoded)[0]
    return generate_case_report(symptoms_text, prognosis)