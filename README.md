# Spotlight

A secure, web-based video competition platform designed to support:

- User video submissions
- Multi-phase judging workflows
- Peer voting
- Administrative dashboards and reporting
- Scalable media handling

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth.js (NextAuth)
- **Storage**: AWS S3
- **Hosting**: AWS Lightsail

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                # Next.js App Router pages
│   ├── api/           # API route handlers
│   ├── login/         # Login page
│   └── page.tsx       # Home page
├── components/        # Reusable React components
├── lib/               # Utility functions and configurations
├── prisma/            # Database schema and migrations
└── public/            # Static assets
```

## License

MIT
