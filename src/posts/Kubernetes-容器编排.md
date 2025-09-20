---
title: "Kubernetes 容器编排"
excerpt: "深入学习 Kubernetes 容器编排技术，掌握现代化应用部署和管理。"
author: "CodeBuddy"
category: "DevOps"
tags: ["Kubernetes", "容器编排", "Docker", "微服务"]
publishedAt: "2024-11-18"
updatedAt: "2024-11-18"
readTime: 32
coverImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop"
isPublished: true
---

# Kubernetes 容器编排

Kubernetes 是现代容器编排的事实标准，提供了强大的容器管理、服务发现、负载均衡和自动扩缩容能力。本文将深入探讨 Kubernetes 的核心概念和实践应用。

## Kubernetes 基础概念

### 集群架构

```yaml
# cluster-overview.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: demo-namespace
  labels:
    environment: development
    team: backend
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: demo-quota
  namespace: demo-namespace
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "10"
    services: "5"
    persistentvolumeclaims: "4"
```

### Pod 基础配置

```yaml
# pod-basic.yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app-pod
  namespace: demo-namespace
  labels:
    app: web-app
    version: v1.0
    environment: development
spec:
  restartPolicy: Always
  
  containers:
  - name: web-container
    image: nginx:1.21-alpine
    imagePullPolicy: IfNotPresent
    
    ports:
    - containerPort: 80
      name: http
      protocol: TCP
    
    env:
    - name: NODE_ENV
      value: "development"
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: url
    
    resources:
      requests:
        memory: "128Mi"
        cpu: "100m"
      limits:
        memory: "256Mi"
        cpu: "200m"
    
    livenessProbe:
      httpGet:
        path: /health
        port: 80
      initialDelaySeconds: 30
      periodSeconds: 10
    
    readinessProbe:
      httpGet:
        path: /ready
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
    
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
      readOnly: true
  
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

## 工作负载管理

### Deployment 部署

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app-deployment
  namespace: demo-namespace
  labels:
    app: web-app
    component: backend
spec:
  replicas: 3
  
  selector:
    matchLabels:
      app: web-app
      component: backend
  
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  
  template:
    metadata:
      labels:
        app: web-app
        component: backend
        version: v1.0
    spec:
      containers:
      - name: web-app
        image: myapp:v1.0
        imagePullPolicy: Always
        
        ports:
        - containerPort: 8080
          name: http
        
        env:
        - name: PORT
          value: "8080"
        - name: NODE_ENV
          value: "production"
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Service 服务发现

```yaml
# services.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app-service
  namespace: demo-namespace
  labels:
    app: web-app
spec:
  type: ClusterIP
  selector:
    app: web-app
    component: backend
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
    name: http

---
# NodePort Service
apiVersion: v1
kind: Service
metadata:
  name: web-app-nodeport
  namespace: demo-namespace
spec:
  type: NodePort
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080
    protocol: TCP

---
# LoadBalancer Service
apiVersion: v1
kind: Service
metadata:
  name: web-app-lb
  namespace: demo-namespace
spec:
  type: LoadBalancer
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
```

### Ingress 入口控制

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-app-ingress
  namespace: demo-namespace
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.example.com
    - app.example.com
    secretName: example-tls
  
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
  
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-app-service
            port:
              number: 80
```

## 配置管理

### ConfigMap 配置映射

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: demo-namespace
data:
  # 简单键值对
  database.host: "postgres.example.com"
  database.port: "5432"
  redis.url: "redis://redis.example.com:6379"
  
  # 配置文件
  app.properties: |
    server.port=8080
    spring.datasource.url=jdbc:postgresql://postgres:5432/myapp
    spring.redis.host=redis
    logging.level.com.example=DEBUG
  
  # JSON 配置
  config.json: |
    {
      "api": {
        "version": "v1",
        "timeout": 30000,
        "retries": 3
      },
      "features": {
        "authentication": true,
        "caching": true,
        "monitoring": true
      }
    }
  
  # Nginx 配置
  nginx.conf: |
    server {
        listen 80;
        server_name localhost;
        
        location / {
            proxy_pass http://backend:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        location /health {
            access_log off;
            return 200 "healthy\n";
        }
    }
```

### Secret 密钥管理

```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-secret
  namespace: demo-namespace
type: Opaque
data:
  # Base64 编码的值
  username: cG9zdGdyZXM=  # postgres
  password: cGFzc3dvcmQxMjM=  # password123
  url: cG9zdGdyZXNxbDovL3Bvc3RncmVzOnBhc3N3b3JkMTIzQHBvc3RncmVzOjU0MzIvbXlhcHA=

---
# TLS Secret
apiVersion: v1
kind: Secret
metadata:
  name: tls-secret
  namespace: demo-namespace
type: kubernetes.io/tls
data:
  tls.crt: LS0tLS1CRUdJTi... # Base64 encoded certificate
  tls.key: LS0tLS1CRUdJTi... # Base64 encoded private key

---
# Docker Registry Secret
apiVersion: v1
kind: Secret
metadata:
  name: registry-secret
  namespace: demo-namespace
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: eyJhdXRocyI6eyJyZWdpc3RyeS5leGFtcGxlLmNvbSI6eyJ1c2VybmFtZSI6InVzZXIiLCJwYXNzd29yZCI6InBhc3MiLCJhdXRoIjoiZFhObGNqcHdZWE56In19fQ==
```

## 存储管理

### PersistentVolume 持久化存储

```yaml
# storage.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: fast-ssd
  hostPath:
    path: /data/postgres

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: demo-namespace
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: fast-ssd

