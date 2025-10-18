# FE Automates Screening Job Application

A modern job application analysis tool that helps evaluate and screen job applications efficiently.

## Features

- **Authentication**: Secure login and signup system
- **Job Analysis**: Analyze job applications with AI-powered insights
- **Recent Evaluations**: View and manage your evaluation history
- **Modern UI**: Clean, responsive design with smooth transitions

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom retro design system
- **UI Components**: Custom components with shadcn/ui patterns
- **Authentication**: Built-in auth system
- **State Management**: React hooks and context

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run the development server:
   ```bash
   bun dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (authenticated)/   # Protected routes
│   ├── auth/               # Authentication pages
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── auth/              # Authentication forms
│   ├── home/              # Homepage components
│   ├── retroui/           # Custom UI components
│   └── ui/                # Base UI components
├── lib/                   # Utilities and configurations
└── public/                # Static assets
```

## License

MIT