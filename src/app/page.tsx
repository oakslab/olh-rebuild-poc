import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";

export default function Home() {
  return (
    <>
      <Header />
      <div className="container mx-auto p-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Open Loop Healthcare POC</h1>
          <p className="text-xl text-muted-foreground">
            FHIR R4 Compliant Healthcare Intake System
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Detail Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                View comprehensive patient data organized into categories based
                on FHIR resource types.
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold">Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Patient Demographics & Vital Signs</li>
                  <li>• Medical History (Conditions, Procedures, Allergies)</li>
                  <li>• Medications & Treatment Plans</li>
                  <li>• Goals & Lifestyle Factors</li>
                  <li>• Laboratory Results & Observations</li>
                  <li>• Treatment Plans & Care Coordination</li>
                  <li>• Administrative Records & Eligibility</li>
                </ul>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  To view a patient, navigate to:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    /patient/[patient-id]
                  </code>
                </p>
                <p className="text-xs text-muted-foreground">
                  Replace [patient-id] with an actual patient ID from your
                  Medplum instance.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Healthcare data APIs with FHIR R4 compliance.
              </p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm">Patient Data</h4>
                  <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                    GET /api/patient/[id]
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fetch comprehensive patient data from Medplum
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm">Intake Form</h4>
                  <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                    POST /api/intake
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submit patient intake forms as FHIR bundles
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>FHIR Resource Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Core Resources</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Patient</li>
                  <li>• Observation</li>
                  <li>• Condition</li>
                  <li>• Procedure</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Medications</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• MedicationStatement</li>
                  <li>• MedicationRequest</li>
                  <li>• AllergyIntolerance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Care Coordination</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Goal</li>
                  <li>• ServiceRequest</li>
                  <li>• Appointment</li>
                  <li>• Consent</li>
                  <li>• Invoice</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui
          </p>
        </div>
      </div>
    </>
  );
}
