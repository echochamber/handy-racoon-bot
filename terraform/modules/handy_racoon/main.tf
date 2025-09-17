
resource "google_service_account" "gcp_function_sa" {
  project = var.project_id
  account_id = var.gcp_function_sa
}

locals {
  service_account_roles = [
    "roles/datastore.user",
    "roles/cloudfunctions.invoker",
    "roles/cloudbuild.builds.editor",
    "roles/artifactregistry.reader",
    "roles/firebasestorage.admin",
    "roles/secretmanager.secretAccessor"
  ]
}

resource "google_project_iam_member" "service_account_roles" {
  for_each = toset(local.service_account_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.gcp_function_sa.email}"
}

locals {
  services = [
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "compute.googleapis.com",
    "firebase.googleapis.com",
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


module "discord_bot" {
  source      = "../cloud_function"
  project_id  = var.project_id
  region      = var.region
  name        = "discordbot-${var.environment_type}" 
  description = "Handles discord bot interactions."
  runtime     = "nodejs22"
  entry_point = "discordBot"
  source_dir  = var.function_source_dir
  make_public = true
  bucket_name = var.bucket_name
  dotenv_secret_name = var.dotenv_secret_name
  gcp_function_sa_email = google_service_account.gcp_function_sa.email
}

# TODO: Make terraform call discord API to write updated command defs and if the interaction endpoint value has changed.