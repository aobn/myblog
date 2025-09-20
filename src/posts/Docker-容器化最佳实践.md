---
title: "Docker 容器化最佳实践"
excerpt: "掌握 Docker 容器化技术，从基础概念到生产环境部署的完整指南。"
author: "CodeBuddy"
category: "DevOps"
tags: ["Docker", "容器化", "DevOps", "部署"]
publishedAt: "2024-06-28"
updatedAt: "2024-06-28"
readTime: 22
coverImage: "https://images.unsplash.com/photo-1605745341112-85968b19335a?w=800&h=400&fit=crop"
isPublished: true
---

# Docker 容器化最佳实践

Docker 已成为现代应用部署的标准工具。本文将深入探讨 Docker 的最佳实践，帮助你构建高效、安全的容器化应用。

## Docker 基础概念

### 镜像与容器

```dockerfile
# 基础镜像选择
FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"]
```

### 多阶段构建

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:18-alpine AS production

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# 只复制生产依赖
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 从构建阶段复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 切换到非 root 用户
USER nextjs

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

## Dockerfile 优化

### 层缓存优化

```dockerfile
# 不好的做法 - 每次都会重新安装依赖
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]

# 好的做法 - 利用层缓存
FROM node:18-alpine
WORKDIR /app

# 先复制依赖文件，利用缓存
COPY package*.json ./
RUN npm ci --only=production

# 再复制应用代码
COPY . .
CMD ["npm", "start"]
```

### 减小镜像体积

```dockerfile
# 使用 Alpine 基础镜像
FROM node:18-alpine

# 合并 RUN 指令
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && npm install -g pm2 \
    && rm -rf /var/cache/apk/*

# 使用 .dockerignore 排除不必要文件
# .dockerignore 内容:
# node_modules
# npm-debug.log
# .git
# .gitignore
# README.md
# .env
# coverage
# .nyc_output

# 清理缓存和临时文件
RUN npm ci --only=production \
    && npm cache clean --force \
    && rm -rf /tmp/*
```

### 安全最佳实践

```dockerfile
FROM node:18-alpine

# 更新系统包
RUN apk update && apk upgrade

# 创建专用用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# 设置正确的文件权限
COPY --chown=appuser:appgroup package*.json ./
RUN npm ci --only=production

COPY --chown=appuser:appgroup . .

# 切换到非特权用户
USER appuser

# 使用非 root 端口
EXPOSE 8080

# 使用 exec 形式的 CMD
CMD ["node", "server.js"]
```

## Docker Compose

### 基础配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 环境配置

```yaml
# docker-compose.override.yml (开发环境)
version: '3.8'

services:
  app:
    build:
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DEBUG=app:*
    command: npm run dev

  db:
    ports:
      - "5432:5432"

  redis:
    ports:
      - "6379:6379"
```

```yaml
# docker-compose.prod.yml (生产环境)
version: '3.8'

services:
  app:
    build:
      target: production
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  db:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

## 容器编排

### Docker Swarm

```bash
# 初始化 Swarm 集群
docker swarm init

# 部署服务栈
docker stack deploy -c docker-compose.prod.yml myapp

# 扩展服务
docker service scale myapp_app=5

# 更新服务
docker service update --image myapp:v2 myapp_app

# 查看服务状态
docker service ls
docker service ps myapp_app
```

### 健康检查

```dockerfile
# Dockerfile 中的健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

```javascript
// 应用中的健康检查端点
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };
  
  try {
    // 检查数据库连接
    // 检查外部服务
    res.status(200).send(healthcheck);
  } catch (error) {
    healthcheck.message = error.message;
    res.status(503).send(healthcheck);
  }
});
```

## 监控和日志

### 日志管理

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=app"

  # 集中式日志收集
  fluentd:
    image: fluent/fluentd:v1.14-1
    volumes:
      - ./fluentd/conf:/fluentd/etc
      - /var/log:/var/log
    ports:
      - "24224:24224"
      - "24224:24224/udp"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

### 监控配置

```yaml
# 添加 Prometheus 监控
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'
```

## 性能优化

### 资源限制

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
```

### 网络优化

```yaml
services:
  app:
    networks:
      - frontend
      - backend

  db:
    networks:
      - backend

  nginx:
    networks:
      - frontend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # 内部网络，不能访问外网
```

### 存储优化

```yaml
services:
  app:
    volumes:
      # 命名卷 - 持久化数据
      - app_data:/app/data
      # 绑定挂载 - 开发时使用
      - ./src:/app/src:ro
      # tmpfs - 临时数据
      - type: tmpfs
        target: /app/tmp
        tmpfs:
          size: 100M

volumes:
  app_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/app_data
```

## 安全实践

### 镜像安全

```dockerfile
# 使用官方基础镜像
FROM node:18-alpine

# 定期更新基础镜像
RUN apk update && apk upgrade

# 扫描漏洞
# docker scan myapp:latest

# 使用多阶段构建减少攻击面
FROM node:18-alpine AS builder
# ... 构建步骤

FROM node:18-alpine AS runtime
# 只复制必要文件
COPY --from=builder /app/dist /app/dist

# 使用非 root 用户
USER 1001

# 只暴露必要端口
EXPOSE 3000
```

### 运行时安全

```yaml
services:
  app:
    # 只读根文件系统
    read_only: true
    # 临时文件系统
    tmpfs:
      - /tmp
      - /var/tmp
    # 安全选项
    security_opt:
      - no-new-privileges:true
    # 限制能力
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    # 用户命名空间
    user: "1001:1001"
```

### 密钥管理

```yaml
services:
  app:
    secrets:
      - db_password
      - api_key
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - API_KEY_FILE=/run/secrets/api_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    external: true
```

## CI/CD 集成

### GitHub Actions

```yaml
# .github/workflows/docker.yml
name: Docker Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}
    
    - name: Build and push
      uses: docker/build-push-action@v3
      with:
        context: .
        push: true
        tags: |
          myapp:latest
          myapp:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Run security scan
      run: |
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
          aquasec/trivy image myapp:latest
```

### 部署脚本

```bash
#!/bin/bash
# deploy.sh

set -e

# 构建镜像
docker build -t myapp:$1 .

# 推送到仓库
docker push myapp:$1

# 更新服务
docker service update --image myapp:$1 myapp_app

# 等待部署完成
echo "等待部署完成..."
sleep 30

# 健康检查
if curl -f http://localhost/health; then
    echo "部署成功!"
else
    echo "部署失败，回滚..."
    docker service rollback myapp_app
    exit 1
fi
```

## 故障排查

### 常用调试命令

```bash
# 查看容器日志
docker logs -f container_name

# 进入容器
docker exec -it container_name /bin/sh

# 查看容器资源使用
docker stats

# 检查容器配置
docker inspect container_name

# 查看网络
docker network ls
docker network inspect network_name

# 查看卷
docker volume ls
docker volume inspect volume_name

# 清理资源
docker system prune -a
```

### 性能分析

```bash
# 容器资源监控
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# 查看进程
docker exec container_name ps aux

# 网络连接
docker exec container_name netstat -tulpn

# 磁盘使用
docker exec container_name df -h
```

## 总结

Docker 容器化的最佳实践要点：

1. **镜像优化** - 多阶段构建，减小体积
2. **安全实践** - 非 root 用户，最小权限
3. **资源管理** - 合理限制 CPU 和内存
4. **监控日志** - 完善的监控和日志系统
5. **CI/CD 集成** - 自动化构建和部署
6. **故障排查** - 掌握调试和分析技巧

遵循这些最佳实践，将帮助你构建更加稳定、安全、高效的容器化应用。