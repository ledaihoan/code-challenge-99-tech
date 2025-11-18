# Problem 5: Blog API Backend Service

A production-ready RESTful API backend service built with Express.js and TypeScript, featuring CRUD operations, JWT authentication, full-text search capabilities, and cursor-based pagination.

## Project Overview

This project implements a comprehensive blog system backend that allows users to:

- **Create resources**: Create blog posts with categories and tags
- **List resources with filters**: Search and filter posts by author, category, and text content
- **Get resource details**: Retrieve specific posts and user profiles
- **Update resources**: Modify existing posts and user profiles
- **Delete resources**: Remove posts from the system

The system includes:
- JWT-based authentication with access and refresh tokens
- PostgreSQL database with Prisma ORM for data persistence
- Full-text search using PostgreSQL's text search capabilities
- Cursor-based pagination for efficient data retrieval
- Comprehensive validation using Zod schemas
- OpenAPI documentation (Swagger UI)
- Security features (rate limiting, CORS, helmet)
- Structured logging with request tracing

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Documentation**: OpenAPI 3.0 (Swagger UI)
- **Testing**: Vitest
- **Security**: Helmet, CORS, Express Rate Limit
- **Logging**: Pino

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Yarn or npm package manager

## Environment Configuration

Create a `.env` file in the `src/problem5` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
LOG_LEVEL=info
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/blog_db?schema=public
# JWT Secrets (use strong random strings in production)
JWT_ACCESS_SECRET=your-access-token-secret-change-this
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this
# JWT Expiry
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
# Cookie Settings
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
COOKIE_SAME_SITE=strict
# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Installation & Setup

### Option 1: Using Docker Compose (Recommended)

1. **Start the application with Docker Compose**:
   ```bash
   cd src/problem5
   docker-compose up -d
   ```

   This will:
    - Start PostgreSQL database
    - Run database migrations
    - Seed initial data
    - Start the application on port 5000

2. **View logs**:
   ```bash
   docker-compose logs -f app
   ```

3. **Stop the application**:
   ```bash
   docker-compose down
   ```

### Option 2: Local Development Setup

1. **Install dependencies**:
   ```bash
   cd src/problem5
   yarn install
   ```

2. **Set up PostgreSQL database**:
   ```bash
   # Create database
   createdb blog_db

   # Or using psql
   psql -U postgres
   CREATE DATABASE blog_db;
   ```

3. **Run database migrations**:
   ```bash
   yarn migrate:dev
   ```

4. **Seed the database** (optional):
   ```bash
   yarn seed
   ```

5. **Start development server**:
   ```bash
   yarn dev
   ```

   The server will start on `http://localhost:5000`

## Running the Application

### Development Mode

```bash
# Run with default logging
yarn dev

# Run with info level logging
yarn dev:info

# Run with debug logging and pretty print
yarn dev:debug
```

### Production Mode

```bash
# Build the application
yarn build

# Start production server
yarn start
```

## API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:5000/api-docs

The OpenAPI specification is available at `src/docs/openapi.yaml`.

## Available Scripts

### Development
- `yarn dev` - Start development server with auto-reload
- `yarn dev:debug` - Start with debug logging

### Database
- `yarn migrate:dev` - Run migrations (development)
- `yarn migrate:deploy` - Run migrations (production)
- `yarn migrate:reset` - Reset database
- `yarn seed` - Seed database with sample data
- `yarn prisma:studio` - Open Prisma Studio (database GUI)

### Code Quality
- `yarn lint` - Lint code
- `yarn lint:fix` - Fix linting issues
- `yarn format` - Format code with Prettier
- `yarn typecheck` - Type check with TypeScript

### Testing
- `yarn test` - Run all tests
- `yarn test:watch` - Run tests in watch mode
- `yarn coverage` - Generate test coverage report
- `yarn test:integration` - Run integration tests only

### Build
- `yarn build` - Build for production
- `yarn start` - Start production server

## Default Test Users

After seeding the database, you can use these credentials:

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

```json
{
  "email": "jane.smith@example.com",
  "password": "password123"
}
```

## API Endpoints Overview

