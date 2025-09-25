# ENVIRONMENT SETUP FOR MULTI-TENANT ARCHITECTURE

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Database Configuration (if using external DB)
DATABASE_URL=your_database_connection_string

# Stripe Configuration (for billing)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Configuration (for invitations)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
FROM_EMAIL=noreply@yourdomain.com

# Application Settings
APP_DOMAIN=yourdomain.com
APP_NAME="Compliance Guardian"
SUPPORT_EMAIL=support@yourdomain.com
```

## Setup Instructions

1. **Supabase Project Setup**:
   - Create a new Supabase project for multi-tenant architecture
   - Run the migration scripts in order
   - Configure RLS policies
   - Set up authentication

2. **Local Development**:
   - Copy environment variables to `.env.local`
   - Install dependencies: `npm install`
   - Run development server: `npm run dev`

3. **Database Migration**:
   - Run `MASTER_SCHEMA_REDESIGN.sql` first
   - Then run `DATA_MIGRATION_PLAN.sql`
   - Validate with verification queries

## Important Notes

- **Never commit `.env.local` to version control**
- Use different Supabase projects for development/staging/production
- Test migration thoroughly in staging before production
- Monitor database performance after migration
