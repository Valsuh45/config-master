# Config-Master: Full Deployment Guide

This document provides a step-by-step walkthrough of how to build, containerize, and deploy the **Config-Master** application using a modern DevOps stack (Docker, Kubernetes, Terraform, and GitHub Actions).

---

## 1. Application Overview
Config-Master is a Node.js application designed to demonstrate **environment-aware deployments**. It reads its theme color and environment name from Kubernetes **ConfigMaps**, allowing a single Docker image to behave differently in Staging (blue) vs. Production (red).

## 2. The Setup Process

### Step 1: Tooling
Ensure you have the following installed on your machine (Ubuntu 24.04 recommended):
- **Docker**: For containerization.
- **Minikube**: A local Kubernetes cluster.
- **kubectl**: Command-line tool for interacting with the cluster.
- **Terraform**: For Infrastructure as Code (IaC).
- **GitHub CLI (gh)**: For managing the repository and secrets.

### Step 2: Build the Image
1. Navigate to the `app/` directory.
2. Build the Docker image:
   ```bash
   docker build -t your-username/config-master:latest .
   ```
3. (Optional) Run it locally to test:
   ```bash
   docker run -p 3000:3000 -e APP_COLOR=blue -e APP_ENV=local your-username/config-master:latest
   ```

### Step 3: Infrastructure with Terraform
We use Terraform to manage Kubernetes Namespaces and ConfigMaps.
1. Initialize Terraform:
   ```bash
   cd terraform/
   terraform init
   ```
2. Create environments using workspaces:
   ```bash
   terraform workspace new staging
   terraform workspace select staging
   terraform apply
   ```
3. Repeat for the `production` workspace.

### Step 4: Kubernetes Deployment
Apply the manifests located in `k8s/`:
```bash
kubectl apply -f k8s/staging/
kubectl apply -f k8s/production/
```
The app will be accessible via Minikube's NodePort services.

## 3. CI/CD Pipeline (GitHub Actions)
The automation is handled via `.github/workflows/deploy.yml`.

### The Approval Gate
Production deployments are protected. When a push to `main` occurs:
1. The **Build** job pushes a new image to Docker Hub.
2. The **Staging** job automatically updates the local cluster.
3. The pipeline **pauses**. You must go to the GitHub Actions UI and click **Approve** to trigger the Production deployment.

### Self-Hosted Runner
Since the Kubernetes cluster is local (Minikube), GitHub's default cloud runners cannot reach it. We solve this by running a **GitHub Self-Hosted Runner** on the local machine. This runner connects to GitHub, picks up jobs, and executes commands locally.

---

## 4. Glossary

| Technology | Role in this Project |
|---|---|
| **Node.js / Express** | The core application runtime. Used for the web server and logic. |
| **Docker** | Used to package the application and its dependencies into a single, portable "image". |
| **Kubernetes (K8s)** | The orchestrator. Manages the containers, scaling, and networking in our cluster. |
| **Minikube** | A tool that runs a single-node Kubernetes cluster inside a VM or container on your local machine. |
| **ConfigMaps** | A Kubernetes object used to store non-confidential data in key-value pairs (like our theme colors). |
| **Terraform** | An Infrastructure as Code tool. It allows us to define and provision our namespaces and configmaps using code instead of manual commands. |
| **GitHub Actions** | The CI/CD platform. Automates the build and deployment process. |
| **Self-Hosted Runner** | A system that you coordinate and manage to execute jobs from GitHub Actions on your own infrastructure. |
| **NodePort** | A type of Kubernetes Service that exposes the application on a specific port on every node in the cluster. |

---

## 5. Maintenance
- To update the app, simply change the code in `app/src/index.js` and push to `main`.
- To change environment variables, update `terraform/variables.tf` and run `terraform apply` in the relevant workspace.
