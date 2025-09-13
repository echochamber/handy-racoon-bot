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


# data "google_service_account" "gcp_functions_dev_sa" {
#   project = var.project_id
#   account_id = var.gcp_function_service_account
# }

# resource "google_project_iam_member" "firestore_access" {
#   project = var.project_id
#   role    = "roles/datastore.user"
#   member  = "serviceAccount:${data.google_service_account.gcp_functions_dev_sa.email}"
# }


resource "google_storage_bucket" "functions" {
  name                        = "${var.project_id}-${var.env_name}-functions-source"
  location                    = var.region
  uniform_bucket_level_access = true
}


module "discord_bot" {
  source      = "../modules/handy_racoon"
  function_source_dir = "${path.module}/../../app/"
  function_source_excludes = ["dist/*"] // "/**/.env" add this when secret manager added
  project_id  = var.project_id
  region      = var.region
  environment_type = "${var.env_name}"
  bucket_name = google_storage_bucket.functions.name
}

output "outs" {
  value = {
    title = "discordbot-${var.env_name}"
    discordbot = module.discord_bot.function_url
    archive_hash = module.discord_bot.archive_hash
  }
}

