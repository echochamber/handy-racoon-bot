output "function_url" {
  value = google_cloudfunctions2_function.function.service_config[0].uri
}

output "function_name" {
  value = google_cloudfunctions2_function.function.name
}

output "archive_hash" {
  value = filemd5(data.archive_file.function.output_path)
}