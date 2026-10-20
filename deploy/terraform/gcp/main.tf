locals {
  apis = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "iamcredentials.googleapis.com",
    "sts.googleapis.com",
  ]

  deployer_roles = [
    "roles/run.admin",
    "roles/artifactregistry.writer",
  ]
}

# --- Owned by the shared bootstrap stack ------------------------------------
#
# The WIF pool/provider and the "apps" Artifact Registry repo are managed in
# a separate Terraform stack (various-terraform/gcp-bootstrap), not here.
# They're referenced read-only via data sources rather than declared as
# resources, since re-declaring them here would try to create already-
# existing, uniquely-named GCP objects and fail with 409s.

data "google_iam_workload_identity_pool" "github_actions" {
  workload_identity_pool_id = "github-actions"
}

data "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = data.google_iam_workload_identity_pool.github_actions.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
}

data "google_artifact_registry_repository" "apps" {
  location      = var.region
  repository_id = "apps"
}

# API enablement is idempotent (enabling an already-enabled API just
# succeeds), so it's safe for this stack to also declare it rather than
# assume the bootstrap stack's state will always be the one managing it.
resource "google_project_service" "this" {
  for_each           = toset(local.apis)
  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# --- This app's own resources ------------------------------------------------

# Used by GitHub Actions to build/push/deploy.
resource "google_service_account" "deployer" {
  account_id   = "${var.github_repo}-deployer"
  display_name = "${var.github_repo} GitHub Actions deployer"
}

# Used as the running Cloud Run service's own identity. The app is static
# (no database, no secrets, no Google APIs), so it gets no roles at all.
resource "google_service_account" "runtime" {
  account_id   = "${var.github_repo}-run"
  display_name = "${var.github_repo} Cloud Run runtime identity"
}

resource "google_project_iam_member" "deployer" {
  for_each = toset(local.deployer_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.deployer.email}"
}

# The deployer must be able to "act as" the runtime SA to deploy a service
# running under it. Granted on that one SA only, not project-wide.
resource "google_service_account_iam_member" "deployer_acts_as_runtime" {
  service_account_id = google_service_account.runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deployer.email}"
}

# Let GitHub Actions, but only from this repo, impersonate the deployer SA —
# no downloaded JSON keys.
resource "google_service_account_iam_member" "deployer_wif_binding" {
  service_account_id = google_service_account.deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${data.google_iam_workload_identity_pool.github_actions.name}/attribute.repository/${var.github_org}/${var.github_repo}"
}
