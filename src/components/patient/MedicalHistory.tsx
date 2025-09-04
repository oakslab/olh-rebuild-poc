import { Condition, Procedure, AllergyIntolerance } from "@medplum/fhirtypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FhirResourceLink } from "@/components/ui/fhir-resource-link";
import { FhirResourceMapping } from "@/app/api/patient/[id]/route";

interface MedicalHistoryProps {
  conditions: Condition[];
  procedures: Procedure[];
  allergies: AllergyIntolerance[];
  resourceMappings: {
    conditions: FhirResourceMapping[];
    procedures: FhirResourceMapping[];
    allergies: FhirResourceMapping[];
  };
}

export function MedicalHistory({
  conditions,
  procedures,
  allergies,
  resourceMappings,
}: MedicalHistoryProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Date unknown";
    return new Date(dateString).toLocaleDateString();
  };

  const getConditionStatus = (
    condition: Condition
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    const status = condition.clinicalStatus?.coding?.[0]?.code;
    switch (status) {
      case "active":
        return { label: "Active", variant: "destructive" };
      case "inactive":
        return { label: "Inactive", variant: "secondary" };
      case "resolved":
        return { label: "Resolved", variant: "success" };
      case "remission":
        return { label: "In Remission", variant: "warning" };
      default:
        return { label: "Unknown", variant: "secondary" };
    }
  };

  const getProcedureStatus = (
    procedure: Procedure
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    const status = procedure.status;
    switch (status) {
      case "completed":
        return { label: "Completed", variant: "success" };
      case "in-progress":
        return { label: "In Progress", variant: "warning" };
      case "stopped":
        return { label: "Stopped", variant: "destructive" };
      case "preparation":
        return { label: "Preparation", variant: "warning" };
      default:
        return { label: status || "Unknown", variant: "secondary" };
    }
  };

  const getAllergyStatus = (
    allergy: AllergyIntolerance
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    const status = allergy.clinicalStatus?.coding?.[0]?.code;
    switch (status) {
      case "active":
        return { label: "Active", variant: "destructive" };
      case "inactive":
        return { label: "Inactive", variant: "secondary" };
      case "resolved":
        return { label: "Resolved", variant: "success" };
      default:
        return { label: "Unknown", variant: "secondary" };
    }
  };

  const getAllergyCriticality = (
    criticality?: string
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    switch (criticality) {
      case "high":
        return { label: "High", variant: "destructive" };
      case "low":
        return { label: "Low", variant: "success" };
      case "unable-to-assess":
        return { label: "Unable to Assess", variant: "warning" };
      default:
        return { label: "Unknown", variant: "secondary" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Medical Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          {conditions.length === 0 ? (
            <p className="text-muted-foreground">
              No medical conditions recorded
            </p>
          ) : (
            <div className="space-y-4">
              {conditions.map((condition, index) => {
                const status = getConditionStatus(condition);
                const category =
                  condition.category?.[0]?.coding?.[0]?.display || "General";
                const conditionMapping = resourceMappings.conditions.find(
                  mapping => mapping.resourceId === condition.id
                );

                return (
                  <div
                    key={condition.id || index}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">
                          {condition.code?.text ||
                            condition.code?.coding?.[0]?.display ||
                            "Unspecified condition"}
                        </h4>
                        {conditionMapping && (
                          <FhirResourceLink
                            resourceType={conditionMapping.resourceType}
                            resourceId={conditionMapping.resourceId}
                            resourcePath={conditionMapping.resourcePath}
                            displayName={conditionMapping.displayName}
                            code={conditionMapping.code}
                            size="sm"
                          />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{category}</Badge>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Onset Date:{" "}
                        </span>
                        {formatDate(condition.onsetDateTime)}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Recorded Date:{" "}
                        </span>
                        {formatDate(condition.recordedDate)}
                      </div>
                    </div>

                    {condition.code?.coding &&
                      condition.code.coding.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium text-muted-foreground text-sm">
                            Codes:{" "}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {condition.code.coding.map(
                              (coding, codingIndex) => (
                                <code
                                  key={codingIndex}
                                  className="text-xs bg-muted px-2 py-1 rounded"
                                >
                                  {coding.system?.split("/").pop()}:{" "}
                                  {coding.code}
                                </code>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {condition.note && condition.note.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium text-muted-foreground text-sm">
                          Notes:{" "}
                        </span>
                        <p className="text-sm mt-1">{condition.note[0].text}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Procedures */}
      <Card>
        <CardHeader>
          <CardTitle>Procedures & Surgeries</CardTitle>
        </CardHeader>
        <CardContent>
          {procedures.length === 0 ? (
            <p className="text-muted-foreground">No procedures recorded</p>
          ) : (
            <div className="space-y-4">
              {procedures.map((procedure, index) => {
                const status = getProcedureStatus(procedure);
                const procedureMapping = resourceMappings.procedures.find(
                  mapping => mapping.resourceId === procedure.id
                );

                return (
                  <div
                    key={procedure.id || index}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">
                          {procedure.code?.text ||
                            procedure.code?.coding?.[0]?.display ||
                            "Unspecified procedure"}
                        </h4>
                        {procedureMapping && (
                          <FhirResourceLink
                            resourceType={procedureMapping.resourceType}
                            resourceId={procedureMapping.resourceId}
                            resourcePath={procedureMapping.resourcePath}
                            displayName={procedureMapping.displayName}
                            code={procedureMapping.code}
                            size="sm"
                          />
                        )}
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Performed Date:{" "}
                        </span>
                        {formatDate(procedure.performedDateTime)}
                      </div>
                      {procedure.category && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Category:{" "}
                          </span>
                          {procedure.category.coding?.[0]?.display ||
                            procedure.category.text}
                        </div>
                      )}
                    </div>

                    {procedure.code?.coding &&
                      procedure.code.coding.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium text-muted-foreground text-sm">
                            Codes:{" "}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {procedure.code.coding.map(
                              (coding, codingIndex) => (
                                <code
                                  key={codingIndex}
                                  className="text-xs bg-muted px-2 py-1 rounded"
                                >
                                  {coding.system?.split("/").pop()}:{" "}
                                  {coding.code}
                                </code>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {procedure.note && procedure.note.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium text-muted-foreground text-sm">
                          Notes:{" "}
                        </span>
                        <p className="text-sm mt-1">{procedure.note[0].text}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card>
        <CardHeader>
          <CardTitle>Allergies & Intolerances</CardTitle>
        </CardHeader>
        <CardContent>
          {allergies.length === 0 ? (
            <p className="text-muted-foreground">No allergies recorded</p>
          ) : (
            <div className="space-y-4">
              {allergies.map((allergy, index) => {
                const status = getAllergyStatus(allergy);
                const criticality = getAllergyCriticality(allergy.criticality);
                const allergyMapping = resourceMappings.allergies.find(
                  mapping => mapping.resourceId === allergy.id
                );

                return (
                  <div
                    key={allergy.id || index}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">
                          {allergy.code?.text ||
                            allergy.code?.coding?.[0]?.display ||
                            "Unspecified allergen"}
                        </h4>
                        {allergyMapping && (
                          <FhirResourceLink
                            resourceType={allergyMapping.resourceType}
                            resourceId={allergyMapping.resourceId}
                            resourcePath={allergyMapping.resourcePath}
                            displayName={allergyMapping.displayName}
                            code={allergyMapping.code}
                            size="sm"
                          />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <Badge variant={criticality.variant}>
                          {criticality.label} Risk
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Type:{" "}
                        </span>
                        {allergy.type || "Unknown"}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Category:{" "}
                        </span>
                        {allergy.category?.join(", ") || "Unknown"}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Onset Date:{" "}
                        </span>
                        {formatDate(allergy.onsetDateTime)}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Recorded Date:{" "}
                        </span>
                        {formatDate(allergy.recordedDate)}
                      </div>
                    </div>

                    {allergy.reaction && allergy.reaction.length > 0 && (
                      <div className="mt-3">
                        <span className="font-medium text-muted-foreground text-sm">
                          Reactions:{" "}
                        </span>
                        <div className="mt-2 space-y-2">
                          {allergy.reaction.map((reaction, reactionIndex) => (
                            <div
                              key={reactionIndex}
                              className="bg-muted p-2 rounded"
                            >
                              {reaction.manifestation?.map(
                                (manifestation, manifestationIndex) => (
                                  <div key={manifestationIndex}>
                                    <span className="text-sm font-medium">
                                      {manifestation.text ||
                                        manifestation.coding?.[0]?.display}
                                    </span>
                                    {reaction.severity && (
                                      <Badge variant="outline" className="ml-2">
                                        {reaction.severity}
                                      </Badge>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {allergy.note && allergy.note.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium text-muted-foreground text-sm">
                          Notes:{" "}
                        </span>
                        <p className="text-sm mt-1">{allergy.note[0].text}</p>
                      </div>
                    )}
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
