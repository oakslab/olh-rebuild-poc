"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientDetailResponse } from "@/app/api/patient/[id]/route";

// Import our data section components
import { PatientOverview } from "@/components/patient/PatientOverview";
import { MedicalHistory } from "@/components/patient/MedicalHistory";
import { Medications } from "@/components/patient/Medications";
import { GoalsLifestyle } from "@/components/patient/GoalsLifestyle";
import { LaboratoryResults } from "@/components/patient/LaboratoryResults";
import { TreatmentPlan } from "@/components/patient/TreatmentPlan";
import { Administrative } from "@/components/patient/Administrative";

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;

  const [patientData, setPatientData] = useState<PatientDetailResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/patient/${patientId}`);
        const data: PatientDetailResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || `HTTP error! status: ${response.status}`
          );
        }

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch patient data");
        }

        setPatientData(data);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Patient Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => window.history.back()} variant="secondary">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state
  if (!patientData?.data) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              No patient data found for ID: {patientId}
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data } = patientData;
  const formatName = (name: typeof data.patient.name): string => {
    if (!name || name.length === 0) return "Unknown Patient";
    const primaryName = name[0];
    const given = primaryName.given?.join(" ") || "";
    const family = primaryName.family || "";
    return `${given} ${family}`.trim();
  };

  // Count data for tab badges
  const dataCounts = {
    conditions: data.conditions.length,
    procedures: data.procedures.length,
    allergies: data.allergies.length,
    medications: data.medicationStatements.length,
    medicationRequests: data.medicationRequests.length,
    goals: data.goals.length,
    socialHistory: data.observations.filter(obs =>
      obs.category?.some(cat =>
        cat.coding?.some(coding => coding.code === "social-history")
      )
    ).length,
    labResults: data.observations.filter(obs =>
      obs.category?.some(cat =>
        cat.coding?.some(coding => coding.code === "laboratory")
      )
    ).length,
    serviceRequests: data.serviceRequests.length,
    appointments: data.appointments.length,
    administrative: data.observations.filter(obs =>
      obs.category?.some(cat =>
        cat.coding?.some(
          coding => coding.code === "survey" || coding.code === "administrative"
        )
      )
    ).length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {formatName(data.patient.name)}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={data.patient.active ? "success" : "secondary"}>
              {data.patient.active ? "Active" : "Inactive"}
            </Badge>
            <span className="text-muted-foreground">ID: {patientId}</span>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7 lg:grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical-history">
            Medical History
            {dataCounts.conditions +
              dataCounts.procedures +
              dataCounts.allergies >
              0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {dataCounts.conditions +
                  dataCounts.procedures +
                  dataCounts.allergies}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="medications">
            Medications
            {dataCounts.medications + dataCounts.medicationRequests > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {dataCounts.medications + dataCounts.medicationRequests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="goals-lifestyle">
            Goals & Lifestyle
            {dataCounts.goals + dataCounts.socialHistory > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {dataCounts.goals + dataCounts.socialHistory}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="lab-results">
            Lab Results
            {dataCounts.labResults > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {dataCounts.labResults}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="treatment-plan">
            Treatment & Care
            {dataCounts.serviceRequests + dataCounts.appointments > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {dataCounts.serviceRequests + dataCounts.appointments}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="administrative">
            Administrative
            {dataCounts.administrative > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {dataCounts.administrative}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PatientOverview
            patient={data.patient}
            observations={data.observations}
          />
        </TabsContent>

        <TabsContent value="medical-history" className="space-y-4">
          <MedicalHistory
            conditions={data.conditions}
            procedures={data.procedures}
            allergies={data.allergies}
          />
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <Medications
            medicationStatements={data.medicationStatements}
            medicationRequests={data.medicationRequests}
          />
        </TabsContent>

        <TabsContent value="goals-lifestyle" className="space-y-4">
          <GoalsLifestyle goals={data.goals} observations={data.observations} />
        </TabsContent>

        <TabsContent value="lab-results" className="space-y-4">
          <LaboratoryResults observations={data.observations} />
        </TabsContent>

        <TabsContent value="treatment-plan" className="space-y-4">
          <TreatmentPlan
            serviceRequests={data.serviceRequests}
            appointments={data.appointments}
            consents={data.consents}
            invoices={data.invoices}
          />
        </TabsContent>

        <TabsContent value="administrative" className="space-y-4">
          <Administrative observations={data.observations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
