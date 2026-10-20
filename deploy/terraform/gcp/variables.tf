variable "project_id" {
  type        = string
  description = "GCP project this app deploys into."
}

variable "region" {
  type        = string
  default     = "europe-west1"
  description = "Region for Cloud Run and Artifact Registry."
}

variable "github_org" {
  type        = string
  description = "GitHub org/username that owns the repos allowed to deploy into this project."
}

variable "github_repo" {
  type        = string
  default     = "ltu-studyhelp"
  description = "GitHub repository name. Also used as the prefix for this app's service accounts."
}
