# Deployment

```
push to main ──▶ lint + unit tests + build ─┐
             └─▶ E2E tests  ────────────────┴─▶ build image ──▶ smoke-test image ──▶ push ──▶ deploy Cloud Run
```

Single branch, single environment: every push to `main` (or a manual run of "Check and deploy") is checked and, if everything passes, deployed straight to production. A failing check stops the deploy, and the previous revision keeps serving.

- **Compute**: Google Cloud Run, one service (`ltu-studyhelp`). Scales to zero when idle; `--max-instances=3` caps cost.
- **No database, no secrets**: the app is a static bundle served by Bun. Progress is stored in each visitor's browser.
- **Auth**: GitHub Actions authenticates to GCP via Workload Identity Federation — no long-lived service account keys.
- **Provisioning**: `deploy/terraform/gcp`. It references the shared Workload Identity Pool and `apps` Artifact Registry repo from [various-terraform/gcp-bootstrap](https://github.com/BlackestDawn/various-terraform) via data sources, and keeps its state in the same GCS bucket under the `ltu-studyhelp-gcp` prefix.
- **Least privilege**: the runtime service account has no roles. The deployer can only act as that one runtime account, not every account in the project.

## Workflow: `.github/workflows/deploy.yml`

| Job | What it does |
|---|---|
| `checks` | ESLint + TypeScript (`bun run lint`), unit tests (`bun run test`) and a production build |
| `e2e-tests` | Playwright suite against the production build; report uploaded as an artifact |
| `deploy` | runs only if both pass: builds the image (tagged with the commit SHA), smoke-tests it locally, pushes it, deploys it, then checks `/health` on the live service |

**Rolling back**: Cloud Run keeps earlier revisions. Either revert the commit and push, or route traffic back to a previous revision:

```bash
gcloud run revisions list --service=ltu-studyhelp --region=$REGION
gcloud run services update-traffic ltu-studyhelp --to-revisions=<revision>=100 --region=$REGION
```

The next successful deploy sends all traffic to the new revision again.

## One-time bootstrap

> **Prerequisite**: the shared Workload Identity Pool/provider (`github-actions`) and the `apps` Artifact Registry repo must already exist in the target GCP project. They do if urlshortener or task-manager are deployed there; otherwise apply [various-terraform/gcp-bootstrap](https://github.com/BlackestDawn/various-terraform) first.

1. **GCP stack** — creates this app's deployer/runtime service accounts and IAM bindings.

   ```bash
   cd deploy/terraform/gcp
   cp terraform.tfvars.example terraform.tfvars   # fill in project_id, github_org
   terraform init
   terraform apply
   ```

2. **GitHub repo secrets** (Settings → Secrets and variables → Actions). With the GitHub CLI, from `deploy/terraform/gcp`:

   ```bash
   gh secret set GCP_PROJECT_ID --body "your-gcp-project-id"
   gh secret set GCP_REGION --body "europe-west1"          # match region in terraform.tfvars
   gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER --body "$(terraform output -raw workload_identity_provider)"
   gh secret set GCP_DEPLOYER_SA --body "$(terraform output -raw deployer_service_account)"
   gh secret set GCP_RUNTIME_SA --body "$(terraform output -raw runtime_service_account)"
   ```

3. **First deploy** — push to `main` (or run "Check and deploy" manually from the Actions tab). This creates the Cloud Run service; the domain mapping below needs it to exist. Until then, the service is reachable on its `*.run.app` URL, which the workflow prints in its run summary.

4. **Domain mapping** — Cloud Run custom domains aren't in Terraform; one-time CLI step:

   ```bash
   PROJECT=your-gcp-project-id
   REGION=your-gcp-region
   DOMAIN=your-domain
   ZONE=your-cloud-dns-zone-name   # e.g. `gcloud dns managed-zones list --project=$PROJECT`

   gcloud beta run domain-mappings create --service=ltu-studyhelp --domain=studyhelp.$DOMAIN --region=$REGION --project=$PROJECT

   # Cloud Run subdomain mappings resolve via a CNAME to ghs.googlehosted.com.
   gcloud dns record-sets create studyhelp.$DOMAIN. \
     --zone=$ZONE \
     --type=CNAME \
     --ttl=300 \
     --rrdatas=ghs.googlehosted.com. \
     --project=$PROJECT
   ```

The `production` GitHub environment is created automatically on the first run and lists every deploy. If you ever want a manual approval before deploys, add a required reviewer to it (Settings → Environments → production).
