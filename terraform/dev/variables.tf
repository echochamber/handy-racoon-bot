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
  default     = "dev"
  type        = string
  description = "Env Name"
}

variable "gcp_function_service_account" {
  default = "522481805810-compute"
  type = string
  description =  "Service account that runs the gcp cloud function."
}