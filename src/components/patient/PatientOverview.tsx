import { Patient, Observation } from "@medplum/fhirtypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FhirResourceLink } from "@/components/ui/fhir-resource-link";
import { FhirResourceMapping } from "@/app/api/patient/[id]/route";

interface PatientOverviewProps {
  patient: Patient;
  observations: Observation[];
  resourceMappings: {
    patient: FhirResourceMapping;
    observations: FhirResourceMapping[];
  };
}

export function PatientOverview({
  patient,
  observations,
  resourceMappings,
}: PatientOverviewProps) {
  // Extract vital signs observations with their mappings
  const weightObs = observations.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "29463-7")
  );
  const heightObs = observations.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "8302-2")
  );
  const bmiObs = observations.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "39156-5")
  );
  const bpObs = observations.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "85354-9")
  );
  const hrObs = observations.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "40443-4")
  );

  // Find corresponding resource mappings
  const weightMapping = resourceMappings.observations.find(
    mapping => mapping.code === "29463-7"
  );
  const heightMapping = resourceMappings.observations.find(
    mapping => mapping.code === "8302-2"
  );
  const bmiMapping = resourceMappings.observations.find(
    mapping => mapping.code === "39156-5"
  );
  const bpMapping = resourceMappings.observations.find(
    mapping => mapping.code === "85354-9"
  );
  const hrMapping = resourceMappings.observations.find(
    mapping => mapping.code === "40443-4"
  );

  // Calculate age from birth date
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatName = (name: Patient["name"]): string => {
    if (!name || name.length === 0) return "Unknown";
    const primaryName = name[0];
    const given = primaryName.given?.join(" ") || "";
    const family = primaryName.family || "";
    return `${given} ${family}`.trim();
  };

  const formatAddress = (
    address: Patient["address"],
    index: number = 0
  ): string => {
    if (!address || address.length <= index) return "Not provided";
    const targetAddress = address[index];
    const line = targetAddress.line?.join(", ") || "";
    const city = targetAddress.city || "";
    const state = targetAddress.state || "";
    const postalCode = targetAddress.postalCode || "";
    return `${line}, ${city}, ${state} ${postalCode}`.replace(/^, |, $/, "");
  };

  const getAddressType = (
    address: Patient["address"],
    index: number = 0
  ): string => {
    if (!address || address.length <= index) return "";
    const targetAddress = address[index];
    const type = targetAddress.type || "unknown";
    const use = targetAddress.use || "";

    if (type === "physical" && use === "home") return "Physical Address";
    if (type === "postal" && use === "temp") return "Shipping Address";
    if (type === "postal" && use === "billing") return "Billing Address";

    return `${type} Address (${use})`;
  };

  const formatTelecom = (
    telecom: Patient["telecom"],
    system: string
  ): string => {
    if (!telecom) return "Not provided";
    const contact = telecom.find(t => t.system === system);
    return contact?.value || "Not provided";
  };

  return (
    <div className="space-y-6">
      {/* Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              Patient Demographics
              <FhirResourceLink
                resourceType={resourceMappings.patient.resourceType}
                resourceId={resourceMappings.patient.resourceId}
                resourcePath={resourceMappings.patient.resourcePath}
                displayName={resourceMappings.patient.displayName}
                size="sm"
              />
            </div>
            <Badge variant={patient.active ? "success" : "secondary"}>
              {patient.active ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Full Name
              </dt>
              <dd className="text-lg font-semibold">
                {formatName(patient.name)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Date of Birth
              </dt>
              <dd className="text-lg">{patient.birthDate || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Age</dt>
              <dd className="text-lg">
                {patient.birthDate
                  ? `${calculateAge(patient.birthDate)} years`
                  : "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Gender
              </dt>
              <dd className="text-lg capitalize">
                {patient.gender || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Email
              </dt>
              <dd className="text-lg">
                {formatTelecom(patient.telecom, "email")}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Phone
              </dt>
              <dd className="text-lg">
                {formatTelecom(patient.telecom, "phone")}
              </dd>
            </div>
          </div>

          {/* Addresses Section */}
          <Separator />
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Addresses
            </h4>

            {/* Physical Address */}
            <div className="p-3 border rounded-lg">
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                {getAddressType(patient.address, 0)}
              </dt>
              <dd className="text-base">{formatAddress(patient.address, 0)}</dd>
            </div>

            {/* Shipping Address */}
            {patient.address && patient.address.length > 1 && (
              <div className="p-3 border rounded-lg">
                <dt className="text-sm font-medium text-muted-foreground mb-1">
                  {getAddressType(patient.address, 1)}
                </dt>
                <dd className="text-base">
                  {formatAddress(patient.address, 1)}
                </dd>
              </div>
            )}

            {/* Billing Address */}
            {patient.address && patient.address.length > 2 && (
              <div className="p-3 border rounded-lg">
                <dt className="text-sm font-medium text-muted-foreground mb-1">
                  {getAddressType(patient.address, 2)}
                </dt>
                <dd className="text-base">
                  {formatAddress(patient.address, 2)}
                </dd>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <Card>
        <CardHeader>
          <CardTitle>Vital Signs & Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  Weight
                </dt>
                {weightMapping && (
                  <FhirResourceLink
                    resourceType={weightMapping.resourceType}
                    resourceId={weightMapping.resourceId}
                    resourcePath={weightMapping.resourcePath}
                    displayName={weightMapping.displayName}
                    code={weightMapping.code}
                    size="sm"
                  />
                )}
              </div>
              <dd className="text-2xl font-bold text-blue-600">
                {weightObs?.valueQuantity?.value
                  ? `${weightObs.valueQuantity.value} ${weightObs.valueQuantity.unit || "lb"}`
                  : "Not recorded"}
              </dd>
              {weightObs?.effectiveDateTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(weightObs.effectiveDateTime).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  Height
                </dt>
                {heightMapping && (
                  <FhirResourceLink
                    resourceType={heightMapping.resourceType}
                    resourceId={heightMapping.resourceId}
                    resourcePath={heightMapping.resourcePath}
                    displayName={heightMapping.displayName}
                    code={heightMapping.code}
                    size="sm"
                  />
                )}
              </div>
              <dd className="text-2xl font-bold text-green-600">
                {heightObs?.valueQuantity?.value
                  ? `${heightObs.valueQuantity.value} ${heightObs.valueQuantity.unit || "in"}`
                  : "Not recorded"}
              </dd>
              {heightObs?.effectiveDateTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(heightObs.effectiveDateTime).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  BMI
                </dt>
                {bmiMapping && (
                  <FhirResourceLink
                    resourceType={bmiMapping.resourceType}
                    resourceId={bmiMapping.resourceId}
                    resourcePath={bmiMapping.resourcePath}
                    displayName={bmiMapping.displayName}
                    code={bmiMapping.code}
                    size="sm"
                  />
                )}
              </div>
              <dd className="text-2xl font-bold text-purple-600">
                {bmiObs?.valueQuantity?.value
                  ? `${bmiObs.valueQuantity.value} ${bmiObs.valueQuantity.unit || "kg/m2"}`
                  : "Not calculated"}
              </dd>
              {bmiObs?.effectiveDateTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(bmiObs.effectiveDateTime).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  Blood Pressure
                </dt>
                {bpMapping && (
                  <FhirResourceLink
                    resourceType={bpMapping.resourceType}
                    resourceId={bpMapping.resourceId}
                    resourcePath={bpMapping.resourcePath}
                    displayName={bpMapping.displayName}
                    code={bpMapping.code}
                    size="sm"
                  />
                )}
              </div>
              <dd className="text-2xl font-bold text-red-600">
                {bpObs?.valueString || "Not recorded"}
              </dd>
              {bpObs?.effectiveDateTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(bpObs.effectiveDateTime).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  Heart Rate
                </dt>
                {hrMapping && (
                  <FhirResourceLink
                    resourceType={hrMapping.resourceType}
                    resourceId={hrMapping.resourceId}
                    resourcePath={hrMapping.resourcePath}
                    displayName={hrMapping.displayName}
                    code={hrMapping.code}
                    size="sm"
                  />
                )}
              </div>
              <dd className="text-2xl font-bold text-orange-600">
                {hrObs?.valueString || "Not recorded"}
              </dd>
              {hrObs?.effectiveDateTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(hrObs.effectiveDateTime).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
