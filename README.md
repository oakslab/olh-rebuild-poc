This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## FHIR Resource Management

This project includes tools for managing FHIR resources in your Medplum server.

### Cleanup Script

The `cleanup-intake-resources.sh` script allows you to delete all FHIR resources created by intake requests. This is useful for development, testing, or resetting your FHIR server.

#### Prerequisites

- `jq` (JSON processor)
- `curl` (HTTP client)
- Medplum credentials configured in `.env.local` file

#### Environment Setup

Before running the cleanup script, create a `.env.local` file with your Medplum credentials:

```bash
# Copy the example file
cp env.example .env.local

# Edit .env.local with your actual Medplum credentials
MEDPLUM_BASE_URL=https://api.medplum.com/
MEDPLUM_CLIENT_ID=your_actual_client_id
MEDPLUM_CLIENT_SECRET=your_actual_client_secret
```

The script will automatically load these variables from `.env.local`. Alternatively, you can still set them as shell environment variables if preferred.

#### Usage

Run the cleanup script from the project root:

```bash
./cleanup-intake-resources.sh
```

The script will:

1. Authenticate with your Medplum FHIR server
2. Search for all intake-related resources
3. Ask for confirmation before deletion
4. Delete resources in the correct order to maintain referential integrity
5. Provide detailed progress feedback

#### What Gets Deleted

The script removes all instances of the following FHIR resource types:

- **Patient** - Patient demographics and contact information
- **Observation** - Weight, height, BMI, lab values, vital signs, social history
- **Goal** - Weight management goals and objectives
- **Condition** - Medical conditions and comorbidities
- **MedicationStatement** - Current and historical medications
- **MedicationRequest** - Treatment plan prescriptions
- **Procedure** - Surgical history and procedures
- **AllergyIntolerance** - Medication allergies and reactions
- **ServiceRequest** - Sync visits and medical clearance requests
- **Consent** - Terms and conditions agreements
- **Invoice** - Pricing and payment information
- **Appointment** - Scheduling information

#### Safety Features

- **Confirmation prompt**: The script asks for explicit confirmation before deletion
- **Proper ordering**: Resources are deleted in dependency order to avoid referential integrity issues
- **Error handling**: Failed deletions are reported but don't stop the process
- **Progress tracking**: Real-time feedback shows what's being deleted
- **Environment validation**: Checks for required tools and configuration before starting

#### Installing Prerequisites

**macOS (using Homebrew):**

```bash
brew install jq
```

**Ubuntu/Debian:**

```bash
sudo apt-get install jq curl
```

**CentOS/RHEL:**

```bash
sudo yum install jq curl
```

⚠️ **Warning**: This script deletes ALL FHIR resources from your server. Use with caution in production environments.
