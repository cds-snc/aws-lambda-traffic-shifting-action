const rollout = require("./rollout");

const ALIAS = process.env.ALIAS;
const FUNCTION_NAME = process.env.FUNCTION_NAME;
const BLUE_VERSION = process.env.BLUE_VERSION || false;
const GREEN_VERSION = process.env.GREEN_VERSION;
const ROLLOUT_STEPS = process.env.ROLLOUT_STEPS;
const ROLLOUT_TIME_IN_MINUTES = process.env.ROLLOUT_TIME_IN_MINUTES;

async function main() {
  const result = await rollout.rollout(
    ALIAS,
    FUNCTION_NAME,
    BLUE_VERSION,
    GREEN_VERSION,
    ROLLOUT_STEPS,
    ROLLOUT_TIME_IN_MINUTES,
  );
  if (result) {
    process.exit(0);
  }
  process.exit(1);
}

main();
