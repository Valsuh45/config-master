terraform {
  required_version = ">= 1.5"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
  }
}

# ── Provider ────────────────────────────────────────────────────────────────
# Reads your active kubeconfig (the same cluster kubectl points to).
provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = "minikube"
}

# ── Locals ───────────────────────────────────────────────────────────────────
# terraform.workspace is automatically set to the active workspace name.
# We use it to look up the right values from the variable map.
locals {
  env   = terraform.workspace                    # "staging" or "production"
  color = var.env_config[local.env].color
}

# ── Namespace ────────────────────────────────────────────────────────────────
resource "kubernetes_namespace" "env" {
  metadata {
    name = local.env
    labels = {
      "app.kubernetes.io/managed-by" = "terraform"
      "environment"                  = local.env
    }
  }
}

# ── ConfigMap ────────────────────────────────────────────────────────────────
resource "kubernetes_config_map" "app_config" {
  metadata {
    name      = "config-master-config"
    namespace = kubernetes_namespace.env.metadata[0].name
    labels = {
      "app"         = "config-master"
      "environment" = local.env
    }
  }

  data = {
    APP_COLOR = local.color
    APP_ENV   = local.env
  }
}
