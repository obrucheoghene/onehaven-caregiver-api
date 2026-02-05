# OneHaven Caregiver API

A real-time caregiver management API built with Node.js, Express, TypeScript, Supabase Auth, and MongoDB.

## Live URL

https://onehaven-caregiver-api.onrender.com/

## Overview

This API enables caregivers to:

- Register and authenticate securely
- Manage protected members (children, seniors, etc.)
- Receive real-time event notifications when member data changes

## Tech Stack

| Component      | Technology             |
| -------------- | ---------------------- |
| Runtime        | Node.js                |
| Framework      | Express.js             |
| Language       | TypeScript             |
| Authentication | Supabase Auth          |
| Database       | MongoDB (Mongoose ODM) |
| Validation     | Zod                    |
| Logging        | Winston                |
| Documentation  | Swagger/OpenAPI        |
| Rate Limiting  | express-rate-limit     |

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)
- Supabase project (for authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/obrucheoghene/onehaven-caregiver-api.git
cd onehaven-caregiver-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onehaven

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

**On your Supabase Dashboard Dissable Email Confirmation**

### 4. Start the Server

**Development mode (with hot reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

### 5. Run the Seed Script

The seed script demonstrates concurrent member creation and event logging:

```bash
# Make sure the server is running first, then in another terminal:
npm run seed
```

Expected output on the **server console**:

```
[2025-02-05 10:30:55] EVENT: member_added — { caregiverId: "abc123", memberId: "xyz1" }
[2025-02-05 10:30:55] EVENT: member_added — { caregiverId: "abc123", memberId: "xyz2" }
[2025-02-05 10:30:55] EVENT: member_added — { caregiverId: "abc123", memberId: "xyz3" }
```

## API Documentation

Interactive Swagger documentation is available at:

```
http://localhost:3000/api/docs
```

## API Endpoints

### Caregiver Management

| Method | Endpoint                 | Description              | Auth |
| ------ | ------------------------ | ------------------------ | ---- |
| POST   | `/api/caregivers/signup` | Create a new caregiver   | No   |
| POST   | `/api/caregivers/login`  | Authenticate and get JWT | No   |
| GET    | `/api/caregivers/me`     | Get current profile      | Yes  |

### Protected Member Management

| Method | Endpoint                     | Description               | Auth |
| ------ | ---------------------------- | ------------------------- | ---- |
| POST   | `/api/protected-members`     | Create a protected member | Yes  |
| GET    | `/api/protected-members`     | List all your members     | Yes  |
| PATCH  | `/api/protected-members/:id` | Update a member           | Yes  |
| DELETE | `/api/protected-members/:id` | Delete a member           | Yes  |

### Other

| Method | Endpoint    | Description           |
| ------ | ----------- | --------------------- |
| GET    | `/`         | Base                  |
| GET    | `/health`   | Health check          |
| GET    | `/api/docs` | Swagger documentation |

## Design Explanation

### Architecture

The application follows a layered architecture:

```
Routes → Controllers → Services → Models → Database
           ↓
       Middleware (Auth, Validation, Rate Limiting)
           ↓
      Event Emitter (Real-time logging)
```

### Key Design Decisions

1. **Authentication Strategy**
   - Supabase Auth handles user registration, login, and JWT token management
   - MongoDB stores caregiver profiles linked via `supabaseUserId`
   - This separation provides security best practices for auth while giving flexibility in data storage

2. **Role-Based Access Control (RBAC)**
   - Each protected member has a `caregiverId` foreign key
   - Service layer validates ownership before any CRUD operation
   - Returns 403 Forbidden if a caregiver tries to access another's members

3. **Real-Time Event System**
   - Node.js EventEmitter singleton pattern
   - Events emitted: `member_added`, `member_updated`, `member_deleted`
   - Events logged to console with timestamps for demonstration
   - Integrated WebSocket (SocketIo) to emit events to frontend

4. **Concurrency Handling**
   - MongoDB handles concurrent writes natively with atomic operations
   - The seed script demonstrates concurrent requests using `Promise.all()`
   - No race conditions due to proper async/await patterns

5. **Validation**
   - Zod schemas validate all incoming requests
   - Detailed error messages returned for invalid input
   - Prevents malformed data from reaching the database

## Event Flow Description

When a protected member is created, updated, or deleted:

1. Controller receives the HTTP request
2. Auth middleware validates the JWT token
3. Validation middleware checks the request body
4. Service layer performs the database operation
5. Service emits an event via the EventEmitter
6. Event listener logs the event to console

```
[timestamp] EVENT: member_added — { caregiverId: "...", memberId: "..." }
```

## Rate Limiting

| Scope          | Limit        | Window     |
| -------------- | ------------ | ---------- |
| Global         | 100 requests | 15 minutes |
| Auth endpoints | 20 requests  | 15 minutes |

## Error Handling

All errors return consistent JSON responses:

```json
{
  "success": false,
  "error": {
    "message": "Description of the error",
    "code": "ERROR_CODE"
  }
}
```

Common error codes:

- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)

## Project Structure

```
onehaven-caregiver-api/
├── src/
│   ├── config/          # Database, Supabase, socketio, Swagger config
│   ├── controllers/     # Request handlers
│   ├── events/          # Event emitter for real-time updates
│   ├── middleware/      # Auth, validation, error handling, rate limiting
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Logger and helpers
│   ├── validations/     # Zod schemas
│   └── app.ts           # Application entry point
├── seed.ts              # Execution harness script
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## AI Usage Summary

This project was developed with assistance from **Claude Code** (Anthropic's Claude Opus 4.5) and **GitHub Copilot**.

### How AI Was Used

| Area                    | Tool           | Description                                                      |
| ----------------------- | -------------- | ---------------------------------------------------------------- |
| Architecture & Planning | Claude Code    | Layered architecture, folder structure, design patterns          |
| Code Generation         | Claude Code    | Boilerplate for routes, middleware, Mongoose models, Zod schemas |
| Code Completion         | GitHub Copilot | Inline code completion and suggestions                           |
| Commit Messages         | GitHub Copilot | Generated descriptive commit messages                            |
| Testing                 | Claude Code    | Unit tests and integration tests (40 tests total)                |
| Documentation           | Claude Code    | Swagger/OpenAPI annotations and README                           |
| Security                | Claude Code    | Helmet, rate limiting, input validation                          |

All AI-generated code was:

- **Reviewed** for correctness and security vulnerabilities
- **Tested** manually and with automated tests
- **Customized** to meet the specific requirements of the OneHaven challenge

## Testing

```bash
npm run test
```

To manually test the API:

1. Start the server: `npm run dev`
2. Open Swagger docs: `http://localhost:3000/api/docs`
3. Create a caregiver account via `/api/caregivers/signup`
4. Copy the JWT token from the response
5. Click "Authorize" in Swagger and paste the token
6. Test the protected member endpoints

Or run the automated seed script:

```bash
npm run seed
```

## License

MIT
