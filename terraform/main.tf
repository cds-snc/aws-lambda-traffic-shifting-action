provider "aws" {
  region              = "ca-central-1"
  allowed_account_ids = [var.account_id]
}