import { NextRequest, NextResponse } from 'next/server';
import { IntakeFormData, IntakeFormResponse } from '@/types/intake';
import { validateIntakeForm, formatValidationErrors } from '@/lib/validation';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: IntakeFormData = await request.json();

    // Validate the form data
    const validationErrors = validateIntakeForm(body);

    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors);
      const response: IntakeFormResponse = {
        success: false,
        message: 'Validation failed. Please check the form and try again.',
        errors: formattedErrors,
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Generate a unique submission ID
    const submissionId = randomUUID();

    // Here you would typically:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Notify healthcare providers
    // 4. Create appointment if needed
    
    // For now, we'll just log the submission (in production, use proper logging)
    console.log('Intake form submitted:', {
      submissionId,
      patientName: `${body.firstName} ${body.lastName}`,
      email: body.email,
      reasonForVisit: body.reasonForVisit,
      timestamp: new Date().toISOString(),
    });

    // Simulate processing time (remove in production)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return success response
    const response: IntakeFormResponse = {
      success: true,
      message: 'Your intake form has been successfully submitted. We will contact you shortly to schedule your appointment.',
      submissionId,
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error processing intake form:', error);

    const response: IntakeFormResponse = {
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET() {
  // Return API information for GET requests
  return NextResponse.json({
    message: 'Intake Form API',
    version: '1.0.0',
    methods: ['POST'],
    description: 'Submit patient intake form data',
    endpoints: {
      POST: {
        path: '/api/intake',
        description: 'Submit a new intake form',
        contentType: 'application/json',
        requiredFields: [
          'firstName',
          'lastName', 
          'email',
          'phone',
          'dateOfBirth',
          'address',
          'emergencyContact',
          'insurance',
          'reasonForVisit',
          'consentToTreatment',
          'privacyPolicyAccepted'
        ]
      }
    }
  });
}
