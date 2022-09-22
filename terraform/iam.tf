resource "aws_iam_role" "aws_lambda_traffic_shifting_action_demo" {
  name               = "AWSLambdaTrafficShiftingDemo"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_policy.json
}

resource "aws_iam_policy" "aws_lambda_traffic_shifting_action_demo" {
  name   = "AWSLambdaTrafficShiftingDemo"
  path   = "/"
  policy = data.aws_iam_policy_document.aws_lambda_traffic_shifting_action_demo.json
}

resource "aws_iam_role_policy_attachment" "aws_lambda_traffic_shifting_action_demo" {
  role       = aws_iam_role.aws_lambda_traffic_shifting_action_demo.name
  policy_arn = aws_iam_policy.aws_lambda_traffic_shifting_action_demo.arn
}

data "aws_iam_policy_document" "lambda_assume_policy" {
  statement {
    effect = "Allow"
    actions = [
      "sts:AssumeRole",
    ]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "aws_lambda_traffic_shifting_action_demo" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${aws_cloudwatch_log_group.aws_lambda_traffic_shifting_action_demo.arn}*"
    ]
  }
}
