---
title: "Docker 容器化部署"
excerpt: "深入学习 Docker 容器化技术，构建高效的应用部署和运维体系。"
author: "CodeBuddy"
category: "DevOps"
tags: ["Docker", "容器化", "微服务", "部署"]
publishedAt: "2024-11-22"
updatedAt: "2024-11-22"
readTime: 28
coverImage: "https://images.unsplash.com/photo-1605745341112-85968b19335a?w=800&h=400&fit=crop"
isPublished: true
---

# Docker 容器化部署

Docker 是一个开源的容器化平台，通过轻量级虚拟化技术实现应用的快速部署和扩展。本文将深入探讨 Docker 容器化部署的最佳实践和核心技术。

## Docker 基础

### Dockerfile 最佳实践

```dockerfile
# 多阶段构建示例 - Node.js 应用
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产环境镜像
FROM node:18-alpine AS production

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 设置工作目录
WORKDIR /app

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 启动命令
CMD ["node", "dist/server.js"]
```

### Python 应用 Dockerfile

```dockerfile
# Python 应用多阶段构建
FROM python:3.11-slim AS base

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 构建阶段
FROM base AS builder

WORKDIR /app

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# 生产阶段
FROM base AS production

# 创建应用用户
RUN useradd --create-home --shell /bin/bash app

# 设置工作目录
WORKDIR /app

# 复制 Python 包
COPY --from=builder /root/.local /home/app/.local

# 复制应用代码
COPY --chown=app:app . .

# 切换用户
USER app

# 更新 PATH
ENV PATH=/home/app/.local/bin:$PATH

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 启动命令
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "app:app"]
```

### Java 应用 Dockerfile

```dockerfile
# Java 应用构建
FROM maven:3.8.6-openjdk-17 AS builder

WORKDIR /app

# 复制 pom.xml 并下载依赖
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 复制源代码并构建
COPY src ./src
RUN mvn clean package -DskipTests

# 运行时镜像
FROM openjdk:17-jre-slim AS production

# 安装必要工具
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 创建应用用户
RUN useradd -r -u 1001 -m -c "app user" -d /app -s /bin/false app

# 设置工作目录
WORKDIR /app

# 复制 JAR 文件
COPY --from=builder --chown=app:app /app/target/*.jar app.jar

# 切换用户
USER app

# JVM 优化参数
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:+UseContainerSupport"

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

## Docker Compose

### 完整的应用栈

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 反向代理
  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - web
      - api
    networks:
      - frontend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Web 前端
  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    container_name: web-app
    environment:
      - NODE_ENV=production
      - API_URL=http://api:3000
    volumes:
      - ./logs/web:/app/logs
    networks:
      - frontend
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  # API 后端
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: api-server
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=myapp
      - DB_USER=postgres
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
    volumes:
      - ./logs/api:/app/logs
      - uploads:/app/uploads
    networks:
      - backend
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    secrets:
      - db_password
      - jwt_secret
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '1.0'
          memory: 512M

  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: postgres-db
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init:/docker-entrypoint-initdb.d:ro
      - ./logs/postgres:/var/log/postgresql
    networks:
      - backend
    secrets:
      - db_password
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d myapp"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: redis-cache
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/etc/redis/redis.conf:ro
    networks:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  # 消息队列
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: rabbitmq-server
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS_FILE=/run/secrets/rabbitmq_password
      - RABBITMQ_DEFAULT_VHOST=/
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
      - ./rabbitmq/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf:ro
    ports:
      - "15672:15672"  # 管理界面
    networks:
      - backend
    secrets:
      - rabbitmq_password
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # 监控 - Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - monitoring
      - backend
    restart: unless-stopped

  # 监控 - Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD_FILE=/run/secrets/grafana_password
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
    ports:
      - "3001:3000"
    networks:
      - monitoring
    secrets:
      - grafana_password
    depends_on:
      - prometheus
    restart: unless-stopped

# 网络配置
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
  monitoring:
    driver: bridge

# 数据卷
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  rabbitmq_data:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local
  uploads:
    driver: local

# 密钥管理
secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  rabbitmq_password:
    file: ./secrets/rabbitmq_password.txt
  grafana_password:
    file: ./secrets/grafana_password.txt
```

### 环境配置

```bash
# .env 文件
COMPOSE_PROJECT_NAME=myapp
COMPOSE_FILE=docker-compose.yml:docker-compose.override.yml

# 应用配置
NODE_ENV=production
API_VERSION=v1

# 数据库配置
POSTGRES_VERSION=15
REDIS_PASSWORD=your_redis_password

# 监控配置
PROMETHEUS_VERSION=latest
GRAFANA_VERSION=latest

# 日志配置
LOG_LEVEL=info
LOG_MAX_SIZE=100m
LOG_MAX_FILES=5
```

## 容器编排

### Docker Swarm 配置

```yaml
# docker-stack.yml
version: '3.8'

services:
  web:
    image: myapp/web:latest
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
        order: start-first
      rollback_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      placement:
        constraints:
          - node.role == worker
        preferences:
          - spread: node.labels.zone
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    networks:
      - frontend
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  api:
    image: myapp/api:latest
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      placement:
        constraints:
          - node.role == worker
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '1.0'
          memory: 512M
    networks:
      - backend
    secrets:
      - source: db_password
        target: /run/secrets/db_password
        mode: 0400
    configs:
      - source: api_config
        target: /app/config.json
        mode: 0644

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.labels.database == true
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
    networks:
      - backend
    secrets:
      - db_password

networks:
  frontend:
    driver: overlay
    attachable: true
  backend:
    driver: overlay
    internal: true

volumes:
  postgres_data:
    driver: local

secrets:
  db_password:
    external: true

configs:
  api_config:
    external: true
```

