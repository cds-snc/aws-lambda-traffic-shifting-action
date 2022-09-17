const test = require("ava");
const sinon = require("sinon");

const aws_calls = require("./aws_calls");

//sinon.stub(console, "error");

test("get_lambda_by_version should return true if the version exists", async (t) => {
  sinon.spy(aws_calls.lambda_client);
  let result = await aws_calls.get_lambda_by_version("name", "version");
  t.is(result, true);
});

test.after.always("guaranteed cleanup", (t) => {
  sinon.restore();
});
