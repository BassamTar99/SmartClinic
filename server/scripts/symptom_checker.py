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
    'Fungal infection': 'Dermatologist, Infectious Disease Specialist',
    'Allergy': 'Allergist, Immunologist',
    'GERD': 'Gastroenterologist',
    'Chronic cholestasis': 'Gastroenterologist, Hepatologist',
    'Drug Reaction': 'Toxicologist, Dermatologist',
    'Peptic ulcer disease': 'Gastroenterologist',
    'AIDS': 'Infectious Disease Specialist',
    'Diabetes': 'Endocrinologist, Diabetologist',
    'Gastroenteritis': 'Gastroenterologist',
    'Bronchial Asthma': 'Pulmonologist, Allergist',
    'Hypertension': 'Cardiologist, General Practitioner',
    'Migraine': 'Neurologist, Pain Management Specialist',
    'Cervical spondylosis': 'Orthopedic Specialist, Neurologist',
    'Paralysis (brain hemorrhage)': 'Neurologist, Neurosurgeon',
    'Jaundice': 'Hepatologist, Gastroenterologist',
    'Malaria': 'Infectious Disease Specialist, General Practitioner',
    'Chicken pox': 'Pediatrician, Infectious Disease Specialist',
    'Dengue': 'Infectious Disease Specialist, General Practitioner',
    'Typhoid': 'Infectious Disease Specialist, General Practitioner',
    'Hepatitis A': 'Hepatologist, Infectious Disease Specialist',
    'Hepatitis B': 'Hepatologist, Infectious Disease Specialist',
    'Hepatitis C': 'Hepatologist, Infectious Disease Specialist',
    'Hepatitis D': 'Hepatologist, Infectious Disease Specialist',
    'Hepatitis E': 'Hepatologist, Infectious Disease Specialist',
    'Alcoholic hepatitis': 'Hepatologist, Gastroenterologist',
    'Tuberculosis': 'Infectious Disease Specialist, Pulmonologist',
    'Common Cold': 'General Practitioner',
    'Pneumonia': 'Pulmonologist, General Practitioner',
    'Dimorphic hemorrhoids (piles)': 'Proctologist, General Surgeon',
    'Heart attack': 'Cardiologist, Emergency Physician',
    'Varicose veins': 'Vascular Surgeon, General Surgeon',
    'Hypothyroidism': 'Endocrinologist',
    'Hyperthyroidism': 'Endocrinologist',
    'Hypoglycemia': 'Endocrinologist, General Practitioner',
    'Osteoarthritis': 'Orthopedic Specialist, Rheumatologist',
    'Arthritis': 'Rheumatologist, Orthopedic Specialist',
    'Paroxysmal Positional Vertigo (Vertigo)': 'Neurologist, ENT Specialist',
    'Acne': 'Dermatologist',
    'Urinary tract infection': 'Urologist, General Practitioner',
    'Psoriasis': 'Dermatologist',
    'Impetigo': 'Dermatologist'
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