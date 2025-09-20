---
title: "Redis 缓存策略与实践"
excerpt: "深入学习 Redis 缓存技术，掌握高性能缓存系统的设计和实现。"
author: "CodeBuddy"
category: "缓存"
tags: ["Redis", "缓存", "性能优化", "数据库"]
publishedAt: "2024-01-30"
updatedAt: "2024-01-30"
readTime: 18
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop"
isPublished: true
---

# Redis 缓存策略与实践

Redis 作为高性能的内存数据库，在现代应用架构中扮演着重要的缓存角色。本文将深入探讨 Redis 的缓存策略和最佳实践。

## Redis 基础操作

### 字符串操作

```javascript
const redis = require('redis');
const client = redis.createClient();

// 基本字符串操作
await client.set('user:1001', JSON.stringify({
  id: 1001,
  name: 'John Doe',
  email: 'john@example.com'
}));

// 设置过期时间
await client.setex('session:abc123', 3600, 'user_data');

// 原子操作
await client.incr('page_views');
await client.incrby('score:user:1001', 10);

// 批量操作
await client.mset(
  'user:1001:name', 'John',
  'user:1001:email', 'john@example.com',
  'user:1001:age', '30'
);

const values = await client.mget('user:1001:name', 'user:1001:email');
```

### 哈希操作

```javascript
// 用户信息存储
await client.hset('user:1001', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  city: 'New York'
});

// 获取单个字段
const name = await client.hget('user:1001', 'name');

// 获取所有字段
const user = await client.hgetall('user:1001');

// 增加数值字段
await client.hincrby('user:1001', 'login_count', 1);

// 检查字段是否存在
const exists = await client.hexists('user:1001', 'phone');
```

### 列表操作

```javascript
// 消息队列实现
await client.lpush('task_queue', JSON.stringify({
  id: 'task_001',
  type: 'email',
  data: { to: 'user@example.com', subject: 'Welcome' }
}));

// 处理任务
const task = await client.brpop('task_queue', 10); // 阻塞10秒

// 最近访问记录
await client.lpush('recent_views:user:1001', 'product:123');
await client.ltrim('recent_views:user:1001', 0, 9); // 保留最近10条

// 获取列表内容
const recentViews = await client.lrange('recent_views:user:1001', 0, -1);
```

### 集合操作

```javascript
// 用户标签
await client.sadd('user:1001:tags', 'developer', 'javascript', 'react');

// 文章标签
await client.sadd('article:123:tags', 'javascript', 'tutorial', 'beginner');

// 交集 - 共同标签
const commonTags = await client.sinter('user:1001:tags', 'article:123:tags');

// 并集 - 所有标签
const allTags = await client.sunion('user:1001:tags', 'article:123:tags');

// 差集 - 用户独有标签
const uniqueTags = await client.sdiff('user:1001:tags', 'article:123:tags');

// 随机获取标签
const randomTag = await client.srandmember('user:1001:tags');
```

### 有序集合操作

```javascript
// 排行榜
await client.zadd('leaderboard', 1500, 'user:1001');
await client.zadd('leaderboard', 1200, 'user:1002');
await client.zadd('leaderboard', 1800, 'user:1003');

// 获取排名
const rank = await client.zrevrank('leaderboard', 'user:1001');

// 获取分数
const score = await client.zscore('leaderboard', 'user:1001');

// 获取排行榜
const topUsers = await client.zrevrange('leaderboard', 0, 9, 'WITHSCORES');

// 按分数范围查询
const highScoreUsers = await client.zrangebyscore('leaderboard', 1400, 2000);

// 增加分数
await client.zincrby('leaderboard', 100, 'user:1001');
```

## 缓存策略

### 缓存穿透解决方案

