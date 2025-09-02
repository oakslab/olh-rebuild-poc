import {
  Patient,
  ContactPoint,
  HumanName,
  Address,
  Bundle,
  BundleEntry,
} from "@medplum/fhirtypes";
import { IntakeFormData } from "@/types/intake";
import { randomUUID } from "crypto";

/**
 * Converts intake form data to a FHIR Patient resource
 */
export function convertToFHIRPatient(
  intakeData: IntakeFormData,
  patientId: string
): Patient {
  const patient: Patient = {
    resourceType: "Patient",
    active: true,
    identifier: [
      {
        system: "https://openloop.org/fhir/patient-ids",
        value: patientId,
      },
    ],
    name: [
      {
        use: "official",
        family: intakeData.lastName,
        given: [intakeData.firstName],
      } as HumanName,
    ],
    gender: intakeData.gender as "male" | "female" | "other" | "unknown",
    birthDate: intakeData.dateOfBirth,
    telecom: [
      {
        system: "email",
        value: intakeData.email,
        use: "home",
      } as ContactPoint,
      {
        system: "phone",
        value: intakeData.phone,
        use: "home",
      } as ContactPoint,
    ],
    address: [
      {
        use: "home",
        type: "physical",
        line: [intakeData.address.street],
        city: intakeData.address.city,
        state: intakeData.address.state,
        postalCode: intakeData.address.zipCode,
        country: "US",
      } as Address,
      {
        use: "temp",
        type: "postal",
        line: [intakeData.address.street],
        city: intakeData.address.city,
        state: intakeData.address.state,
        postalCode: intakeData.address.zipCode,
        country: "US",
      } as Address,
    ],
  };

  return patient;
}

/**
 * Creates a FHIR Bundle containing all intake-related resources
 */
export function createIntakeBundle(intakeData: IntakeFormData): Bundle {
  const patientId = randomUUID();
  const patient = convertToFHIRPatient(intakeData, patientId);

  const entries: BundleEntry[] = [
    {
      resource: patient,
      request: {
        method: "POST",
        url: "Patient",
      },
    },
  ];

  return {
    resourceType: "Bundle",
    type: "transaction",
    entry: entries,
  };
}
