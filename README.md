# AWS Lambda traffic shifting action 🟦 / 🟩

The purpose of this action is to do a blue / green deploy for lambdas using [alias routing configuration](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html#configuring-alias-routing). The basic premise is that you push a new version of your code, publish it, and then gradually shift between the existing version on the alias (🟦) to the new published version (🟩). At the same time the action monitors the error metrics for that lambda alias and will automatically roll back if an error is detected.

## Required environment variables

| NAME                    | DESCRIPTION                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| ALIAS                   | The alias of the Lambda function you want to shift                                                              |
| FUNCTION_NAME           | The name of the Lambda function you want to shift                                                               |
| BLUE_VERSION            | The existing version of the Lambda in the alias. This is optional and will be retrieved by the action if needed |
| GREEN_VERSION           | The version you want to shift the Lambda to                                                                     |
| ROLLOUT_STEPS           | The number of steps until you want to complete the rollout                                                      |
| ROLLOUT_TIME_IN_MINUTES | The total amount of time in minutes you would like to have the rollout take                                     |

To continously check for errors in the green version, the loop times is set at a minute interval. As a result your shift interval (ROLLOUT_TIME_IN_MINUTES / ROLLOUT_STEPS) should be an integer greater or equal to 1. For example, having 5 steps in 10 minutes will shift 20% every two minutes (10/5 = 2). Doing something like 3 steps in 5 minutes (5 / 3) will result in a non-integer shift interval (5/3 = 1.66666666667), which will not work with the error check interval.