```javascript
class CacheService {
  constructor(redisClient) {
    this.redis = redisClient;
  }
  
  // 布隆过滤器防止缓存穿透
  async getWithBloomFilter(key, fetchFunction) {
    // 检查布隆过滤器
    const exists = await this.redis.bf.exists('bloom_filter', key);
    if (!exists) {
      return null; // 数据肯定不存在
    }
    
    // 检查缓存
    let data = await this.redis.get(key);
    if (data) {
      return JSON.parse(data);
    }
    
    // 从数据库获取
    data = await fetchFunction();
    if (data) {
      await this.redis.setex(key, 3600, JSON.stringify(data));
      await this.redis.bf.add('bloom_filter', key);
    } else {
      // 缓存空值，防止缓存穿透
      await this.redis.setex(key, 300, 'NULL');
    }
    
    return data;
  }
  
  // 缓存空值策略
  async getWithNullCache(key, fetchFunction, ttl = 3600) {
    let cached = await this.redis.get(key);
    
    if (cached === 'NULL') {
      return null; // 空值缓存
    }
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const data = await fetchFunction();
    
    if (data) {
      await this.redis.setex(key, ttl, JSON.stringify(data));
    } else {
      // 缓存空值，较短的过期时间
      await this.redis.setex(key, Math.min(ttl, 300), 'NULL');
    }
    
    return data;
  }
}
```

### 缓存雪崩防护

```javascript
class AntiAvalancheCache {
  constructor(redisClient) {
    this.redis = redisClient;
    this.locks = new Map();
  }
  
  // 随机过期时间
  getRandomTTL(baseTTL) {
    const randomFactor = 0.1; // 10% 的随机性
    const randomOffset = Math.random() * baseTTL * randomFactor;
    return Math.floor(baseTTL + randomOffset);
  }
  
  // 分布式锁防止缓存击穿
  async getWithLock(key, fetchFunction, ttl = 3600) {
    let data = await this.redis.get(key);
    if (data && data !== 'NULL') {
      return JSON.parse(data);
    }
    
    const lockKey = `lock:${key}`;
    const lockValue = `${Date.now()}-${Math.random()}`;
    
    // 尝试获取锁
    const acquired = await this.redis.set(lockKey, lockValue, 'PX', 10000, 'NX');
    
    if (acquired) {
      try {
        // 双重检查
        data = await this.redis.get(key);
        if (data && data !== 'NULL') {
          return JSON.parse(data);
        }
        
        // 获取数据
        const freshData = await fetchFunction();
        
        if (freshData) {
          const randomTTL = this.getRandomTTL(ttl);
          await this.redis.setex(key, randomTTL, JSON.stringify(freshData));
          return freshData;
        } else {
          await this.redis.setex(key, 300, 'NULL');
          return null;
        }
      } finally {
        // 释放锁
        const script = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
        await this.redis.eval(script, 1, lockKey, lockValue);
      }
    } else {
      // 等待其他线程完成
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getWithLock(key, fetchFunction, ttl);
    }
  }
}
```

### 多级缓存架构

```javascript
class MultiLevelCache {
  constructor(l1Cache, redisClient, database) {
    this.l1 = l1Cache; // 本地缓存 (LRU)
    this.l2 = redisClient; // Redis 缓存
    this.db = database; // 数据库
  }
  
  async get(key) {
    // L1 缓存检查
    let data = this.l1.get(key);
    if (data) {
      return data;
    }
    
    // L2 缓存检查
    const cached = await this.l2.get(key);
    if (cached && cached !== 'NULL') {
      data = JSON.parse(cached);
      this.l1.set(key, data, 300); // 本地缓存5分钟
      return data;
    }
    
    // 数据库查询
    data = await this.db.findById(key);
    
    if (data) {
      // 写入所有缓存层
      this.l1.set(key, data, 300);
      await this.l2.setex(key, 3600, JSON.stringify(data));
    } else {
      await this.l2.setex(key, 300, 'NULL');
    }
    
    return data;
  }
  
  async set(key, data, ttl = 3600) {
    // 更新所有缓存层
    this.l1.set(key, data, Math.min(ttl, 300));
    await this.l2.setex(key, ttl, JSON.stringify(data));
    
    // 更新数据库
    await this.db.save(data);
  }
  
  async delete(key) {
    // 删除所有缓存层
    this.l1.delete(key);
    await this.l2.del(key);
    await this.db.delete(key);
  }
}
```

