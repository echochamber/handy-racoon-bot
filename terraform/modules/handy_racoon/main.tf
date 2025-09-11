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
}