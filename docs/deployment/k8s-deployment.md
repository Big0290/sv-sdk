# Kubernetes Deployment Guide

Deploy SV-SDK to Kubernetes cluster.

---

## Prerequisites

- Kubernetes cluster (1.28+)
- kubectl configured
- Helm (optional, for PostgreSQL/Redis)
- Container registry access

---

## Quick Deploy

```bash
# Apply all manifests
kubectl apply -f deploy/k8s/

# Check status
kubectl get pods
kubectl get services
kubectl get ingress
```

---

## Detailed Steps

### 1. Create Namespace

```bash
kubectl create namespace sv-sdk
kubectl config set-context --current --namespace=sv-sdk
```

### 2. Create Secrets

```bash
# Create secrets from file
kubectl create secret generic sv-sdk-secrets \
  --from-literal=database-url="postgresql://user:pass@postgres:5432/sv_sdk" \
  --from-literal=redis-url="redis://:pass@redis:6379" \
  --from-literal=auth-secret="$(openssl rand -base64 32)" \
  --from-literal=brevo-api-key="your-api-key"
```

### 3. Create ConfigMap

```bash
kubectl create configmap sv-sdk-config \
  --from-literal=auth-url="https://admin.example.com" \
  --from-literal=email-provider="brevo" \
  --from-literal=email-from="noreply@example.com"
```

### 4. Deploy Database (Using Helm)

```bash
# Add Bitnami repo
helm repo add bitnami https://charts.bitnami.com/bitnami

# Install PostgreSQL
helm install postgres bitnami/postgresql \
  --set auth.postgresPassword=secure-password \
  --set auth.database=sv_sdk \
  --set primary.persistence.size=100Gi \
  --set volumePermissions.enabled=true
```

### 5. Deploy Redis

```bash
# Install Redis
helm install redis bitnami/redis \
  --set auth.password=secure-password \
  --set master.persistence.size=20Gi
```

### 6. Deploy Application

```bash
# Apply deployment
kubectl apply -f deploy/k8s/deployment.yaml

# Wait for rollout
kubectl rollout status deployment/sv-sdk-admin
```

### 7. Run Migrations

```bash
# Run as Job
kubectl create job sv-sdk-migrate --image=registry.example.com/sv-sdk-admin:latest \
  -- pnpm db:migrate

# Check job status
kubectl logs job/sv-sdk-migrate
```

### 8. Configure Ingress

```bash
# Install nginx ingress controller (if needed)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# Apply ingress
kubectl apply -f deploy/k8s/deployment.yaml
```

---

## Scaling

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sv-sdk-admin
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sv-sdk-admin
  minReplicas: 3
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
```

Apply:
```bash
kubectl apply -f hpa.yaml
```

---

## Monitoring

### Prometheus ServiceMonitor

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sv-sdk-admin
spec:
  selector:
    matchLabels:
      app: sv-sdk-admin
  endpoints:
    - port: http
      path: /metrics
      interval: 30s
```

---

## Health Checks

All deployments include:
- **Liveness probe**: `/health/live`
- **Readiness probe**: `/health/ready`
- **Startup probe**: `/health/startup`

---

## Troubleshooting

### Check Pod Logs

```bash
kubectl logs -f deployment/sv-sdk-admin
kubectl logs -f -l app=sv-sdk-admin --all-containers
```

### Shell into Pod

```bash
kubectl exec -it deployment/sv-sdk-admin -- sh
```

### Check Resources

```bash
kubectl top pods
kubectl describe pod <pod-name>
```

### Restart Deployment

```bash
kubectl rollout restart deployment/sv-sdk-admin
```

---

## Backup Strategy

### Database Backups

RDS automated backups are enabled with 30-day retention.

Manual backup:
```bash
kubectl exec -it postgres-0 -- pg_dump -U sv_sdk_user sv_sdk | gzip > backup.sql.gz
```

---

## Security

### Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: sv-sdk-admin
spec:
  podSelector:
    matchLabels:
      app: sv-sdk-admin
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: nginx-ingress
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - podSelector:
            matchLabels:
              app: redis
      ports:
        - protocol: TCP
          port: 6379
```

---

## References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Charts](https://helm.sh/)
- [Ingress NGINX](https://kubernetes.github.io/ingress-nginx/)

