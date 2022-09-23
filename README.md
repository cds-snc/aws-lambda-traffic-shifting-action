# AWS Lambda traffic shifting action 🟦 / 🟩

The purpose of this action is to do a blue / green deploy for lambdas using [alias routing configuration](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html#configuring-alias-routing). The basic premise is that you push a new version of your code, publish it, and then gradually shift between the existing version on the alias (🟦) to the new published version (🟩). At the same time the action monitors the error metrics for that lambda alias and will automatically roll back if an error is detected. This mean that the primary access point to your lambda function is an alias.

## Required environment variables

| NAME                    | DESCRIPTION                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| ALIAS                   | The alias of the Lambda function you want to shift                                                              |
| FUNCTION_NAME           | The name of the Lambda function you want to shift                                                               |
| BLUE_VERSION            | The existing version of the Lambda in the alias. This is optional and will be retrieved by the action if needed |
| GREEN_VERSION           | The version you want to shift the Lambda to                                                                     |
| ROLLOUT_STEPS           | The number of steps until you want to complete the rollout                                                      |
| ROLLOUT_TIME_IN_MINUTES | The total amount of time in minutes you would like to have the rollout take                                     |

To continuously check for errors in the green version, the loop times is set at a minute interval. As a result your shift interval (ROLLOUT_TIME_IN_MINUTES / ROLLOUT_STEPS) should be an integer greater or equal to 1. For example, having 5 steps in 10 minutes will shift 20% every two minutes (10/5 = 2). Doing something like 3 steps in 5 minutes (5 / 3) will result in a non-integer shift interval (5/3 = 1.66666666667), which will not work with the error check interval.

## How does it work?

The two most important things to make this action useful are:

1. Your functions have to exit with an error if there is an error. If you handle the error gracefully just to keep the function alive, you will not create any error metrics to check if the new function is healthy.

2. You need to have consistent traffic to validate the health of your new lambda. This can either be natural traffic or artificial traffic through EventBridge triggers or Route53 health checks.

Next you want to integrate it into your continuous deployment pipeline after the lambda has been deployed and published. For example in this repository, with a lambda that has the name `aws_lambda_traffic_shifting_action_demo` and an alias `aws_lambda_traffic_shifting_action_demo`, the action is used in the following way to deploy the new function over 10 minutes with a step every five minutes:

```
- name: Terraform Apply
working-directory: terraform
run: |
    terragrunt apply --terragrunt-non-interactive -auto-approve

- name: Publish new lambda version
run: |
    aws lambda wait function-updated --function-name aws_lambda_traffic_shifting_action_demo
    echo "VERSION=$(aws lambda publish-version --function-name aws_lambda_traffic_shifting_action_demo | jq -r '.Version')" >> $GITHUB_ENV

- name: Shift lambda traffic over 10 minutes
uses: cds-snc/aws-lambda-traffic-shifting-action@0.4
env:
    ALIAS: aws_lambda_traffic_shifting_action_demo
    FUNCTION_NAME: aws_lambda_traffic_shifting_action_demo
    BLUE_VERSION: "2"
    GREEN_VERSION: "${{ env.VERSION }}"
    ROLLOUT_STEPS: 5
    ROLLOUT_TIME_IN_MINUTES: 10
```

Should your deploy succeed, you should see the following in your logs:
[successful_shift](https://user-images.githubusercontent.com/867334/192053660-71ebba38-e97f-43c4-9649-eafd7a81237c.png)
Below is a CloudWatch graph of the traffic shifting between version 2 and version 4:
[traffic_shift_example](https://user-images.githubusercontent.com/867334/192053543-a91056f6-e8a1-415f-8622-2b37c7903855.png)
Should your deploy fail, you should see the following in yours logs:
[failed_shift](https://user-images.githubusercontent.com/867334/192053661-138a66b7-b772-4bdb-a17b-b97f5076c941.png)
Below is a CloudWatch graph of the error count when shifting between version 2 and version 3:
[error_count](https://user-images.githubusercontent.com/867334/192053574-a6acbb18-32ba-42fa-896a-d8cf3269c88d.png)