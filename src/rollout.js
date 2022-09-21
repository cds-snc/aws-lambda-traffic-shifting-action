const aws_calls = require("./aws_calls");
const validations = require("./validations");

const rollout = async (
  alias,
  function_name,
  blue_version,
  green_version,
  rollout_steps,
  rollout_time_in_minutes
) => {
  if (!validations.isValidAlias("alias", alias)) {
    return false;
  }

  if (!validations.isValidFunctionName("function_name", function_name)) {
    return false;
  }

  const aliased_function = await aws_calls.get_current_alias(
    function_name,
    alias
  );

  blue_version = blue_version || aliased_function.FunctionVersion;

  if (!validations.isValidVersion("blue_version", blue_version)) {
    return false;
  }

  if (!validations.isValidVersion("green_version", green_version)) {
    return false;
  }

  const current_version = await aws_calls.get_lambda_by_version(
    function_name,
    green_version
  );

  if (!current_version) {
    console.error(
      `❌ Your Green version (${green_version}) has not been published`
    );
    return false;
  }
  if (blue_version == green_version) {
    console.error(
      `❌ Your Blue version (${blue_version}) and Green version (${green_version}) are the same`
    );
    return false;
  }

  if (!validations.isValidNumber("rollout_steps", rollout_steps)) {
    return false;
  }

  if (
    !validations.isValidNumber(
      "rollout_time_in_minutes",
      rollout_time_in_minutes
    )
  ) {
    return false;
  }

  const INTERVAL = rollout_time_in_minutes / rollout_steps;
  const REMAINDER = rollout_time_in_minutes % rollout_steps;
  const PERCENTAGE = 100 / rollout_steps;

  if (INTERVAL < 1) {
    console.error(
      "❌ Your shift interval (roll out time in minutes / rollout steps) is less than 1 minute, please use a larger interval"
    );
    return false;
  }

  if (REMAINDER != 0) {
    console.error(
      `❌ Your shift interval (roll out time in minutes / rollout steps) needs to be an integer. Currently it is ${REMAINDER}`
    );
    return false;
  }

  const start_time = new Date();

  console.log(
    `🚀 Shifting ${PERCENTAGE.toFixed(
      2
    )}% of traffic, every ${INTERVAL} minute(s), over a total of ${rollout_time_in_minutes} minutes.\n\n`
  );

  for (
    let current_step = 0;
    current_step < parseInt(rollout_steps) + 1;
    current_step++
  ) {
    let shifted = current_step * PERCENTAGE;

    await aws_calls.shift_traffic(
      function_name,
      alias,
      blue_version,
      green_version,
      shifted
    );

    console.log(
      `🟦 Shifted ${shifted.toFixed(2)}% of traffic after ${
        current_step * INTERVAL
      } minute(s). ${
        rollout_time_in_minutes - current_step * INTERVAL
      } minute(s) remaining.`
    );

    if (shifted.toFixed(2) != 100.0) {
      for (let check_step = 0; check_step < INTERVAL; check_step++) {
        let err = await aws_calls.check_errors(
          function_name,
          alias,
          start_time
        );
        if (err) {
          console.error(
            `🟥 An error was detected in Cloudwatch, rolling back to version ${blue_version}`
          );
          await aws_calls.shift_traffic(
            function_name,
            alias,
            green_version,
            blue_version,
            100
          );
          return false;
        }
        const process_tick = process.env.PROCESS_TICK || 1;
        await new Promise((res) => setTimeout(res, 60 * 1000 * process_tick));
      }
    }
  }

  console.log(
    `\n\n🟩 Traffic shift completed after ${rollout_time_in_minutes} minute(s) from version ${blue_version} to version ${green_version} for alias ${alias}`
  );
  return true;
};

exports.rollout = rollout;
