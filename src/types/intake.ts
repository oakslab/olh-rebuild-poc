export interface IntakeFormData {
  // Personal Information - mapped to Patient resource
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;

  // Address Information - mapped to Patient.address
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
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
