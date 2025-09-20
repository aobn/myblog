---
title: "Node.js 性能优化指南"
excerpt: "全面的 Node.js 性能优化策略，从代码层面到系统架构的完整解决方案。"
author: "CodeBuddy"
category: "Node.js"
tags: ["Node.js", "性能优化", "后端开发"]
publishedAt: "2024-11-08"
updatedAt: "2024-11-08"
readTime: 18
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop"
isPublished: true
---

# Node.js 性能优化指南

Node.js 以其高性能和非阻塞 I/O 著称，但要充分发挥其潜力，需要掌握正确的优化技巧。本文将深入探讨 Node.js 性能优化的各个方面。

## 事件循环优化

### 理解事件循环

```javascript
// 避免阻塞事件循环
console.time('blocking');
const start = Date.now();
while (Date.now() - start < 1000) {
  // 阻塞 1 秒 - 这是不好的做法
}
console.timeEnd('blocking');

// 使用 setImmediate 分解长时间运行的任务
function processLargeArray(array, callback) {
  if (array.length === 0) {
    return callback();
  }
  
  // 处理一小批数据
  const batch = array.splice(0, 100);
  batch.forEach(item => {
    // 处理每个项目
    processItem(item);
  });
  
  // 让出控制权给事件循环
  setImmediate(() => {
    processLargeArray(array, callback);
  });
}
```

### 使用 Worker Threads

```javascript
// main.js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // 主线程
  const worker = new Worker(__filename, {
    workerData: { numbers: [1, 2, 3, 4, 5] }
  });
  
  worker.on('message', (result) => {
    console.log('计算结果:', result);
  });
  
  worker.on('error', (error) => {
    console.error('Worker 错误:', error);
  });
} else {
  // Worker 线程
  const { numbers } = workerData;
  const result = numbers.reduce((sum, num) => sum + num * num, 0);
  parentPort.postMessage(result);
}
```

## 内存管理

### 内存泄漏检测

```javascript
// 监控内存使用
function monitorMemory() {
  const used = process.memoryUsage();
  console.log({
    rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    external: `${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`
  });
}

setInterval(monitorMemory, 5000);

// 避免内存泄漏的最佳实践
class EventEmitterExample {
  constructor() {
    this.listeners = new Map();
  }
  
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  removeListener(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  // 清理所有监听器
  cleanup() {
    this.listeners.clear();
  }
}
```

### 对象池模式

```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    
    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }
  
  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// 使用示例
const bufferPool = new ObjectPool(
  () => Buffer.alloc(1024),
  (buffer) => buffer.fill(0),
  50
);

function processData(data) {
  const buffer = bufferPool.acquire();
  try {
    // 使用 buffer 处理数据
    buffer.write(data);
    return buffer.toString();
  } finally {
    bufferPool.release(buffer);
  }
}
```

## 数据库优化

### 连接池管理

```javascript
const mysql = require('mysql2/promise');

// 创建连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
});

// 使用连接池
async function getUser(id) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

// 批量操作优化
async function batchInsertUsers(users) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const values = users.map(user => [user.name, user.email]);
    await connection.query(
      'INSERT INTO users (name, email) VALUES ?',
      [values]
    );
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

### Redis 缓存策略

```javascript
const redis = require('redis');
const client = redis.createClient();

class CacheManager {
  constructor(redisClient) {
    this.client = redisClient;
  }
  
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('缓存读取错误:', error);
      return null;
    }
  }
  
  async set(key, value, ttl = 3600) {
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('缓存写入错误:', error);
    }
  }
  
  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('缓存删除错误:', error);
    }
  }
  
  // 缓存穿透保护
  async getWithFallback(key, fallbackFn, ttl = 3600) {
    let value = await this.get(key);
    
    if (value === null) {
      value = await fallbackFn();
      if (value !== null) {
        await this.set(key, value, ttl);
      }
    }
    
    return value;
  }
}

const cache = new CacheManager(client);

// 使用示例
async function getUserWithCache(id) {
  return await cache.getWithFallback(
    `user:${id}`,
    () => getUser(id),
    1800 // 30 分钟
  );
}
```

## HTTP 性能优化

### 压缩和缓存

```javascript
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');

const app = express();

// 启用 gzip 压缩
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// 安全头
app.use(helmet());

