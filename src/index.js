const spawn = require('cross-spawn');

const AVAILABLE_COMMANDS = [
  'test',
  'lint',
  'format',
  'build',
  'commit',
  'release',
  'commitmsg',
  'precommit',
];

const [, , command, ...extraOptions] = process.argv;

if (!AVAILABLE_COMMANDS.includes(command)) {
  // eslint-disable-next-line no-console
  console.log(
    `error: unknown command "${command}". Available commands: ${AVAILABLE_COMMANDS.join(
      ', ',
    )}`,
  );
  process.exit(1);
}

runCommand(command, extraOptions);

function runCommand(cmd, opts = []) {
  // Attempt to strt the script with the passed node arguments
  const args = ['--no-install', 'web-scripts', cmd, ...opts];
  const result = spawn.sync('npx', args, {
    stdio: 'inherit',
  });

  if (result.signal) {
    handleSignal(result);
  } else {
    process.exit(result.status);
  }
}

function handleSignal(result) {
  if (result.signal === 'SIGKILL') {
    // eslint-disable-next-line no-console
    console.log(
      `The script "${command}" failed because the process exited too early. ` +
        'This probably means the system ran out of memory or someone called ' +
        '`kill -9` on the process.',
    );
  } else if (result.signal === 'SIGTERM') {
    // eslint-disable-next-line no-console
    console.log(
      `The script "${command}" failed because the process exited too early. ` +
        'Someone might have called `kill` or `killall`, or the system could ' +
        'be shutting down.',
    );
  }
  process.exit(1);
}
