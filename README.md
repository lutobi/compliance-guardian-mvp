# Compliance Guardian MVP

A modern compliance management application built with Next.js and Supabase.

## Features

- User authentication (signup, login, email verification)
- Dashboard with compliance management tools
- Real-time notifications
- Responsive design

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- Radix UI Components

## Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Vercel (Recommended)

1. Push your code to a Git repository
2. Import your project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```

## Environment Setup

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
