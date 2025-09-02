import { MedplumClient } from "@medplum/core";

// Initialize Medplum client
// For production, you should use environment variables for configuration
export const medplum = new MedplumClient({
  baseUrl: process.env.MEDPLUM_BASE_URL || "https://api.medplum.com/",
  clientId: process.env.MEDPLUM_CLIENT_ID,
  clientSecret: process.env.MEDPLUM_CLIENT_SECRET,
});

// Initialize the client with credentials if available
export async function initializeMedplum() {
  try {
    if (process.env.MEDPLUM_CLIENT_ID && process.env.MEDPLUM_CLIENT_SECRET) {
      await medplum.startClientLogin(
        process.env.MEDPLUM_CLIENT_ID,
        process.env.MEDPLUM_CLIENT_SECRET
      );

      console.log("Medplum client initialized successfully");
      console.log("medplum.getBaseUrl()", medplum.getBaseUrl());
    } else {
      console.warn(
        "Medplum credentials not configured. API requests will fail without proper authentication."
      );
    }
  } catch (error: any) {
    console.error("Failed to initialize Medplum client:", {
      error: error.message,
      code: error.code,
      status: error.response?.status,
      details: error.response?.data,
    });
    // Don't throw here - let individual requests handle authentication failures
  }
}

// Call initialization on module load
if (typeof window === "undefined") {
  // Only initialize on server side
  initializeMedplum();
}
