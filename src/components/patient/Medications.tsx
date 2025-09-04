import { MedicationStatement, MedicationRequest } from "@medplum/fhirtypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FhirResourceLink } from "@/components/ui/fhir-resource-link";
import { FhirResourceMapping } from "@/app/api/patient/[id]/route";

interface MedicationsProps {
  medicationStatements: MedicationStatement[];
  medicationRequests: MedicationRequest[];
  resourceMappings: {
    medicationStatements: FhirResourceMapping[];
    medicationRequests: FhirResourceMapping[];
  };
}

export function Medications({
  medicationStatements,
  medicationRequests,
  resourceMappings,
}: MedicationsProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Date unknown";
    return new Date(dateString).toLocaleDateString();
  };

  const getMedicationStatementStatus = (
    statement: MedicationStatement
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    const status = statement.status;
    switch (status) {
      case "active":
        return { label: "Active", variant: "success" };
      case "completed":
        return { label: "Completed", variant: "secondary" };
      case "entered-in-error":
        return { label: "Error", variant: "destructive" };
      case "intended":
        return { label: "Intended", variant: "warning" };
      case "stopped":
        return { label: "Stopped", variant: "destructive" };
      case "on-hold":
        return { label: "On Hold", variant: "warning" };
      case "unknown":
        return { label: "Unknown", variant: "secondary" };
      default:
        return { label: status || "Unknown", variant: "secondary" };
    }
  };

  const getMedicationRequestStatus = (
    request: MedicationRequest
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    const status = request.status;
    switch (status) {
      case "active":
        return { label: "Active", variant: "success" };
      case "on-hold":
        return { label: "On Hold", variant: "warning" };
      case "cancelled":
        return { label: "Cancelled", variant: "destructive" };
      case "completed":
        return { label: "Completed", variant: "secondary" };
      case "entered-in-error":
        return { label: "Error", variant: "destructive" };
      case "stopped":
        return { label: "Stopped", variant: "destructive" };
      case "draft":
        return { label: "Draft", variant: "warning" };
      case "unknown":
        return { label: "Unknown", variant: "secondary" };
      default:
        return { label: status || "Unknown", variant: "secondary" };
    }
  };

  const getMedicationRequestIntent = (
    intent?: string
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary" | "info";
  } => {
    switch (intent) {
      case "proposal":
        return { label: "Proposal", variant: "info" };
      case "plan":
        return { label: "Plan", variant: "warning" };
      case "order":
        return { label: "Order", variant: "success" };
      case "original-order":
        return { label: "Original Order", variant: "success" };
      case "reflex-order":
        return { label: "Reflex Order", variant: "success" };
      case "filler-order":
        return { label: "Filler Order", variant: "success" };
      case "instance-order":
        return { label: "Instance Order", variant: "success" };
      case "option":
        return { label: "Option", variant: "secondary" };
      default:
        return { label: intent || "Unknown", variant: "secondary" };
    }
  };

  const getMedicationName = (
    medication:
      | MedicationStatement["medicationCodeableConcept"]
      | MedicationRequest["medicationCodeableConcept"]
  ): string => {
    if (!medication) return "Unspecified medication";
    return (
      medication.text ||
      medication.coding?.[0]?.display ||
      "Unspecified medication"
    );
  };

  const formatDosage = (dosage?: MedicationStatement["dosage"]): string => {
    if (!dosage || dosage.length === 0) return "No dosage information";
    const primaryDosage = dosage[0];
    return primaryDosage.text || "See clinical notes";
  };

  return (
    <div className="space-y-6">
      {/* Current Medication Statements */}
      <Card>
        <CardHeader>
          <CardTitle>Current Medications</CardTitle>
        </CardHeader>
        <CardContent>
          {medicationStatements.length === 0 ? (
            <p className="text-muted-foreground">
              No current medications recorded
            </p>
          ) : (
            <div className="space-y-4">
              {medicationStatements.map((statement, index) => {
                const status = getMedicationStatementStatus(statement);
                const medicationName = getMedicationName(
                  statement.medicationCodeableConcept
                );
                const statementMapping =
                  resourceMappings.medicationStatements.find(
                    mapping => mapping.resourceId === statement.id
                  );

                return (
                  <div
                    key={statement.id || index}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">
                          {medicationName}
                        </h4>
                        {statementMapping && (
                          <FhirResourceLink
                            resourceType={statementMapping.resourceType}
                            resourceId={statementMapping.resourceId}
                            resourcePath={statementMapping.resourcePath}
                            displayName={statementMapping.displayName}
                            code={statementMapping.code}
                            size="sm"
                          />
                        )}
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="space-y-3">
                      {/* Dosage Information */}
                      <div>
                        <span className="font-medium text-muted-foreground text-sm">
                          Dosage & Instructions:
                        </span>
                        <p className="text-sm mt-1 bg-muted p-2 rounded">
                          {formatDosage(statement.dosage)}
                        </p>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Effective Date:{" "}
                          </span>
                          {formatDate(statement.effectiveDateTime)}
                        </div>
                        {statement.dateAsserted && (
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Date Recorded:{" "}
                            </span>
                            {formatDate(statement.dateAsserted)}
                          </div>
                        )}
                      </div>

                      {/* Timing Information */}
                      {statement.dosage?.[0]?.timing && (
                        <div>
                          <span className="font-medium text-muted-foreground text-sm">
                            Timing:{" "}
                          </span>
                          {statement.dosage[0].timing.repeat?.extension?.map(
                            (ext, extIndex) => (
                              <p key={extIndex} className="text-sm mt-1">
                                {ext.valueString}
                              </p>
                            )
                          )}
                        </div>
                      )}

                      {/* Medication Codes */}
                      {statement.medicationCodeableConcept?.coding &&
                        statement.medicationCodeableConcept.coding.length >
                          0 && (
                          <div>
                            <span className="font-medium text-muted-foreground text-sm">
                              Codes:{" "}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {statement.medicationCodeableConcept.coding.map(
                                (coding, codingIndex) => (
                                  <code
                                    key={codingIndex}
                                    className="text-xs bg-background px-2 py-1 rounded border"
                                  >
                                    {coding.system?.split("/").pop()}:{" "}
                                    {coding.code}
                                  </code>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Notes */}
                      {statement.note && statement.note.length > 0 && (
                        <div>
                          <span className="font-medium text-muted-foreground text-sm">
                            Notes:{" "}
                          </span>
                          <p className="text-sm mt-1">
                            {statement.note[0].text}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medication Requests (Treatment Plans) */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Plans & Medication Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {medicationRequests.length === 0 ? (
            <p className="text-muted-foreground">
              No medication requests recorded
            </p>
          ) : (
            <div className="space-y-4">
              {medicationRequests.map((request, index) => {
                const status = getMedicationRequestStatus(request);
                const intent = getMedicationRequestIntent(request.intent);
                const medicationName = getMedicationName(
                  request.medicationCodeableConcept
                );
                const requestMapping = resourceMappings.medicationRequests.find(
                  mapping => mapping.resourceId === request.id
                );

                return (
                  <div
                    key={request.id || index}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">
                          {medicationName}
                        </h4>
                        {requestMapping && (
                          <FhirResourceLink
                            resourceType={requestMapping.resourceType}
                            resourceId={requestMapping.resourceId}
                            resourcePath={requestMapping.resourcePath}
                            displayName={requestMapping.displayName}
                            code={requestMapping.code}
                            size="sm"
                          />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={intent.variant}>{intent.label}</Badge>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Request Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Authored Date:{" "}
                          </span>
                          {formatDate(request.authoredOn)}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Priority:{" "}
                          </span>
                          {request.priority || "Normal"}
                        </div>
                      </div>

                      {/* Dosage Instructions */}
                      {request.dosageInstruction &&
                        request.dosageInstruction.length > 0 && (
                          <div>
                            <span className="font-medium text-muted-foreground text-sm">
                              Dosage Instructions:
                            </span>
                            <div className="mt-1 space-y-1">
                              {request.dosageInstruction.map(
                                (dosage, dosageIndex) => (
                                  <p
                                    key={dosageIndex}
                                    className="text-sm bg-muted p-2 rounded"
                                  >
                                    {dosage.text || "See clinical notes"}
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Dispense Request */}
                      {request.dispenseRequest && (
                        <div>
                          <span className="font-medium text-muted-foreground text-sm">
                            Dispense Information:
                          </span>
                          <div className="text-sm mt-1 bg-muted p-2 rounded">
                            {request.dispenseRequest.quantity && (
                              <p>
                                Quantity:{" "}
                                {request.dispenseRequest.quantity.value}{" "}
                                {request.dispenseRequest.quantity.unit}
                              </p>
                            )}
                            {request.dispenseRequest.numberOfRepeatsAllowed !==
                              undefined && (
                              <p>
                                Refills:{" "}
                                {request.dispenseRequest.numberOfRepeatsAllowed}
                              </p>
                            )}
                            {request.dispenseRequest.expectedSupplyDuration && (
                              <p>
                                Supply Duration:{" "}
                                {
                                  request.dispenseRequest.expectedSupplyDuration
                                    .value
                                }{" "}
                                {
                                  request.dispenseRequest.expectedSupplyDuration
                                    .unit
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Medication Codes */}
                      {request.medicationCodeableConcept?.coding &&
                        request.medicationCodeableConcept.coding.length > 0 && (
                          <div>
                            <span className="font-medium text-muted-foreground text-sm">
                              Codes:{" "}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {request.medicationCodeableConcept.coding.map(
                                (coding, codingIndex) => (
                                  <code
                                    key={codingIndex}
                                    className="text-xs bg-background px-2 py-1 rounded border"
                                  >
                                    {coding.system?.split("/").pop()}:{" "}
                                    {coding.code}
                                  </code>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Notes */}
                      {request.note && request.note.length > 0 && (
                        <div>
                          <span className="font-medium text-muted-foreground text-sm">
                            Notes:{" "}
                          </span>
                          <p className="text-sm mt-1">{request.note[0].text}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
