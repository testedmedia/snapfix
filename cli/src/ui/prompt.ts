import chalk from 'chalk';
import { createInterface } from 'readline';

export type UserAction = 'apply' | 'skip' | 'edit' | 'quit';

export async function askApproval(): Promise<UserAction> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    const prompt = `  ${chalk.white.bold('[A]')}pply  ${chalk.white.bold('[S]')}kip  ${chalk.white.bold('[E]')}dit  ${chalk.white.bold('[Q]')}uit  `;
    rl.question(prompt, (answer) => {
      rl.close();
      const a = answer.trim().toLowerCase();
      if (a === 'a' || a === 'apply' || a === 'y' || a === 'yes' || a === '') {
        resolve('apply');
      } else if (a === 's' || a === 'skip' || a === 'n') {
        resolve('skip');
      } else if (a === 'e' || a === 'edit') {
        resolve('edit');
      } else if (a === 'q' || a === 'quit' || a === 'x') {
        resolve('quit');
      } else {
        resolve('apply'); // Default to apply
      }
    });
  });
}

export async function getCustomCommand(): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question(`  ${chalk.hex('#FF6B35')('>')} Enter fix command: `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
