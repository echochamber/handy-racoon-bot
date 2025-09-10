output "function_url" {
  value = google_cloudfunctions2_function.function.service_config[0].uri
}

output "function_name" {
  value = google_cloudfunctions2_function.function.name
}
