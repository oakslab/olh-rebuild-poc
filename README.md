# Data Architecture PoC

A FHIR R4 compliant healthcare intake system built with Next.js 15, TypeScript, and Medplum integration. This application handles patient intake forms and converts them to standardized healthcare data formats with secure authentication.

## Features

- 🏥 **FHIR R4 Compliance** - Full integration with healthcare data standards
- 🔐 **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- 📊 **Patient Data Management** - Comprehensive patient records and intake forms
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components
- 🔒 **HIPAA-Ready Architecture** - Secure handling of protected health information
- 📱 **Responsive Design** - Works seamlessly across desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **UI Library**: Radix UI primitives with custom variants
- **Healthcare**: FHIR R4 compliance via @medplum/core and @medplum/fhirtypes
- **Authentication**: JWT tokens with bcrypt password hashing
- **Utilities**: clsx, tailwind-merge, class-variance-authority
- **Icons**: Lucide React
- **Fonts**: Geist Sans and Geist Mono

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Access to a Medplum FHIR server
- `jq` and `curl` for cleanup scripts (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd poc
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp env.example .env.local
   ```

4. **Set up your environment variables in `.env.local`:**

   **Medplum Configuration:**

   ```bash
   MEDPLUM_BASE_URL=https://api.medplum.com/
   MEDPLUM_CLIENT_ID=your_actual_client_id
   MEDPLUM_CLIENT_SECRET=your_actual_client_secret
   ```

   **Authentication Configuration:**

   ```bash
   # Generate a secure 32+ character secret for JWT signing
   AUTH_SECRET=your-super-secret-32-character-minimum-key-here

   # System username
   AUTH_USERNAME=admin

   # Bcrypt hash of your password (base64 encoded to avoid shell interpretation)
   AUTH_PASSWORD_HASH=JDJiJDEyJEtPN2t6czBhaU1iLzc3WUVBOEg0QXU2MjRlR0ZYNzIydEVBVFpaVEJBRi9JUXlXR0tsNlVT
   ```

5. **Generate password hash**

   ```bash
   # Generate bcrypt hash
   node -e "console.log(require('bcryptjs').hashSync('your-password-here', 12))"

   # Convert to base64 (to avoid shell interpretation of $ characters)
   node -e "const hash = require('bcryptjs').hashSync('your-password-here', 12); console.log('Base64 encoded:', Buffer.from(hash).toString('base64'));"
   ```

   Copy the base64-encoded hash to `AUTH_PASSWORD_HASH` in your `.env.local` file.

6. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Access the application**
   Open [http://localhost:3001](http://localhost:3001) and log in with your configured credentials.

## Authentication

The application uses a secure JWT-based authentication system:

### Features

- ✅ **JWT tokens** with 24-hour expiry
- ✅ **Bcrypt password hashing** with 12 salt rounds
- ✅ **HttpOnly cookies** for secure token storage
- ✅ **Route protection** for all pages and API endpoints
- ✅ **Environment-based credentials** (not hardcoded)
- ✅ **CSRF protection** via SameSite cookies

### Default Setup

For testing purposes, you can use:

- **Username**: `admin`
- **Password**: `admin123` (hash: `$2b$12$YpP97YQMtaWaJ/SOz3TrE.b2hjksWsRWsWujVJfhWunjgOUtWggI2`)

⚠️ **Important**: Change these credentials before deploying to production!

### Authentication Flow

1. User accesses any protected route
2. Middleware checks for valid auth token
3. If not authenticated → redirect to `/login`
4. User enters credentials
5. Server validates and sets secure cookie
6. User gains access to protected resources
7. Header displays logout functionality

## API Endpoints

### Healthcare Data APIs

**Patient Data**

```
GET /api/patient/[id]
```

Fetch comprehensive patient data from Medplum including demographics, medical history, medications, and treatment plans.

**Intake Form Submission**

```
POST /api/intake
```

Submit patient intake forms as FHIR-compliant bundles. Creates multiple FHIR resources including Patient, Observations, Goals, Conditions, and more.

### Authentication APIs

**Login**

```
POST /api/auth/login
```

**Logout**

```
POST /api/auth/logout
```

**Authentication Status**

```
GET /api/auth/status
```

## FHIR Resource Management

### Supported FHIR Resources

The application creates and manages the following FHIR R4 resources:

**Core Resources:**

- **Patient** - Demographics and contact information
- **Observation** - Weight, height, BMI, laboratory values, vital signs
- **Condition** - Medical conditions and comorbidities
- **Procedure** - Surgical history and procedures

**Medications:**

- **MedicationStatement** - Current and historical medications
- **MedicationRequest** - Treatment plan prescriptions
- **AllergyIntolerance** - Medication allergies and reactions

**Care Coordination:**

- **Goal** - Weight management goals and targets
- **ServiceRequest** - Sync visits and medical clearance
- **Appointment** - Scheduling information
- **Consent** - Terms and conditions agreements
- **Invoice** - Pricing and payment information

### Cleanup Script

The `cleanup-intake-resources.sh` script allows you to delete all FHIR resources created by intake requests. This is useful for development, testing, or resetting your FHIR server.

#### Prerequisites

- `jq` (JSON processor)
- `curl` (HTTP client)
- Medplum credentials configured in `.env.local` file

#### Usage

```bash
./cleanup-intake-resources.sh
```

The script will:

1. Authenticate with your Medplum FHIR server
2. Search for all intake-related resources
3. Ask for confirmation before deletion
4. Delete resources in the correct order to maintain referential integrity
5. Provide detailed progress feedback

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

## Project Structure

```
src/
├── app/                     # Next.js App Router pages and API routes
│   ├── api/                # API endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   ├── intake/         # Intake form submission
│   │   └── patient/        # Patient data retrieval
│   ├── login/              # Login page
│   ├── patient/[id]/       # Patient detail pages
│   ├── globals.css         # Global Tailwind styles
│   ├── layout.tsx          # Root layout with authentication
│   └── page.tsx            # Homepage
├── components/
│   ├── auth/               # Authentication components
│   ├── layout/             # Layout components (Header, etc.)
│   ├── patient/            # Patient data display components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities and business logic
│   ├── auth.ts             # Authentication utilities
│   ├── auth-context.tsx    # React authentication context
│   ├── auth-middleware.ts  # API authentication middleware
│   ├── fhir-converter.ts   # FHIR resource conversion
│   ├── medplum.ts          # Medplum client configuration
│   ├── utils.ts            # General utilities
│   └── validation.ts       # Form validation logic
└── types/                  # TypeScript type definitions
    └── intake.ts           # Healthcare intake form interfaces
```

## Healthcare Data Standards

### FHIR R4 Compliance

- Follows FHIR R4 specifications strictly
- Uses proper LOINC codes for observations:
  - Weight: 29463-7
  - Height: 8302-2
  - BMI: 39156-5
- Implements SNOMED CT codes where applicable
- Proper healthcare data validation
- UUID identifiers for all resources

### HIPAA Considerations

- Secure authentication and session management
- Protected health information (PHI) handling
- Audit trails and logging
- Secure API endpoints
- Encrypted data transmission

## Development

### Code Style

- TypeScript strict mode with explicit types
- ESLint with Next.js and Prettier configurations
- Consistent import patterns and file organization
- Proper error handling and validation

### Environment Setup

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Code formatting
npm run format
```

### Testing

- Validate FHIR resource generation
- Test Medplum integration
- Verify authentication flows
- Check healthcare data compliance

## Security

### Authentication Security

- JWT tokens with secure secret keys
- Password hashing with bcrypt (12 salt rounds)
- HttpOnly cookies with SameSite protection
- Secure cookies in production environments
- Token expiration and refresh handling

### API Security

- All API routes protected with authentication middleware
- Input validation and sanitization
- Proper error handling without sensitive data exposure
- Rate limiting considerations for production

### Healthcare Data Security

- HIPAA-compliant data handling
- Secure transmission of PHI
- Audit logging for compliance
- Access controls and permissions

## Deployment

### Environment Variables

Ensure all required environment variables are set:

- `AUTH_SECRET` - Secure JWT signing key
- `AUTH_USERNAME` - System username
- `AUTH_PASSWORD_HASH` - Bcrypt password hash
- `MEDPLUM_BASE_URL` - Medplum server URL
- `MEDPLUM_CLIENT_ID` - Medplum client ID
- `MEDPLUM_CLIENT_SECRET` - Medplum client secret

### Production Considerations

- Use strong, unique passwords and secrets
- Enable secure cookies (`NODE_ENV=production`)
- Implement proper SSL/TLS certificates
- Set up monitoring and logging
- Regular security audits and updates

## Contributing

1. Follow the established code style and patterns
2. Ensure FHIR R4 compliance for all healthcare data
3. Add proper TypeScript types for new features
4. Test authentication and security features thoroughly
5. Update documentation for new functionality

## License

[Add your license information here]

## Support

For questions about FHIR implementation, Medplum integration, or authentication setup, please refer to:

- [FHIR R4 Documentation](https://www.hl7.org/fhir/R4/)
- [Medplum Documentation](https://www.medplum.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
