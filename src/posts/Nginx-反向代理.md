---
title: "Nginx 反向代理"
excerpt: "深入学习 Nginx 反向代理技术，构建高性能的 Web 服务器和负载均衡系统。"
author: "CodeBuddy"
category: "服务器"
tags: ["Nginx", "反向代理", "负载均衡", "Web服务器"]
publishedAt: "2024-04-16"
updatedAt: "2024-04-16"
readTime: 22
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop"
isPublished: true
---

# Nginx 反向代理

Nginx 是一个高性能的 HTTP 和反向代理服务器，广泛用于负载均衡、静态文件服务和 API 网关等场景。本文将深入探讨 Nginx 反向代理的配置和优化技术。

## 基础配置

### 主配置文件

```nginx
# /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript;
    
    include /etc/nginx/conf.d/*.conf;
}
```

### 反向代理基础配置

```nginx
upstream backend_servers {
    server 192.168.1.10:8080 weight=3 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8080 weight=2 max_fails=3 fail_timeout=30s;
    server 192.168.1.12:8080 weight=1 backup;
    
    keepalive 32;
    keepalive_requests 100;
    keepalive_timeout 60s;
}

server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    ssl_certificate /etc/ssl/certs/api.example.com.crt;
    ssl_certificate_key /etc/ssl/private/api.example.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    
    location / {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
    
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## 负载均衡策略

### 不同算法配置

```nginx
# 轮询（默认）
upstream round_robin {
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080;
}

# 加权轮询
upstream weighted {
    server 192.168.1.10:8080 weight=3;
    server 192.168.1.11:8080 weight=2;
    server 192.168.1.12:8080 weight=1;
}

# IP 哈希
upstream ip_hash {
    ip_hash;
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080;
}

# 最少连接
upstream least_conn {
    least_conn;
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080;
}
```

## 缓存配置

```nginx
proxy_cache_path /var/cache/nginx/api
                 levels=1:2
                 keys_zone=api_cache:10m
                 max_size=1g
                 inactive=60m;

server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend_servers;
        
        proxy_cache api_cache;
        proxy_cache_key $scheme$proxy_host$request_uri;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
        
        proxy_cache_use_stale error timeout updating;
        proxy_cache_background_update on;
        proxy_cache_lock on;
        
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

## 安全配置

```nginx
# 限流配置
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

# 连接限制
limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;

server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    # 安全头
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # 限制连接数
    limit_conn conn_limit_per_ip 20;
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend_servers;
    }
    
    location /login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://backend_servers;
    }
    
    # 阻止恶意请求
    location ~* \.(php|asp|aspx|jsp)$ {
        deny all;
    }
    
    # 隐藏敏感文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

## 性能优化

```nginx
# 工作进程优化
worker_processes auto;
worker_cpu_affinity auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # 文件缓存
    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
    
    # 连接优化
    keepalive_timeout 30;
    keepalive_requests 100;
    reset_timedout_connection on;
    
    # 缓冲区优化
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    
    # 超时优化
    client_header_timeout 15;
    client_body_timeout 15;
    send_timeout 15;
    
    # 代理缓冲优化
    proxy_buffering on;
    proxy_buffer_size 8k;
    proxy_buffers 32 8k;
    proxy_busy_buffers_size 16k;
    proxy_temp_file_write_size 16k;
}
```

## 监控和日志

```nginx
# 详细日志格式
log_format detailed '$remote_addr - $remote_user [$time_local] '
                   '"$request" $status $body_bytes_sent '
                   '"$http_referer" "$http_user_agent" '
                   'rt=$request_time uct="$upstream_connect_time" '
                   'uht="$upstream_header_time" urt="$upstream_response_time"';

# 状态监控
server {
    listen 8080;
    server_name localhost;
    
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow 192.168.1.0/24;
        deny all;
    }
    
    location /upstream_status {
        upstream_status;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}

# 错误页面
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;

location = /50x.html {
    root /usr/share/nginx/html;
}
```

## 高可用配置

```bash
#!/bin/bash
# Nginx 高可用脚本

# 主备切换脚本
NGINX_PID="/var/run/nginx.pid"
BACKUP_SERVER="192.168.1.100"

check_nginx() {
    if [ -f $NGINX_PID ]; then
        if ps -p $(cat $NGINX_PID) > /dev/null; then
            return 0
        fi
    fi
    return 1
}

failover() {
    echo "Nginx 服务异常，启动故障转移..."
    
    # 停止本地 Nginx
    systemctl stop nginx
    
    # 通知备用服务器接管
    ssh root@$BACKUP_SERVER "systemctl start nginx"
    
    # 更新 DNS 或负载均衡器配置
    # update_dns_to_backup
    
    echo "故障转移完成"
}

# 健康检查
while true; do
    if ! check_nginx; then
        failover
        break
    fi
    sleep 10
done
```

## 总结

Nginx 反向代理的核心要点：

1. **基础配置** - 主配置文件和反向代理设置
2. **负载均衡** - 多种算法和高级配置
3. **缓存机制** - HTTP 缓存和性能优化
4. **安全防护** - 限流、安全头、访问控制
5. **性能调优** - 工作进程、缓冲区、连接优化
6. **监控运维** - 日志分析、状态监控、高可用

掌握这些技能将让你能够构建高性能、安全可靠的 Web 服务架构。