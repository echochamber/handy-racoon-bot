terraform { 
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.34.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "random_id" "default" {
  byte_length = 8
}

locals {
  services = [
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "clouddeploy.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "storage-component.googleapis.com",
  ]
}

resource "google_project_service" "enabled" {
  for_each                   = toset(local.services)
  project                    = var.project_id
  service                    = each.value
  disable_dependent_services = true
  disable_on_destroy         = false
}

data "archive_file" "function" {
  type        = "zip"
  output_path = "/tmp/${var.name}-source.zip"
  source_dir  = var.source_dir
}

resource "google_storage_bucket_object" "function" {
  name   = "${var.name}-${data.archive_file.function.output_md5}.zip"
  bucket = var.bucket_name
  source = data.archive_file.function.output_path
}

resource "google_cloudfunctions2_function" "function" {
  name        = var.name
  location    = var.region
  description = var.description

  depends_on = [google_storage_bucket_object.function]


  build_config {
    runtime     = var.runtime
    entry_point = var.entry_point
    source {
      storage_source {
        bucket = var.bucket_name
        object = google_storage_bucket_object.function.name
        generation = google_storage_bucket_object.function.generation
      }
    }
  }

  service_config {
    max_instance_count = var.max_instances
    available_memory   = var.memory
    timeout_seconds    = var.timeout
  }
}

resource "google_cloud_run_service_iam_member" "invoker" {
  count    = var.make_public ? 1 : 0
  location = google_cloudfunctions2_function.function.location
  service  = google_cloudfunctions2_function.function.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