### Swarm 管理脚本

```bash
#!/bin/bash
# swarm-deploy.sh

set -e

STACK_NAME="myapp"
COMPOSE_FILE="docker-stack.yml"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# 检查 Swarm 状态
check_swarm() {
    if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q "active"; then
        error "Docker Swarm 未初始化"
    fi
    log "Docker Swarm 状态正常"
}

# 创建密钥
create_secrets() {
    log "创建密钥..."
    
    if ! docker secret ls | grep -q "db_password"; then
        echo "your_db_password" | docker secret create db_password -
        log "创建数据库密码密钥"
    fi
    
    if ! docker secret ls | grep -q "jwt_secret"; then
        openssl rand -base64 32 | docker secret create jwt_secret -
        log "创建 JWT 密钥"
    fi
}

# 创建配置
create_configs() {
    log "创建配置..."
    
    if ! docker config ls | grep -q "api_config"; then
        docker config create api_config ./config/api.json
        log "创建 API 配置"
    fi
}

# 部署服务栈
deploy_stack() {
    log "部署服务栈: $STACK_NAME"
    
    docker stack deploy \
        --compose-file $COMPOSE_FILE \
        --with-registry-auth \
        $STACK_NAME
    
    log "服务栈部署完成"
}

# 检查服务状态
check_services() {
    log "检查服务状态..."
    
    sleep 10
    
    docker stack services $STACK_NAME
    
    # 等待服务启动
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        local running_services=$(docker stack services $STACK_NAME --format "{{.Replicas}}" | grep -c "^[1-9]")
        local total_services=$(docker stack services $STACK_NAME --format "{{.Name}}" | wc -l)
        
        if [ "$running_services" -eq "$total_services" ]; then
            log "所有服务已启动"
            return 0
        fi
        
        warn "等待服务启动... ($attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    error "服务启动超时"
}

# 滚动更新
rolling_update() {
    local service=$1
    local image=$2
    
    log "滚动更新服务: $service"
    
    docker service update \
        --image $image \
        --update-parallelism 1 \
        --update-delay 10s \
        --update-failure-action rollback \
        ${STACK_NAME}_${service}
    
    log "滚动更新完成: $service"
}

# 扩缩容
scale_service() {
    local service=$1
    local replicas=$2
    
    log "扩缩容服务: $service 到 $replicas 个副本"
    
    docker service scale ${STACK_NAME}_${service}=$replicas
    
    log "扩缩容完成: $service"
}

# 主函数
main() {
    case "${1:-deploy}" in
        "deploy")
            check_swarm
            create_secrets
            create_configs
            deploy_stack
            check_services
            ;;
        "update")
            if [ -z "$2" ] || [ -z "$3" ]; then
                error "用法: $0 update <service> <image>"
            fi
            rolling_update $2 $3
            ;;
        "scale")
            if [ -z "$2" ] || [ -z "$3" ]; then
                error "用法: $0 scale <service> <replicas>"
            fi
            scale_service $2 $3
            ;;
        "status")
            docker stack services $STACK_NAME
            ;;
        "logs")
            docker service logs -f ${STACK_NAME}_${2:-web}
            ;;
        "remove")
            log "移除服务栈: $STACK_NAME"
            docker stack rm $STACK_NAME
            ;;
        *)
            echo "用法: $0 {deploy|update|scale|status|logs|remove}"
            exit 1
            ;;
    esac
}

main "$@"
```

## 监控和日志

### 日志配置

```yaml
# 日志驱动配置
version: '3.8'

services:
  app:
    image: myapp:latest
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"
        labels: "service,version"
        env: "NODE_ENV"
    labels:
      - "service=myapp"
      - "version=1.0.0"

  # 使用 Fluentd 日志驱动
  api:
    image: myapi:latest
    logging:
      driver: "fluentd"
      options:
        fluentd-address: "localhost:24224"
        tag: "api.{{.Name}}"
        fluentd-async-connect: "true"
        fluentd-buffer-limit: "4194304"

  # 使用 syslog 驱动
  worker:
    image: myworker:latest
    logging:
      driver: "syslog"
      options:
        syslog-address: "tcp://192.168.1.100:514"
        tag: "worker"
        syslog-facility: "local0"
```

### Prometheus 监控

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'docker'
    static_configs:
      - targets: ['docker-exporter:9323']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'app'
    static_configs:
      - targets: ['web:3000', 'api:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

## 总结

Docker 容器化部署的核心要点：

1. **Dockerfile 优化** - 多阶段构建、安全配置、健康检查
2. **Docker Compose** - 服务编排、网络配置、数据管理
3. **容器编排** - Docker Swarm、服务发现、负载均衡
4. **监控日志** - 日志驱动、指标收集、告警配置
5. **安全最佳实践** - 用户权限、密钥管理、网络隔离
6. **运维自动化** - 部署脚本、滚动更新、故障恢复

掌握这些技能将让你能够构建可扩展、高可用的容器化应用系统。