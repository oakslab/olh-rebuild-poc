import { Patient, Observation } from "@medplum/fhirtypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PatientOverviewProps {
  patient: Patient;
  observations: Observation[];
}

export function PatientOverview({
  patient,
  observations,
}: PatientOverviewProps) {
  // Extract vital signs observations
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
            Patient Demographics
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
              <dt className="text-sm font-medium text-muted-foreground mb-2">
                Weight
              </dt>
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
              <dt className="text-sm font-medium text-muted-foreground mb-2">
                Height
              </dt>
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
              <dt className="text-sm font-medium text-muted-foreground mb-2">
                BMI
              </dt>
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
              <dt className="text-sm font-medium text-muted-foreground mb-2">
                Blood Pressure
              </dt>
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
              <dt className="text-sm font-medium text-muted-foreground mb-2">
                Heart Rate
              </dt>
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

      {/* Patient Identifiers */}
      {patient.identifier && patient.identifier.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Identifiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patient.identifier.map((id, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-muted rounded"
                >
                  <span className="text-sm font-medium">
                    {id.type?.text || id.system || "Identifier"}
                  </span>
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    {id.value}
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