## 高级应用场景

### 分布式锁实现

```javascript
class DistributedLock {
  constructor(redisClient) {
    this.redis = redisClient;
  }
  
  async acquire(lockKey, ttl = 10000, retryDelay = 100, maxRetries = 50) {
    const lockValue = `${Date.now()}-${Math.random()}`;
    
    for (let i = 0; i < maxRetries; i++) {
      const acquired = await this.redis.set(lockKey, lockValue, 'PX', ttl, 'NX');
      
      if (acquired) {
        return {
          key: lockKey,
          value: lockValue,
          release: () => this.release(lockKey, lockValue)
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    
    throw new Error('Failed to acquire lock');
  }
  
  async release(lockKey, lockValue) {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    return await this.redis.eval(script, 1, lockKey, lockValue);
  }
  
  // 可重入锁
  async acquireReentrant(lockKey, ttl = 10000) {
    const threadId = `${process.pid}-${Date.now()}`;
    const script = `
      local key = KEYS[1]
      local threadId = ARGV[1]
      local ttl = tonumber(ARGV[2])
      
      local lockValue = redis.call('get', key)
      if lockValue == false then
        redis.call('set', key, threadId, 'PX', ttl)
        redis.call('hset', key .. ':count', threadId, 1)
        return 1
      elseif lockValue == threadId then
        redis.call('hincrby', key .. ':count', threadId, 1)
        redis.call('pexpire', key, ttl)
        return 1
      else
        return 0
      end
    `;
    
    const acquired = await this.redis.eval(script, 1, lockKey, threadId, ttl);
    return acquired === 1;
  }
}
```

### 限流器实现

```javascript
class RateLimiter {
  constructor(redisClient) {
    this.redis = redisClient;
  }
  
  // 令牌桶算法
  async tokenBucket(key, capacity, refillRate, tokens = 1) {
    const script = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local tokens = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])
      
      local bucket = redis.call('hmget', key, 'tokens', 'lastRefill')
      local currentTokens = tonumber(bucket[1]) or capacity
      local lastRefill = tonumber(bucket[2]) or now
      
      -- 计算需要补充的令牌
      local timePassed = now - lastRefill
      local tokensToAdd = math.floor(timePassed / 1000 * refillRate)
      currentTokens = math.min(capacity, currentTokens + tokensToAdd)
      
      if currentTokens >= tokens then
        currentTokens = currentTokens - tokens
        redis.call('hmset', key, 'tokens', currentTokens, 'lastRefill', now)
        redis.call('expire', key, 3600)
        return {1, currentTokens}
      else
        redis.call('hmset', key, 'tokens', currentTokens, 'lastRefill', now)
        redis.call('expire', key, 3600)
        return {0, currentTokens}
      end
    `;
    
    const result = await this.redis.eval(
      script, 1, key, capacity, refillRate, tokens, Date.now()
    );
    
    return {
      allowed: result[0] === 1,
      remainingTokens: result[1]
    };
  }
  
  // 滑动窗口算法
  async slidingWindow(key, windowSize, maxRequests) {
    const now = Date.now();
    const windowStart = now - windowSize;
    
    const pipeline = this.redis.pipeline();
    
    // 移除过期的请求记录
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // 计算当前窗口内的请求数
    pipeline.zcard(key);
    
    // 添加当前请求
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    
    // 设置过期时间
    pipeline.expire(key, Math.ceil(windowSize / 1000));
    
    const results = await pipeline.exec();
    const currentRequests = results[1][1];
    
    return {
      allowed: currentRequests < maxRequests,
      currentRequests: currentRequests + 1,
      remainingRequests: Math.max(0, maxRequests - currentRequests - 1)
    };
  }
}
```

### 会话管理

```javascript
class SessionManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.defaultTTL = 1800; // 30分钟
  }
  
  async createSession(userId, data = {}) {
    const sessionId = this.generateSessionId();
    const sessionData = {
      userId,
      createdAt: Date.now(),
      lastAccessAt: Date.now(),
      ...data
    };
    
    await this.redis.setex(
      `session:${sessionId}`,
      this.defaultTTL,
      JSON.stringify(sessionData)
    );
    
    // 维护用户的活跃会话列表
    await this.redis.sadd(`user:${userId}:sessions`, sessionId);
    await this.redis.expire(`user:${userId}:sessions`, this.defaultTTL);
    
    return sessionId;
  }
  
  async getSession(sessionId) {
    const data = await this.redis.get(`session:${sessionId}`);
    if (!data) return null;
    
    const sessionData = JSON.parse(data);
    
    // 更新最后访问时间
    sessionData.lastAccessAt = Date.now();
    await this.redis.setex(
      `session:${sessionId}`,
      this.defaultTTL,
      JSON.stringify(sessionData)
    );
    
    return sessionData;
  }
  
  async destroySession(sessionId) {
    const sessionData = await this.getSession(sessionId);
    if (sessionData) {
      await this.redis.del(`session:${sessionId}`);
      await this.redis.srem(`user:${sessionData.userId}:sessions`, sessionId);
    }
  }
  
  async destroyAllUserSessions(userId) {
    const sessions = await this.redis.smembers(`user:${userId}:sessions`);
    
    if (sessions.length > 0) {
      const pipeline = this.redis.pipeline();
      sessions.forEach(sessionId => {
        pipeline.del(`session:${sessionId}`);
      });
      pipeline.del(`user:${userId}:sessions`);
      await pipeline.exec();
    }
  }
  
  generateSessionId() {
    return require('crypto').randomBytes(32).toString('hex');
  }
}
```

## 监控和维护

### 性能监控

```javascript
class RedisMonitor {
  constructor(redisClient) {
    this.redis = redisClient;
  }
  
