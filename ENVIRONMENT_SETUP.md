# Environment Setup Guide

This guide walks you through setting up the environment for the multi-tenant Compliance Guardian MVP.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Supabase Configuration
```bash
# Supabase project configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-side Supabase key (keep secret)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Authentication Configuration
```bash
# NextAuth.js configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Optional: Database URL for direct connections
DATABASE_URL=postgresql://username:password@host:port/database
```

### Stripe Configuration (for billing)
```bash
# Stripe keys for subscription management
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Email Configuration (for invitations)
```bash
# SMTP settings for sending invitation emails
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=noreply@yourdomain.com
```

## Setup Steps

### 1. Supabase Setup

1. **Create a new Supabase project** at https://supabase.com
2. **Get your project credentials** from the project settings
3. **Run the database migrations**:
   ```bash
   # First run the master schema redesign
   psql -h your-db-host -U your-username -d your-database -f migrations/MASTER_SCHEMA_REDESIGN.sql
   
   # Run pre-migration validation
   psql -h your-db-host -U your-username -d your-database -f migrations/PRE_MIGRATION_VALIDATION.sql
   
   # Run data migration (if upgrading from single-tenant)
   psql -h your-db-host -U your-username -d your-database -f migrations/DATA_MIGRATION_PLAN.sql
   ```

### 2. NextAuth Secret Generation

Generate a secure secret for NextAuth:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

### 3. Stripe Setup (Optional)

1. **Create a Stripe account** at https://stripe.com
2. **Get your API keys** from the Stripe dashboard
3. **Set up webhook endpoints** for subscription events:
   - Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
   - Events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

### 4. Email Setup (Optional)

Configure SMTP settings for sending workspace invitations:

**Popular providers:**
- **Gmail**: Use App Passwords with 2FA enabled
- **SendGrid**: Use API key as password
- **Mailgun**: Use SMTP credentials from dashboard
- **AWS SES**: Use SMTP credentials from SES console

### 5. Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Open http://localhost:3000
   - Sign up for a new account
   - Complete the onboarding flow

## Database Schema Validation

After running the migrations, validate your setup:

```sql
-- Check that all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Check workspace and user data
SELECT w.name as workspace_name, 
       COUNT(wm.user_id) as member_count
FROM workspaces w
LEFT JOIN workspace_memberships wm ON w.id = wm.workspace_id
GROUP BY w.id, w.name;
```

## Troubleshooting

### Common Issues

1. **"Invalid JWT" errors**
   - Check that NEXTAUTH_SECRET is set correctly
   - Verify Supabase keys are correct
   - Ensure database connection is working

2. **Database connection issues**
   - Verify DATABASE_URL format: `postgresql://user:pass@host:port/db`
   - Check firewall settings for database access
   - Ensure database user has proper permissions

3. **RLS policy errors**
   - Verify user is authenticated before accessing data
   - Check workspace membership for data access
   - Review RLS policies in database

4. **Email invitation issues**
   - Verify SMTP settings are correct
   - Check that sender email is verified
   - Review email provider's sending limits

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```bash
# Enable debug logging
DEBUG=true
NEXT_PUBLIC_DEBUG=true
```

## Production Deployment

### Environment Variables for Production

```bash
# Update these for production
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url

# Use production Stripe keys
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key
```

### Security Checklist

- [ ] All secrets use strong, unique values
- [ ] Database has proper backup strategy
- [ ] RLS policies are tested and validated
- [ ] Stripe webhook endpoints use HTTPS
- [ ] Email sending limits are appropriate
- [ ] Error logging is configured
- [ ] Performance monitoring is enabled

### Performance Optimization

- [ ] Database indexes are in place
- [ ] Connection pooling is configured
- [ ] CDN is set up for static assets
- [ ] Caching strategies are implemented
- [ ] Database queries are optimized

## Support

For issues with setup:

1. Check the [Implementation Strategy](IMPLEMENTATION_STRATEGY.md)
2. Review the [Migration Documentation](migrations/)
3. Test with the provided validation scripts
4. Check application logs for specific error messages

## Security Notes

- **Never commit `.env.local` to version control**
- **Use environment-specific secrets for each deployment**
- **Regularly rotate API keys and passwords**
- **Monitor for unusual access patterns**
- **Keep dependencies updated for security patches**
