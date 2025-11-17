# Live Scoreboard API Specification

## Overview
Real-time leaderboard system with score updates, fraud prevention, and live WebSocket broadcasting.

## Architecture

### Flow Diagram
See [architecture-flow.mermaid](./architecture-flow.mermaid) for the complete execution flow.

### Key Components
- **REST API**: Action start/complete endpoints with JWT authentication
- **WebSocket Server**: Real-time score updates to connected clients
- **Redis Distributed Locks**: Action cooldown enforcement and rate limiting
- **Redis Cache**: Top 10 leaderboard with 5-second refresh
- **Redis Pub/Sub**: Score update event broadcasting
- **Database**: PostgreSQL with optimized indexes and row-level locking

## API Specification
Full OpenAPI 3.0 specification: [openapi.yaml](./openapi.yaml)

Detailed Redis implementation: [redis-implementation.md](./redis-implementation.md)

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
4. **Redis Cooldown Lock**: Atomic check prevents same-action repetition within cooldown period
5. **Token Bucket Rate Limiting**: Global 10 req/min limit per user across all actions
6. **Database Transaction Locking**: NOWAIT prevents race conditions on point distribution

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
- **Horizontal scaling**: Stateless API servers behind load balancer
- **Redis multi-instance**: Per-zone deployment with user-hash routing for distributed locking
- **Redis Pub/Sub**: Decouples score updates from WebSocket broadcasting
- **Database connection pooling**: Handle concurrent action completions
- **Fail-closed policy**: System rejects requests if Redis unavailable (prevents fraud)

## Implementation Notes

### Transaction Flow for Score Update
```
1. Redis Cooldown Check (Lua script - atomic)
   - Key: action_lock:{userId}:{actionId}
   - If exists → Reject 429 (cooldown active)
   - If not exists → Set with TTL from Action.cooldownSeconds
   
2. Token Bucket Rate Limiting
   - Key: rate_bucket:{userId}
   - Decrement token count
   - If depleted → Reject 429 (rate limit exceeded)
   
3. Validate ActionAttempt exists and status='started'

4. Check timing constraints (minCompletionTime, maxCompletionTime)

5. BEGIN DATABASE TRANSACTION
   - SELECT * FROM actions WHERE id = ? FOR UPDATE NOWAIT
   - If lock fails → Rollback, Return 409 (resource locked)
   - Verify remainingPoints >= pointsPerCompletion
   - If insufficient → Rollback, Return 409 (points depleted)
   
6. Update ActionAttempt (completedAt, pointsAwarded, status='completed')

7. Decrement Action.remainingPoints

8. Increment User.currentScore

9. COMMIT

10. Publish event to Redis Pub/Sub for leaderboard update
```

### Locking Mechanisms

**Action-Specific Cooldown (Redis)**
```lua
-- Atomic Lua script prevents race conditions
local key = KEYS[1]
local ttl = ARGV[1]
local exists = redis.call('EXISTS', key)
if exists == 1 then
    return 0
end
redis.call('SETEX', key, ttl, '1')
return 1
```
- Key pattern: `action_lock:{userId}:{actionId}`
- TTL: Configurable per action via `Action.cooldownSeconds`
- Latency: ~1-2ms per check
- Fail-fast: Returns 429 before touching database

**Global Rate Limiting (Token Bucket)**
- Key pattern: `rate_bucket:{userId}`
- Limit: 10 requests per minute per user
- Implementation: Redis DECR with TTL reset
- Prevents spam attacks across all actions

**Points Pool Locking (Database)**
- Row-level lock on Action table with `SELECT FOR UPDATE NOWAIT`
- Ensures points pool integrity across concurrent requests
- Fails immediately if another transaction holds lock
- Returns 409 without waiting

**Redis Architecture**
- Multi-instance deployment per geographic zone
- User routing by userId hash for horizontal scaling
- Fail-closed policy: Reject requests if Redis unavailable
- Acceptable 0.01% race condition tolerance for cooldown bypass

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
- Redis cluster with Redlock algorithm for stronger consistency guarantees
- Circuit breaker pattern for Redis failover scenarios
- Add exponential backoff for failed action attempts
- Implement daily/weekly leaderboard variants with separate Redis keys
- Add admin dashboard for monitoring fraud patterns and lock contention
- Consider sharding User table by score ranges for large scale
- Add replay protection using nonce in ActionAttempt
- Implement Redis Sentinel for automatic failover
- Add metrics for lock acquisition latency and failure rates