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
  name                        = "${var.project_id}-functions-source"
  location                    = var.region
  uniform_bucket_level_access = true
}

module "discord_bot" {
  source      = "./modules/cloud_function"
  project_id  = var.project_id
  region      = var.region
  name        = "discordbot"
  description = "Handles discord bot interactions."
  runtime     = "nodejs22"
  entry_point = "discordBot"
  source_dir  = "../app/"
  make_public = true
  bucket_name = google_storage_bucket.functions.name
}

output "all_functions" {
  value = {
    discordbot = module.discord_bot.function_url
  }
}
