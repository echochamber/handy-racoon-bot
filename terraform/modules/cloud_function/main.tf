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

data "google_secret_manager_secret_version" "env_file" {
  secret  = var.env_secret_name
  project = var.project_id
  version = "latest"
}

resource "google_storage_bucket_object" "env_file" {
  name   = "${var.name}-env"
  bucket = var.bucket_name
  source = data.google_secret_manager_secret_version.env_file.secret_data
  content_type = "text/plain"
}



resource "null_resource" "copy_env_file" {
  triggers = {
    env_sha = data.google_secret_manager_secret_version.env_file.secret_data_sha256
    src_dir = var.source_dir
  }

  provisioner "local-exec" {
    command = <<EOT
set -e
# Create a temp dir
TMP_DIR=$(mktemp -d /tmp/cloudfuncbuild-XXXXXXXX)
# Copy source dir to temp dir
cp -a "${var.source_dir}/." "$TMP_DIR/"
# Write .env file into temp dir
echo "${data.google_secret_manager_secret_version.env_file.secret_data}" > "$TMP_DIR/.env"
# Output the temp dir path for use by archive_file
echo "$TMP_DIR" > "${var.source_dir}/.last_tmp_dir"
EOT
  }
}

data "archive_file" "function" {
  type        = "zip"
  output_path = "/tmp/${var.name}-source.zip"
  # Read the temp dir path from the file created by the provisioner
  source_dir  = chomp(file("${var.source_dir}/.last_tmp_dir"))
  excludes    = var.source_excludes

  # Copy the env file from Secret Manager into .env at the root of the temp dir before zipping
  depends_on = [null_resource.copy_env_file, google_storage_bucket_object.env_file]
}


# TODO: Local fire cleanup can be better probably.
resource "google_storage_bucket_object" "function" {
  name   = "${var.name}-${data.archive_file.function.output_md5}.zip"
  bucket = var.bucket_name
  source = data.archive_file.function.output_path
  provisioner "local-exec" {
    when    = create
    command = <<EOT
TMP_DIR_FILE="${var.source_dir}/.last_tmp_dir"
if [ -f "$TMP_DIR_FILE" ]; then
  TMP_DIR=$(cat "$TMP_DIR_FILE")
  if [ -d "$TMP_DIR" ]; then
    rm -rf "$TMP_DIR"
  fi
  rm -f "$TMP_DIR_FILE"
fi
EOT
  }
  provisioner "local-exec" {
    when    = destroy
    command = <<EOT
TMP_DIR_FILE="${var.source_dir}/.last_tmp_dir"
if [ -f "$TMP_DIR_FILE" ]; then
  TMP_DIR=$(cat "$TMP_DIR_FILE")
  if [ -d "$TMP_DIR" ]; then
    rm -rf "$TMP_DIR"
  fi
  rm -f "$TMP_DIR_FILE"
fi
EOT
  }
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
