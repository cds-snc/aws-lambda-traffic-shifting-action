# AWS Lambda traffic shifting action 🟦 / 🟩

The purpose of this action is to do a blue / green deploy for lambdas using [alias routing configuration](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html#configuring-alias-routing). The basic premise is that you push a new version of your code, publish it, and then gradually shift between the existing version on the alias (🟦) to the new published version (🟩). At the same time the action monitors the error metrics for that lambda alias and will automatically roll back if an error is detected.
