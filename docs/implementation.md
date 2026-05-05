# The Config-Master — Implementation Plan

## Stack & Environment
| Decision | Answer |
|---|---|
| Kubernetes | **Minikube** (local, on Ubuntu 24.04) |
| Docker Hub username | **valsuh** |
| GitHub repo | [Valsuh45/config-master](https://github.com/Valsuh45/config-master) |
| Terraform | Installed (v1.5+) |
| kubectl / Minikube | Installed & Running |

---

## Folder Structure (`config-master/`)

```
config-master/
├── app/
│   ├── src/index.js          # Express app — reads APP_COLOR from env
│   ├── package.json
│   └── Dockerfile
├── k8s/
│   ├── staging/
│   │   ├── configmap.yaml    # APP_COLOR=blue
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   └── production/
│       ├── configmap.yaml    # APP_COLOR=red
│       ├── deployment.yaml
│       └── service.yaml
├── terraform/
│   ├── main.tf               # Namespaces + ConfigMaps via K8s provider
│   ├── variables.tf
│   └── outputs.tf
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD with manual prod approval
└── docs/                     # Documentation (this folder)
```

---

## Technical Summary

### Phase 0 — Setup
Tools installed: `docker`, `kubectl`, `minikube`, `terraform`, `gh`. Minikube cluster started with Docker driver.

### Phase 1 — Node.js App
A simple Express app that reads `APP_COLOR` and `APP_ENV` from environment variables. It renders a modern, responsive HTML page with a theme color based on the environment.

### Phase 2 — Containerization
Docker multi-stage build used to keep the final image small and secure (non-root user). Image is pushed to Docker Hub as `valsuh/config-master:latest`.

### Phase 3 — Kubernetes
Manifests defined for Staging and Production. Each has its own Namespace and ConfigMap. The app uses `envFrom` to inject ConfigMap values as environment variables.

### Phase 4 — Infrastructure as Code
Terraform manages the Namespaces and ConfigMaps. We used **Terraform Workspaces** to handle environment-specific state within the same configuration files.

### Phase 5 — CI/CD Pipeline
GitHub Actions workflow with:
- **Build**: Compiles image and pushes to Docker Hub.
- **Staging**: Deploys automatically to the local minikube via a **Self-Hosted Runner**.
- **Production**: Manual approval gate required before deployment.
