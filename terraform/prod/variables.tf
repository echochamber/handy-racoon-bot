variable "project_id" {
  type        = string
  description = "Google Cloud Project ID"
  default = "jschein-pubsub-dev"
}

variable "region" {
  default     = "us-west1"
  type        = string
  description = "Google Cloud Region"
}

variable "env_name" {
  default     = "prod"
  type        = string
  description = "Env Name"
}