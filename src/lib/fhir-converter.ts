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
    telecom: createPatientTelecom(intakeData),
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
 * Creates patient telecom entries for email and phone
 */
function createPatientTelecom(intakeData: IntakeFormData): ContactPoint[] {
  const telecom: ContactPoint[] = [];

  // Email
  if (intakeData.email) {
    telecom.push({
      system: "email",
      value: intakeData.email,
      use: "home",
    } as ContactPoint);
  }

  // Phone - support both phone and phoneNumber fields for backward compatibility
  const phoneValue = intakeData.phone || intakeData.phoneNumber;
  if (phoneValue) {
    telecom.push({
      system: "phone",
      value: phoneValue,
      use: "home",
    } as ContactPoint);
  }

  return telecom;
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

  // Add shipping address if provided (following CSV mapping specification)
  if (intakeData.shippingAddress) {
    addresses.push({
      use: "temp", // patient.address[1].use = "temp"
      type: "postal", // patient.address[1].type = "postal"
      line: [
        intakeData.shippingAddress.fullName || "", // patient.address[1].line[0]
        intakeData.shippingAddress.address1 || "", // patient.address[1].line[1]
      ].filter(Boolean),
      city: intakeData.shippingAddress.city, // patient.address[1].city
      state: intakeData.shippingAddress.state, // patient.address[1].state
      postalCode: intakeData.shippingAddress.zipCode, // patient.address[1].postalCode
      country: "US",
    } as Address);
  }

  // Add billing address if provided (following CSV mapping specification)
  if (intakeData.paymentAddress) {
    addresses.push({
      use: "billing", // patient.address[2].use = "billing"
      type: "postal", // patient.address[2].type = "postal"
      line: [intakeData.paymentAddress.fullName || ""].filter(Boolean), // patient.address[2].line[0]
      postalCode: intakeData.paymentAddress.zipCode, // patient.address[2].postalCode
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
 * Converts weight goal and main reasons to FHIR Goal resources
 */
export function convertToFHIRGoals(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): Goal[] {
  const goals: Goal[] = [];

  // Weight loss goal
  if (intakeData.weightGoal) {
    goals.push({
      resourceType: "Goal",
      id: randomUUID(),
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
    });
  }

  // Main reasons for weight loss (from CSV mapping)
  if (intakeData.mainReason?.length) {
    intakeData.mainReason.forEach(reason => {
      const goal: Goal = {
        resourceType: "Goal",
        id: randomUUID(),
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
          text: reason,
        },
        subject: {
          reference: patientUrnUuid,
        },
        startDate: new Date().toISOString().split("T")[0],
      };

      // Add SNOMED codes based on common reasons (as suggested in CSV)
      const snomedMapping: Record<string, { code: string; display: string }> = {
        longevity: { code: "111951006", display: "Longevity" },
        "reduce risk": { code: "1255619009", display: "Risk level" },
        "improve health": { code: "182840001", display: "Improve health" },
        "increase energy": { code: "248263006", display: "Increase energy" },
        "reduce cardiovascular risk": {
          code: "1255619009",
          display: "Risk level",
        },
        "improve diabetes control": {
          code: "182840001",
          display: "Improve health",
        },
      };

      // Try to match reason to SNOMED code
      const reasonLower = reason.toLowerCase();
      for (const [key, snomed] of Object.entries(snomedMapping)) {
        if (reasonLower.includes(key)) {
          // Add SNOMED code as extension since Goal.code doesn't exist in FHIR R4
          goal.extension = [
            {
              url: "https://openloop.org/fhir/goal-snomed-code",
              valueCoding: {
                system: "http://snomed.info/sct",
                code: snomed.code,
                display: snomed.display,
              },
            },
          ];
          break;
        }
      }

      goals.push(goal);
    });
  }

  return goals;
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

  // Weight loss medications with enhanced timing
  if (
    intakeData.priorWeightLossMedsUse &&
    intakeData.weightLossMedicationDescription
  ) {
    const medicationStatement: MedicationStatement = {
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
    };

    // Add timing information if lastMwlDose is provided (CSV mapping: medicationStatement.dosage.timing)
    if (intakeData.lastMwlDose) {
      medicationStatement.dosage![0].timing = {
        repeat: {
          // Use extension for custom timing data since bounds structure is complex
          extension: [
            {
              url: "https://openloop.org/fhir/last-dose-timing",
              valueString: intakeData.lastMwlDose,
            },
          ],
        },
      };

      // Add as additional text note as well
      medicationStatement.note = [
        {
          text: `Last dose: ${intakeData.lastMwlDose}`,
        },
      ];
    }

    medicationStatements.push(medicationStatement);
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
 * Converts social history and lifestyle observations to FHIR Observation resources
 */
export function convertToFHIRSocialHistoryObservations(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): Observation[] {
  const observations: Observation[] = [];

  // Willing to participate in activities (from CSV mapping)
  if (intakeData.willingTo?.length) {
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
            system: "https://openloop.org/fhir/observation-codes",
            code: "willing-to-participate",
            display: "Willing to participate in activities",
          },
        ],
      },
      subject: {
        reference: patientUrnUuid,
      },
      effectiveDateTime: new Date().toISOString(),
      component: intakeData.willingTo.map(activity => ({
        code: {
          text: "Activity willingness",
        },
        valueString: activity,
      })),
    });
  }

  // Weight change in 12 months (social history context)
  if (intakeData.weightChangeIn12Months) {
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
            system: "https://openloop.org/fhir/observation-codes",
            code: "weight-change-12mo",
            display: "Weight change in last 12 months",
          },
        ],
      },
      subject: {
        reference: patientUrnUuid,
      },
      effectiveDateTime: new Date().toISOString(),
      valueString: intakeData.weightChangeIn12Months,
    });
  }

  return observations;
}

