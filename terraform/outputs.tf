output "workspace" {
  description = "The active Terraform workspace (environment name)"
  value       = terraform.workspace
}

output "namespace" {
  description = "Kubernetes namespace created for this environment"
  value       = kubernetes_namespace.env.metadata[0].name
}

output "app_color" {
  description = "The APP_COLOR value set in the ConfigMap"
  value       = kubernetes_config_map.app_config.data["APP_COLOR"]
}

output "configmap_name" {
  description = "Name of the ConfigMap created"
  value       = kubernetes_config_map.app_config.metadata[0].name
}
