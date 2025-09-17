variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "jschein-pubsub-dev"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-west1"
}

variable "env_name" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
  default     = "prod"
}

variable "gcp_function_sa" {
  description = "GCP function service account name or email"
  type        = string
  default     = "handy-racoon-jobs-prod"
}

variable "function_source_dir" {
  description = "Path to the function source directory"
  type        = string
  default     = "../../../app/"
}

variable "function_source_excludes" {
  description = "List of patterns to exclude from function source"
  type        = list(string)
  default     = ["dist/*"]
}

variable "dotenv_secret_name" {
  description = "Name of the dotenv secret in Secret Manager"
  type        = string
  default     = "handy-racoon-dotenv-prod"
}