/**
 * Converts treatment plan to FHIR MedicationRequest resource
 */
export function convertToFHIRMedicationRequest(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): MedicationRequest | null {
  if (!intakeData.productId || !intakeData.productName) return null;

  const medicationRequest: MedicationRequest = {
    resourceType: "MedicationRequest",
    id: randomUUID(),
    status: "draft",
    intent: "proposal",
    medicationCodeableConcept: {
      coding: [
        {
          system: "https://openloop.org/fhir/medication-codes",
          code: intakeData.productId,
          display: intakeData.productName,
        },
      ],
      text: intakeData.productName,
    },
    subject: {
      reference: patientUrnUuid,
    },
    authoredOn: new Date().toISOString(),
    note: intakeData.lastMwlDose
      ? [
          {
            text: `Last dose: ${intakeData.lastMwlDose}`,
          },
        ]
      : undefined,
  };

  return medicationRequest;
}

/**
 * Converts sync visit and clearance requirements to FHIR ServiceRequest resources
 */
export function convertToFHIRServiceRequests(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): ServiceRequest[] {
  const serviceRequests: ServiceRequest[] = [];

  // Sync visit service request
  if (intakeData.syncVisit) {
    serviceRequests.push({
      resourceType: "ServiceRequest",
      id: randomUUID(),
      status: "active",
      intent: "plan",
      code: {
        coding: [
          {
            system: "https://openloop.org/fhir/service-codes",
            code: "sync-telehealth-visit",
            display: "Synchronous telehealth visit",
          },
        ],
      },
      subject: {
        reference: patientUrnUuid,
      },
      authoredOn: new Date().toISOString(),
      note: intakeData.syncVisitReason
        ? [
            {
              text: intakeData.syncVisitReason,
            },
          ]
        : undefined,
    });
  }

  // Medical clearance service request
  if (intakeData.clearanceRequired) {
    serviceRequests.push({
      resourceType: "ServiceRequest",
      id: randomUUID(),
      status: "active",
      intent: "plan",
      code: {
        coding: [
          {
            system: "https://openloop.org/fhir/service-codes",
            code: "medical-clearance-mwl",
            display: "Medical clearance for MWL/GLP-1",
          },
        ],
      },
      subject: {
        reference: patientUrnUuid,
      },
      authoredOn: new Date().toISOString(),
    });
  }

  return serviceRequests;
}

