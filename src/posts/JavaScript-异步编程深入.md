---
title: "JavaScript 异步编程深入"
excerpt: "深入理解 JavaScript 异步编程，从回调函数到 async/await 的完整进化历程。"
author: "CodeBuddy"
category: "JavaScript"
tags: ["JavaScript", "异步编程", "Promise", "async/await"]
publishedAt: "2024-09-03"
updatedAt: "2024-09-03"
readTime: 16
coverImage: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&h=400&fit=crop"
isPublished: true
---

# JavaScript 异步编程深入

异步编程是 JavaScript 的核心特性之一。本文将深入探讨从回调函数到现代 async/await 的异步编程演进历程。

## 理解异步编程

### 同步 vs 异步

```javascript
// 同步代码 - 阻塞执行
console.log('开始');
function syncOperation() {
  const start = Date.now();
  while (Date.now() - start < 2000) {
    // 阻塞 2 秒
  }
  return '同步操作完成';
}
console.log(syncOperation());
console.log('结束');

// 异步代码 - 非阻塞执行
console.log('开始');
setTimeout(() => {
  console.log('异步操作完成');
}, 2000);
console.log('结束');
```

### 事件循环机制

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// 输出顺序：1, 4, 3, 2
// 解释：
// 1. 同步代码先执行：1, 4
// 2. 微任务队列：Promise.then (3)
// 3. 宏任务队列：setTimeout (2)
```

## 回调函数时代

### 基本回调

```javascript
function fetchData(callback) {
  setTimeout(() => {
    const data = { id: 1, name: 'John' };
    callback(null, data);
  }, 1000);
}

fetchData((error, data) => {
  if (error) {
    console.error('错误:', error);
  } else {
    console.log('数据:', data);
  }
});
```

### 回调地狱

```javascript
// 回调地狱示例
function getUserData(userId, callback) {
  setTimeout(() => {
    callback(null, { id: userId, name: 'John' });
  }, 100);
}

function getUserPosts(userId, callback) {
  setTimeout(() => {
    callback(null, [{ id: 1, title: 'Post 1' }]);
  }, 100);
}

function getPostComments(postId, callback) {
  setTimeout(() => {
    callback(null, [{ id: 1, text: 'Comment 1' }]);
  }, 100);
}

// 嵌套回调 - 难以维护
getUserData(1, (err, user) => {
  if (err) return console.error(err);
  
  getUserPosts(user.id, (err, posts) => {
    if (err) return console.error(err);
    
    getPostComments(posts[0].id, (err, comments) => {
      if (err) return console.error(err);
      
      console.log('用户:', user);
      console.log('文章:', posts);
      console.log('评论:', comments);
    });
  });
});
```

## Promise 的救赎

### Promise 基础

```javascript
// 创建 Promise
const promise = new Promise((resolve, reject) => {
  const success = Math.random() > 0.5;
  
  setTimeout(() => {
    if (success) {
      resolve('操作成功');
    } else {
      reject(new Error('操作失败'));
    }
  }, 1000);
});

// 使用 Promise
promise
  .then(result => {
    console.log('成功:', result);
  })
  .catch(error => {
    console.error('失败:', error.message);
  })
  .finally(() => {
    console.log('操作完成');
  });
```

### Promise 链式调用

```javascript
// 将回调地狱改写为 Promise 链
function getUserData(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: userId, name: 'John' });
    }, 100);
  });
}

function getUserPosts(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([{ id: 1, title: 'Post 1' }]);
    }, 100);
  });
}

function getPostComments(postId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([{ id: 1, text: 'Comment 1' }]);
    }, 100);
  });
}

// 链式调用 - 更清晰的结构
getUserData(1)
  .then(user => {
    console.log('用户:', user);
    return getUserPosts(user.id);
  })
  .then(posts => {
    console.log('文章:', posts);
    return getPostComments(posts[0].id);
  })
  .then(comments => {
    console.log('评论:', comments);
  })
  .catch(error => {
    console.error('错误:', error);
  });