### Authentication
- `POST /api/v1/auth/sign-in` - Sign in user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/sign-out` - Sign out user

### User Profile
- `GET /api/v1/users/profile` - Get user profile
- `PATCH /api/v1/users/profile` - Update user profile

### Posts (User-specific, requires authentication)
- `POST /api/v1/users/:userId/posts` - Create post
- `GET /api/v1/users/:userId/posts/:id` - Get post by ID
- `PATCH /api/v1/users/:userId/posts/:id` - Update post
- `DELETE /api/v1/users/:userId/posts/:id` - Delete post
- `POST /api/v1/users/:userId/posts/search` - Search user's posts

### Public Endpoints
- `GET /api/v1/public/categories` - Get all categories
- `POST /api/v1/public/posts/search` - Search all posts (public)

## Pagination: Cursor-based vs Offset-based

This API implements **cursor-based pagination** for listing and searching posts. Understanding the difference between pagination strategies is important:

### Offset-based Pagination (Traditional)

**How it works**:
```
GET /posts?page=2&limit=10
```
- Uses `page` and `limit` parameters
- Fetches data using `OFFSET` and `LIMIT` in SQL: `SELECT * FROM posts LIMIT 10 OFFSET 10`

**Advantages**:
- Simple to implement and understand
- Easy to jump to any page
- Shows total pages/count

**Disadvantages**:
- **Performance degrades** with large offsets (database must scan and skip rows)
- **Inconsistent results** when data changes (items can be duplicated or skipped if records are added/deleted during pagination)
- Not suitable for real-time data or large datasets

### Cursor-based Pagination (Used in this API)

**How it works**:
```
GET /posts?cursor=eyJpZCI6MTIzLCJ2YWx1ZSI6MTcwMDAwMDAwMH0=&limit=10
```
- Uses an encoded cursor (pointer) to the last item
- Fetches data relative to the cursor position

**Advantages**:
- **Consistent performance** regardless of dataset size (uses indexed WHERE clause instead of OFFSET)
- **Stable results** - no duplicates or skipped items when data changes
- **Efficient for large datasets** - perfect for infinite scrolling
- **Works with real-time data** - maintains consistency as new items are added

**Disadvantages**:
- Cannot jump to arbitrary pages
- More complex to implement
- No total count by default (can be added separately if needed)

### Example Usage

**First Request** (no cursor):
```bash
POST /api/v1/public/posts/search?limit=10
Content-Type: application/json

{
  "searchText": "typescript",
  "categoryIds": [1, 2]
}
```

**Response**:
```json
{
  "nextCursor": "eyJpZCI6IjEyMzQ1Iiwic29ydEJ5IjoiY3JlYXRlZEF0IiwidmFsdWUiOjE3MDAwMDAwMDB9",
  "items": [...]
}
```

**Next Request** (using cursor):
```bash
POST /api/v1/public/posts/search?cursor=eyJpZCI6IjEyMzQ1Iiwic29ydEJ5IjoiY3JlYXRlZEF0IiwidmFsdWUiOjE3MDAwMDAwMDB9&limit=10
```

### When to Use Each

**Use Cursor-based** (this API):
- Infinite scrolling interfaces
- Real-time feeds (social media, news)
- Large datasets (millions of records)
- Mobile applications
- APIs requiring high performance

**Use Offset-based**:
- Admin panels with page numbers
- Reports with fixed page navigation
- Small datasets
- When users need to jump to specific pages

## Project Structure

```
src/problem5/
├── prisma/
│   ├── migrations/         # Database migrations
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Database seeding script
├── src/
│   ├── controllers/       # Request handlers
│   ├── docs/             # OpenAPI documentation
│   ├── lib/              # Utilities (JWT, crypto, pagination, etc.)
│   ├── middleware/       # Express middleware
│   ├── repositories/     # Database access layer
│   ├── routes/           # API routes
│   ├── schemas/          # Zod validation schemas
│   ├── services/         # Business logic
│   ├── types/            # TypeScript type definitions
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── test/
│   ├── integration/      # Integration tests
│   └── unit/            # Unit tests
├── docker-compose.yaml   # Docker Compose configuration
├── Dockerfile           # Docker image definition
└── package.json         # Project dependencies
```

## Security Features

- **JWT Authentication**: Secure access/refresh token mechanism
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Protection against brute-force attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Zod schemas for all inputs
- **Request ID Tracing**: Unique ID for each request

## Database Schema

The application uses PostgreSQL with the following main entities:

- **User**: User accounts with authentication
- **Post**: Blog posts with full-text search
- **Category**: Hierarchical category system
- **RefreshToken**: Secure refresh token storage

See `prisma/schema.prisma` for the complete schema definition.

## Full-text Search

Posts support full-text search powered by PostgreSQL's text search capabilities:

- Searches across title, description, and body
- Supports multiple languages
- Automatic indexing with triggers
- Combined with filters (category, author, tags)
