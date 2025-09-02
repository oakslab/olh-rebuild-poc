import { IntakeFormData } from '@/types/intake';

export const sampleIntakeData: IntakeFormData = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1-555-123-4567",
  dateOfBirth: "1985-06-15",
  
  address: {
    street: "123 Main Street",
    city: "Anytown",
    state: "CA",
    zipCode: "90210",
    country: "United States"
  },
  
  emergencyContact: {
    name: "Jane Doe",
    relationship: "Spouse",
    phone: "+1-555-987-6543"
  },
  
  medicalHistory: {
    currentMedications: ["Lisinopril 10mg", "Metformin 500mg"],
    allergies: ["Penicillin", "Shellfish"],
    chronicConditions: ["Hypertension", "Type 2 Diabetes"],
    previousSurgeries: ["Appendectomy (2010)"]
  },
  
  insurance: {
    provider: "Blue Cross Blue Shield",
    policyNumber: "ABC123456789",
    groupNumber: "GRP001"
  },
  
  reasonForVisit: "Annual physical examination and medication review",
  symptoms: ["Fatigue", "Occasional headaches"],
  symptomDuration: "2 weeks",
  painLevel: 3,
  
  additionalNotes: "Would like to discuss exercise routine and diet modifications",
  preferredAppointmentTime: "Morning appointments preferred",
  
  consentToTreatment: true,
  privacyPolicyAccepted: true,
  communicationPreferences: {
    email: true,
    sms: true,
    phone: false
  }
};

export const invalidIntakeData: Partial<IntakeFormData> = {
  firstName: "",
  lastName: "Doe",
  email: "invalid-email",
  phone: "123", // Too short
  dateOfBirth: "2030-01-01", // Future date
  consentToTreatment: false,
  privacyPolicyAccepted: false
};
