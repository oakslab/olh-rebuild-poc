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
};

export const invalidIntakeData: Partial<IntakeFormData> = {
  firstName: "",
  lastName: "Doe",
  email: "invalid-email",
  phone: "123", // Too short
  dateOfBirth: "2030-01-01", // Future date
  gender: "",
};
