import { spawnSync } from 'node:child_process';

const lessonArg = process.argv.find(arg => arg.startsWith('--lesson='));
const steps = [
  ['scripts/assets/auditImages.mjs', lessonArg],
  ['scripts/assets/optimizeImages.mjs', lessonArg],
  ['scripts/assets/verifyImages.mjs', lessonArg],
].map(args => args.filter(Boolean));

for (const args of steps) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
