#!/bin/bash

# Cleanup script for intake FHIR resources
# This script deletes all Patients and their referenced resources from the Medplum FHIR server
# Created resources include: Patient, Observation, Goal, Condition, MedicationStatement, 
# Procedure, AllergyIntolerance, Consent, MedicationRequest, ServiceRequest, Invoice, Appointment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Starting cleanup of intake FHIR resources...${NC}"

# Load environment variables from .env.local
if [ -f ".env.local" ]; then
    echo -e "${BLUE}📁 Loading environment variables from .env.local${NC}"
    # Load environment variables using a simple approach that handles files without trailing newline
    while IFS='=' read -r key value || [[ -n "$key" ]]; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue
        
        # Remove trailing whitespace and special characters
        key=$(echo "$key" | tr -d '\r\n' | xargs)
        value=$(echo "$value" | tr -d '\r\n%' | xargs)
        
        # Export the variable
        export "$key"="$value"
        echo -e "${BLUE}  Loaded: $key${NC}"
    done < .env.local
else
    echo -e "${YELLOW}⚠️  .env.local file not found, checking shell environment variables...${NC}"
fi

# Check if environment variables are set
if [ -z "$MEDPLUM_BASE_URL" ] || [ -z "$MEDPLUM_CLIENT_ID" ] || [ -z "$MEDPLUM_CLIENT_SECRET" ]; then
    echo -e "${RED}❌ Error: Required Medplum configuration not found${NC}"
    echo ""
    echo "Please ensure Medplum credentials are configured in one of these ways:"
    echo ""
    echo "Option 1 (Recommended): Create .env.local file with:"
    echo "  MEDPLUM_BASE_URL=https://api.medplum.com/"
    echo "  MEDPLUM_CLIENT_ID=your_client_id"
    echo "  MEDPLUM_CLIENT_SECRET=your_client_secret"
    echo ""
    echo "Option 2: Set environment variables:"
    echo "  export MEDPLUM_BASE_URL=https://api.medplum.com/"
    echo "  export MEDPLUM_CLIENT_ID=your_client_id"
    echo "  export MEDPLUM_CLIENT_SECRET=your_client_secret"
    echo ""
    echo "You can copy env.example to .env.local and update the values:"
    echo "  cp env.example .env.local"
    echo ""
    exit 1
fi

# Function to get access token
get_access_token() {
    echo -e "${BLUE}🔑 Getting access token...${NC}"
    
    local token_response=$(curl -s -X POST "${MEDPLUM_BASE_URL}/oauth2/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=client_credentials&client_id=${MEDPLUM_CLIENT_ID}&client_secret=${MEDPLUM_CLIENT_SECRET}")
    
    ACCESS_TOKEN=$(echo "$token_response" | jq -r '.access_token')
    
    if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
        echo -e "${RED}❌ Failed to get access token${NC}"
        echo -e "${RED}Response: ${token_response}${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Access token obtained${NC}"
}

# Function to delete resources of a specific type
delete_resources() {
    local resource_type=$1
    local description=$2
    
    echo -e "${YELLOW}🔍 Searching for ${description}...${NC}"
    
    # Get all resources of this type
    local response=$(curl -s -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        "${MEDPLUM_BASE_URL}/fhir/R4/${resource_type}?_count=1000")
    
    # Extract resource IDs using jq
    local resource_ids=$(echo "$response" | jq -r '.entry[]?.resource?.id // empty')
    
    if [ -z "$resource_ids" ]; then
        echo -e "${GREEN}✅ No ${description} found${NC}"
        return
    fi
    
    local count=$(echo "$resource_ids" | wc -l | tr -d ' ')
    echo -e "${YELLOW}📋 Found ${count} ${description}${NC}"
    
    # Delete each resource
    local deleted_count=0
    while IFS= read -r resource_id; do
        if [ -n "$resource_id" ]; then
            echo -e "  🗑️  Deleting ${resource_type}/${resource_id}..."
            
            local delete_response=$(curl -s -w "%{http_code}" -o /dev/null \
                -X DELETE \
                -H "Authorization: Bearer ${ACCESS_TOKEN}" \
                "${MEDPLUM_BASE_URL}/fhir/R4/${resource_type}/${resource_id}")
            
            if [ "$delete_response" = "204" ] || [ "$delete_response" = "200" ]; then
                deleted_count=$((deleted_count + 1))
            else
                echo -e "${RED}    ❌ Failed to delete ${resource_type}/${resource_id} (HTTP ${delete_response})${NC}"
            fi
        fi
    done <<< "$resource_ids"
    
    echo -e "${GREEN}✅ Deleted ${deleted_count}/${count} ${description}${NC}"
}

# Function to delete all intake-related resources
cleanup_all_resources() {
    echo -e "${BLUE}🚀 Starting resource cleanup...${NC}"
    
    # Delete resources in order (dependencies first, then patients last)
    # This order ensures referential integrity during deletion
    
    delete_resources "Appointment" "appointments"
    delete_resources "Invoice" "invoices"
    delete_resources "Consent" "consents"
    delete_resources "ServiceRequest" "service requests"
    delete_resources "MedicationRequest" "medication requests"
    delete_resources "AllergyIntolerance" "allergy intolerances"
    delete_resources "Procedure" "procedures"
    delete_resources "MedicationStatement" "medication statements"
    delete_resources "Condition" "conditions"
    delete_resources "Goal" "goals"
    delete_resources "Observation" "observations"
    delete_resources "Patient" "patients"
    
    echo -e "${GREEN}🎉 Cleanup completed successfully!${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  FHIR Resource Cleanup Script${NC}"
    echo -e "${BLUE}  Base URL: ${MEDPLUM_BASE_URL}${NC}"
    echo -e "${BLUE}================================================${NC}"
    
    # Confirm with user
    echo -e "${YELLOW}⚠️  WARNING: This will delete ALL FHIR resources!${NC}"
    echo -e "${YELLOW}   This includes all Patients and related data.${NC}"
    echo -e "${YELLOW}   This action cannot be undone.${NC}"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo -e "${BLUE}👋 Operation cancelled${NC}"
        exit 0
    fi
    
    get_access_token
    cleanup_all_resources
    
    echo -e "${GREEN}✨ All done! Your FHIR server has been cleaned up.${NC}"
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ Error: jq is required but not installed${NC}"
    echo "Please install jq:"
    echo "  macOS: brew install jq"
    echo "  Ubuntu/Debian: sudo apt-get install jq"
    echo "  CentOS/RHEL: sudo yum install jq"
    exit 1
fi

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ Error: curl is required but not installed${NC}"
    exit 1
fi

# Run main function
main "$@"
