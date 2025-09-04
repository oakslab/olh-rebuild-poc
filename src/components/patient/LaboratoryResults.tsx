import { Observation } from "@medplum/fhirtypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FhirResourceLink } from "@/components/ui/fhir-resource-link";
import { FhirResourceMapping } from "@/app/api/patient/[id]/route";

interface LaboratoryResultsProps {
  observations: Observation[];
  resourceMappings: {
    observations: FhirResourceMapping[];
  };
}

export function LaboratoryResults({
  observations,
  resourceMappings,
}: LaboratoryResultsProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Date unknown";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return "Date unknown";
    return new Date(dateString).toLocaleString();
  };

  // Filter observations by category
  const laboratoryObs = observations.filter(obs =>
    obs.category?.some(cat =>
      cat.coding?.some(coding => coding.code === "laboratory")
    )
  );

  const vitalSignsObs = observations.filter(obs =>
    obs.category?.some(cat =>
      cat.coding?.some(coding => coding.code === "vital-signs")
    )
  );

  // Specific lab observations based on FHIR mapping
  const glucoseObs = laboratoryObs.find(
    obs => obs.code?.coding?.some(coding => coding.code === "33747-0") // Fasting glucose
  );

  const hba1cObs = laboratoryObs.find(
    obs => obs.code?.coding?.some(coding => coding.code === "4548-4") // Hemoglobin A1c
  );

  // Additional vital signs beyond the basic weight/height/BMI
  const bloodPressureObs = vitalSignsObs.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "85354-9")
  );

  const heartRateObs = vitalSignsObs.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "40443-4")
  );

  const weightObs = vitalSignsObs.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "29463-7")
  );

  const heightObs = vitalSignsObs.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "8302-2")
  );

  const bmiObs = vitalSignsObs.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "39156-5")
  );

  // Starting weight observation (different from current weight)
  const startingWeightObs = vitalSignsObs.find(
    obs =>
      obs.code?.coding?.some(coding => coding.code === "29463-7") &&
      obs.code?.text === "Starting weight"
  );

  const getObservationStatus = (
    obs: Observation
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    const status = obs.status;
    switch (status) {
      case "final":
        return { label: "Final", variant: "success" };
      case "preliminary":
        return { label: "Preliminary", variant: "warning" };
      case "cancelled":
        return { label: "Cancelled", variant: "destructive" };
      case "corrected":
        return { label: "Corrected", variant: "warning" };
      case "amended":
        return { label: "Amended", variant: "warning" };
      case "entered-in-error":
        return { label: "Error", variant: "destructive" };
      default:
        return { label: status || "Unknown", variant: "secondary" };
    }
  };

  const formatValue = (obs: Observation): string => {
    if (obs.valueQuantity) {
      return `${obs.valueQuantity.value} ${obs.valueQuantity.unit || ""}`.trim();
    }
    if (obs.valueString) {
      return obs.valueString;
    }
    if (obs.valueBoolean !== undefined) {
      return obs.valueBoolean ? "Yes" : "No";
    }
    if (obs.valueCodeableConcept) {
      return (
        obs.valueCodeableConcept.text ||
        obs.valueCodeableConcept.coding?.[0]?.display ||
        "See notes"
      );
    }
    return "No value recorded";
  };

  const getReferenceRange = (obs: Observation): string => {
    if (!obs.referenceRange || obs.referenceRange.length === 0) return "";
    const range = obs.referenceRange[0];
    let rangeText = "";
    if (range.low?.value !== undefined && range.high?.value !== undefined) {
      rangeText = `${range.low.value} - ${range.high.value}`;
      if (range.low.unit) rangeText += ` ${range.low.unit}`;
    } else if (range.low?.value !== undefined) {
      rangeText = `> ${range.low.value}`;
      if (range.low.unit) rangeText += ` ${range.low.unit}`;
    } else if (range.high?.value !== undefined) {
      rangeText = `< ${range.high.value}`;
      if (range.high.unit) rangeText += ` ${range.high.unit}`;
    }
    if (range.text) {
      rangeText = rangeText ? `${rangeText} (${range.text})` : range.text;
    }
    return rangeText;
  };

  return (
    <div className="space-y-6">
      {/* Key Laboratory Results */}
      <Card>
        <CardHeader>
          <CardTitle>Laboratory Results</CardTitle>
        </CardHeader>
        <CardContent>
          {laboratoryObs.length === 0 ? (
            <p className="text-muted-foreground">
              No laboratory results recorded
            </p>
          ) : (
            <div className="space-y-6">
              {/* Key Lab Values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Glucose */}
                {glucoseObs && (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">Fasting Glucose</h4>
                        {(() => {
                          const mapping = resourceMappings.observations.find(
                            m => m.resourceId === glucoseObs.id
                          );
                          return (
                            mapping && (
                              <FhirResourceLink
                                resourceType={mapping.resourceType}
                                resourceId={mapping.resourceId}
                                resourcePath={mapping.resourcePath}
                                displayName={mapping.displayName}
                                code={mapping.code}
                                size="sm"
                              />
                            )
                          );
                        })()}
                      </div>
                      <Badge variant={getObservationStatus(glucoseObs).variant}>
                        {getObservationStatus(glucoseObs).label}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {formatValue(glucoseObs)}
                    </div>
                    {getReferenceRange(glucoseObs) && (
                      <p className="text-sm text-muted-foreground">
                        Reference: {getReferenceRange(glucoseObs)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDateTime(glucoseObs.effectiveDateTime)}
                    </p>
                  </div>
                )}

                {/* HbA1c */}
                {hba1cObs && (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">Hemoglobin A1c</h4>
                        {(() => {
                          const mapping = resourceMappings.observations.find(
                            m => m.resourceId === hba1cObs.id
                          );
                          return (
                            mapping && (
                              <FhirResourceLink
                                resourceType={mapping.resourceType}
                                resourceId={mapping.resourceId}
                                resourcePath={mapping.resourcePath}
                                displayName={mapping.displayName}
                                code={mapping.code}
                                size="sm"
                              />
                            )
                          );
                        })()}
                      </div>
                      <Badge variant={getObservationStatus(hba1cObs).variant}>
                        {getObservationStatus(hba1cObs).label}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {formatValue(hba1cObs)}
                    </div>
                    {getReferenceRange(hba1cObs) && (
                      <p className="text-sm text-muted-foreground">
                        Reference: {getReferenceRange(hba1cObs)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDateTime(hba1cObs.effectiveDateTime)}
                    </p>
                  </div>
                )}
              </div>

              {/* All Laboratory Results */}
              <div>
                <h4 className="font-semibold mb-3">All Laboratory Results</h4>
                <div className="space-y-3">
                  {laboratoryObs.map((obs, index) => {
                    const status = getObservationStatus(obs);
                    const mapping = resourceMappings.observations.find(
                      m => m.resourceId === obs.id
                    );
                    return (
                      <div
                        key={obs.id || index}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">
                              {obs.code?.text ||
                                obs.code?.coding?.[0]?.display ||
                                "Unknown Test"}
                            </h5>
                            {mapping && (
                              <FhirResourceLink
                                resourceType={mapping.resourceType}
                                resourceId={mapping.resourceId}
                                resourcePath={mapping.resourcePath}
                                displayName={mapping.displayName}
                                code={mapping.code}
                                size="sm"
                              />
                            )}
                          </div>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Value:{" "}
                            </span>
                            <span className="text-lg font-semibold">
                              {formatValue(obs)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Reference Range:{" "}
                            </span>
                            {getReferenceRange(obs) || "Not provided"}
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Date:{" "}
                            </span>
                            {formatDateTime(obs.effectiveDateTime)}
                          </div>
                        </div>

                        {obs.code?.coding && obs.code.coding.length > 0 && (
                          <div className="mt-2">
                            <span className="font-medium text-muted-foreground text-sm">
                              Codes:{" "}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {obs.code.coding.map((coding, codingIndex) => (
                                <code
                                  key={codingIndex}
                                  className="text-xs bg-muted px-2 py-1 rounded"
                                >
                                  {coding.system?.split("/").pop()}:{" "}
                                  {coding.code}
                                </code>
                              ))}
                            </div>
                          </div>
                        )}

                        {obs.note && obs.note.length > 0 && (
                          <div className="mt-2">
                            <span className="font-medium text-muted-foreground text-sm">
                              Notes:{" "}
                            </span>
                            <p className="text-sm mt-1">{obs.note[0].text}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vital Signs Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Vital Signs History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Weight Comparison */}
            {(weightObs || startingWeightObs) && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Weight History</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {startingWeightObs && (
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Starting Weight
                        </dt>
                        {(() => {
                          const mapping = resourceMappings.observations.find(
                            m => m.resourceId === startingWeightObs.id
                          );
                          return (
                            mapping && (
                              <FhirResourceLink
                                resourceType={mapping.resourceType}
                                resourceId={mapping.resourceId}
                                resourcePath={mapping.resourcePath}
                                displayName={mapping.displayName}
                                code={mapping.code}
                                size="sm"
                              />
                            )
                          );
                        })()}
                      </div>
                      <dd className="text-xl font-bold text-orange-600">
                        {formatValue(startingWeightObs)}
                      </dd>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(startingWeightObs.effectiveDateTime)}
                      </p>
                    </div>
                  )}
                  {weightObs && (
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Current Weight
                        </dt>
                        {(() => {
                          const mapping = resourceMappings.observations.find(
                            m => m.resourceId === weightObs.id
                          );
                          return (
                            mapping && (
                              <FhirResourceLink
                                resourceType={mapping.resourceType}
                                resourceId={mapping.resourceId}
                                resourcePath={mapping.resourcePath}
                                displayName={mapping.displayName}
                                code={mapping.code}
                                size="sm"
                              />
                            )
                          );
                        })()}
                      </div>
                      <dd className="text-xl font-bold text-blue-600">
                        {formatValue(weightObs)}
                      </dd>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(weightObs.effectiveDateTime)}
                      </p>
                    </div>
                  )}
                </div>
                {startingWeightObs &&
                  weightObs &&
                  startingWeightObs.valueQuantity &&
                  weightObs.valueQuantity && (
                    <div className="mt-3 text-center">
                      <div className="text-sm text-muted-foreground">
                        Weight Change
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          (weightObs.valueQuantity.value || 0) <
                          (startingWeightObs.valueQuantity.value || 0)
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {(
                          (weightObs.valueQuantity.value || 0) -
                          (startingWeightObs.valueQuantity.value || 0)
                        ).toFixed(1)}{" "}
                        lbs
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Other Vital Signs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {heightObs && (
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Height
                    </dt>
                    {(() => {
                      const mapping = resourceMappings.observations.find(
                        m => m.resourceId === heightObs.id
                      );
                      return (
                        mapping && (
                          <FhirResourceLink
                            resourceType={mapping.resourceType}
                            resourceId={mapping.resourceId}
                            resourcePath={mapping.resourcePath}
                            displayName={mapping.displayName}
                            code={mapping.code}
                            size="sm"
                          />
                        )
                      );
                    })()}
                  </div>
                  <dd className="text-xl font-bold text-green-600">
                    {formatValue(heightObs)}
                  </dd>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(heightObs.effectiveDateTime)}
                  </p>
                </div>
              )}

              {bmiObs && (
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <dt className="text-sm font-medium text-muted-foreground">
                      BMI
                    </dt>
                    {(() => {
                      const mapping = resourceMappings.observations.find(
                        m => m.resourceId === bmiObs.id
                      );
                      return (
                        mapping && (
                          <FhirResourceLink
                            resourceType={mapping.resourceType}
                            resourceId={mapping.resourceId}
                            resourcePath={mapping.resourcePath}
                            displayName={mapping.displayName}
                            code={mapping.code}
                            size="sm"
                          />
                        )
                      );
                    })()}
                  </div>
                  <dd className="text-xl font-bold text-purple-600">
                    {formatValue(bmiObs)}
                  </dd>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(bmiObs.effectiveDateTime)}
                  </p>
                </div>
              )}

              {bloodPressureObs && (
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Blood Pressure
                    </dt>
                    {(() => {
                      const mapping = resourceMappings.observations.find(
                        m => m.resourceId === bloodPressureObs.id
                      );
                      return (
                        mapping && (
                          <FhirResourceLink
                            resourceType={mapping.resourceType}
                            resourceId={mapping.resourceId}
                            resourcePath={mapping.resourcePath}
                            displayName={mapping.displayName}
                            code={mapping.code}
                            size="sm"
                          />
                        )
                      );
                    })()}
                  </div>
                  <dd className="text-xl font-bold text-red-600">
                    {formatValue(bloodPressureObs)}
                  </dd>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(bloodPressureObs.effectiveDateTime)}
                  </p>
                </div>
              )}

              {heartRateObs && (
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Heart Rate
                    </dt>
                    {(() => {
                      const mapping = resourceMappings.observations.find(
                        m => m.resourceId === heartRateObs.id
                      );
                      return (
                        mapping && (
                          <FhirResourceLink
                            resourceType={mapping.resourceType}
                            resourceId={mapping.resourceId}
                            resourcePath={mapping.resourcePath}
                            displayName={mapping.displayName}
                            code={mapping.code}
                            size="sm"
                          />
                        )
                      );
                    })()}
                  </div>
                  <dd className="text-xl font-bold text-orange-600">
                    {formatValue(heartRateObs)}
                  </dd>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(heartRateObs.effectiveDateTime)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {vitalSignsObs.length === 0 && (
            <p className="text-muted-foreground">No vital signs recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
