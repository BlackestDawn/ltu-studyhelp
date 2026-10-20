terraform {
  required_version = ">= 1.7.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  # Same state bucket as various-terraform/gcp-bootstrap, own prefix.
  backend "gcs" {
    bucket = "demos-502909-terraform-state"
    prefix = "ltu-studyhelp-gcp"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