---
# StatefulSet with PVC
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: demo-namespace
spec:
  serviceName: postgres-headless
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:14-alpine
        env:
        - name: POSTGRES_DB
          value: myapp
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: password
        
        ports:
        - containerPort: 5432
          name: postgres
        
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
  
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 10Gi
```

## 自动扩缩容

### HorizontalPodAutoscaler

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
  namespace: demo-namespace
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app-deployment
  
  minReplicas: 2
  maxReplicas: 10
  
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
```

## 监控和日志

### 监控配置

```yaml
# monitoring.yaml
apiVersion: v1
kind: ServiceMonitor
metadata:
  name: web-app-monitor
  namespace: demo-namespace
  labels:
    app: web-app
spec:
  selector:
    matchLabels:
      app: web-app
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics

---
# Prometheus Rule
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: web-app-rules
  namespace: demo-namespace
spec:
  groups:
  - name: web-app.rules
    rules:
    - alert: HighCPUUsage
      expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High CPU usage detected"
        description: "CPU usage is above 80% for more than 5 minutes"
    
    - alert: HighMemoryUsage
      expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "High memory usage detected"
        description: "Memory usage is above 90% for more than 5 minutes"
```

## 安全配置

### RBAC 权限控制

```yaml
# rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: web-app-sa
  namespace: demo-namespace

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: web-app-role
  namespace: demo-namespace
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "update", "patch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: web-app-binding
  namespace: demo-namespace
subjects:
- kind: ServiceAccount
  name: web-app-sa
  namespace: demo-namespace
roleRef:
  kind: Role
  name: web-app-role
  apiGroup: rbac.authorization.k8s.io

---
# Network Policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-app-netpol
  namespace: demo-namespace
spec:
  podSelector:
    matchLabels:
      app: web-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
```

## 部署策略

### 蓝绿部署

```bash
#!/bin/bash
# blue-green-deploy.sh

NAMESPACE="demo-namespace"
APP_NAME="web-app"
NEW_VERSION="v2.0"
CURRENT_VERSION="v1.0"

echo "开始蓝绿部署..."

# 1. 部署新版本（绿色环境）
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${APP_NAME}-green
  namespace: ${NAMESPACE}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${APP_NAME}
      version: green
  template:
    metadata:
      labels:
        app: ${APP_NAME}
        version: green
    spec:
      containers:
      - name: ${APP_NAME}
        image: myapp:${NEW_VERSION}
        ports:
        - containerPort: 8080
EOF

# 2. 等待新版本就绪
echo "等待绿色环境就绪..."
kubectl rollout status deployment/${APP_NAME}-green -n ${NAMESPACE}

# 3. 健康检查
echo "执行健康检查..."
GREEN_POD=$(kubectl get pods -n ${NAMESPACE} -l app=${APP_NAME},version=green -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n ${NAMESPACE} ${GREEN_POD} -- curl -f http://localhost:8080/health

if [ $? -eq 0 ]; then
    echo "健康检查通过，切换流量..."
    
    # 4. 切换服务流量到绿色环境
    kubectl patch service ${APP_NAME}-service -n ${NAMESPACE} -p '{"spec":{"selector":{"version":"green"}}}'
    
    echo "流量已切换到绿色环境"
    
    # 5. 清理蓝色环境（可选）
    read -p "是否删除蓝色环境? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete deployment ${APP_NAME}-blue -n ${NAMESPACE}
        echo "蓝色环境已删除"
    fi
else
    echo "健康检查失败，回滚..."
    kubectl delete deployment ${APP_NAME}-green -n ${NAMESPACE}
    exit 1
fi

echo "蓝绿部署完成！"
```

## 故障排查

### 常用调试命令

```bash
# 查看 Pod 状态
kubectl get pods -n demo-namespace -o wide

# 查看 Pod 详细信息
kubectl describe pod <pod-name> -n demo-namespace

# 查看 Pod 日志
kubectl logs <pod-name> -n demo-namespace -f

# 进入 Pod 容器
kubectl exec -it <pod-name> -n demo-namespace -- /bin/bash

# 查看事件
kubectl get events -n demo-namespace --sort-by='.lastTimestamp'

# 查看资源使用情况
kubectl top pods -n demo-namespace
kubectl top nodes

# 端口转发调试
kubectl port-forward <pod-name> 8080:8080 -n demo-namespace

# 查看服务端点
kubectl get endpoints -n demo-namespace

# 网络连通性测试
kubectl run test-pod --image=busybox -it --rm -- /bin/sh
```

## 总结

Kubernetes 容器编排的核心要点：

1. **基础概念** - Pod、Service、Deployment 等核心资源
2. **配置管理** - ConfigMap 和 Secret 管理应用配置
3. **存储管理** - PV/PVC 实现数据持久化
4. **网络管理** - Service 和 Ingress 实现服务发现和流量路由
5. **自动扩缩容** - HPA 实现弹性伸缩
6. **安全管理** - RBAC 和 NetworkPolicy 保障集群安全
7. **监控运维** - 日志收集和指标监控

掌握这些技能将让你能够高效地管理和运维 Kubernetes 集群。