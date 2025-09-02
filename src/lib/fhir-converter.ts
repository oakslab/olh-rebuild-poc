import {
  Patient,
  ContactPoint,
  HumanName,
  Address,
  Bundle,
  BundleEntry,
  Observation,
  Goal,
  Condition,
  MedicationStatement,
  Procedure,
  AllergyIntolerance,
  Consent,
  MedicationRequest,
  Appointment,
  ServiceRequest,
  Media,
  Invoice,
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
    address: createPatientAddresses(intakeData),
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
 * Creates patient addresses including home, shipping, and billing addresses
 */
function createPatientAddresses(intakeData: IntakeFormData): Address[] {
  const addresses: Address[] = [
    {
      use: "home",
      type: "physical",
      line: [intakeData.address.street],
      city: intakeData.address.city,
      state: intakeData.address.state,
      postalCode: intakeData.address.zipCode,
      country: "US",
    } as Address,
  ];

  // Add shipping address if provided
  if (intakeData.shippingAddress) {
    addresses.push({
      use: "temp",
      type: "postal",
      line: [
        intakeData.shippingAddress.fullName || "",
        intakeData.shippingAddress.address1 || "",
      ].filter(Boolean),
      city: intakeData.shippingAddress.city,
      state: intakeData.shippingAddress.state,
      postalCode: intakeData.shippingAddress.zipCode,
      country: "US",
    } as Address);
  }

  // Add billing address if provided
  if (intakeData.paymentAddress) {
    addresses.push({
      use: "billing",
      type: "postal",
      line: [intakeData.paymentAddress.fullName || ""].filter(Boolean),
      postalCode: intakeData.paymentAddress.zipCode,
      country: "US",
    } as Address);
  }

  return addresses;
}

/**
 * Converts BMI calculation to a FHIR Observation resource
 */
export function convertToFHIRBMIObservation(
  intakeData: IntakeFormData,
  patientUrnUuid: string,
  observationId: string
): Observation {
  // Calculate BMI: weight (lb) / height (in)² × 703
  const bmi =
    (intakeData.weight / (intakeData.height * intakeData.height)) * 703;

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
          code: "39156-5",
          display: "Body mass index (BMI) [Ratio]",
        },
      ],
    },
    subject: {
      reference: patientUrnUuid,
    },
    effectiveDateTime: new Date().toISOString(),
    valueQuantity: {
      value: Math.round(bmi * 10) / 10, // Round to 1 decimal place
      unit: "kg/m2",
      system: "http://unitsofmeasure.org",
      code: "kg/m2",
    },
  };

  return observation;
}

/**
 * Converts weight goal to a FHIR Goal resource
 */
export function convertToFHIRGoal(
  intakeData: IntakeFormData,
  patientUrnUuid: string,
  goalId: string
): Goal | null {
  if (!intakeData.weightGoal) return null;

  const goal: Goal = {
    resourceType: "Goal",
    id: goalId,
    lifecycleStatus: "active",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/goal-category",
            code: "behavioral",
            display: "Behavioral",
          },
        ],
      },
    ],
    description: {
      text: intakeData.weightGoal,
    },
    subject: {
      reference: patientUrnUuid,
    },
    startDate: new Date().toISOString().split("T")[0],
  };

  return goal;
}

/**
 * Converts medical conditions to FHIR Condition resources
 */
