# Mongo Server

A GraphQL server for the Tradz application, built with:

- Node.js
- TypeScript
- Apollo Server
- Drizzle ORM
- PostgreSQL (hosted on Neon)
- Express
- Passport.js for authentication

## Setup

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file with required environment variables
4. Run database migrations:

```bash
npx drizzle-kit push
```

5. Start the development server:

```bash
npm run dev
```

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_GOOGLE_ID`: Google OAuth client ID
- `AUTH_GOOGLE_SECRET`: Google OAuth client secret
- `GOOGLE_CALLBACK_URL`: Google OAuth callback URL
- `SESSION_SECRET`: Secret for session encryption

## API

The server provides a GraphQL API at `/graphql` with:

- User authentication
- Trading account management
- Trade logging and tracking
- Portfolio analytics
- Real-time updates via WebSocket
