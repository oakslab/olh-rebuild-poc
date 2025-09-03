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
  };
  error?: string;
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
