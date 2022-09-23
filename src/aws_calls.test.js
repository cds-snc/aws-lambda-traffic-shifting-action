const test = require("ava");
const sinon = require("sinon");
const { mockClient } = require("aws-sdk-client-mock");
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

const aws_calls = require("./aws_calls");
const lambdaMock = mockClient(LambdaClient);
const cwMock = mockClient(CloudWatchClient);

sinon.stub(console, "error");

test("check_errors returns false if no error is found", async (t) => {
  cwMock.on(GetMetricDataCommand).resolves({
    MetricDataResults: [
      {
        Id: "e1",
        Label: "e1",
        Timestamps: [],
        Values: [],
        StatusCode: "Complete",
        Messages: [
          {
            Code: "ArithmeticError",
            Value:
              "One or more data-points have been dropped due to non-numeric values (NaN, -Infinite, +Infinite)",
          },
        ],
      },
    ],
    Messages: [],
  });
  let result = await aws_calls.check_errors(
    "name",
    "alias",
    new Date(Date.now() - 1000)
  );
  t.is(result, false);
});

test("check_errors returns true if an error is found", async (t) => {
  cwMock
    .on(GetMetricDataCommand)
    .resolves({ MetricDataResults: [{ Values: ["error"] }] });
  let result = await aws_calls.check_errors(
    "name",
    "alias",
    new Date(Date.now() - 1000)
  );
  t.is(result, true);
});

test("check_errors returns true if there is an error querying cloudwatch", async (t) => {
  cwMock.rejects(GetMetricDataCommand);
  let result = await aws_calls.check_errors(
    "name",
    "alias",
    new Date(Date.now() - 1000)
  );
  t.is(result, true);
});

test("get_current_alias should return true if the alias exist", async (t) => {
  lambdaMock.on(GetAliasCommand).resolves({ alias: "foo" });
  let result = await aws_calls.get_current_alias("name", "alias");
  t.deepEqual(result, { alias: "foo" });
});

test("get_current_alias should return false if the version does not exist", async (t) => {
  lambdaMock.on(GetAliasCommand).rejects();
  let result = await aws_calls.get_current_alias("name", "alias");
  t.is(result, false);
});

test("get_lambda_by_version should return true if the version exist", async (t) => {
  lambdaMock
    .on(GetFunctionCommand)
    .resolves({ $metadata: { httpStatusCode: 202 } });
  let result = await aws_calls.get_lambda_by_version("name", "version");
  t.is(result, true);
});

test("get_lambda_by_version should return false if the version does not exist", async (t) => {
  lambdaMock
    .on(GetFunctionCommand)
    .rejects({ $metadata: { httpStatusCode: 404 } });
  let result = await aws_calls.get_lambda_by_version("name", "version");
  t.is(result, false);
});

test("get_lambda_by_version should return false if the version does not exist and the http error is not 404", async (t) => {
  lambdaMock
    .on(GetFunctionCommand)
    .rejects({ $metadata: { httpStatusCode: 500 } });
  let result = await aws_calls.get_lambda_by_version("name", "version");
  t.is(result, false);
});

test("shift_traffic returns false it there is an error", async (t) => {
  lambdaMock.on(UpdateAliasCommand).rejects();
  let result = await aws_calls.shift_traffic("name", "alias", 1, 2, 50);
  t.is(result, false);
});

test("shift_traffic returns true it there is no error", async (t) => {
  lambdaMock.on(UpdateAliasCommand).resolves();
  let result = await aws_calls.shift_traffic("name", "alias", 1, 2, 50);
  t.is(result, true);
});

test("shift_traffic keeps the main alias at blue if less than 100% traffic", async (t) => {
  lambdaMock.on(UpdateAliasCommand).resolves();
  let result = await aws_calls.shift_traffic(
    "name",
    "alias",
    "blue",
    "green",
    50
  );
  t.is(
    lambdaMock.commandCalls(UpdateAliasCommand, {
      FunctionName: "name",
      Name: "alias",
      FunctionVersion: "blue",
      RoutingConfig: {
        AdditionalVersionWeights: { green: 0.5 },
      },
    }).length,
    1
  );
  t.is(result, true);
});

test("shift_traffic shift the alias to green if 100% traffic", async (t) => {
  lambdaMock.on(UpdateAliasCommand).resolves();
  let result = await aws_calls.shift_traffic(
    "name",
    "alias",
    "blue",
    "green",
    100
  );
  t.is(
    lambdaMock.commandCalls(UpdateAliasCommand, {
      FunctionName: "name",
      Name: "alias",
      FunctionVersion: "green",
      RoutingConfig: {
        AdditionalVersionWeights: { blue: 0 },
      },
    }).length,
    1
  );
  t.is(result, true);
});

test.after.always("guaranteed cleanup", () => {
  sinon.restore();
});
