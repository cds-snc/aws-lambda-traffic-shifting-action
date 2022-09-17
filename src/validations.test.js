const test = require("ava");
const sinon = require("sinon");

const validations = require("./validations");

sinon.stub(console, "error");

test("isValidAlias should be be defined", (t) => {
  t.is(validations.isValidAlias("alias"), false);
});

test("isValidAlias should be more than 0 characters", (t) => {
  t.is(validations.isValidAlias("alias", ""), false);
});

test("isValidAlias should be less than 129 characters", (t) => {
  t.is(validations.isValidAlias("alias", "a".repeat(129)), false);
});

test("isValidAlias should match regex", (t) => {
  t.is(validations.isValidAlias("alias", "::"), false);
});

test("isValidAlias should return true if it passed validation", (t) => {
  t.is(validations.isValidAlias("alias", "abcd"), true);
});

test("isValidFunctionName should be be defined", (t) => {
  t.is(validations.isValidFunctionName("function_name"), false);
});

test("isValidFunctionName should be more than 0 characters", (t) => {
  t.is(validations.isValidFunctionName("function_name", ""), false);
});

test("isValidFunctionName should be less than 141 characters", (t) => {
  t.is(
    validations.isValidFunctionName("function_name", "a".repeat(141)),
    false
  );
});

test("isValidFunctionName should match regex", (t) => {
  t.is(validations.isValidFunctionName("function_name", "❌"), false);
});

test("isValidFunctionName should return true if it passed validation", (t) => {
  t.is(validations.isValidFunctionName("function_name", "abcd"), true);
});

test("isValidNumber should be defined", (t) => {
  t.is(validations.isValidNumber("number"), false);
});

test("isValidNumber should not be a non-positive integer", (t) => {
  t.is(validations.isValidNumber("number", -1), false);
});

test("isValidNumber should be not be a non-number", (t) => {
  t.is(validations.isValidNumber("number", "abcd"), false);
});

test("isValidNumber should be a positive integer", (t) => {
  t.is(validations.isValidNumber("number", 1), true);
});

test("isValidVersion should be defined", (t) => {
  t.is(validations.isValidVersion("version"), false);
});

test("isValidVersion should not be less than 1 character long", (t) => {
  t.is(validations.isValidVersion("version", ""), false);
});

test("isValidVersion should not be more than 1024 character long", (t) => {
  t.is(validations.isValidVersion("version", "a".repeat(1025)), false);
});

test("isValidVersion should needs to match a regex", (t) => {
  t.is(validations.isValidVersion("version", "a"), false);
});

test("isValidVersion should be true for LATEST", (t) => {
  t.is(validations.isValidVersion("version", "$LATEST"), true);
});

test("isValidVersion should be true for 1", (t) => {
  t.is(validations.isValidVersion("version", "1"), true);
});

test("isValidVersion should be true for 9.repeat(1024)", (t) => {
  t.is(validations.isValidVersion("version", "9".repeat(1024)), true);
});

test.after.always("guaranteed cleanup", (t) => {
  sinon.restore();
});
