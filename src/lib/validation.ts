import { IntakeFormData, ValidationError } from '@/types/intake';

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validateZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
}

export function validateIntakeForm(data: IntakeFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required field validation
  if (!data.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }

  if (!data.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }

  if (!data.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!data.phone?.trim()) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else if (!validatePhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  if (!data.dateOfBirth) {
    errors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
  } else {
    const dob = new Date(data.dateOfBirth);
    const today = new Date();
    if (dob >= today) {
      errors.push({ field: 'dateOfBirth', message: 'Date of birth must be in the past' });
    }
  }

  // Address validation
  if (!data.address?.street?.trim()) {
    errors.push({ field: 'address.street', message: 'Street address is required' });
  }

  if (!data.address?.city?.trim()) {
    errors.push({ field: 'address.city', message: 'City is required' });
  }

  if (!data.address?.state?.trim()) {
    errors.push({ field: 'address.state', message: 'State is required' });
  }

  if (!data.address?.zipCode?.trim()) {
    errors.push({ field: 'address.zipCode', message: 'ZIP code is required' });
  } else if (!validateZipCode(data.address.zipCode)) {
    errors.push({ field: 'address.zipCode', message: 'Please enter a valid ZIP code' });
  }

  if (!data.address?.country?.trim()) {
    errors.push({ field: 'address.country', message: 'Country is required' });
  }

  // Emergency contact validation
  if (!data.emergencyContact?.name?.trim()) {
    errors.push({ field: 'emergencyContact.name', message: 'Emergency contact name is required' });
  }

  if (!data.emergencyContact?.relationship?.trim()) {
    errors.push({ field: 'emergencyContact.relationship', message: 'Emergency contact relationship is required' });
  }

  if (!data.emergencyContact?.phone?.trim()) {
    errors.push({ field: 'emergencyContact.phone', message: 'Emergency contact phone is required' });
  } else if (!validatePhone(data.emergencyContact.phone)) {
    errors.push({ field: 'emergencyContact.phone', message: 'Please enter a valid emergency contact phone number' });
  }

  // Insurance validation
  if (!data.insurance?.provider?.trim()) {
    errors.push({ field: 'insurance.provider', message: 'Insurance provider is required' });
  }

  if (!data.insurance?.policyNumber?.trim()) {
    errors.push({ field: 'insurance.policyNumber', message: 'Policy number is required' });
  }

  // Reason for visit validation
  if (!data.reasonForVisit?.trim()) {
    errors.push({ field: 'reasonForVisit', message: 'Reason for visit is required' });
  }

  // Pain level validation
  if (data.painLevel !== undefined && (data.painLevel < 1 || data.painLevel > 10)) {
    errors.push({ field: 'painLevel', message: 'Pain level must be between 1 and 10' });
  }

  // Consent validation
  if (!data.consentToTreatment) {
    errors.push({ field: 'consentToTreatment', message: 'Consent to treatment is required' });
  }

  if (!data.privacyPolicyAccepted) {
    errors.push({ field: 'privacyPolicyAccepted', message: 'Privacy policy acceptance is required' });
  }

  return errors;
}

export function formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
  return errors.reduce((acc, error) => {
    if (!acc[error.field]) {
      acc[error.field] = [];
    }
    acc[error.field].push(error.message);
    return acc;
  }, {} as Record<string, string[]>);
}
