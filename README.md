# Compliance Guardian MVP

A modern compliance monitoring and management system built with Next.js.

## Features

### Framework Support
- ISO 27001 (Information Security Management)
- GDPR (Data Protection)
- SOX (Financial Controls)
- HIPAA (Healthcare Privacy)

### Monitoring Features
- Smart monitoring setup wizard
- Framework-specific control selection
- Customizable monitoring frequency
- Multiple evidence types support
- Priority-based monitoring
- Automation level configuration

### Dashboard
- Real-time compliance status
- Framework and control monitoring
- Status tracking and alerts
- Performance metrics

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui Components
- Lucide Icons

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/compliance-guardian-mvp.git
   cd compliance-guardian-mvp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # Reusable React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── monitoring/       # Monitoring-specific components
│   └── dashboard/        # Dashboard components
├── services/             # Business logic and API services
├── types/                # TypeScript type definitions
└── lib/                  # Utility functions and constants
```

## Deployment

### Vercel (Recommended)

1. Fork this repository
2. Import your fork to Vercel
3. Deploy with default settings
4. Your app will be live at: `https://your-project.vercel.app`

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own compliance monitoring needs.

## Puppeteer E2E: Evidence API Sanity

This repository includes a headless E2E script to verify that authentication, workspace switching, and Evidence API operations work end-to-end in a local dev environment.

Script: `scripts/e2e/evidence.e2e.js`

What it does:

- Logs in to the app at `http://localhost:3002/auth/login` using the credentials you provide
- Confirms the server recognizes the user via `/api/dev/whoami` with a Bearer token
- Switches to the specified workspace via `POST /api/workspace/switch`
- Navigates to the dashboard frameworks page for the provided framework ID
- Calls `GET /api/evidence` and expects 200 OK
- Creates a test evidence via `POST /api/evidence`, then deletes it with `DELETE /api/evidence`

Run:

```
TEST_EMAIL="you@example.com" \
TEST_PASSWORD="yourpass" \
TEST_WORKSPACE_SLUG="your-workspace-slug" \
TEST_FRAMEWORK_ID="framework-uuid" \
npm run e2e:evidence
```

Defaults (override as needed):

- `E2E_ORIGIN` defaults to `http://localhost:3002`
- `TEST_WORKSPACE_SLUG` defaults to `abimbolatobi-gmail-com-s-workspace`
- `TEST_FRAMEWORK_ID` defaults to `84fe5672-eb4b-405c-a913-19f956fbe256`

Prerequisites:

- Dev server is running locally: `npm run dev` (on port 3002 per `package.json`)
- A test user exists (you can create or use `scripts/seed-test-user.js` if you have service credentials)

Expected output:

- Successful run prints `E2E SUCCESS` and exits with code 0
- On failure, prints error details (HTTP status + JSON body) and exits with code 1

