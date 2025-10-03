# Backend Docker

This directory contains the Dockerfile for the Vibe Apply backend API.

## Building the Docker Image

From the **project root** (not from apps/backend):

```bash
docker build -f apps/backend/Dockerfile -t vibe-apply-backend .
```

## Running the Container

```bash
docker run -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  -e JWT_EXPIRES_IN=24h \
  -e JWT_REFRESH_EXPIRES_IN=7d \
  -e FRONTEND_URL=http://localhost:5173 \
  -e GOOGLE_CLIENT_ID=your-google-client-id \
  -e GOOGLE_CLIENT_SECRET=your-google-client-secret \
  -e GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback \
  -e FIREBASE_PROJECT_ID=your-project-id \
  -e FIREBASE_PRIVATE_KEY="your-private-key" \
  -e FIREBASE_CLIENT_EMAIL=your-client-email \
  vibe-apply-backend
```

## Using Docker Compose (Recommended)

Create a `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=24h
      - JWT_REFRESH_EXPIRES_IN=7d
      - FRONTEND_URL=${FRONTEND_URL}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL}
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
      - FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
    env_file:
      - .env
```

Then run:

```bash
docker-compose up -d
```

## Environment Variables

Required environment variables:
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Access token expiration (default: 24h)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: 7d)
- `FRONTEND_URL` - Frontend URL for CORS and redirects
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - Google OAuth callback URL
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Firebase service account private key
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email

## Image Details

- Base image: `node:20-alpine`
- Multi-stage build for optimized size
- Runs as non-root user (nestjs:nodejs)
- Exposed port: 3001
- Production optimized with minimal dependencies