export function convertToFHIRConditions(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): Condition[] {
  const conditions: Condition[] = [];

  // Medical exclusion criteria
  if (intakeData.medicalExclusionCriteria?.length) {
    intakeData.medicalExclusionCriteria.forEach(condition => {
      conditions.push({
        resourceType: "Condition",
        id: randomUUID(),
        clinicalStatus: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/condition-clinical",
              code: "active",
            },
          ],
        },
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/condition-category",
                code: "problem-list-item",
              },
            ],
          },
        ],
        code: {
          text: condition,
        },
        subject: {
          reference: patientUrnUuid,
        },
      });
    });
  }

  // Weight-related comorbidities
  if (intakeData.weightRelatedComorbidity?.length) {
    intakeData.weightRelatedComorbidity.forEach(condition => {
      conditions.push({
        resourceType: "Condition",
        id: randomUUID(),
        clinicalStatus: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/condition-clinical",
              code: "active",
            },
          ],
        },
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/condition-category",
                code: "problem-list-item",
              },
            ],
          },
        ],
        code: {
          text: condition,
        },
        subject: {
          reference: patientUrnUuid,
        },
      });
    });
  }

  // Other exclusion conditions
  if (intakeData.otherExclusionConditions?.length) {
    intakeData.otherExclusionConditions.forEach(condition => {
      conditions.push({
        resourceType: "Condition",
        id: randomUUID(),
        clinicalStatus: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/condition-clinical",
              code: "active",
            },
          ],
        },
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/condition-category",
                code: "problem-list-item",
              },
            ],
          },
        ],
        code: {
          text: condition,
        },
        subject: {
          reference: patientUrnUuid,
        },
      });
    });
  }

  return conditions;
}

/**
 * Converts medication information to FHIR MedicationStatement resources
 */
export function convertToFHIRMedicationStatements(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): MedicationStatement[] {
  const medicationStatements: MedicationStatement[] = [];

  // General medications
  if (intakeData.anyMedications && intakeData.anyMedicationsDescription) {
    medicationStatements.push({
      resourceType: "MedicationStatement",
      id: randomUUID(),
      status: "active",
      medicationCodeableConcept: {
        text: "Current medications",
      },
      subject: {
        reference: patientUrnUuid,
      },
      dosage: [
        {
          text: intakeData.anyMedicationsDescription,
        },
      ],
    });
  }

  // Weight loss medications
  if (
    intakeData.priorWeightLossMedsUse &&
    intakeData.weightLossMedicationDescription
  ) {
    medicationStatements.push({
      resourceType: "MedicationStatement",
      id: randomUUID(),
      status: "active",
      medicationCodeableConcept: {
        text: "Weight loss medications",
      },
      subject: {
        reference: patientUrnUuid,
      },
      dosage: [
        {
          text: intakeData.weightLossMedicationDescription,
        },
      ],
    });
  }

  // Opiate medications
  if (
    intakeData.opiatePainMedications &&
    intakeData.opiatePainMedicationsDescription
  ) {
    medicationStatements.push({
      resourceType: "MedicationStatement",
      id: randomUUID(),
      status: "active",
      medicationCodeableConcept: {
        text: "Opiate pain medications",
      },
      subject: {
        reference: patientUrnUuid,
      },
      dosage: [
        {
          text: intakeData.opiatePainMedicationsDescription,
        },
      ],
    });
  }

  return medicationStatements;
}

/**
 * Converts surgical procedures to FHIR Procedure resources
 */
export function convertToFHIRProcedures(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): Procedure[] {
  const procedures: Procedure[] = [];

  if (
    intakeData.abdominalPelvicSurgeries &&
    intakeData.abdominalPelvicSurgeriesDescription
  ) {
    procedures.push({
      resourceType: "Procedure",
      id: randomUUID(),
      status: "completed",
      code: {
        text: "Abdominal/pelvic surgery",
      },
      subject: {
        reference: patientUrnUuid,
      },
      note: [
        {
          text: intakeData.abdominalPelvicSurgeriesDescription,
        },
      ],
    });
  }

  return procedures;
}

/**
 * Converts allergy information to FHIR AllergyIntolerance resources
 */
export function convertToFHIRAllergies(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): AllergyIntolerance[] {
  const allergies: AllergyIntolerance[] = [];

  if (
    intakeData.medicationAllergies &&
    intakeData.medicationAllergiesDescription
  ) {
    allergies.push({
      resourceType: "AllergyIntolerance",
      id: randomUUID(),
      clinicalStatus: {
        coding: [
          {
            system:
              "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
            code: "active",
          },
        ],
      },
      code: {
        text: "Medication allergies",
      },
      patient: {
        reference: patientUrnUuid,
      },
      reaction: [
        {
          manifestation: [
            {
              text: intakeData.medicationAllergiesDescription,
            },
          ],
        },
      ],
    });
  }

  return allergies;
}

