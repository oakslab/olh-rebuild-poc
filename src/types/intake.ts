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

  // Vital Signs - mapped to Observation resources
  weight: number; // in pounds
  height: number; // in inches

  // Weight Management Goals - mapped to Goal resource
  weightGoal?: string;

  // Medical History - mapped to Condition resources
  medicalExclusionCriteria?: string[];
  weightRelatedComorbidity?: string[];
  otherExclusionConditions?: string[];

  // Medications - mapped to MedicationStatement resources
  anyMedications?: boolean;
  anyMedicationsDescription?: string;
  priorWeightLossMedsUse?: boolean;
  weightLossMedicationDescription?: string;
  opiatePainMedications?: boolean;
  opiatePainMedicationsDescription?: string;

  // Procedures - mapped to Procedure resources
  abdominalPelvicSurgeries?: boolean;
  abdominalPelvicSurgeriesDescription?: string;

  // Lifestyle and History - mapped to Observation resources
  mainReason?: string[];
  weightManagementProgram?: boolean;
  weightManagementProgramDescription?: string;
  willingTo?: string[];
  weightChangeIn12Months?: string;
  medicalLifestyleFactors?: string[];

  // Vital Signs and Lab Values - mapped to Observation resources
  glucoseValue?: number;
  hemoglobinValue?: number;
  bloodPressureRange?: string;
  restingHeartRateRange?: string;
  startingWeightInLbs?: number;

  // Allergies - mapped to AllergyIntolerance resources
  medicationAllergies?: boolean;
  medicationAllergiesDescription?: string;

  // Additional Information - mapped to Observation resources
  anyFurtherInformation?: boolean;
  anyFurtherInformationDescription?: string;

  // Medication Timing - mapped to MedicationStatement resources
  lastMwlDose?: string;

  // Shipping and Billing Addresses (additional Patient.address entries)
  shippingAddress?: {
    fullName?: string;
    address1?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };

  paymentAddress?: {
    fullName?: string;
    zipCode?: string;
  };

  // Consent - mapped to Consent resource
  consentTc?: boolean;

  // Treatment Plan - mapped to MedicationRequest resources
  productId?: string;
  productName?: string;
  price?: number;
  priceCurrency?: string;
  priceId?: string;
  subscriptionId?: string;
  paymentCompleted?: boolean;

  // Appointment - mapped to Appointment resource
  schedulingCompleted?: boolean;

  // Clinical Decision Support
  mwlEligibility?: boolean;
  dqReason?: string;
  syncVisit?: boolean;
  syncVisitReason?: string;
  clearanceRequired?: boolean;

  // Additional fields from CSV
  phoneNumber?: string; // Will be mapped properly to telecom
  mwlExclusivity?: boolean;
  glp1MedicationPenImage?: string; // Media resource
  age?: number; // Calculated from dateOfBirth
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
