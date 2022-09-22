resource "aws_lambda_function" "aws_lambda_traffic_shifting_action_demo" {
  function_name = "aws_lambda_traffic_shifting_action_demo"
  description   = "Lambda function to demo blue / green traffic shifting."

  filename    = data.archive_file.aws_lambda_traffic_shifting_action_demo.output_path
  handler     = "lambda_function.lambda_handler"
  runtime     = "python3.8"
  timeout     = 10
  memory_size = 128
  publish     = true

  role             = aws_iam_role.aws_lambda_traffic_shifting_action_demo.arn
  source_code_hash = filebase64sha256(data.archive_file.aws_lambda_traffic_shifting_action_demo.output_path)

  depends_on = [
    aws_iam_role_policy_attachment.aws_lambda_traffic_shifting_action_demo,
    aws_cloudwatch_log_group.aws_lambda_traffic_shifting_action_demo,
  ]
}

resource "aws_lambda_permission" "allow_eventbridge_invocation" {
  statement_id  = "AllowEventBridgeInvocation"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.aws_lambda_traffic_shifting_action_demo.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.trigger_aws_lambda_traffic_shifting_action_demo.arn
  qualifier     = aws_lambda_alias.aws_lambda_traffic_shifting_action_demo_alias.name
}


resource "aws_lambda_alias" "aws_lambda_traffic_shifting_action_demo_alias" {
  name             = "aws_lambda_traffic_shifting_action_demo"
  description      = "Traffic shifting demo"
  function_name    = aws_lambda_function.aws_lambda_traffic_shifting_action_demo.arn
  function_version = aws_lambda_function.aws_lambda_traffic_shifting_action_demo_alias.version
  depends_on = [
    aws_lambda_alias.aws_lambda_traffic_shifting_action_demo_alias
  ]
}

data "archive_file" "aws_lambda_traffic_shifting_action_demo" {
  type        = "zip"
  source_file = "${path.module}/scripts/lambda_function.py"
  output_path = "/tmp/lambda_function.py.zip"
}

resource "aws_cloudwatch_log_group" "aws_lambda_traffic_shifting_action_demo" {
  name              = "/aws/lambda/aws_lambda_traffic_shifting_action_demo"
  retention_in_days = "14"
}
