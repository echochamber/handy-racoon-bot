
variable "function_source_dir" {
  type        = string
  description = "Directory of function source"
}
variable "function_source_excludes" {
  type        = list(string)
  default     = ["dist/*"]
  description = "Pattern of files in source dir to exclude"
}

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

variable "environment_type" {
  description = "The type of environment (dev, staging, or prod)."
  type        = string
  validation {
    condition     = length(regexall("^(dev|staging|prod)$", var.environment_type)) > 0
    error_message = "Invalid environment_type. Must be 'dev', 'staging', or 'prod'."
  }
}

variable "bucket_name" {
  type        = string
  description = "The name of the GCS bucket to upload the function source code"
}

variable "dotenv_secret_name" {
  type        = string
  nullable    = true
  description = "GCP Cloud secret containing dotenv file. Must either provide this or dotenv_file_local_path."
}

variable "gcp_function_sa" {
  type        = string
  description = "Service account that runs the cloud function."
}