variable "account_id" {
  description = "The account ID to scope terraform to"
  type        = string
  default     = "017790921725"
}

variable "billing_code" {
  description = "The billing code to tag our resources with"
  type        = string
}