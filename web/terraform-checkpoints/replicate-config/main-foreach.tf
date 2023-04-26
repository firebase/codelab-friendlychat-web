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

# Create new Google Cloud projects.
resource "google_project" "default" {
  provider = google-beta.no_user_project_override
  name     = each.value
  # TODO: REPLACE WITH YOUR OWN VALUES
  # Create a unique project ID for each project, with each ID starting with <PROJECT_ID>.
  project_id = "<PROJECT_ID>-${each.key}"
  # Required if you want to set up Authentication via Terraform
  billing_account = "<YOUR_BILLING_ACCOUNT_ID>"

  # Required for the projects to display in any list of Firebase projects.
  labels = {
    "firebase" = "enabled"
  }

  # TODO: REPLACE WITH YOUR OWN VALUES
  for_each = {
    prod    = "<PROJECT_NAME_OF_PROD_PROJECT>"
    staging = "<PROJECT_NAME_OF_STAGING_PROJECT>"
  }
}

# Enable the required underlying Service Usage API.
resource "google_project_service" "serviceusage" {
  provider = google-beta.no_user_project_override
  for_each = google_project.default

  project = each.value.project_id
  service = "serviceusage.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Enable the required underlying Firebase Management API.
resource "google_project_service" "firebase" {
  provider = google-beta.no_user_project_override
  for_each = google_project.default

  project = each.value.project_id
  service = "firebase.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Enable Firebase services for the new project created above.
resource "google_firebase_project" "default" {
  provider = google-beta
  for_each = google_project.default

  project = each.value.project_id

  # Wait until the required APIs are enabled.
  depends_on = [
    google_project_service.firebase,
    google_project_service.serviceusage,
  ]
}

# Create a Firebase Web App in the new project created above.
resource "google_firebase_web_app" "default" {
  provider = google-beta
  for_each = google_firebase_project.default

  project         = each.value.project
  # TODO: REPLACE WITH YOUR OWN VALUE
  display_name    = "<DISPLAY_NAME_OF_YOUR_WEB_APP>"
  deletion_policy = "DELETE"
}

# UNCOMMENT BELOW IF YOU SET UP FIREBASE AUTHENTICATION USING TERRAFORM IN THE PREVIOUS STEP
# # Enable the Identity Toolkit API.
# resource "google_project_service" "auth" {
#   provider = google-beta
#   for_each = google_firebase_project.default

#   project = each.value.project
#   service = "identitytoolkit.googleapis.com"

#   # Don't disable the service if the resource block is removed by accident.
#   disable_on_destroy = false
# }

# # Create an Identity Platform config.
# # Also, enable Firebase Authentication using Identity Platform (if Authentication isn't yet enabled).
# resource "google_identity_platform_config" "auth" {
#   provider = google-beta
#   for_each = google_firebase_project.default

#   project = each.value.project
#   # For example, you can configure to auto-delete anonymous users.
#   autodelete_anonymous_users = true

#   # Wait for identitytoolkit.googleapis.com to be enabled before initializing Authentication.
#   depends_on = [
#     google_project_service.auth,
#   ]
# }

# variable "oauth_client_secret" {
#   type = string

#   description = "OAuth client secret. For this codelab, you can pass in this secret through the environment variable TF_VAR_oauth_client_secret. In a real app, you should use a secret manager service."

#   sensitive = true
# }

# resource "google_identity_platform_default_supported_idp_config" "google_sign_in" {
#   provider = google-beta
#   for_each = google_firebase_project.default

#   project       = each.value.project
#   enabled       = true
#   idp_id        = "google.com"
#   # TODO: REPLACE WITH YOUR OWN VALUE
#   client_id     = "<YOUR_OAUTH_CLIENT_ID>"
#   client_secret = var.oauth_client_secret

#   depends_on = [
#     google_identity_platform_config.auth
#   ]
# }

# Enable required APIs for Cloud Firestore.
resource "google_project_service" "firestore" {
  provider = google-beta
  for_each = google_firebase_project.default

  project = each.value.project
  service = "firestore.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Enable required APIs for Cloud Firestore.
resource "google_project_service" "rules" {
  provider = google-beta
  for_each = google_firebase_project.default

  project = each.value.project
  service = "firebaserules.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Provision the Firestore database instance.
resource "google_firestore_database" "default" {
  provider = google-beta
  for_each = google_firebase_project.default

  project = each.value.project
  name    = "(default)"
  # See available locations:
  # https://firebase.google.com/docs/firestore/locations
  # TODO: REPLACE WITH YOUR OWN VALUE
  location_id = "<NAME_OF_DESIRED_REGION>"
  # "FIRESTORE_NATIVE" is required to use Firestore with Firebase SDKs,
  # authentication, and Firebase Security Rules.
  type             = "FIRESTORE_NATIVE"
  concurrency_mode = "OPTIMISTIC"

  depends_on = [
    google_project_service.firestore,
    google_project_service.rules,
  ]
}

# Create a ruleset of Firestore Security Rules from a local file.
resource "google_firebaserules_ruleset" "firestore" {
  provider = google-beta
  for_each = google_firebase_project.default

  project = each.value.project
  source {
    files {
      name = "firestore.rules"
      # Write security rules in a local file named "firestore.rules".
      # Learn more: https://firebase.google.com/docs/firestore/security/get-started
      content = file("firestore.rules")
    }
  }

  # Wait for Firestore to be provisioned before creating this ruleset.
  depends_on = [
    google_firestore_database.default,
  ]
}

# Release the ruleset for the Firestore instance.
resource "google_firebaserules_release" "firestore" {
  provider = google-beta
  for_each = google_firebase_project.default

  project      = each.value.project
  name         = "cloud.firestore" # must be cloud.firestore
  ruleset_name = google_firebaserules_ruleset.firestore[each.key].name

  # Wait for Firestore to be provisioned before releasing the ruleset.
  depends_on = [
    google_firestore_database.default,
  ]

  lifecycle {
    replace_triggered_by = [
      google_firebaserules_ruleset.firestore[each.key]
    ]
  }
}

# Enable required APIs for Cloud Storage for Firebase.
resource "google_project_service" "storage" {
  provider = google-beta
  for_each = google_firebase_project.default

  project = each.value.project
  service = "storage.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Enable required APIs for Cloud Storage for Firebase.
resource "google_project_service" "firebasestorage" {
  provider = google-beta
  for_each = google_firebase_project.default

  project = each.value.project
  service = "firebasestorage.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Provision the default Cloud Storage bucket for the project via Google App Engine.
resource "google_app_engine_application" "default" {
  provider = google-beta
  for_each = google_firebase_project.default

  project = each.value.project
  # See available locations: https://firebase.google.com/docs/projects/locations#default-cloud-location
  # This will set the location for the default Storage bucket and the App Engine App.
  # TODO: REPLACE WITH YOUR OWN VALUE
  location_id = "<NAME_OF_DESIRED_REGION_FOR_DEFAULT_BUCKET>" # Must be in the same location as Firestore (above)

  # Wait until Firestore is provisioned first.
  depends_on = [
    google_firestore_database.default
  ]
}

# Make the default Storage bucket accessible for Firebase SDKs, authentication, and Firebase Security Rules.
resource "google_firebase_storage_bucket" "default_bucket" {
  provider = google-beta
  for_each = google_firebase_project.default

  project   = each.value.project
  bucket_id = google_app_engine_application.default[each.key].default_bucket

  depends_on = [
    google_project_service.firebasestorage,
    google_project_service.storage,
  ]
}

# Create a ruleset of Cloud Storage Security Rules from a local file.
resource "google_firebaserules_ruleset" "storage" {
  provider = google-beta
  for_each = google_firebase_project.default

  project = each.value.project
  source {
    files {
      # Write security rules in a local file named "storage.rules".
      # Learn more: https://firebase.google.com/docs/storage/security/get-started
      name    = "storage.rules"
      content = file("storage.rules")
    }
  }

  # Wait for the default Storage bucket to be provisioned before creating this ruleset.
  depends_on = [
    google_firebase_storage_bucket.default_bucket,
  ]
}

# Release the ruleset to the default Storage bucket.
resource "google_firebaserules_release" "default_bucket" {
  provider = google-beta
  for_each = google_firebase_project.default

  name         = "firebase.storage/${google_app_engine_application.default[each.key].default_bucket}"
  ruleset_name = "projects/${google_firebase_project.default[each.key].project}/rulesets/${google_firebaserules_ruleset.storage[each.key].name}"
  project      = each.value.project

  lifecycle {
    replace_triggered_by = [
      google_firebaserules_ruleset.storage
    ]
  }
}
