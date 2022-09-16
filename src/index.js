const aws_calls = require("./aws_calls");
const validations = require("./validations");

const ALIAS = process.env.ALIAS || "alias";
const FUNCTION_NAME = process.env.FUNCTION_NAME || "test";

const GREEN_VERSION = process.env.GREEN_VERSION || "4";

const ROLLOUT_STEPS = process.env.ROLLOUT_STEPS || "5";
const ROLLOUT_TIME_IN_MINUTES = process.env.ROLLOUT_TIME_IN_MINUTES || "10";

async function main() {
  if (!validations.isValidAlias("ALIAS", ALIAS)) {
    return false;
  }

  if (!validations.isValidFunctionName("FUNCTION_NAME", FUNCTION_NAME)) {
    return false;
  }

  const alias = await aws_calls.get_current_alias(FUNCTION_NAME, ALIAS);

  const BLUE_VERSION = process.env.BLUE_VERSION || alias.FunctionVersion;

  if (!validations.isValidVersion("BLUE_VERSION", BLUE_VERSION)) {
    return false;
  }

  if (!validations.isValidVersion("GREEN_VERSION", GREEN_VERSION)) {
    return false;
  }

  const current_version = await aws_calls.get_lambda_by_version(
    FUNCTION_NAME,
    GREEN_VERSION
  );

  if (!current_version) {
    console.error(
      `❌ Your Green version (${GREEN_VERSION}) has not been published`
    );
    return false;
  }

  if (BLUE_VERSION === GREEN_VERSION) {
    console.error(
      `❌ Your Blue version (${BLUE_VERSION}) and Green version (${GREEN_VERSION}) are the same`
    );
    return false;
  }

  if (!validations.isValidNumber("ROLLOUT_STEPS", ROLLOUT_STEPS)) {
    return false;
  }

  if (
    !validations.isValidNumber(
      "ROLLOUT_TIME_IN_MINUTES",
      ROLLOUT_TIME_IN_MINUTES
    )
  ) {
    return false;
  }

  const INTERVAL = ROLLOUT_TIME_IN_MINUTES / ROLLOUT_STEPS;
  const PERCENTAGE = 100 / ROLLOUT_STEPS;

  if (INTERVAL < 1) {
    console.error(
      "❌ Your shift interval is less than 1 minute, please use a larger interval"
    );
    return false;
  }

  const start_time = new Date();

  console.log(
    `🚀 Shifting ${PERCENTAGE.toFixed(
      2
    )}% of traffic, every ${INTERVAL} minute(s), over a total of ${ROLLOUT_TIME_IN_MINUTES} minutes.\n\n`
  );

  for (
    let current_step = 0;
    current_step < parseInt(ROLLOUT_STEPS) + 1;
    current_step++
  ) {
    let shifted = current_step * PERCENTAGE;

    await aws_calls.shift_traffic(
      FUNCTION_NAME,
      ALIAS,
      BLUE_VERSION,
      GREEN_VERSION,
      shifted
    );

    console.log(
      `🟦 Shifted ${shifted.toFixed(2)}% of traffic after ${
        current_step * INTERVAL
      } minute(s). ${
        ROLLOUT_TIME_IN_MINUTES - current_step * INTERVAL
      } minute(s) remaining.`
    );

    if (shifted.toFixed(2) != 100.0) {
      for (let check_step = 0; check_step < INTERVAL; check_step++) {
        let err = await aws_calls.check_errors(
          FUNCTION_NAME,
          ALIAS,
          start_time
        );
        if (err) {
          console.log("ERRORS FOUND");
        }
        await new Promise((res) => setTimeout(res, 60 * 1000));
      }
    }
  }

  console.log(
    `\n\n🟩 Traffic shift completed after ${ROLLOUT_TIME_IN_MINUTES} minute(s) from version ${BLUE_VERSION} to version ${GREEN_VERSION}`
  );
}

main();
