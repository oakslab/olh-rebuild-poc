import { NextRequest, NextResponse } from "next/server";
import { medplum } from "@/lib/medplum";
import {
  Patient,
  Bundle,
  Observation,
  Goal,
  Condition,
  MedicationStatement,
  Procedure,
  AllergyIntolerance,
  MedicationRequest,
  ServiceRequest,
  Consent,
  Invoice,
  Appointment,
} from "@medplum/fhirtypes";
import { withAuth } from "@/lib/auth-middleware";

export interface FhirResourceMapping {
  resourceType: string;
  resourceId: string;
  resourcePath: string;
  displayName?: string;
  code?: string;
  category?: string;
}

export interface PatientDetailResponse {
  success: boolean;
  message: string;
  data?: {
    patient: Patient;
    observations: Observation[];
    goals: Goal[];
    conditions: Condition[];
    medicationStatements: MedicationStatement[];
    procedures: Procedure[];
    allergies: AllergyIntolerance[];
    medicationRequests: MedicationRequest[];
    serviceRequests: ServiceRequest[];
    consents: Consent[];
    invoices: Invoice[];
    appointments: Appointment[];
    resourceMappings: {
      patient: FhirResourceMapping;
      observations: FhirResourceMapping[];
      goals: FhirResourceMapping[];
      conditions: FhirResourceMapping[];
      medicationStatements: FhirResourceMapping[];
      procedures: FhirResourceMapping[];
      allergies: FhirResourceMapping[];
      medicationRequests: FhirResourceMapping[];
      serviceRequests: FhirResourceMapping[];
      consents: FhirResourceMapping[];
      invoices: FhirResourceMapping[];
      appointments: FhirResourceMapping[];
    };
  };
  error?: string;
}

/**
 * Helper function to create resource mapping
 */
function createResourceMapping(
  resource: any,
  displayName?: string,
  code?: string,
  category?: string
): FhirResourceMapping {
  return {
    resourceType: resource.resourceType,
    resourceId: resource.id || "",
    resourcePath: `${resource.resourceType}/${resource.id}`,
    displayName,
    code,
    category,
  };
}

/**
 * GET /api/patient/[id] - Fetch comprehensive patient data from Medplum
 */
