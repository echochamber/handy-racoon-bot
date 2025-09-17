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


resource "google_storage_bucket" "functions" {
  name                        = "${var.project_id}-${var.env_name}-functions-source"
  location                    = var.region
  uniform_bucket_level_access = true
}


module "discord_bot" {
  source                   = "../../modules/handy_racoon"
  function_source_dir        = "${path.module}/${var.function_source_dir}"
  function_source_excludes   = var.function_source_excludes
  project_id                 = var.project_id
  region                     = var.region
  environment_type           = var.env_name
  bucket_name                = google_storage_bucket.functions.name
  dotenv_secret_name         = var.dotenv_secret_name
  gcp_function_sa            = var.gcp_function_sa
}

output "outs" {
  value = {
  title           = "discordbot-${var.env_name}"
  discordbot      = module.discord_bot.function_url
  archive_hash    = module.discord_bot.archive_hash
  service_account = var.gcp_function_sa
  }
}

