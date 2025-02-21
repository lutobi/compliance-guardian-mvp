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
