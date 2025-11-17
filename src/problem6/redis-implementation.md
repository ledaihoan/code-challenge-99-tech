# Redis Implementation Details

## Overview
Redis serves three critical functions in the Live Scoreboard system:
1. **Distributed Locking**: Action-specific cooldown enforcement
2. **Rate Limiting**: Token bucket for global user rate limits
3. **Caching & Pub/Sub**: Leaderboard cache and real-time event broadcasting

## Architecture

### Multi-Instance Deployment
```
User Request → Hash(userId) → Route to Redis Instance
├── Zone 1: Redis Instance (users 0-33%)
├── Zone 2: Redis Instance (users 34-66%)
└── Zone 3: Redis Instance (users 67-100%)
```

**Benefits:**
- Horizontal scaling per geographic zone
- Reduced single-point-of-failure risk
- Lower latency through proximity routing

## 1. Action-Specific Cooldown Lock

### Implementation
```lua
-- cooldown_lock.lua
local key = KEYS[1]  -- action_lock:{userId}:{actionId}
local ttl = ARGV[1]  -- Action.cooldownSeconds

local exists = redis.call('EXISTS', key)
if exists == 1 then
    local remaining = redis.call('TTL', key)
    return {0, remaining}  -- Lock exists, return remaining TTL
end

redis.call('SETEX', key, ttl, '1')
return {1, 0}  -- Lock acquired
```

### API Usage
```typescript
// Pseudocode
const result = await redis.eval(
  cooldownLockScript,
  [`action_lock:${userId}:${actionId}`],
  [action.cooldownSeconds]
);

const [acquired, remaining] = result;
if (!acquired) {
  return res.status(429).json({
    error: 'cooldown_active',
    retryAfter: remaining
  });
}
```

### Key Pattern
- Format: `action_lock:{userId}:{actionId}`
- Example: `action_lock:550e8400-e29b-41d4-a716-446655440000:123e4567-e89b-12d3-a456-426614174000`
- TTL: Configurable per action (default: 300 seconds)

## 2. Token Bucket Rate Limiting

### Implementation
```lua
-- rate_limit.lua
local key = KEYS[1]  -- rate_bucket:{userId}
local max_tokens = tonumber(ARGV[1])
local refill_time = tonumber(ARGV[2])
local cost = tonumber(ARGV[3])

local current = redis.call('GET', key)
if not current then
    redis.call('SET', key, max_tokens - cost, 'EX', refill_time)
    return 1
end

local tokens = tonumber(current)
if tokens >= cost then
    redis.call('DECRBY', key, cost)
    return 1
end

return 0  -- Insufficient tokens
```

### Configuration
- **Max Tokens**: 10 per window
- **Window**: 60 seconds
- **Cost**: 1 token per request
- **Refill**: Full reset after window expiration

### Key Pattern
- Format: `rate_bucket:{userId}`
- Example: `rate_bucket:550e8400-e29b-41d4-a716-446655440000`

## 3. Leaderboard Cache

### Data Structure
```redis
Key: leaderboard:top10
Type: ZSET (Sorted Set)
Score: User's currentScore
Member: userId

ZADD leaderboard:top10 1500 user:alice
ZADD leaderboard:top10 1200 user:bob
ZADD leaderboard:top10 900 user:charlie

ZREVRANGE leaderboard:top10 0 9 WITHSCORES
```

### Update Strategy
**Background Job (every 5 seconds):**
```sql
SELECT id, current_score 
FROM users 
ORDER BY current_score DESC 
LIMIT 10;
```
→ Atomic update Redis ZSET

**Real-time Delta Updates:**
```
On score change:
  1. ZINCRBY leaderboard:top10 {points} {userId}
  2. ZCARD leaderboard:top10 > 10 → ZREMRANGEBYRANK 10 -1
  3. Publish event to ws:scoreboard channel
```

## 4. Pub/Sub for WebSocket Broadcasting

### Channel Structure
```
Channel: ws:scoreboard
Message Format:
{
  "type": "SCORE_UPDATE",
  "userId": "uuid",
  "newScore": 1250,
  "delta": 50,
  "leaderboardPosition": 7,
  "timestamp": "2025-11-17T12:00:00Z"
}
```

### Subscriber Pattern
```typescript
redisSubscriber.subscribe('ws:scoreboard');
redisSubscriber.on('message', (channel, message) => {
  const update = JSON.parse(message);
  webSocketServer.broadcast(update);
});
```

## Failure Handling

### Fail-Closed Policy
```typescript
try {
  const lockAcquired = await redisClient.eval(cooldownLockScript, ...);
  if (!lockAcquired) return res.status(429);
} catch (error) {
  logger.error('Redis unavailable', error);
  // Fail closed - reject request
  return res.status(503).json({
    error: 'service_unavailable',
    message: 'Unable to verify rate limits'
  });
}
```

**Why Fail-Closed?**
- Prevents fraud during Redis outages
- Maintains system integrity over availability
- User sees temporary 503 vs permanent score corruption

### Monitoring & Alerting
```
Metrics to track:
- Lock acquisition latency (p50, p99)
- Lock contention rate
- Rate limit hit rate
- Redis connection failures
- Script execution time

Alerts:
- Redis unavailable > 30s
- Lock latency > 10ms (p99)
- Error rate > 1%
```

## Performance Characteristics

### Latency Budget
```
Redis Cooldown Check:    1-2ms
Token Bucket Check:      1-2ms
Database Transaction:    10-20ms
Total Request Time:      15-25ms
```

### Throughput
- Single Redis instance: ~100k ops/sec
- With 3 zones: ~300k ops/sec
- Bottleneck: Database transaction (200-500 TPS per instance)

## Configuration Example

```yaml
redis:
  clusters:
    - zone: us-east-1
      host: redis-east.example.com
      port: 6379
      db: 0
    - zone: us-west-1
      host: redis-west.example.com
      port: 6379
      db: 0
  
  routing:
    strategy: consistent_hash
    hash_function: murmur3
  
  scripts:
    cooldown_lock: /scripts/cooldown_lock.lua
    rate_limit: /scripts/rate_limit.lua
  
  timeouts:
    connect: 100ms
    command: 50ms
```