export const GET = withAuth(async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PatientDetailResponse>> {
  try {
    const { id: patientId } = await params;

    if (!patientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient ID is required",
        },
        { status: 400 }
      );
    }

    // Fetch patient data
    const patient = await medplum.readResource("Patient", patientId);

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found",
        },
        { status: 404 }
      );
    }

    // Fetch all related resources in parallel for better performance
    const [
      observations,
      goals,
      conditions,
      medicationStatements,
      procedures,
      allergies,
      medicationRequests,
      serviceRequests,
      consents,
      invoices,
      appointments,
    ] = await Promise.all([
      // Observations (vital signs, lab results, social history, etc.)
      medplum.searchResources("Observation", {
        subject: `Patient/${patientId}`,
        _sort: "-_lastUpdated",
        _count: "100",
      }),
      // Goals (weight loss goals, main reasons)
      medplum.searchResources("Goal", {
        subject: `Patient/${patientId}`,
        _sort: "-_lastUpdated",
      }),
      // Conditions (medical exclusions, comorbidities)
      medplum.searchResources("Condition", {
        subject: `Patient/${patientId}`,
        _sort: "-_lastUpdated",
      }),
      // Medication Statements (current medications, weight loss meds, opiates)
      medplum.searchResources("MedicationStatement", {
        subject: `Patient/${patientId}`,
        _sort: "-_lastUpdated",
      }),
      // Procedures (surgeries)
      medplum.searchResources("Procedure", {
        subject: `Patient/${patientId}`,
        _sort: "-_lastUpdated",
      }),
      // Allergies
      medplum.searchResources("AllergyIntolerance", {
        patient: `Patient/${patientId}`,
        _sort: "-_lastUpdated",
      }),
      // Medication Requests (treatment plans)
      medplum.searchResources("MedicationRequest", {
        subject: `Patient/${patientId}`,
        _sort: "-_lastUpdated",
      }),
      // Service Requests (sync visits, clearance requirements)
      medplum.searchResources("ServiceRequest", {
        subject: `Patient/${patientId}`,
        _sort: "-_lastUpdated",
      }),
      // Consents
      medplum.searchResources("Consent", {
        patient: `Patient/${patientId}`,
        _sort: "-_lastUpdated",
      }),
      // Invoices (billing information)
      medplum.searchResources("Invoice", {
        subject: `Patient/${patientId}`,
        _sort: "-_lastUpdated",
      }),
      // Appointments
      medplum.searchResources("Appointment", {
        actor: `Patient/${patientId}`,
        _sort: "-_lastUpdated",
      }),
    ]);

    // Create resource mappings
    const resourceMappings = {
      patient: createResourceMapping(
        patient,
        "Patient Demographics",
        undefined,
        "Demographics"
      ),
      observations: observations.map(obs => {
        const code = obs.code?.coding?.[0]?.code;
        const displayName = obs.code?.text || obs.code?.coding?.[0]?.display;
        const category = obs.category?.[0]?.coding?.[0]?.code;
        return createResourceMapping(obs, displayName, code, category);
      }),
      goals: goals.map(goal => {
        const displayName =
          goal.description?.text || goal.description?.coding?.[0]?.display;
        return createResourceMapping(goal, displayName);
      }),
      conditions: conditions.map(condition => {
        const displayName =
          condition.code?.text || condition.code?.coding?.[0]?.display;
        const code = condition.code?.coding?.[0]?.code;
        return createResourceMapping(condition, displayName, code);
      }),
      medicationStatements: medicationStatements.map(med => {
        const displayName =
          med.medicationCodeableConcept?.text ||
          med.medicationCodeableConcept?.coding?.[0]?.display;
        const code = med.medicationCodeableConcept?.coding?.[0]?.code;
        return createResourceMapping(med, displayName, code);
      }),
      procedures: procedures.map(proc => {
        const displayName = proc.code?.text || proc.code?.coding?.[0]?.display;
        const code = proc.code?.coding?.[0]?.code;
        return createResourceMapping(proc, displayName, code);
      }),
      allergies: allergies.map(allergy => {
        const displayName =
          allergy.code?.text || allergy.code?.coding?.[0]?.display;
        const code = allergy.code?.coding?.[0]?.code;
        return createResourceMapping(allergy, displayName, code);
      }),
      medicationRequests: medicationRequests.map(med => {
        const displayName =
          med.medicationCodeableConcept?.text ||
          med.medicationCodeableConcept?.coding?.[0]?.display;
        const code = med.medicationCodeableConcept?.coding?.[0]?.code;
        return createResourceMapping(med, displayName, code);
      }),
      serviceRequests: serviceRequests.map(sr => {
        const displayName = sr.code?.text || sr.code?.coding?.[0]?.display;
        const code = sr.code?.coding?.[0]?.code;
        return createResourceMapping(sr, displayName, code);
      }),
      consents: consents.map(consent => {
        const displayName =
          consent.category?.[0]?.coding?.[0]?.display || "Consent";
        const code = consent.category?.[0]?.coding?.[0]?.code;
        return createResourceMapping(consent, displayName, code);
      }),
      invoices: invoices.map(invoice => {
        const displayName = invoice.type?.coding?.[0]?.display || "Invoice";
        const code = invoice.type?.coding?.[0]?.code;
        return createResourceMapping(invoice, displayName, code);
      }),
      appointments: appointments.map(appointment => {
        const displayName =
          appointment.serviceType?.[0]?.coding?.[0]?.display || "Appointment";
        const code = appointment.serviceType?.[0]?.coding?.[0]?.code;
        return createResourceMapping(appointment, displayName, code);
      }),
    };

    return NextResponse.json({
      success: true,
      message: "Patient data retrieved successfully",
      data: {
        patient,
        observations,
        goals,
        conditions,
        medicationStatements,
        procedures,
        allergies,
        medicationRequests,
        serviceRequests,
        consents,
        invoices,
        appointments,
        resourceMappings,
      },
    });
  } catch (error) {
    console.error("Error fetching patient data:", error);

    // Handle specific Medplum errors
    if (error instanceof Error) {
      if (
        error.message.includes("404") ||
        error.message.includes("Not Found")
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Patient not found",
            error: error.message,
          },
          { status: 404 }
        );
      }

      if (
        error.message.includes("403") ||
        error.message.includes("Forbidden")
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Access denied to patient data",
            error: error.message,
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve patient data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
