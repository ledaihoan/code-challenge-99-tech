# Live Scoreboard API Specification

## Overview
Real-time leaderboard system with score updates, fraud prevention, and live WebSocket broadcasting.

## Architecture

### Flow Diagram
See [architecture-flow.mermaid](./architecture-flow.mermaid) for the complete execution flow.

### Key Components
- **REST API**: Action start/complete endpoints with JWT authentication
- **WebSocket Server**: Real-time score updates to connected clients
- **Redis Cache**: Top 10 leaderboard with 5-second refresh
- **Database**: PostgreSQL with optimized indexes for leaderboard queries

## API Specification
Full OpenAPI 3.0 specification: [openapi.yaml](./openapi.yaml)

### Core Endpoints
- `POST /api/actions/start` - Initialize action attempt
- `POST /api/actions/complete` - Submit completion and award points
- `GET /api/leaderboard/top10` - Fetch current top 10 users
- `WebSocket /ws/scoreboard` - Subscribe to live updates

## Database Schema

### Tables
**User**
- Stores user credentials and `currentScore` for fast leaderboard queries

**Action**
- Defines scoring actions with point pools and validation constraints
- `remainingPoints` tracks available points with row-level locking

**ActionAttempt**
- Tracks each user's action lifecycle from start to completion
- Includes fraud detection fields: `clientFingerprint`, `ipAddress`

See [entity-diagram.mermaid](./entity-diagram.mermaid) for detailed entity relationships.

## Security & Fraud Prevention

### Anti-Fraud Measures
1. **Timing Validation**: Enforce `minCompletionTime` and `maxCompletionTime`
2. **JWT Authentication**: Validate user identity on each request
3. **Fingerprinting**: Track `clientFingerprint` and `ipAddress`
4. **Rate Limiting**: 10 requests/minute per user
5. **Transaction Locking**: Prevent race conditions on point distribution

### Authorization Flow
1. User authenticates → Receives JWT token
2. Token includes `userId` and `exp` timestamp
3. All action endpoints verify token signature and expiration
4. `ActionAttempt.userId` must match authenticated user

## Performance Optimizations

### Caching Strategy
- **Redis Cache**: Top 10 leaderboard refreshed every 5 seconds
- **Database Index**: `User(currentScore DESC)` for fast queries
- **WebSocket**: Broadcast only score deltas, not full leaderboard

### Scalability Considerations
- Horizontal scaling: Stateless API servers behind load balancer
- Redis Pub/Sub: Decouples score updates from WebSocket broadcasting
- Database connection pooling: Handle concurrent action completions

## Implementation Notes

### Transaction Flow for Score Update
```
BEGIN TRANSACTION
  1. Validate ActionAttempt exists and status='started'
  2. Check timing constraints
  3. Verify no duplicate attempts (userId + actionId within 5 min window)
  4. Lock Action row (SELECT FOR UPDATE)
  5. Verify remainingPoints >= pointsPerCompletion
  6. Decrement Action.remainingPoints
  7. Update ActionAttempt (completedAt, pointsAwarded, status)
  8. Increment User.currentScore
COMMIT
```

### Locking Mechanisms
**Action-Level Locking**
- Row-level lock on Action table prevents race conditions on `remainingPoints`
- Ensures points pool integrity across concurrent requests

**User-Action Rate Limiting**
- Query existing ActionAttempts: `WHERE userId = ? AND actionId = ? AND startedAt > NOW() - INTERVAL '5 minutes'`
- Reject if active attempt exists within cooldown window
- Prevents rapid-fire exploitation of same action

### WebSocket Message Format
```json
{
  "type": "SCORE_UPDATE",
  "payload": {
    "userId": "uuid",
    "newScore": 1250,
    "leaderboardPosition": 7
  }
}
```

## Potential Improvements
- Configurable cooldown periods per action type
- Add exponential backoff for failed action attempts
- Implement daily/weekly leaderboard variants
- Add admin dashboard for monitoring fraud patterns
- Consider sharding User table by score ranges for large scale
- Add replay protection using nonce in ActionAttempt
- Implement distributed locks (Redis) for high-concurrency scenarios