// 静态文件缓存
app.use('/static', express.static('public', {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

// API 响应缓存
const cache = new Map();

app.get('/api/data/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `data:${id}`;
  
  // 检查缓存
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < 300000) { // 5 分钟
      return res.json(data);
    }
  }
  
  try {
    const data = await fetchData(id);
    cache.set(cacheKey, { data, timestamp: Date.now() });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 请求限流

```javascript
const rateLimit = require('express-rate-limit');

// 基本限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 限制每个 IP 100 个请求
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/', limiter);

// 自定义限流器
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }
  
  consume(tokens = 1) {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }
  
  refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / 1000 * this.refillRate);
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

const buckets = new Map();

function rateLimitMiddleware(req, res, next) {
  const ip = req.ip;
  
  if (!buckets.has(ip)) {
    buckets.set(ip, new TokenBucket(10, 1)); // 10 个令牌，每秒补充 1 个
  }
  
  const bucket = buckets.get(ip);
  
  if (bucket.consume()) {
    next();
  } else {
    res.status(429).json({ error: '请求过于频繁' });
  }
}
```

## 监控和分析

### 性能监控

```javascript
const performanceHooks = require('perf_hooks');

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }
  
  startTimer(name) {
    this.metrics.set(name, performanceHooks.performance.now());
  }
  
  endTimer(name) {
    const startTime = this.metrics.get(name);
    if (startTime) {
      const duration = performanceHooks.performance.now() - startTime;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
      this.metrics.delete(name);
      return duration;
    }
  }
  
  measureAsync(name, asyncFn) {
    return async (...args) => {
      this.startTimer(name);
      try {
        const result = await asyncFn(...args);
        return result;
      } finally {
        this.endTimer(name);
      }
    };
  }
}

const monitor = new PerformanceMonitor();

// 使用示例
const measuredGetUser = monitor.measureAsync('getUserFromDB', getUser);

// 中间件形式的性能监控
function performanceMiddleware(req, res, next) {
  const start = performanceHooks.performance.now();
  
  res.on('finish', () => {
    const duration = performanceHooks.performance.now() - start;
    console.log(`${req.method} ${req.url}: ${duration.toFixed(2)}ms`);
  });
  
  next();
}

app.use(performanceMiddleware);
```

### 内存和 CPU 监控

```javascript
const os = require('os');

class SystemMonitor {
  constructor() {
    this.startCpuUsage = process.cpuUsage();
    this.startTime = Date.now();
  }
  
  getMemoryUsage() {
    const usage = process.memoryUsage();
    const total = os.totalmem();
    const free = os.freemem();
    
    return {
      process: {
        rss: Math.round(usage.rss / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024)
      },
      system: {
        total: Math.round(total / 1024 / 1024),
        free: Math.round(free / 1024 / 1024),
        used: Math.round((total - free) / 1024 / 1024)
      }
    };
  }
  
  getCpuUsage() {
    const currentUsage = process.cpuUsage(this.startCpuUsage);
    const currentTime = Date.now();
    const timeDiff = currentTime - this.startTime;
    
    const userPercent = (currentUsage.user / 1000 / timeDiff) * 100;
    const systemPercent = (currentUsage.system / 1000 / timeDiff) * 100;
    
    return {
      user: userPercent.toFixed(2),
      system: systemPercent.toFixed(2),
      total: (userPercent + systemPercent).toFixed(2)
    };
  }
  
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      loadavg: os.loadavg(),
      uptime: os.uptime()
    };
  }
}

const systemMonitor = new SystemMonitor();

// 定期输出系统状态
setInterval(() => {
  console.log('=== 系统状态 ===');
  console.log('内存使用:', systemMonitor.getMemoryUsage());
  console.log('CPU 使用:', systemMonitor.getCpuUsage());
}, 30000);
```

## 部署优化

### PM2 配置

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-app',
    script: './app.js',
    instances: 'max', // 使用所有 CPU 核心
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=4096'
  }]
};
```

### Docker 优化

```dockerfile
# 多阶段构建
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:16-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

USER nextjs
EXPOSE 3000

CMD ["node", "app.js"]
```

## 总结

Node.js 性能优化的关键点：

1. **事件循环** - 避免阻塞，合理使用异步
2. **内存管理** - 防止泄漏，使用对象池
3. **数据库优化** - 连接池，缓存策略
4. **HTTP 优化** - 压缩，缓存，限流
5. **监控分析** - 性能指标，系统监控
6. **部署优化** - 集群模式，容器化

通过这些优化策略，可以显著提升 Node.js 应用的性能和稳定性。