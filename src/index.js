const rollout = require("./rollout");

const ALIAS = process.env.ALIAS || "alias";
const FUNCTION_NAME = process.env.FUNCTION_NAME || "test";
const BLUE_VERSION = process.env.BLUE_VERSION || "1";
const GREEN_VERSION = process.env.GREEN_VERSION || "4";
const ROLLOUT_STEPS = process.env.ROLLOUT_STEPS || "2";
const ROLLOUT_TIME_IN_MINUTES = process.env.ROLLOUT_TIME_IN_MINUTES || "10";

async function main() {
  await rollout.rollout(
    ALIAS,
    FUNCTION_NAME,
    BLUE_VERSION,
    GREEN_VERSION,
    ROLLOUT_STEPS,
    ROLLOUT_TIME_IN_MINUTES
  );
}

main();
