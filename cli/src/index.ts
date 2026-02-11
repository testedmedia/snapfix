#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { debugLoop } from './loop.js';
import { setConfigValue, getConfigValue, loadConfig, REPORTS_DIR } from './config.js';
import { listReports, viewReport } from './report/generator.js';

const program = new Command();

program
  .name('snapfix')
  .description('Paste a broken command. Get it fixed. That\'s it.')
  .version('1.0.0')
  .argument('[command...]', 'The broken command (e.g., npm install)')
  .option('-i, --interactive', 'Ask before applying each fix')
  .option('--max-loops <n>', 'Max fix attempts', '10')
  .option('--ai <provider>', 'AI: ollama (free), groq (free), gemini (free), openai, claude')
  .option('--model <model>', 'AI model override')
  .option('--key <apikey>', 'API key (or use env var)')
  .option('--dry-run', 'Show fixes without applying them')
  .option('--verbose', 'Show full debug details')
  .option('--timeout <ms>', 'Command timeout in ms', '300000')
  .action(async (args: string[], opts) => {
    if (args.length === 0) {
      console.log('');
      console.log(`  ${chalk.hex('#FF6B35').bold('snapfix')} ${chalk.dim('- paste a broken command, get it fixed')}`);
      console.log('');
      console.log(`  ${chalk.white('Usage:')}  snapfix ${chalk.green('"npm install"')}`);
      console.log(`          snapfix ${chalk.green('"pip install tensorflow"')}`);
      console.log(`          snapfix ${chalk.green('"cargo build"')}`);
      console.log('');
      console.log(`  ${chalk.white('Options:')}`);
      console.log(`    ${chalk.yellow('-i')}              Ask before each fix (default: auto-fix)`);
      console.log(`    ${chalk.yellow('--ai ollama')}     Free local AI (default)`);
      console.log(`    ${chalk.yellow('--ai groq')}       Free cloud AI`);
      console.log(`    ${chalk.yellow('--dry-run')}       Show fixes without applying`);
      console.log('');
      return;
    }

    const command = args.join(' ');

    try {
      const session = await debugLoop(command, {
        auto: !opts.interactive,
        maxLoops: parseInt(opts.maxLoops, 10),
        ai: opts.ai || '',
        model: opts.model || '',
        key: opts.key || '',
        report: true,
        verbose: opts.verbose || false,
        dryRun: opts.dryRun || false,
        timeout: parseInt(opts.timeout, 10),
      });

      process.exit(session.status === 'success' ? 0 : 1);
    } catch (err: any) {
      console.error(chalk.red(`\n  Fatal: ${err.message}`));
      process.exit(1);
    }
  });

// Config subcommand
const configCmd = program.command('config').description('Manage configuration');

configCmd
  .command('set <key> <value>')
  .description('Set a config value (e.g., ai.provider, ai.apiKey)')
  .action((key: string, value: string) => {
    setConfigValue(key, value);
    console.log(chalk.green(`  Set ${key} = ${value}`));
  });

configCmd
  .command('get <key>')
  .description('Get a config value')
  .action((key: string) => {
    const val = getConfigValue(key);
    if (val === undefined) {
      console.log(chalk.yellow(`  ${key} is not set`));
    } else {
      console.log(`  ${key} = ${typeof val === 'string' && key.includes('Key') ? val.slice(0, 8) + '...' : val}`);
    }
  });

configCmd
  .command('show')
  .description('Show all config')
  .action(() => {
    const config = loadConfig();
    const display = JSON.parse(JSON.stringify(config));
    if (display.ai?.apiKey) display.ai.apiKey = display.ai.apiKey.slice(0, 8) + '...';
    console.log(JSON.stringify(display, null, 2));
  });

// Report subcommand
const reportCmd = program.command('report').description('View past debug sessions');

reportCmd
  .command('list')
  .description('List past sessions')
  .action(() => {
    const config = loadConfig();
    const reports = listReports(config.report.dir);
    if (reports.length === 0) {
      console.log(chalk.dim('  No reports yet.'));
      return;
    }
    console.log('');
    for (const r of reports.slice(0, 20)) {
      const icon = r.status === 'success' ? '✅' : r.status === 'aborted' ? '⚠️' : '❌';
      console.log(`  ${icon} ${r.date}  ${r.command}`);
    }
    console.log('');
  });

reportCmd
  .command('view <id>')
  .description('View a debug report')
  .action((id: string) => {
    const config = loadConfig();
    const report = viewReport(config.report.dir, id);
    if (!report) {
      console.log(chalk.red(`  Report not found: ${id}`));
      return;
    }
    console.log(report);
  });

program.parse();