/**
 * Converts additional observations to FHIR Observation resources
 */
export function convertToFHIRAdditionalObservations(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): Observation[] {
  const observations: Observation[] = [];

  // Glucose value
  if (intakeData.glucoseValue !== undefined) {
    observations.push({
      resourceType: "Observation",
      id: randomUUID(),
      status: "final",
      category: [
        {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "laboratory",
              display: "Laboratory",
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "33747-0",
            display: "Fasting glucose [Mass/volume] in Serum or Plasma",
          },
        ],
      },
      subject: {
        reference: patientUrnUuid,
      },
      effectiveDateTime: new Date().toISOString(),
      valueQuantity: {
        value: intakeData.glucoseValue,
        unit: "mg/dL",
        system: "http://unitsofmeasure.org",
        code: "mg/dL",
      },
    });
  }

  // Hemoglobin A1c
  if (intakeData.hemoglobinValue !== undefined) {
    observations.push({
      resourceType: "Observation",
      id: randomUUID(),
      status: "final",
      category: [
        {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "laboratory",
              display: "Laboratory",
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "4548-4",
            display: "Hemoglobin A1c/Hemoglobin.total in Blood",
          },
        ],
      },
      subject: {
        reference: patientUrnUuid,
      },
      effectiveDateTime: new Date().toISOString(),
      valueQuantity: {
        value: intakeData.hemoglobinValue,
        unit: "%",
        system: "http://unitsofmeasure.org",
        code: "%",
      },
    });
  }

  // Blood pressure range
  if (intakeData.bloodPressureRange) {
    observations.push({
      resourceType: "Observation",
      id: randomUUID(),
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
            code: "85354-9",
            display: "Blood pressure panel with all children optional",
          },
        ],
      },
      subject: {
        reference: patientUrnUuid,
      },
      effectiveDateTime: new Date().toISOString(),
      valueString: intakeData.bloodPressureRange,
    });
  }

  // Resting heart rate
  if (intakeData.restingHeartRateRange) {
    observations.push({
      resourceType: "Observation",
      id: randomUUID(),
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
            code: "40443-4",
            display: "Heart rate --resting",
          },
        ],
      },
      subject: {
        reference: patientUrnUuid,
      },
      effectiveDateTime: new Date().toISOString(),
      valueString: intakeData.restingHeartRateRange,
    });
  }

  // Starting weight
  if (intakeData.startingWeightInLbs !== undefined) {
    observations.push({
      resourceType: "Observation",
      id: randomUUID(),
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
        text: "Starting weight",
      },
      subject: {
        reference: patientUrnUuid,
      },
      effectiveDateTime: new Date().toISOString(),
      valueQuantity: {
        value: intakeData.startingWeightInLbs,
        unit: "lb",
        system: "http://unitsofmeasure.org",
        code: "[lb_av]",
      },
    });
  }

  // Additional information for doctor
  if (
    intakeData.anyFurtherInformation &&
    intakeData.anyFurtherInformationDescription
  ) {
    observations.push({
      resourceType: "Observation",
      id: randomUUID(),
      status: "final",
      category: [
        {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "social-history",
              display: "Social History",
            },
          ],
        },
      ],
      code: {
        text: "Instructions for doctor",
      },
      subject: {
        reference: patientUrnUuid,
      },
      effectiveDateTime: new Date().toISOString(),
      valueString: intakeData.anyFurtherInformationDescription,
    });
  }

  // Weight management program history
  if (
    intakeData.weightManagementProgram &&
    intakeData.weightManagementProgramDescription
  ) {
    observations.push({
      resourceType: "Observation",
      id: randomUUID(),
      status: "final",
      category: [
        {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "social-history",
              display: "Social History",
            },
          ],
        },
      ],
      code: {
        text: "Prior weight management program",
      },
      subject: {
        reference: patientUrnUuid,
      },
      effectiveDateTime: new Date().toISOString(),
      note: [
        {
          text: intakeData.weightManagementProgramDescription,
        },
      ],
    });
  }

  // Lifestyle factors/formulation preferences
  if (intakeData.medicalLifestyleFactors?.length) {
    observations.push({
      resourceType: "Observation",
      id: randomUUID(),
      status: "final",
      category: [
        {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "social-history",
              display: "Social History",
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: "formulation-pref",
            display: "Formulation preferences",
          },
        ],
      },
      subject: {
        reference: patientUrnUuid,
      },
      effectiveDateTime: new Date().toISOString(),
      valueString: intakeData.medicalLifestyleFactors.join(", "),
    });
  }

  return observations;
}