/**
 * Converts consent information to FHIR Consent resource
 */
export function convertToFHIRConsent(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): Consent | null {
  if (!intakeData.consentTc) return null;

  const consent: Consent = {
    resourceType: "Consent",
    id: randomUUID(),
    status: "active",
    scope: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/consentscope",
          code: "treatment",
          display: "Treatment",
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system:
              "http://terminology.hl7.org/CodeSystem/consentcategorycodes",
            code: "acd",
            display: "Advance Care Directive",
          },
        ],
      },
    ],
    patient: {
      reference: patientUrnUuid,
    },
    dateTime: new Date().toISOString(),
    provision: {
      type: "permit",
    },
  };

  return consent;
}

/**
 * Converts pricing and payment information to FHIR Invoice resource
 */
export function convertToFHIRInvoice(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): Invoice | null {
  if (!intakeData.price && !intakeData.priceId && !intakeData.subscriptionId)
    return null;

  const invoice: Invoice = {
    resourceType: "Invoice",
    id: randomUUID(),
    status: intakeData.paymentCompleted ? "issued" : "draft",
    subject: {
      reference: patientUrnUuid,
    },
    date: new Date().toISOString(),
    identifier: [],
  };

  // Add identifiers
  if (intakeData.priceId) {
    invoice.identifier!.push({
      system: "https://openloop.org/fhir/price-ids",
      value: intakeData.priceId,
      type: {
        text: "priceId",
      },
    });
  }

  if (intakeData.subscriptionId) {
    invoice.identifier!.push({
      system: "https://openloop.org/fhir/subscription-ids",
      value: intakeData.subscriptionId,
      type: {
        text: "subscriptionId",
      },
    });
  }

  // Add total amount
  if (intakeData.price) {
    invoice.totalGross = {
      value: intakeData.price,
      currency: (intakeData.priceCurrency as any) || "USD",
    };
  }

  return invoice;
}

/**
 * Converts scheduling information to FHIR Appointment resource
 */
export function convertToFHIRAppointment(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): Appointment | null {
  if (!intakeData.schedulingCompleted) return null;

  const appointment: Appointment = {
    resourceType: "Appointment",
    id: randomUUID(),
    status: "booked",
    participant: [
      {
        actor: {
          reference: patientUrnUuid,
        },
        status: "accepted",
      },
    ],
  };

  return appointment;
}

/**
 * Converts medication image to FHIR Media resource
 */
export function convertToFHIRMedia(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): Media | null {
  if (!intakeData.glp1MedicationPenImage) return null;

  const media: Media = {
    resourceType: "Media",
    id: randomUUID(),
    status: "completed",
    type: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/media-type",
          code: "image",
          display: "Image",
        },
      ],
    },
    subject: {
      reference: patientUrnUuid,
    },
    createdDateTime: new Date().toISOString(),
    content: {
      contentType: "image/jpeg",
      url: intakeData.glp1MedicationPenImage,
      title: "GLP-1 medication pen/vial image",
    },
  };

  return media;
}

/**
 * Converts additional administrative observations
 */
