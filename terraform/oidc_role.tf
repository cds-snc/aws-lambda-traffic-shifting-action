locals {
  plan_name  = "AWSLambdaTrafficShiftingDemoReadOnlyRole"
  admin_name = "AWSLambdaTrafficShiftingDemoAdministratorRole"
}

data "aws_caller_identity" "current" {}

module "gh_oidc_roles" {
  source = "github.com/cds-snc/terraform-modules//gh_oidc_role?ref=v3.0.20"
  roles = [
    {
      name      = local.plan_name
      repo_name = "aws-lambda-traffic-shifting-action"
      claim     = "*"
    },
    {
      name      = local.admin_name
      repo_name = "aws-lambda-traffic-shifting-action"
      claim     = "ref:refs/heads/main"
    }
  ]

  billing_tag_value = var.billing_code
}

module "attach_tf_plan_policy" {
  source            = "github.com/cds-snc/terraform-modules//attach_tf_plan_policy?ref=v7.0.1"
  account_id        = data.aws_caller_identity.current.account_id
  role_name         = local.plan_name
  bucket_name       = "${var.billing_code}-tf"
  lock_table_name   = "terraform-state-lock-dynamo"
  billing_tag_value = var.billing_code
  depends_on = [
    module.gh_oidc_roles
  ]
}

data "aws_iam_policy" "admin" {
  name = "AdministratorAccess"
  depends_on = [
    module.gh_oidc_roles
  ]
}

resource "aws_iam_role_policy_attachment" "admin" {
  role       = local.admin_name
  policy_arn = data.aws_iam_policy.admin.arn
  depends_on = [
    module.gh_oidc_roles
  ]
}