  async getStats() {
    const info = await this.redis.info();
    const stats = this.parseInfo(info);
    
    return {
      memory: {
        used: stats.used_memory_human,
        peak: stats.used_memory_peak_human,
        fragmentation: stats.mem_fragmentation_ratio
      },
      connections: {
        connected: stats.connected_clients,
        blocked: stats.blocked_clients
      },
      operations: {
        total: stats.total_commands_processed,
        perSecond: stats.instantaneous_ops_per_sec
      },
      keyspace: {
        keys: stats.db0 ? stats.db0.keys : 0,
        expires: stats.db0 ? stats.db0.expires : 0
      }
    };
  }
  
  async getSlowLog(count = 10) {
    return await this.redis.slowlog('get', count);
  }
  
  async analyzeKeys(pattern = '*', count = 100) {
    const keys = await this.redis.keys(pattern);
    const analysis = {
      total: keys.length,
      types: {},
      sizes: {},
      ttls: {}
    };
    
    for (const key of keys.slice(0, count)) {
      const type = await this.redis.type(key);
      const ttl = await this.redis.ttl(key);
      
      analysis.types[type] = (analysis.types[type] || 0) + 1;
      
      if (ttl > 0) {
        analysis.ttls[key] = ttl;
      }
    }
    
    return analysis;
  }
  
  parseInfo(info) {
    const lines = info.split('\r\n');
    const stats = {};
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key] = isNaN(value) ? value : Number(value);
      }
    });
    
    return stats;
  }
}
```

## 总结

Redis 缓存的核心要点：

1. **合理的数据结构选择** - 根据使用场景选择最适合的数据类型
2. **有效的缓存策略** - 防止穿透、雪崩、击穿
3. **多级缓存架构** - 提升整体性能
4. **分布式应用** - 锁、限流、会话管理
5. **监控和维护** - 持续优化性能

掌握这些技巧将帮助你构建高性能、可靠的缓存系统。