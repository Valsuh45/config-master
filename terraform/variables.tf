variable "env_config" {
  description = "Per-environment configuration. Keys must match Terraform workspace names."
  type = map(object({
    color = string
  }))

  default = {
    staging = {
      color = "blue"
    }
    production = {
      color = "red"
    }
  }
}
