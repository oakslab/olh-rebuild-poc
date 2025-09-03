import {
  ServiceRequest,
  Appointment,
  Consent,
  Invoice,
} from "@medplum/fhirtypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TreatmentPlanProps {
  serviceRequests: ServiceRequest[];
  appointments: Appointment[];
  consents: Consent[];
  invoices: Invoice[];
}

export function TreatmentPlan({
  serviceRequests,
  appointments,
  consents,
  invoices,
}: TreatmentPlanProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Date unknown";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return "Date unknown";
    return new Date(dateString).toLocaleString();
  };

  const getServiceRequestStatus = (
    request: ServiceRequest
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
      case "revoked":
        return { label: "Revoked", variant: "destructive" };
      case "completed":
        return { label: "Completed", variant: "secondary" };
      case "entered-in-error":
        return { label: "Error", variant: "destructive" };
      case "draft":
        return { label: "Draft", variant: "warning" };
      case "unknown":
        return { label: "Unknown", variant: "secondary" };
      default:
        return { label: status || "Unknown", variant: "secondary" };
    }
  };

  const getServiceRequestIntent = (
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
      case "directive":
        return { label: "Directive", variant: "success" };
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

  const getAppointmentStatus = (
    appointment: Appointment
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    const status = appointment.status;
    switch (status) {
      case "booked":
        return { label: "Booked", variant: "success" };
      case "arrived":
        return { label: "Arrived", variant: "success" };
      case "fulfilled":
        return { label: "Fulfilled", variant: "secondary" };
      case "cancelled":
        return { label: "Cancelled", variant: "destructive" };
      case "noshow":
        return { label: "No Show", variant: "destructive" };
      case "entered-in-error":
        return { label: "Error", variant: "destructive" };
      case "checked-in":
        return { label: "Checked In", variant: "success" };
      case "waitlist":
        return { label: "Waitlist", variant: "warning" };
      default:
        return { label: status || "Unknown", variant: "secondary" };
    }
  };

  const getConsentStatus = (
    consent: Consent
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    const status = consent.status;
    switch (status) {
      case "active":
        return { label: "Active", variant: "success" };
      case "inactive":
        return { label: "Inactive", variant: "secondary" };
      case "entered-in-error":
        return { label: "Error", variant: "destructive" };
      case "proposed":
        return { label: "Proposed", variant: "warning" };
      case "rejected":
        return { label: "Rejected", variant: "destructive" };
      default:
        return { label: status || "Unknown", variant: "secondary" };
    }
  };

  const getInvoiceStatus = (
    invoice: Invoice
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    const status = invoice.status;
    switch (status) {
      case "draft":
        return { label: "Draft", variant: "warning" };
      case "issued":
        return { label: "Issued", variant: "success" };
      case "balanced":
        return { label: "Balanced", variant: "secondary" };
      case "cancelled":
        return { label: "Cancelled", variant: "destructive" };
      case "entered-in-error":
        return { label: "Error", variant: "destructive" };
      default:
        return { label: status || "Unknown", variant: "secondary" };
    }
  };

  const formatCurrency = (amount?: number, currency?: string): string => {
    if (amount === undefined) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Service Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Service Requests & Care Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceRequests.length === 0 ? (
            <p className="text-muted-foreground">
              No service requests recorded
            </p>
          ) : (
            <div className="space-y-4">
              {serviceRequests.map((request, index) => {
                const status = getServiceRequestStatus(request);
                const intent = getServiceRequestIntent(request.intent);

                return (
                  <div
                    key={request.id || index}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg">
                        {request.code?.text ||
                          request.code?.coding?.[0]?.display ||
                          "Unspecified service"}
                      </h4>
                      <div className="flex gap-2">
                        <Badge variant={intent.variant}>{intent.label}</Badge>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
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
                        {request.category && request.category.length > 0 && (
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Category:{" "}
                            </span>
                            {request.category[0].text ||
                              request.category[0].coding?.[0]?.display}
                          </div>
                        )}
                        {request.occurrenceDateTime && (
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Occurrence:{" "}
                            </span>
                            {formatDateTime(request.occurrenceDateTime)}
                          </div>
                        )}
                      </div>

                      {request.code?.coding &&
                        request.code.coding.length > 0 && (
                          <div>
                            <span className="font-medium text-muted-foreground text-sm">
                              Service Codes:{" "}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {request.code.coding.map(
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

                      {request.reasonCode && request.reasonCode.length > 0 && (
                        <div>
                          <span className="font-medium text-muted-foreground text-sm">
                            Reason:{" "}
                          </span>
                          <div className="mt-1">
                            {request.reasonCode.map((reason, reasonIndex) => (
                              <p key={reasonIndex} className="text-sm">
                                {reason.text || reason.coding?.[0]?.display}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

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

      {/* Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-muted-foreground">No appointments scheduled</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment, index) => {
                const status = getAppointmentStatus(appointment);

                return (
                  <div
                    key={appointment.id || index}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg">
                        {appointment.appointmentType?.text ||
                          appointment.appointmentType?.coding?.[0]?.display ||
                          "Healthcare Appointment"}
                      </h4>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {appointment.start && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Start Time:{" "}
                          </span>
                          {formatDateTime(appointment.start)}
                        </div>
                      )}
                      {appointment.end && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            End Time:{" "}
                          </span>
                          {formatDateTime(appointment.end)}
                        </div>
                      )}
                      {appointment.minutesDuration && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Duration:{" "}
                          </span>
                          {appointment.minutesDuration} minutes
                        </div>
                      )}
                      {appointment.priority && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Priority:{" "}
                          </span>
                          {appointment.priority}
                        </div>
                      )}
                    </div>

                    {appointment.description && (
                      <div className="mt-3">
                        <span className="font-medium text-muted-foreground text-sm">
                          Description:{" "}
                        </span>
                        <p className="text-sm mt-1">
                          {appointment.description}
                        </p>
                      </div>
                    )}

                    {appointment.participant &&
                      appointment.participant.length > 0 && (
                        <div className="mt-3">
                          <span className="font-medium text-muted-foreground text-sm">
                            Participants:{" "}
                          </span>
                          <div className="mt-1 space-y-1">
                            {appointment.participant.map(
                              (participant, participantIndex) => (
                                <div
                                  key={participantIndex}
                                  className="text-sm flex justify-between"
                                >
                                  <span>
                                    {participant.actor?.display ||
                                      "Participant"}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {participant.status}
                                  </Badge>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consents */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Consents</CardTitle>
        </CardHeader>
        <CardContent>
          {consents.length === 0 ? (
            <p className="text-muted-foreground">No consents recorded</p>
          ) : (
            <div className="space-y-4">
              {consents.map((consent, index) => {
                const status = getConsentStatus(consent);

                return (
                  <div
                    key={consent.id || index}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg">
                        {consent.scope?.text ||
                          consent.scope?.coding?.[0]?.display ||
                          "Healthcare Consent"}
                      </h4>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Date Given:{" "}
                        </span>
                        {formatDate(consent.dateTime)}
                      </div>
                      {consent.provision?.type && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Type:{" "}
                          </span>
                          {consent.provision.type}
                        </div>
                      )}
                    </div>

                    {consent.category && consent.category.length > 0 && (
                      <div className="mb-3">
                        <span className="font-medium text-muted-foreground text-sm">
                          Categories:{" "}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {consent.category.map((category, categoryIndex) => (
                            <Badge key={categoryIndex} variant="outline">
                              {category.text || category.coding?.[0]?.display}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {consent.policyRule && (
                      <div>
                        <span className="font-medium text-muted-foreground text-sm">
                          Policy:{" "}
                        </span>
                        <p className="text-sm mt-1">
                          {consent.policyRule.text ||
                            consent.policyRule.coding?.[0]?.display}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing & Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Billing & Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-muted-foreground">
              No billing information recorded
            </p>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice, index) => {
                const status = getInvoiceStatus(invoice);

                return (
                  <div
                    key={invoice.id || index}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg">
                        Invoice #{invoice.id || `INV-${index + 1}`}
                      </h4>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Date:{" "}
                        </span>
                        {formatDate(invoice.date)}
                      </div>
                      {invoice.totalGross && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Total:{" "}
                          </span>
                          <span className="text-lg font-bold">
                            {formatCurrency(
                              invoice.totalGross.value,
                              invoice.totalGross.currency
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {invoice.identifier && invoice.identifier.length > 0 && (
                      <div className="mb-3">
                        <span className="font-medium text-muted-foreground text-sm">
                          Identifiers:{" "}
                        </span>
                        <div className="mt-1 space-y-1">
                          {invoice.identifier.map((id, idIndex) => (
                            <div
                              key={idIndex}
                              className="flex justify-between items-center text-sm bg-muted p-2 rounded"
                            >
                              <span>{id.type?.text || "ID"}</span>
                              <code className="text-xs">{id.value}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {invoice.lineItem && invoice.lineItem.length > 0 && (
                      <div>
                        <span className="font-medium text-muted-foreground text-sm">
                          Line Items:{" "}
                        </span>
                        <div className="mt-1 space-y-2">
                          {invoice.lineItem.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="bg-muted p-2 rounded text-sm"
                            >
                              <div className="flex justify-between">
                                <span>
                                  {item.chargeItemCodeableConcept?.text ||
                                    "Service"}
                                </span>
                                {item.priceComponent?.[0]?.amount && (
                                  <span className="font-medium">
                                    {formatCurrency(
                                      item.priceComponent[0].amount.value,
                                      item.priceComponent[0].amount.currency
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
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
