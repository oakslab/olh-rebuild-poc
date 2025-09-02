import {
  Patient,
  ContactPoint,
  HumanName,
  Address,
  Bundle,
  BundleEntry,
  Observation,
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
 * Converts weight data to a FHIR Observation resource
 */
export function convertToFHIRWeightObservation(
  intakeData: IntakeFormData,
  patientUrnUuid: string,
  observationId: string
): Observation {
  const observation: Observation = {
    resourceType: "Observation",
    id: observationId,
    status: "final",
    category: [
      {
        coding: [
          {
            system:
              "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "Vital Signs",
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "29463-7",
          display: "Body weight",
        },
      ],
    },
    subject: {
      reference: patientUrnUuid,
    },
    effectiveDateTime: new Date().toISOString(),
    valueQuantity: {
      value: intakeData.weight,
      unit: "lb",
      system: "http://unitsofmeasure.org",
      code: "[lb_av]",
    },
  };

  return observation;
}

/**
 * Converts height data to a FHIR Observation resource
 */
export function convertToFHIRHeightObservation(
  intakeData: IntakeFormData,
  patientUrnUuid: string,
  observationId: string
): Observation {
  const observation: Observation = {
    resourceType: "Observation",
    id: observationId,
    status: "final",
    category: [
      {
        coding: [
          {
            system:
              "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "Vital Signs",
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "8302-2",
          display: "Body height",
        },
      ],
    },
    subject: {
      reference: patientUrnUuid,
    },
    effectiveDateTime: new Date().toISOString(),
    valueQuantity: {
      value: intakeData.height,
      unit: "in",
      system: "http://unitsofmeasure.org",
      code: "[in_i]",
    },
  };

  return observation;
}

/**
 * Creates a FHIR Bundle containing all intake-related resources
 */
export function createIntakeBundle(intakeData: IntakeFormData): Bundle {
  const patientId = randomUUID();
  const weightObservationId = randomUUID();
  const heightObservationId = randomUUID();

  // Create URN UUID for internal references
  const patientUrnUuid = `urn:uuid:${patientId}`;
  const weightObservationUrnUuid = `urn:uuid:${weightObservationId}`;
  const heightObservationUrnUuid = `urn:uuid:${heightObservationId}`;

  const patient = convertToFHIRPatient(intakeData, patientId);
  const weightObservation = convertToFHIRWeightObservation(
    intakeData,
    patientUrnUuid,
    weightObservationId
  );
  const heightObservation = convertToFHIRHeightObservation(
    intakeData,
    patientUrnUuid,
    heightObservationId
  );

  const entries: BundleEntry[] = [
    {
      fullUrl: patientUrnUuid,
      resource: patient,
      request: {
        method: "POST",
        url: "Patient",
      },
    },
    {
      fullUrl: weightObservationUrnUuid,
      resource: weightObservation,
      request: {
        method: "POST",
        url: "Observation",
      },
    },
    {
      fullUrl: heightObservationUrnUuid,
      resource: heightObservation,
      request: {
        method: "POST",
        url: "Observation",
      },
    },
  ];

  return {
    resourceType: "Bundle",
    type: "transaction",
    entry: entries,
  };
}
