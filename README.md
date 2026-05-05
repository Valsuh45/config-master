# Config-Master

> One codebase, multiple environments — **Staging (Blue)** and **Production (Red)**

A Node.js app that reads its theme color from a Kubernetes ConfigMap and renders a colored page. Deployments to Production require a manual **Approve** click in GitHub Actions.

---

## Architecture

```
GitHub push → Build Docker image → Deploy to STAGING (auto)
                                        ↓
                               [Manual Approve gate]
                                        ↓
                              Deploy to PRODUCTION
```

| Environment | Namespace | Color | K8s ConfigMap |
|---|---|---|---|
| Staging | `staging` | 🔵 Blue | `config-master-config` |
| Production | `production` | 🔴 Red | `config-master-config` |

---

## Prerequisites

Install the following tools before getting started:

```bash
# 1. Docker
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER  # then log out & back in

# 2. kubectl
curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/

# 3. Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube && rm minikube-linux-amd64

# 4. Terraform
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com noble main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

---

## Running Locally (without Kubernetes)

```bash
cd app
npm install
APP_COLOR=blue APP_ENV=staging node src/index.js
# open http://localhost:3000 → blue page

APP_COLOR=red APP_ENV=production node src/index.js
# open http://localhost:3000 → red page
```

---

## Kubernetes Setup (Minikube)

```bash
# Start the cluster
minikube start

# Apply staging
kubectl apply -f k8s/staging/configmap.yaml
kubectl apply -f k8s/staging/deployment.yaml
kubectl apply -f k8s/staging/service.yaml

# Apply production
kubectl apply -f k8s/production/configmap.yaml
kubectl apply -f k8s/production/deployment.yaml
kubectl apply -f k8s/production/service.yaml

# Open in browser
minikube service config-master-svc -n staging
minikube service config-master-svc -n production
```

---

## Terraform Workspaces

```bash
cd terraform
terraform init
terraform workspace new staging
terraform workspace new production

terraform workspace select staging
terraform apply

terraform workspace select production
terraform apply

terraform workspace list   # shows both environments
```

---

## GitHub Actions Setup

1. Push this repo to GitHub
2. Go to **Settings → Secrets → Actions** and add:
   - `DOCKERHUB_USERNAME` = `valsuh`
   - `DOCKERHUB_TOKEN` = your Docker Hub access token
   - `KUBECONFIG` = `base64 -w0 ~/.kube/config`
3. Go to **Settings → Environments** and create:
   - `staging` — no protection rules
   - `production` — add yourself as **Required reviewer**
4. Push to `main` and watch the pipeline run!

---

## Project Structure

```
config-master/
├── app/                   # Node.js Express application
│   ├── src/index.js
│   ├── package.json
│   └── Dockerfile
├── k8s/                   # Kubernetes manifests
│   ├── staging/
│   └── production/
├── terraform/             # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
└── .github/workflows/
    └── deploy.yml         # CI/CD pipeline
```
