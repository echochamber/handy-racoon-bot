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

variable "bucket_name" {
  type        = string
  description = "The name of the GCS bucket to upload the function source code"
}

variable "name" {
  type        = string
  description = "Name of the Cloud Function"
}

variable "description" {
  type        = string
  default     = "Managed by Terraform"
  description = "Description of the Cloud Function"
}

variable "runtime" {
  type        = string
  default     = "nodejs22"
  description = "Runtime for the Cloud Function (e.g., nodejs22, python310)"
}

variable "entry_point" {
  type        = string
  description = "Entry point function in the source code"
}

variable "source_dir" {
  type        = string
  description = "Path to the function's source directory"
}
variable "source_excludes" {
  type        = list(string)
  default     = ["dist/*", ".env*"]
  description = "Pattern of files in source dir to exclude"
}

variable "memory" {
  type        = string
  default     = "256M"
  description = "Memory allocated to the Cloud Function"
}

variable "timeout" {
  type        = number
  default     = 60
  description = "Timeout in seconds for function execution"
}

variable "max_instances" {
  type        = number
  default     = 1
  description = "Maximum number of function instances"
}

variable "make_public" {
  type        = bool
  default     = true
  description = "Whether the function should be publicly invokable"
}

variable "dotenv_secret_name" {
  type        = string
  nullable    = true
  description = "GCP Cloud secret containing dotenv file. Must either provide this or dotenv_file_local_path."
}

variable "gcp_function_sa_email" {
  type        = string
  description = "Service account that runs the cloud function."
}