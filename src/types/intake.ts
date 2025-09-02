export interface IntakeFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;

  // Contact Information
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Medical Information
  medicalHistory: {
    currentMedications: string[];
    allergies: string[];
    chronicConditions: string[];
    previousSurgeries: string[];
  };

  // Insurance Information
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };

  // Reason for Visit
  reasonForVisit: string;
  symptoms: string[];
  symptomDuration: string;
  painLevel?: number; // 1-10 scale

  // Additional Information
  additionalNotes?: string;
  preferredAppointmentTime?: string;

  // Consent and Agreements
  consentToTreatment: boolean;
  privacyPolicyAccepted: boolean;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
}

export interface IntakeFormResponse {
  success: boolean;
  message: string;
  submissionId?: string;
  errors?: Record<string, string[]>;
}

export interface ValidationError {
  field: string;
  message: string;
}
