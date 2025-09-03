import { NextRequest, NextResponse } from "next/server";
import { IntakeFormData, IntakeFormResponse } from "@/types/intake";
import { validateIntakeForm, formatValidationErrors } from "@/lib/validation";
import { medplum } from "@/lib/medplum";
import { createIntakeBundle } from "@/lib/fhir-converter";
import { randomUUID } from "crypto";
import { withAuth } from "@/lib/auth-middleware";

export const POST = withAuth(async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: IntakeFormData = await request.json();

    // Validate the form data
    const validationErrors = validateIntakeForm(body);

    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors);
      const response: IntakeFormResponse = {
        success: false,
        message: "Validation failed. Please check the form and try again.",
        errors: formattedErrors,
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Generate a unique submission ID
    const submissionId = randomUUID();

    // Create FHIR bundle from intake data
    const fhirBundle = createIntakeBundle(body);

    let medplumResponse;
    try {
      // Submit to Medplum FHIR server
      medplumResponse = await medplum.executeBatch(fhirBundle);

      console.log("medplumResponse", JSON.stringify(medplumResponse, null, 2));

      console.log("Successfully submitted to Medplum:", {
        submissionId,
        patientName: `${body.firstName} ${body.lastName}`,
        email: body.email,
        gender: body.gender,
        fhirBundleId: medplumResponse.id,
        timestamp: new Date().toISOString(),
      });
    } catch (medplumError: any) {
      console.error("Medplum submission failed:", medplumError);

      // Create meaningful error message based on the error type
      let errorMessage =
        "Failed to submit to healthcare system. Please try again later.";
      let statusCode = 500;

      if (medplumError?.response) {
        // HTTP error response from Medplum API
        const status = medplumError.response.status;
        const responseData = medplumError.response.data;

        switch (status) {
          case 400:
            errorMessage =
              "Invalid data format. Please check your information and try again.";
            statusCode = 400;
            break;
          case 401:
            errorMessage =
              "Authentication failed with healthcare system. Please contact support.";
            statusCode = 502; // Bad Gateway - service configuration issue
            break;
          case 403:
            errorMessage =
              "Access denied to healthcare system. Please contact support.";
            statusCode = 502;
            break;
          case 404:
            errorMessage =
              "Healthcare system endpoint not found. Please contact support.";
            statusCode = 502;
            break;
          case 429:
            errorMessage =
              "Too many requests. Please wait a moment and try again.";
            statusCode = 429;
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage =
              "Healthcare system is temporarily unavailable. Please try again later.";
            statusCode = 502;
            break;
          default:
            errorMessage = `Healthcare system error (${status}). Please try again later.`;
            statusCode = 502;
        }

        // Include additional error details if available
        if (responseData?.issue) {
          console.error("FHIR OperationOutcome:", responseData.issue);
          // For validation errors, provide more specific feedback
          if (status === 400 && responseData.issue.length > 0) {
            const issues = responseData.issue
              .map((issue: any) => issue.diagnostics || issue.details?.text)
              .filter(Boolean);
            if (issues.length > 0) {
              errorMessage = `Data validation failed: ${issues.join(", ")}`;
            }
          }
        }
      } else if (
        medplumError?.code === "ECONNREFUSED" ||
        medplumError?.code === "ENOTFOUND"
      ) {
        errorMessage =
          "Cannot connect to healthcare system. Please check your internet connection and try again.";
        statusCode = 502;
      } else if (medplumError?.code === "ETIMEDOUT") {
        errorMessage =
          "Request to healthcare system timed out. Please try again.";
        statusCode = 504;
      } else if (
        medplumError?.message?.includes("credentials") ||
        medplumError?.message?.includes("authentication")
      ) {
        errorMessage =
          "Healthcare system authentication failed. Please contact support.";
        statusCode = 502;
      }

      const response: IntakeFormResponse = {
        success: false,
        message: errorMessage,
      };

      return NextResponse.json(response, { status: statusCode });
    }

    // Return success response
    const response: IntakeFormResponse = {
      success: true,
      message:
        "Your intake form has been successfully submitted to our FHIR-compliant healthcare system. We will contact you shortly to schedule your appointment.",
      submissionId,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error processing intake form:", error);

    const response: IntakeFormResponse = {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };

    return NextResponse.json(response, { status: 500 });
  }
});

export async function GET() {
  // Return API information for GET requests
  return NextResponse.json({
    message: "Intake Form API with Medplum FHIR Integration",
    version: "2.0.0",
    methods: ["POST"],
    description:
      "Submit patient intake form data to FHIR-compliant healthcare system",
    features: [
      "FHIR R4 compliant data storage",
      "Medplum healthcare platform integration",
      "Comprehensive form validation",
      "HIPAA-ready architecture",
      "Structured healthcare data management",
    ],
    fhirResources: [
      "Patient - Demographics, contact information, and addresses",
      "Observation - Weight measurement (LOINC code 29463-7)",
      "Observation - Height measurement (LOINC code 8302-2)",
      "Observation - BMI calculation (LOINC code 39156-5)",
      "Observation - Laboratory values (glucose, hemoglobin A1c)",
      "Observation - Vital signs (blood pressure, heart rate)",
      "Observation - Social history and lifestyle factors",
      "Observation - Administrative data (eligibility, DQ reasons)",
      "Goal - Weight management goals and targets",
      "Condition - Medical conditions and comorbidities",
      "MedicationStatement - Current and historical medications",
      "MedicationRequest - Treatment plan prescriptions",
      "Procedure - Surgical history and procedures",
      "AllergyIntolerance - Medication allergies and reactions",
      "ServiceRequest - Sync visits and medical clearance",
      "Consent - Terms and conditions agreements",
      "Invoice - Pricing and payment information",
      "Appointment - Scheduling information",
    ],
    endpoints: {
      POST: {
        path: "/api/intake",
        description: "Submit a new intake form and create FHIR resources",
        contentType: "application/json",
        requiredFields: [
          "firstName",
          "lastName",
          "email",
          "phone",
          "dateOfBirth",
          "gender",
          "address",
          "weight",
          "height",
        ],
        optionalFields: [
          "weightGoal",
          "medicalExclusionCriteria",
          "weightRelatedComorbidity",
          "anyMedications",
          "anyMedicationsDescription",
          "priorWeightLossMedsUse",
          "weightLossMedicationDescription",
          "opiatePainMedications",
          "abdominalPelvicSurgeries",
          "glucoseValue",
          "hemoglobinValue",
          "bloodPressureRange",
          "restingHeartRateRange",
          "medicationAllergies",
          "medicationAllergiesDescription",
          "anyFurtherInformation",
          "shippingAddress",
          "paymentAddress",
          "consentTc",
          "productId",
          "schedulingCompleted",
          "mwlEligibility",
          "// ... and many more optional fields for comprehensive intake",
        ],
      },
    },
  });
}