```

### Promise 静态方法

```javascript
// Promise.all - 并行执行，全部成功才成功
const promises = [
  fetch('/api/user/1'),
  fetch('/api/user/2'),
  fetch('/api/user/3')
];

Promise.all(promises)
  .then(responses => {
    console.log('所有请求完成:', responses);
  })
  .catch(error => {
    console.error('有请求失败:', error);
  });

// Promise.allSettled - 并行执行，等待全部完成
Promise.allSettled(promises)
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`请求 ${index} 成功:`, result.value);
      } else {
        console.log(`请求 ${index} 失败:`, result.reason);
      }
    });
  });

// Promise.race - 竞速，第一个完成的决定结果
Promise.race(promises)
  .then(result => {
    console.log('第一个完成的请求:', result);
  })
  .catch(error => {
    console.error('第一个失败的请求:', error);
  });

// Promise.any - 第一个成功的决定结果
Promise.any(promises)
  .then(result => {
    console.log('第一个成功的请求:', result);
  })
  .catch(error => {
    console.error('所有请求都失败了:', error);
  });
```

## async/await 的优雅

### 基本用法

```javascript
// 使用 async/await 重写 Promise 链
async function fetchUserData() {
  try {
    const user = await getUserData(1);
    console.log('用户:', user);
    
    const posts = await getUserPosts(user.id);
    console.log('文章:', posts);
    
    const comments = await getPostComments(posts[0].id);
    console.log('评论:', comments);
    
    return { user, posts, comments };
  } catch (error) {
    console.error('错误:', error);
    throw error;
  }
}

// 调用 async 函数
fetchUserData()
  .then(result => {
    console.log('完整数据:', result);
  })
  .catch(error => {
    console.error('处理失败:', error);
  });
```

### 并行执行

```javascript
// 串行执行 - 较慢
async function serialExecution() {
  const start = Date.now();
  
  const user1 = await getUserData(1);
  const user2 = await getUserData(2);
  const user3 = await getUserData(3);
  
  console.log('串行执行时间:', Date.now() - start);
  return [user1, user2, user3];
}

// 并行执行 - 更快
async function parallelExecution() {
  const start = Date.now();
  
  const [user1, user2, user3] = await Promise.all([
    getUserData(1),
    getUserData(2),
    getUserData(3)
  ]);
  
  console.log('并行执行时间:', Date.now() - start);
  return [user1, user2, user3];
}

// 混合执行 - 灵活控制
async function mixedExecution() {
  // 先并行获取用户数据
  const [user1, user2] = await Promise.all([
    getUserData(1),
    getUserData(2)
  ]);
  
  // 再串行处理每个用户的文章
  const posts1 = await getUserPosts(user1.id);
  const posts2 = await getUserPosts(user2.id);
  
  return { user1, user2, posts1, posts2 };
}
```

### 错误处理

```javascript
// 细粒度错误处理
async function handleErrors() {
  let user, posts, comments;
  
  try {
    user = await getUserData(1);
  } catch (error) {
    console.error('获取用户失败:', error);
    return null;
  }
  
  try {
    posts = await getUserPosts(user.id);
  } catch (error) {
    console.error('获取文章失败:', error);
    posts = []; // 使用默认值
  }
  
  try {
    comments = await getPostComments(posts[0]?.id);
  } catch (error) {
    console.error('获取评论失败:', error);
    comments = []; // 使用默认值
  }
  
  return { user, posts, comments };
}

// 使用 Promise.allSettled 处理部分失败
async function handlePartialFailure() {
  const results = await Promise.allSettled([
    getUserData(1),
    getUserData(2),
    getUserData(3)
  ]);
  
  const users = results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
  
  const errors = results
    .filter(result => result.status === 'rejected')
    .map(result => result.reason);
  
  if (errors.length > 0) {
    console.warn('部分请求失败:', errors);
  }
  
  return users;
}
```

## 高级异步模式

### 异步迭代器

```javascript
// 创建异步迭代器
async function* asyncGenerator() {
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield `数据 ${i}`;
  }
}

