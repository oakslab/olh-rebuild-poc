import { Observation } from "@medplum/fhirtypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AdministrativeProps {
  observations: Observation[];
}

export function Administrative({ observations }: AdministrativeProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Date unknown";
    return new Date(dateString).toLocaleDateString();
  };

  // Filter administrative observations
  const administrativeObs = observations.filter(obs =>
    obs.category?.some(cat =>
      cat.coding?.some(
        coding => coding.code === "survey" || coding.code === "administrative"
      )
    )
  );

  // Specific administrative observations based on FHIR mapping
  const mwlEligibilityObs = administrativeObs.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "mwl-eligibility")
  );

  const dqReasonObs = administrativeObs.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "dq-reason")
  );

  const mwlExclusivityObs = administrativeObs.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "mwl-exclusivity")
  );

  const getEligibilityStatus = (
    isEligible?: boolean
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    if (isEligible === true) {
      return { label: "Eligible", variant: "success" };
    } else if (isEligible === false) {
      return { label: "Not Eligible", variant: "destructive" };
    } else {
      return { label: "Pending Review", variant: "warning" };
    }
  };

  const getComplianceStatus = (
    isCompliant?: boolean
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    if (isCompliant === true) {
      return { label: "Agreed", variant: "success" };
    } else if (isCompliant === false) {
      return { label: "Declined", variant: "destructive" };
    } else {
      return { label: "Pending", variant: "warning" };
    }
  };

  const formatValue = (obs: Observation): string => {
    if (obs.valueBoolean !== undefined) {
      return obs.valueBoolean ? "Yes" : "No";
    }
    if (obs.valueString) {
      return obs.valueString;
    }
    if (obs.valueCodeableConcept) {
      return (
        obs.valueCodeableConcept.text ||
        obs.valueCodeableConcept.coding?.[0]?.display ||
        "See notes"
      );
    }
    if (obs.valueQuantity) {
      return `${obs.valueQuantity.value} ${obs.valueQuantity.unit || ""}`.trim();
    }
    return "No value recorded";
  };

  return (
    <div className="space-y-6">
      {/* Eligibility Status */}
      <Card>
        <CardHeader>
          <CardTitle>Eligibility & Qualification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* MWL Eligibility */}
          {mwlEligibilityObs && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">
                  Medical Weight Loss Eligibility
                </h4>
                <Badge
                  variant={
                    getEligibilityStatus(mwlEligibilityObs.valueBoolean).variant
                  }
                >
                  {getEligibilityStatus(mwlEligibilityObs.valueBoolean).label}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Status: {formatValue(mwlEligibilityObs)}</p>
                <p>
                  Assessed: {formatDate(mwlEligibilityObs.effectiveDateTime)}
                </p>
              </div>
            </div>
          )}

          {/* Disqualification Reason */}
          {dqReasonObs && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">Disqualification Information</h4>
                <Badge variant="warning">Review Required</Badge>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded border-l-4 border-yellow-500">
                <p className="text-sm font-medium">
                  Reason for Disqualification:
                </p>
                <p className="text-sm mt-1">{formatValue(dqReasonObs)}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Recorded: {formatDate(dqReasonObs.effectiveDateTime)}
              </p>
            </div>
          )}

          {/* Platform Exclusivity Agreement */}
          {mwlExclusivityObs && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">
                  Platform Exclusivity Agreement
                </h4>
                <Badge
                  variant={
                    getComplianceStatus(mwlExclusivityObs.valueBoolean).variant
                  }
                >
                  {getComplianceStatus(mwlExclusivityObs.valueBoolean).label}
                </Badge>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">
                  Agreement to obtain weight loss medication exclusively through
                  this platform:
                </p>
                <p className="font-medium mt-1">
                  {formatValue(mwlExclusivityObs)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Recorded: {formatDate(mwlExclusivityObs.effectiveDateTime)}
              </p>
            </div>
          )}

          {!mwlEligibilityObs && !dqReasonObs && !mwlExclusivityObs && (
            <p className="text-muted-foreground">
              No eligibility information recorded
            </p>
          )}
        </CardContent>
      </Card>

      {/* All Administrative Observations */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Records</CardTitle>
        </CardHeader>
        <CardContent>
          {administrativeObs.length === 0 ? (
            <p className="text-muted-foreground">
              No administrative records found
            </p>
          ) : (
            <div className="space-y-4">
              {administrativeObs.map((obs, index) => {
                const isEligibility = obs.code?.coding?.some(
                  coding => coding.code === "mwl-eligibility"
                );
                const isDQ = obs.code?.coding?.some(
                  coding => coding.code === "dq-reason"
                );
                const isExclusivity = obs.code?.coding?.some(
                  coding => coding.code === "mwl-exclusivity"
                );

                return (
                  <div key={obs.id || index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">
                        {obs.code?.text ||
                          obs.code?.coding?.[0]?.display ||
                          "Administrative Record"}
                      </h4>
                      <div className="flex gap-2">
                        {obs.status && (
                          <Badge variant="outline" className="text-xs">
                            {obs.status}
                          </Badge>
                        )}
                        {isEligibility && (
                          <Badge
                            variant={
                              getEligibilityStatus(obs.valueBoolean).variant
                            }
                          >
                            {getEligibilityStatus(obs.valueBoolean).label}
                          </Badge>
                        )}
                        {isDQ && <Badge variant="warning">DQ</Badge>}
                        {isExclusivity && (
                          <Badge
                            variant={
                              getComplianceStatus(obs.valueBoolean).variant
                            }
                          >
                            {getComplianceStatus(obs.valueBoolean).label}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Value:{" "}
                          </span>
                          <span className="font-medium">
                            {formatValue(obs)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Date:{" "}
                          </span>
                          {formatDate(obs.effectiveDateTime)}
                        </div>
                      </div>

                      {obs.category && obs.category.length > 0 && (
                        <div>
                          <span className="font-medium text-muted-foreground text-sm">
                            Category:{" "}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {obs.category.map((category, categoryIndex) => (
                              <Badge
                                key={categoryIndex}
                                variant="outline"
                                className="text-xs"
                              >
                                {category.text || category.coding?.[0]?.display}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {obs.code?.coding && obs.code.coding.length > 0 && (
                        <div>
                          <span className="font-medium text-muted-foreground text-sm">
                            Codes:{" "}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {obs.code.coding.map((coding, codingIndex) => (
                              <code
                                key={codingIndex}
                                className="text-xs bg-muted px-2 py-1 rounded"
                              >
                                {coding.system?.split("/").pop()}: {coding.code}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}

                      {obs.note && obs.note.length > 0 && (
                        <div>
                          <span className="font-medium text-muted-foreground text-sm">
                            Notes:{" "}
                          </span>
                          <p className="text-sm mt-1">{obs.note[0].text}</p>
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

      {/* Data Quality & Compliance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {administrativeObs.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Administrative Records
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {administrativeObs.filter(obs => obs.status === "final").length}
              </div>
              <div className="text-sm text-muted-foreground">Final Records</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {mwlEligibilityObs?.valueBoolean ? "Eligible" : "Pending"}
              </div>
              <div className="text-sm text-muted-foreground">
                Eligibility Status
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
