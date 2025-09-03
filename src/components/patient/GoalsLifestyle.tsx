import { Goal, Observation } from "@medplum/fhirtypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface GoalsLifestyleProps {
  goals: Goal[];
  observations: Observation[];
}

export function GoalsLifestyle({ goals, observations }: GoalsLifestyleProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Date unknown";
    return new Date(dateString).toLocaleDateString();
  };

  const getGoalStatus = (
    goal: Goal
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    const status = goal.lifecycleStatus;
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
      case "rejected":
        return { label: "Rejected", variant: "destructive" };
      default:
        return { label: status || "Unknown", variant: "secondary" };
    }
  };

  const getAchievementStatus = (
    goal: Goal
  ): {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  } => {
    const status = goal.achievementStatus?.coding?.[0]?.code;
    switch (status) {
      case "in-progress":
        return { label: "In Progress", variant: "warning" };
      case "improving":
        return { label: "Improving", variant: "success" };
      case "worsening":
        return { label: "Worsening", variant: "destructive" };
      case "no-change":
        return { label: "No Change", variant: "secondary" };
      case "achieved":
        return { label: "Achieved", variant: "success" };
      case "sustaining":
        return { label: "Sustaining", variant: "success" };
      case "not-achieved":
        return { label: "Not Achieved", variant: "destructive" };
      case "no-progress":
        return { label: "No Progress", variant: "secondary" };
      case "not-attainable":
        return { label: "Not Attainable", variant: "destructive" };
      default:
        return { label: "Unknown", variant: "secondary" };
    }
  };

  // Filter observations for social history and lifestyle factors
  const socialHistoryObs = observations.filter(obs =>
    obs.category?.some(cat =>
      cat.coding?.some(coding => coding.code === "social-history")
    )
  );

  // Filter specific lifestyle observations based on our FHIR mapping
  const willingToObs = socialHistoryObs.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "willing-to-participate")
  );

  const weightChangeObs = socialHistoryObs.find(obs =>
    obs.code?.coding?.some(coding => coding.code === "weight-change-12mo")
  );

  const formationPrefsObs = observations.find(obs =>
    obs.code?.coding?.some(coding => coding.system === "formulation-pref")
  );

  const weightMgmtProgramObs = socialHistoryObs.find(
    obs => obs.code?.text === "Prior weight management program"
  );

  const doctorInstructionsObs = observations.find(
    obs => obs.code?.text === "Instructions for doctor"
  );

  return (
    <div className="space-y-6">
      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="text-muted-foreground">No goals recorded</p>
          ) : (
            <div className="space-y-4">
              {goals.map((goal, index) => {
                const status = getGoalStatus(goal);
                const achievement = getAchievementStatus(goal);
                const category =
                  goal.category?.[0]?.coding?.[0]?.display || "General";

                return (
                  <div key={goal.id || index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg">
                        {goal.description?.text || "Unspecified goal"}
                      </h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">{category}</Badge>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {goal.achievementStatus && (
                          <Badge variant={achievement.variant}>
                            {achievement.label}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Start Date:{" "}
                        </span>
                        {formatDate(goal.startDate)}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Target Date:{" "}
                        </span>
                        {goal.target?.[0]?.dueDate
                          ? formatDate(goal.target[0].dueDate)
                          : "Not specified"}
                      </div>
                    </div>

                    {/* Goal Targets */}
                    {goal.target && goal.target.length > 0 && (
                      <div className="mb-3">
                        <span className="font-medium text-muted-foreground text-sm">
                          Targets:
                        </span>
                        <div className="mt-1 space-y-2">
                          {goal.target.map((target, targetIndex) => (
                            <div
                              key={targetIndex}
                              className="bg-muted p-2 rounded text-sm"
                            >
                              {target.measure && (
                                <p>
                                  <strong>Measure:</strong>{" "}
                                  {target.measure.text ||
                                    target.measure.coding?.[0]?.display}
                                </p>
                              )}
                              {target.detailQuantity && (
                                <p>
                                  <strong>Target:</strong>{" "}
                                  {target.detailQuantity.value}{" "}
                                  {target.detailQuantity.unit}
                                </p>
                              )}
                              {target.detailString && (
                                <p>
                                  <strong>Target:</strong> {target.detailString}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SNOMED Codes from Extensions */}
                    {goal.extension && goal.extension.length > 0 && (
                      <div className="mb-3">
                        <span className="font-medium text-muted-foreground text-sm">
                          Clinical Codes:{" "}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {goal.extension.map(
                            (ext, extIndex) =>
                              ext.valueCoding && (
                                <code
                                  key={extIndex}
                                  className="text-xs bg-background px-2 py-1 rounded border"
                                >
                                  {ext.valueCoding.system?.split("/").pop()}:{" "}
                                  {ext.valueCoding.code} -{" "}
                                  {ext.valueCoding.display}
                                </code>
                              )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {goal.note && goal.note.length > 0 && (
                      <div>
                        <span className="font-medium text-muted-foreground text-sm">
                          Notes:{" "}
                        </span>
                        <p className="text-sm mt-1">{goal.note[0].text}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social History & Lifestyle Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Social History & Lifestyle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Willingness to Participate */}
          {willingToObs && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Willingness to Participate</h4>
              {willingToObs.component && willingToObs.component.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {willingToObs.component.map((component, index) => (
                    <Badge key={index} variant="success">
                      {component.valueString}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No specific activities recorded
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Recorded: {formatDate(willingToObs.effectiveDateTime)}
              </p>
            </div>
          )}

          {/* Weight Change History */}
          {weightChangeObs && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">
                Weight Change (Last 12 Months)
              </h4>
              <p className="text-lg">{weightChangeObs.valueString}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Recorded: {formatDate(weightChangeObs.effectiveDateTime)}
              </p>
            </div>
          )}

          {/* Formulation Preferences */}
          {formationPrefsObs && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Formulation Preferences</h4>
              <p className="text-lg">{formationPrefsObs.valueString}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Recorded: {formatDate(formationPrefsObs.effectiveDateTime)}
              </p>
            </div>
          )}

          {/* Weight Management Program History */}
          {weightMgmtProgramObs && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">
                Prior Weight Management Programs
              </h4>
              {weightMgmtProgramObs.note &&
              weightMgmtProgramObs.note.length > 0 ? (
                <p className="text-sm">{weightMgmtProgramObs.note[0].text}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No details provided
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Recorded: {formatDate(weightMgmtProgramObs.effectiveDateTime)}
              </p>
            </div>
          )}

          {/* Instructions for Doctor */}
          {doctorInstructionsObs && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">
                Additional Information for Healthcare Provider
              </h4>
              <p className="text-sm bg-blue-50 dark:bg-blue-950 p-3 rounded border-l-4 border-blue-500">
                {doctorInstructionsObs.valueString}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Recorded: {formatDate(doctorInstructionsObs.effectiveDateTime)}
              </p>
            </div>
          )}

          {/* Other Social History Observations */}
          {socialHistoryObs.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Other Social History</h4>
              <div className="space-y-3">
                {socialHistoryObs
                  .filter(
                    obs =>
                      obs !== willingToObs &&
                      obs !== weightChangeObs &&
                      obs !== weightMgmtProgramObs &&
                      obs !== doctorInstructionsObs
                  )
                  .map((obs, index) => (
                    <div key={obs.id || index} className="bg-muted p-3 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">
                          {obs.code?.text ||
                            obs.code?.coding?.[0]?.display ||
                            "Social History Item"}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formatDate(obs.effectiveDateTime)}
                        </Badge>
                      </div>
                      {obs.valueString && (
                        <p className="text-sm">{obs.valueString}</p>
                      )}
                      {obs.valueBoolean !== undefined && (
                        <p className="text-sm">
                          {obs.valueBoolean ? "Yes" : "No"}
                        </p>
                      )}
                      {obs.note && obs.note.length > 0 && (
                        <p className="text-sm italic">{obs.note[0].text}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {socialHistoryObs.length === 0 && !formationPrefsObs && (
            <p className="text-muted-foreground">
              No social history or lifestyle information recorded
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
