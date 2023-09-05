const test = require("ava");
const rollout = require("./rollout");

const sinon = require("sinon");
const aws_calls = require("./aws_calls");

let get_lambda_by_version_stub = sinon.stub(aws_calls, "get_lambda_by_version");
get_lambda_by_version_stub.onCall(0).returns(false);
get_lambda_by_version_stub.returns(true);

let shift_traffic_stub = sinon.stub(aws_calls, "shift_traffic");
let check_errors_stub = sinon.stub(aws_calls, "check_errors");
check_errors_stub.onCall(0).returns(true);
check_errors_stub.returns(false);

sinon.stub(console, "log");
sinon.stub(console, "error");

test("rollout returns false if alias is not valid", async (t) => {
  let result = await rollout.rollout("", "function_name", "1", "2", 2, 2);
  t.is(result, false);
});

test("rollout returns false if function_name is not valid", async (t) => {
  let result = await rollout.rollout("alias", "", "1", "2", 2, 2);
  t.is(result, false);
});

test("rollout returns false if blue_version is not valid", async (t) => {
  sinon
    .stub(aws_calls, "get_current_alias")
    .returns({ FunctionVersion: "blue_alias" });
  let result = await rollout.rollout(
    "alias",
    "function_name",
    false,
    "2",
    2,
    2,
  );
  t.is(result, false);
});

test("rollout returns false if green_version is not valid", async (t) => {
  let result = await rollout.rollout("alias", "function_name", "1", "", 2, 2);
  t.is(result, false);
});

test("rollout returns false if green_version does not exist", async (t) => {
  let result = await rollout.rollout("alias", "function_name", "1", "1", 2, 2);
  t.is(result, false);
  get_lambda_by_version_stub.returns(true);
});

test("rollout returns false if blue_version and green_version match", async (t) => {
  let result = await rollout.rollout("alias", "function_name", "1", "1", 2, 2);
  t.is(result, false);
});

test("rollout returns false if rollout_steps is not a positive integer", async (t) => {
  let result = await rollout.rollout("alias", "function_name", "1", "2", 0, 2);
  t.is(result, false);
  result = await rollout.rollout("alias", "function_name", "1", "2", 0.5, 2);
  t.is(result, false);
});

test("rollout returns false if rollout_time_in_minutes is not a positive integer", async (t) => {
  let result = await rollout.rollout("alias", "function_name", "1", "2", 2, 0);
  t.is(result, false);
  result = await rollout.rollout("alias", "function_name", "1", "2", 2, 0.5);
  t.is(result, false);
});

test("rollout returns false if shift intervals are less than a minute", async (t) => {
  let result = await rollout.rollout("alias", "function_name", "1", "2", 2, 1);
  t.is(result, false);
});

test("rollout returns false if shift intervals are not integers", async (t) => {
  let result = await rollout.rollout("alias", "function_name", "3", "5", 3, 5);
  t.is(result, false);
});

test("rollout stops shifting traffic after an error is detected", async (t) => {
  process.env.PROCESS_TICK = 0;
  let result = await rollout.rollout("alias", "function_name", "1", "2", 2, 2);
  t.is(result, false);
});

test("rollout calls shift_traffic n+1 INTERVAL times", async (t) => {
  process.env.PROCESS_TICK = 0;
  let result = await rollout.rollout("alias", "function_name", "1", "2", 2, 2);
  t.is(shift_traffic_stub.callCount, 3 + 2); // +2 from previous test
  t.is(result, true);
});

test.after.always("guaranteed cleanup", () => {
  sinon.restore();
});
