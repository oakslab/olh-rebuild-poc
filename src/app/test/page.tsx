"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntakeFormResponse } from "@/types/intake";

// Import test data from the JSON file
import testData from "../../../test-request.json";

export default function TestPage() {
  const [response, setResponse] = useState<IntakeFormResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitIntakeForm = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      const data = await res.json();
      setResponse(data);

      if (!res.ok) {
        setError(`HTTP ${res.status}: ${data.message}`);
      }
    } catch (err) {
      console.error("Test request failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Intake Form Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Test Data Preview</h3>
              <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-60">
                <pre className="text-sm">
                  {JSON.stringify(testData, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Patient Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Name:</strong> {testData.firstName}{" "}
                  {testData.lastName}
                </div>
                <div>
                  <strong>Email:</strong> {testData.email}
                </div>
                <div>
                  <strong>Phone:</strong> {testData.phone}
                </div>
                <div>
                  <strong>Weight:</strong> {testData.weight} lbs
                </div>
                <div>
                  <strong>Medical Conditions:</strong>{" "}
                  {[
                    ...(testData.medicalExclusionCriteria || []),
                    ...(testData.weightRelatedComorbidity || []),
                    ...(testData.otherExclusionConditions || []),
                  ].join(", ")}
                </div>
                <div>
                  <strong>Product:</strong> {testData.productName}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={submitIntakeForm} disabled={loading} size="lg">
                {loading ? "Submitting..." : "Submit Intake Form"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {response && (
            <div
              className={`border rounded-lg p-4 ${
                response.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-2 ${
                  response.success ? "text-green-800" : "text-red-800"
                }`}
              >
                Response
              </h3>
              <div className="bg-white p-4 rounded border overflow-auto max-h-60">
                <pre className="text-sm">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
              {response.success && (
                <div className="mt-4 space-y-3">
                  {response.submissionId && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <strong>Submission ID:</strong> {response.submissionId}
                    </div>
                  )}
                  {response.patientId && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong>Patient ID:</strong> {response.patientId}
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/patient/${response.patientId}`}>
                            View Patient Page
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
