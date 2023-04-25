# Create a new Google Cloud project.
resource "google_project" "staging" {
  provider = google-beta.no_user_project_override

  # TODO: REPLACE WITH YOUR OWN VALUES
  name       = "<PROJECT_NAME_OF_YOUR_STAGING_PROJECT>"
  project_id = "<PROJECT_ID_OF_YOUR_STAGING_PROJECT>"
  # UNCOMMENT BELOW IF YOU IF YOU SET UP FIREBASE AUTHENTICATION USING TERRAFORM IN THE PREVIOUS STEP
  # billing_account = "<BILLING_ACCOUNT_ID>"

  # Required for the project to display in any list of Firebase projects.
  labels = {
    "firebase" = "enabled"
  }
}

# Enable the required underlying Service Usage API.
resource "google_project_service" "serviceusage_staging" {
  provider = google-beta.no_user_project_override

  project = google_project.staging.project_id
  service = "serviceusage.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Enable the required underlying Firebase Management API.
resource "google_project_service" "firebase_staging" {
  provider = google-beta.no_user_project_override

  project = google_project.staging.project_id
  service = "firebase.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Enable Firebase services for the new project created above.
resource "google_firebase_project" "staging" {
  provider = google-beta

  project = google_project.staging.project_id

  # Wait until the required APIs are enabled.
  depends_on = [
    google_project_service.firebase_staging,
    google_project_service.serviceusage_staging,
  ]
}

# Create a Firebase Web App in the new project created above.
resource "google_firebase_web_app" "staging" {
  provider = google-beta

  project         = google_firebase_project.staging.project
  # TODO: REPLACE WITH YOUR OWN VALUE
  display_name    = "<DISPLAY_NAME_OF_YOUR_WEB_APP>"
  deletion_policy = "DELETE"
}

# UNCOMMENT BELOW IF YOU SET UP FIREBASE AUTHENTICATION USING TERRAFORM IN THE PREVIOUS STEP
## Enable the Identity Toolkit API.
# resource "google_project_service" "auth_staging" {
#   provider = google-beta

#   project = google_firebase_project.staging.project
#   service = "identitytoolkit.googleapis.com"

#   # Don't disable the service if the resource block is removed by accident.
#   disable_on_destroy = false
# }

## Create an Identity Platform config.
## Also, enable Firebase Authentication using Identity Platform (if Authentication isn't yet enabled).
# resource "google_identity_platform_config" "auth_staging" {
#   provider = google-beta
#   project  = google_firebase_project.staging.project

#   # For example, you can configure to auto-delete anonymous users.
#   autodelete_anonymous_users = true

#   # Wait for identitytoolkit.googleapis.com to be enabled before initializing Authentication.
#   depends_on = [
#     google_project_service.auth_staging,
#   ]
# }

# variable "oauth_client_secret_staging" {
#   type = string

#   description = "OAuth client secret. For this codelab, you can pass in this secret through the environment variable TF_VAR_oauth_client_secret_staging. In a real app, you should use a secret manager service."

#   sensitive = true
# }

# resource "google_identity_platform_default_supported_idp_config" "google_sign_in_staging" {
#   provider = google-beta
#   project  = google_firebase_project.staging.project

#   enabled       = true
#   idp_id        = "google.com"
#   # TODO: REPLACE WITH YOUR OWN VALUE
#   client_id     = "<YOUR_OAUTH_CLIENT_ID>"
#   client_secret = var.oauth_client_secret_staging

#   depends_on = [
#     google_identity_platform_config.auth_staging
#   ]
# }

# Enable required APIs for Cloud Firestore.
resource "google_project_service" "firestore_staging" {
  provider = google-beta

  project = google_firebase_project.staging.project
  for_each = toset([
    "firestore.googleapis.com",
    "firebaserules.googleapis.com",
  ])
  service = each.key

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Provision the Firestore database instance.
resource "google_firestore_database" "staging" {
  provider = google-beta

  project = google_firebase_project.staging.project
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
    google_project_service.firestore_staging
  ]
}

# Create a ruleset of Firestore Security Rules from a local file.
resource "google_firebaserules_ruleset" "firestore_staging" {
  provider = google-beta

  project = google_firebase_project.staging.project
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
    google_firestore_database.staging,
  ]
}

# Release the ruleset for the Firestore instance.
resource "google_firebaserules_release" "firestore_staging" {
  provider = google-beta

  name         = "cloud.firestore" # must be cloud.firestore
  ruleset_name = google_firebaserules_ruleset.firestore_staging.name
  project      = google_firebase_project.staging.project

  # Wait for Firestore to be provisioned before releasing the ruleset.
  depends_on = [
    google_firestore_database.staging,
  ]

  lifecycle {
    replace_triggered_by = [
      google_firebaserules_ruleset.firestore_staging
    ]
  }
}

# Enable required APIs for Cloud Storage for Firebase.
resource "google_project_service" "storage_staging" {
  provider = google-beta

  project = google_firebase_project.staging.project
  for_each = toset([
    "firebasestorage.googleapis.com",
    "storage.googleapis.com",
  ])
  service = each.key


  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Provision the default Cloud Storage bucket for the project via Google App Engine.
resource "google_app_engine_application" "staging" {
  provider = google-beta

  project = google_firebase_project.staging.project
  # See available locations: https://firebase.google.com/docs/projects/locations#default-cloud-location
  # This will set the location for the default Storage bucket and the App Engine App.
  # TODO: REPLACE WITH YOUR OWN VALUE
  location_id = "<NAME_OF_DESIRED_REGION_FOR_DEFAULT_BUCKET>" # Must be in the same location as Firestore (above)

  # Wait until Firestore is provisioned first.
  depends_on = [
    google_firestore_database.staging
  ]
}

# Make the default Storage bucket accessible for Firebase SDKs, authentication, and Firebase Security Rules.
resource "google_firebase_storage_bucket" "default_bucket_staging" {
  provider = google-beta

  project   = google_firebase_project.staging.project
  bucket_id = google_app_engine_application.staging.default_bucket


  depends_on = [
    google_project_service.storage_staging
  ]
}

# Create a ruleset of Cloud Storage Security Rules from a local file.
resource "google_firebaserules_ruleset" "storage_staging" {
  provider = google-beta

  project = google_firebase_project.staging.project
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
    google_firebase_storage_bucket.default_bucket_staging,
  ]
}

# Release the ruleset to the default Storage bucket.
resource "google_firebaserules_release" "default_bucket_staging" {
  provider = google-beta

  name         = "firebase.storage/${google_app_engine_application.staging.default_bucket}"
  ruleset_name = "projects/${google_firebase_project.staging.project}/rulesets/${google_firebaserules_ruleset.storage_staging.name}"
  project      = google_firebase_project.staging.project

  lifecycle {
    replace_triggered_by = [
      google_firebaserules_ruleset.storage_staging
    ]
  }
}
