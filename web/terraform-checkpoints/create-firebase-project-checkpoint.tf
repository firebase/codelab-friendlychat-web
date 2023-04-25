# Terraform configuration to set up providers by version.
terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
}

# Configure the provider not to use the specified project for quota check.
# This provider should only be used during project creation and initializing services.
provider "google-beta" {
  alias                 = "no_user_project_override"
  user_project_override = false
}

# Configure the provider that uses the new project's quota.
provider "google-beta" {
  user_project_override = true
}

# Create a new Google Cloud project.
resource "google_project" "default" {
  provider = google-beta.no_user_project_override

  # TODO: REPLACE WITH YOUR OWN VALUES
  name       = "<PROJECT_NAME_OF_YOUR_PROJECT>"
  project_id = "<PROJECT_ID_OF_YOUR_PROJECT>"

  # Required for the project to display in any list of Firebase projects.
  labels = {
    "firebase" = "enabled"
  }
}

# Enable the required underlying Service Usage API.
resource "google_project_service" "serviceusage" {
  provider = google-beta.no_user_project_override

  project = google_project.default.project_id
  service = "serviceusage.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Enable the required underlying Firebase Management API.
resource "google_project_service" "firebase" {
  provider = google-beta.no_user_project_override

  project = google_project.default.project_id
  service = "firebase.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Enable Firebase services for the new project created above.
resource "google_firebase_project" "default" {
  provider = google-beta

  project = google_project.default.project_id

  # Wait until the required APIs are enabled.
  depends_on = [
    google_project_service.firebase,
    google_project_service.serviceusage,
  ]
}
