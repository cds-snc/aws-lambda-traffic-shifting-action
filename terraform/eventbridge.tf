resource "aws_cloudwatch_event_rule" "trigger_aws_lambda_traffic_shifting_action_demo" {
  name                = "InvokeTrafficShiftingDemo"
  schedule_expression = "rate(1 minute)"
}

resource "aws_cloudwatch_event_target" "aws_lambda_traffic_shifting_action_demo" {
  rule = aws_cloudwatch_event_rule.trigger_aws_lambda_traffic_shifting_action_demo.name
  arn  = "${aws_lambda_function.aws_lambda_traffic_shifting_action_demo.arn}:${aws_lambda_alias.aws_lambda_traffic_shifting_action_demo_alias.name}"
  input = jsonencode({
    "foo" = "bar"
    }
  )
}
