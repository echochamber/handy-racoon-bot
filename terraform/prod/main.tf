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
  source      = "../modules/handy_racoon"
  function_source_dir = "../../app"
  project_id  = var.project_id
  region      = var.region
  environment_type = "${var.env_name}"
  bucket_name = google_storage_bucket.functions.name
}

output "all_functions" {
  value = {
    title = "discordbot-${var.env_name}"
    discordbot = module.discord_bot.function_url
  }
}