/**
 * Creates a FHIR Bundle containing all intake-related resources
 */
export function createIntakeBundle(intakeData: IntakeFormData): Bundle {
  const patientId = randomUUID();
  const patientUrnUuid = `urn:uuid:${patientId}`;

  // Create all resources
  const patient = convertToFHIRPatient(intakeData, patientId);
  const entries: BundleEntry[] = [
    {
      fullUrl: patientUrnUuid,
      resource: patient,
      request: {
        method: "POST",
        url: "Patient",
      },
    },
  ];

  // Add weight observation
  const weightObservation = convertToFHIRWeightObservation(
    intakeData,
    patientUrnUuid,
    randomUUID()
  );
  entries.push({
    fullUrl: `urn:uuid:${weightObservation.id}`,
    resource: weightObservation,
    request: {
      method: "POST",
      url: "Observation",
    },
  });

  // Add height observation
  const heightObservation = convertToFHIRHeightObservation(
    intakeData,
    patientUrnUuid,
    randomUUID()
  );
  entries.push({
    fullUrl: `urn:uuid:${heightObservation.id}`,
    resource: heightObservation,
    request: {
      method: "POST",
      url: "Observation",
    },
  });

  // Add BMI observation
  const bmiObservation = convertToFHIRBMIObservation(
    intakeData,
    patientUrnUuid,
    randomUUID()
  );
  entries.push({
    fullUrl: `urn:uuid:${bmiObservation.id}`,
    resource: bmiObservation,
    request: {
      method: "POST",
      url: "Observation",
    },
  });

  // Add goal if provided
  const goal = convertToFHIRGoal(intakeData, patientUrnUuid, randomUUID());
  if (goal) {
    entries.push({
      fullUrl: `urn:uuid:${goal.id}`,
      resource: goal,
      request: {
        method: "POST",
        url: "Goal",
      },
    });
  }

  // Add conditions
  const conditions = convertToFHIRConditions(intakeData, patientUrnUuid);
  conditions.forEach(condition => {
    entries.push({
      fullUrl: `urn:uuid:${condition.id}`,
      resource: condition,
      request: {
        method: "POST",
        url: "Condition",
      },
    });
  });

  // Add medication statements
  const medicationStatements = convertToFHIRMedicationStatements(
    intakeData,
    patientUrnUuid
  );
  medicationStatements.forEach(medicationStatement => {
    entries.push({
      fullUrl: `urn:uuid:${medicationStatement.id}`,
      resource: medicationStatement,
      request: {
        method: "POST",
        url: "MedicationStatement",
      },
    });
  });

  // Add procedures
  const procedures = convertToFHIRProcedures(intakeData, patientUrnUuid);
  procedures.forEach(procedure => {
    entries.push({
      fullUrl: `urn:uuid:${procedure.id}`,
      resource: procedure,
      request: {
        method: "POST",
        url: "Procedure",
      },
    });
  });

  // Add allergies
  const allergies = convertToFHIRAllergies(intakeData, patientUrnUuid);
  allergies.forEach(allergy => {
    entries.push({
      fullUrl: `urn:uuid:${allergy.id}`,
      resource: allergy,
      request: {
        method: "POST",
        url: "AllergyIntolerance",
      },
    });
  });

  // Add additional observations
  const additionalObservations = convertToFHIRAdditionalObservations(
    intakeData,
    patientUrnUuid
  );
  additionalObservations.forEach(observation => {
    entries.push({
      fullUrl: `urn:uuid:${observation.id}`,
      resource: observation,
      request: {
        method: "POST",
        url: "Observation",
      },
    });
  });

  return {
    resourceType: "Bundle",
    type: "transaction",
    entry: entries,
  };
}
