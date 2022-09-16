const {
  LambdaClient,
  GetAliasCommand,
  GetFunctionCommand,
  UpdateAliasCommand,
} = require("@aws-sdk/client-lambda");

const {
  CloudWatchClient,
  GetMetricDataCommand,
} = require("@aws-sdk/client-cloudwatch");

const REGION = process.env.AWS_DEFAULT_REGION || "ca-central-1";

const lambda_client = new LambdaClient({ region: REGION });
const cloudwatch_client = new CloudWatchClient({ region: REGION });

const check_errors = async (name, alias, start_time) => {
  const end_time = new Date(Date.now() + 1000);
  const query = [
    {
      Id: "check_error_query",
      MetricStat: {
        Metric: {
          Namespace: "AWS/Lambda",
          MetricName: "Errors",
          Dimensions: [
            { Name: "FunctionName", Value: name },
            { Name: "Resource", Value: `${name}:${alias}` },
          ],
        },
        Period: 1,
        Stat: "Sum",
        Unit: "Count",
      },
      ReturnData: true,
    },
  ];
  command = new GetMetricDataCommand({
    EndTime: end_time,
    StartTime: start_time,
    MetricDataQueries: query,
  });
  try {
    result = await cloudwatch_client.send(command);
    console.log(result);
    if (result.MetricDataResults[0].Values.length > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const get_current_alias = async (name, alias) => {
  let command = new GetAliasCommand({
    FunctionName: name,
    Name: alias,
  });
  try {
    result = await lambda_client.send(command);
    return result;
  } catch (error) {
    console.error(error);
  }
};

const get_lambda_by_version = async (name, version) => {
  let command = new GetFunctionCommand({
    FunctionName: name,
    Qualifier: version,
  });
  try {
    await lambda_client.send(command);
    return true;
  } catch (error) {
    if (error.$metadata.httpStatusCode != 404) {
      console.error(error);
    }
    return false;
  }
};

const shift_traffic = async (name, alias, blue, green, percentage) => {
  let routing_params = {};
  let weights = {};
  if (percentage / 100 < 1) {
    weights[green] = percentage / 100;
    routing_params = {
      FunctionName: name,
      Name: alias,
      FunctionVersion: blue,
      RoutingConfig: {
        AdditionalVersionWeights: weights,
      },
    };
  } else {
    weights[blue] = 0;
    routing_params = {
      FunctionName: name,
      Name: alias,
      FunctionVersion: green,
      RoutingConfig: {
        AdditionalVersionWeights: weights,
      },
    };
  }

  try {
    const command = new UpdateAliasCommand(routing_params);
    await lambda_client.send(command);
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
};

exports.check_errors = check_errors;
exports.get_current_alias = get_current_alias;
exports.get_lambda_by_version = get_lambda_by_version;
exports.shift_traffic = shift_traffic;
