const isValidAlias = (v, alias) => {
  if (!validateDefined(v, alias)) {
    return false;
  }

  if (alias.length < 1 || alias.length > 128) {
    console.error(
      "❌ Alias needs to be between 1 and 128 characters in length.",
    );
    return false;
  }

  const pattern = "(?!^[0-9]+$)([a-zA-Z0-9-_]+)";
  const re = new RegExp(pattern);

  if (!re.test(alias)) {
    console.error(`❌ Alias is not valid, it needs to match ${pattern}`);
    return false;
  }
  return true;
};

const isValidFunctionName = (v, name) => {
  if (!validateDefined(v, name)) {
    return false;
  }

  if (name.length < 1 || name.length > 140) {
    console.error(
      "❌ Function name needs to be between 1 and 140 characters in length.",
    );
    return false;
  }

  const pattern =
    "(arn:(aws[a-zA-Z-]*)?:lambda:)?([a-z]{2}(-gov)?-[a-z]+-d{1}:)?(d{12}:)?(function:)?([a-zA-Z0-9-_]+)(:($LATEST|[a-zA-Z0-9-_]+))?";
  const re = new RegExp(pattern);

  if (!re.test(name)) {
    console.error(
      `❌ Function name is not valid, it needs to match ${pattern}`,
    );
    return false;
  }
  return true;
};

const isValidNumber = (v, number) => {
  if (!validateDefined(v, number)) {
    return false;
  }

  const num = Number(number);

  if (Number.isInteger(num) && num > 0) {
    return true;
  }

  console.error(`❌ ${v} must be a valid positive integer`);
  return false;
};

const isValidVersion = (v, version) => {
  if (!validateDefined(v, version)) {
    return false;
  }

  if (version.length < 1 || version.length > 1024) {
    console.error(
      `❌ ${v} needs to be between 1 and 1024 characters in length.`,
    );
    return false;
  }

  const pattern = "(\\$LATEST|[0-9]+)";
  const re = new RegExp(pattern);

  if (!re.test(version)) {
    console.error(`❌ ${v} is not valid, it needs to match ${pattern}`);
    return false;
  }
  return true;
};

const validateDefined = (name, value) => {
  if (value === undefined) {
    console.error(`❌ ${name} is undefined`);
    return false;
  }
  return true;
};

exports.isValidAlias = isValidAlias;
exports.isValidFunctionName = isValidFunctionName;
exports.isValidNumber = isValidNumber;
exports.isValidVersion = isValidVersion;
