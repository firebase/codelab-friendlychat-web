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
  billing_account = "<BILLING_ACCOUNT_ID>"

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

# Create a Firebase Web App in the new project created above.
resource "google_firebase_web_app" "default" {
  provider = google-beta

  project         = google_firebase_project.default.project
  # TODO: REPLACE WITH YOUR OWN VALUE
  display_name    = "<DISPLAY_NAME_OF_YOUR_WEB_APP>"
  deletion_policy = "DELETE"
}

# Enable the Identity Toolkit API.
resource "google_project_service" "auth" {
  provider = google-beta

  project = google_firebase_project.default.project
  service = "identitytoolkit.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Create an Identity Platform config.
# Also, enable Firebase Authentication using Identity Platform (if Authentication isn't yet enabled).
resource "google_identity_platform_config" "auth" {
  provider = google-beta
  project  = google_firebase_project.default.project

  # For example, you can configure to auto-delete anonymous users.
  autodelete_anonymous_users = true

  # Wait for identitytoolkit.googleapis.com to be enabled before initializing Authentication.
  depends_on = [
    google_project_service.auth,
  ]
}

variable "oauth_client_secret" {
  type = string

  description = "OAuth client secret. For this codelab, you can pass in this secret through the environment variable TF_VAR_oauth_client_secret. In a real app, you should use a secret manager service."

  sensitive = true
}

resource "google_identity_platform_default_supported_idp_config" "google_sign_in" {
  provider = google-beta
  project  = google_firebase_project.default.project

  enabled       = true
  idp_id        = "google.com"
  # TODO: REPLACE WITH YOUR OWN VALUE
  client_id     = "<YOUR_OAUTH_CLIENT_ID>"
  client_secret = var.oauth_client_secret

  depends_on = [
    google_identity_platform_config.auth
  ]
}