// 使用 for await...of
async function consumeAsyncGenerator() {
  for await (const data of asyncGenerator()) {
    console.log(data);
  }
}

// 手动迭代
async function manualIteration() {
  const iterator = asyncGenerator();
  let result = await iterator.next();
  
  while (!result.done) {
    console.log(result.value);
    result = await iterator.next();
  }
}
```

### 异步队列

```javascript
class AsyncQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject
      });
      
      this.process();
    });
  }
  
  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { task, resolve, reject } = this.queue.shift();
    
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

// 使用异步队列
const queue = new AsyncQueue(2); // 最多并发 2 个任务

const tasks = Array.from({ length: 10 }, (_, i) => 
  () => new Promise(resolve => {
    setTimeout(() => {
      console.log(`任务 ${i} 完成`);
      resolve(`结果 ${i}`);
    }, Math.random() * 2000);
  })
);

// 添加任务到队列
Promise.all(tasks.map(task => queue.add(task)))
  .then(results => {
    console.log('所有任务完成:', results);
  });
```

### 重试机制

```javascript
async function retry(fn, maxAttempts = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`尝试 ${attempt} 失败:`, error.message);
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // 指数退避
      }
    }
  }
  
  throw lastError;
}

// 使用重试机制
async function unreliableOperation() {
  if (Math.random() < 0.7) {
    throw new Error('随机失败');
  }
  return '操作成功';
}

retry(() => unreliableOperation(), 5, 500)
  .then(result => {
    console.log('最终结果:', result);
  })
  .catch(error => {
    console.error('重试失败:', error.message);
  });
```

### 超时控制

```javascript
function withTimeout(promise, timeout) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`操作超时 (${timeout}ms)`));
    }, timeout);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

// 使用超时控制
async function fetchWithTimeout(url, timeout = 5000) {
  try {
    const response = await withTimeout(fetch(url), timeout);
    return await response.json();
  } catch (error) {
    if (error.message.includes('超时')) {
      console.error('请求超时');
    } else {
      console.error('请求失败:', error.message);
    }
    throw error;
  }
}

// AbortController 实现超时
async function fetchWithAbort(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('请求被取消');
    }
    throw error;
  }
}
```

## 性能优化

### 避免不必要的 await

```javascript
// 不好的做法 - 不必要的串行
async function badExample() {
  const user = await getUserData(1);
  const settings = await getUserSettings(1);
  const posts = await getUserPosts(1);
  
  return { user, settings, posts };
}

// 好的做法 - 并行执行
async function goodExample() {
  const [user, settings, posts] = await Promise.all([
    getUserData(1),
    getUserSettings(1),
    getUserPosts(1)
  ]);
  
  return { user, settings, posts };
}

// 混合方式 - 有依赖关系时
async function mixedExample() {
  const user = await getUserData(1);
  
  // 这两个可以并行执行
  const [settings, posts] = await Promise.all([
    getUserSettings(user.id),
    getUserPosts(user.id)
  ]);
  
  return { user, settings, posts };
}
```

### 缓存异步结果

```javascript
class AsyncCache {
  constructor(ttl = 60000) { // 默认 1 分钟过期
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  async get(key, fetcher) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.value;
    }
    
    const value = await fetcher();
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
    
    return value;
  }
  
  clear() {
    this.cache.clear();
  }
}

const cache = new AsyncCache(30000); // 30 秒缓存

async function getCachedUserData(userId) {
  return cache.get(`user:${userId}`, () => getUserData(userId));
}
```

## 总结

JavaScript 异步编程的演进：

1. **回调函数** - 简单但容易形成回调地狱
2. **Promise** - 解决回调地狱，提供更好的错误处理
3. **async/await** - 让异步代码看起来像同步代码
4. **高级模式** - 队列、重试、超时等实用模式

掌握这些异步编程技巧，将让你的 JavaScript 代码更加优雅和高效。