export function convertToFHIRAdministrativeObservations(
  intakeData: IntakeFormData,
  patientUrnUuid: string
): Observation[] {
  const observations: Observation[] = [];

  // MWL eligibility observation
  if (intakeData.mwlEligibility !== undefined) {
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
              code: "survey",
              display: "Survey",
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: "https://openloop.org/fhir/observation-codes",
            code: "mwl-eligibility",
            display: "Medical weight loss eligibility",
          },
        ],
      },
      subject: {
        reference: patientUrnUuid,
      },
      effectiveDateTime: new Date().toISOString(),
      valueBoolean: intakeData.mwlEligibility,
    });
  }

  // DQ reason observation
  if (intakeData.dqReason) {
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
              code: "survey",
              display: "Survey",
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: "https://openloop.org/fhir/observation-codes",
            code: "dq-reason",
            display: "Disqualification reason",
          },
        ],
      },
      subject: {
        reference: patientUrnUuid,
      },
      effectiveDateTime: new Date().toISOString(),
      valueString: intakeData.dqReason,
    });
  }

  // MWL exclusivity observation
  if (intakeData.mwlExclusivity !== undefined) {
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
              code: "survey",
              display: "Survey",
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: "https://openloop.org/fhir/observation-codes",
            code: "mwl-exclusivity",
            display: "MWL platform exclusivity agreement",
          },
        ],
      },
      subject: {
        reference: patientUrnUuid,
      },
      effectiveDateTime: new Date().toISOString(),
      valueBoolean: intakeData.mwlExclusivity,
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

  // Add goals (weight goal and main reasons)
  const goals = convertToFHIRGoals(intakeData, patientUrnUuid);
  goals.forEach(goal => {
    entries.push({
      fullUrl: `urn:uuid:${goal.id}`,
      resource: goal,
      request: {
        method: "POST",
        url: "Goal",
      },
    });
  });

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

  // Add social history observations
  const socialHistoryObservations = convertToFHIRSocialHistoryObservations(
    intakeData,
    patientUrnUuid
  );
  socialHistoryObservations.forEach(observation => {
    entries.push({
      fullUrl: `urn:uuid:${observation.id}`,
      resource: observation,
      request: {
        method: "POST",
        url: "Observation",
      },
    });
  });

  // Add administrative observations
  const administrativeObservations = convertToFHIRAdministrativeObservations(
    intakeData,
    patientUrnUuid
  );
  administrativeObservations.forEach(observation => {
    entries.push({
      fullUrl: `urn:uuid:${observation.id}`,
      resource: observation,
      request: {
        method: "POST",
        url: "Observation",
      },
    });
  });

  // Add medication request
  const medicationRequest = convertToFHIRMedicationRequest(
    intakeData,
    patientUrnUuid
  );
  if (medicationRequest) {
    entries.push({
      fullUrl: `urn:uuid:${medicationRequest.id}`,
      resource: medicationRequest,
      request: {
        method: "POST",
        url: "MedicationRequest",
      },
    });
  }

  // Add service requests
  const serviceRequests = convertToFHIRServiceRequests(
    intakeData,
    patientUrnUuid
  );
  serviceRequests.forEach(serviceRequest => {
    entries.push({
      fullUrl: `urn:uuid:${serviceRequest.id}`,
      resource: serviceRequest,
      request: {
        method: "POST",
        url: "ServiceRequest",
      },
    });
  });

  // Add consent
  const consent = convertToFHIRConsent(intakeData, patientUrnUuid);
  if (consent) {
    entries.push({
      fullUrl: `urn:uuid:${consent.id}`,
      resource: consent,
      request: {
        method: "POST",
        url: "Consent",
      },
    });
  }

  // Add invoice
  const invoice = convertToFHIRInvoice(intakeData, patientUrnUuid);
  if (invoice) {
    entries.push({
      fullUrl: `urn:uuid:${invoice.id}`,
      resource: invoice,
      request: {
        method: "POST",
        url: "Invoice",
      },
    });
  }

  // Add appointment
  const appointment = convertToFHIRAppointment(intakeData, patientUrnUuid);
  if (appointment) {
    entries.push({
      fullUrl: `urn:uuid:${appointment.id}`,
      resource: appointment,
      request: {
        method: "POST",
        url: "Appointment",
      },
    });
  }

  // Add media
  const media = convertToFHIRMedia(intakeData, patientUrnUuid);
  if (media) {
    entries.push({
      fullUrl: `urn:uuid:${media.id}`,
      resource: media,
      request: {
        method: "POST",
        url: "Media",
      },
    });
  }

  return {
    resourceType: "Bundle",
    type: "transaction",
    entry: entries,
  };
}
