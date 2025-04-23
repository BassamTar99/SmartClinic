import joblib
import sys
import json

# Define preprocessing function
# Updated to dynamically load symptom columns from the model

def preprocess_input(symptoms_text):
    model = joblib.load('symptom_checker_model.pkl')
    symptom_columns = model.feature_names_in_  # Extract feature names from the trained model
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

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python symptom_checker.py '<symptoms_text>'")
        sys.exit(1)

    symptoms_text = sys.argv[1]

    try:
        # Predict disease
        result = predict_disease(symptoms_text)
        print(json.dumps(result, indent=4))
    except Exception as e:
        print(f"Error: {e}")