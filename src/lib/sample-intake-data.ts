import { IntakeFormData } from "@/types/intake";

export const sampleIntakeData: IntakeFormData = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1-555-123-4567",
  dateOfBirth: "1985-06-15",
  gender: "male",
  address: {
    street: "123 Main Street",
    city: "Anytown",
    state: "CA",
    zipCode: "90210",
  },
  weight: 180,
  height: 72,

  // Weight management goals
  weightGoal: "Lose 30 pounds for better health and increased energy",

  // Medical history
  medicalExclusionCriteria: ["High blood pressure"],
  weightRelatedComorbidity: ["Sleep apnea", "Type 2 diabetes"],

  // Medications
  anyMedications: true,
  anyMedicationsDescription:
    "Metformin 500mg twice daily, Lisinopril 10mg once daily",
  priorWeightLossMedsUse: false,
  opiatePainMedications: false,

  // Procedures
  abdominalPelvicSurgeries: false,

  // Lifestyle and history
  mainReason: ["Improve overall health", "Increase energy levels"],
  weightManagementProgram: true,
  weightManagementProgramDescription:
    "Tried Weight Watchers for 6 months in 2022",
  willingTo: ["Follow a structured diet plan", "Exercise regularly"],
  weightChangeIn12Months: "Gained 15 pounds",
  medicalLifestyleFactors: ["Injectable medication", "Oral medication"],

  // Vital signs and lab values
  glucoseValue: 110,
  hemoglobinValue: 7.2,
  bloodPressureRange: "130-140/80-90",
  restingHeartRateRange: "70-80 bpm",
  startingWeightInLbs: 195,

  // Allergies
  medicationAllergies: true,
  medicationAllergiesDescription: "Penicillin - causes rash and swelling",

  // Additional information
  anyFurtherInformation: true,
  anyFurtherInformationDescription:
    "I work night shifts which affects my eating schedule. Please consider this when recommending treatment plans.",

  // Shipping address
  shippingAddress: {
    fullName: "John Doe",
    address1: "456 Work Street",
    city: "Worktown",
    state: "CA",
    zipCode: "90211",
  },

  // Payment address
  paymentAddress: {
    fullName: "John Doe",
    zipCode: "90210",
  },

  // Consent
  consentTc: true,

  // Treatment plan
  productId: "glp1-semaglutide-001",
  productName: "Semaglutide 0.25mg/0.5mg Starter Kit",
  price: 299.99,
  priceCurrency: "USD",
  priceId: "price_1234567890",
  subscriptionId: "sub_1234567890",
  paymentCompleted: true,

  // Appointment
  schedulingCompleted: true,

  // Clinical decision support
  mwlEligibility: true,
  syncVisit: false,
  clearanceRequired: false,

  // Additional fields
  phoneNumber: "+1-555-123-4567", // Alternative phone field
  mwlExclusivity: true,
  lastMwlDose: "2 weeks ago",
  glp1MedicationPenImage: "https://example.com/medication-pen-image.jpg",
};

export const invalidIntakeData: Partial<IntakeFormData> = {
  firstName: "",
  lastName: "Doe",
  email: "invalid-email",
  phone: "123", // Too short
  dateOfBirth: "2030-01-01", // Future date
  gender: "",
};
