import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FhirResourceLinkProps {
  resourceType: string;
  resourceId: string;
  resourcePath: string;
  displayName?: string;
  code?: string;
  category?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function FhirResourceLink({
  resourceType,
  resourceId,
  resourcePath,
  displayName,
  code,
  category,
  className,
  size = "md",
  showTooltip = true,
}: FhirResourceLinkProps) {
  const medplumFrontendUrl =
    process.env.NEXT_PUBLIC_MEDPLUM_FRONTEND_URL || "http://localhost:3000";
  const resourceUrl = `${medplumFrontendUrl.replace(/\/$/, "")}/${resourcePath}`;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const tooltipText = showTooltip
    ? `View ${resourceType}${displayName ? `: ${displayName}` : ""}${code ? ` (${code})` : ""} in Medplum`
    : "";

  return (
    <a
      href={resourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors",
        className
      )}
      title={tooltipText}
      aria-label={tooltipText}
    >
      <ExternalLink className={sizeClasses[size]} />
    </a>
  );
}
