#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { debugLoop } from './loop.js';
import { setConfigValue, getConfigValue, loadConfig, REPORTS_DIR } from './config.js';
import { listReports, viewReport } from './report/generator.js';

const program = new Command();

program
  .name('snapfix')
  .description('Autopilot for installation debugging. Stop screenshotting errors.')
  .version('1.0.0')
  .argument('[command...]', 'Command to debug (e.g., npm install)')
  .option('--auto', 'Auto-apply fixes without confirmation')
  .option('--max-loops <n>', 'Maximum debug iterations', '25')
  .option('--ai <provider>', 'AI provider: claude, openai, ollama')
  .option('--model <model>', 'AI model to use')
  .option('--key <apikey>', 'API key (or use config/env)')
  .option('--report', 'Generate debug report after session')
  .option('--verbose', 'Show full AI reasoning')
  .option('--dry-run', 'Show AI suggestions without applying')
  .option('--timeout <ms>', 'Command timeout in ms', '300000')
  .action(async (args: string[], opts) => {
    if (args.length === 0) {
      program.help();
      return;
    }

    const command = args.join(' ');

    try {
      const session = await debugLoop(command, {
        auto: opts.auto || false,
        maxLoops: parseInt(opts.maxLoops, 10),
        ai: opts.ai || '',
        model: opts.model || '',
        key: opts.key || '',
        report: opts.report || false,
        verbose: opts.verbose || false,
        dryRun: opts.dryRun || false,
        timeout: parseInt(opts.timeout, 10),
      });

      // Exit with appropriate code
      process.exit(session.status === 'success' ? 0 : 1);
    } catch (err: any) {
      console.error(chalk.red(`\n  Fatal error: ${err.message}`));
      process.exit(1);
    }
  });

// Config subcommand
const configCmd = program.command('config').description('Manage configuration');

configCmd
  .command('set <key> <value>')
  .description('Set a config value (e.g., ai.apiKey, ai.provider, loop.maxLoops)')
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
  .description('Show all config (keys masked)')
  .action(() => {
    const config = loadConfig();
    const display = JSON.parse(JSON.stringify(config));
    if (display.ai?.apiKey) display.ai.apiKey = display.ai.apiKey.slice(0, 8) + '...';
    console.log(JSON.stringify(display, null, 2));
  });

// Report subcommand
const reportCmd = program.command('report').description('Manage debug reports');

reportCmd
  .command('list')
  .description('List past debug sessions')
  .action(() => {
    const config = loadConfig();
    const reports = listReports(config.report.dir);
    if (reports.length === 0) {
      console.log(chalk.dim('  No reports yet. Run a debug session first.'));
      return;
    }
    console.log('');
    console.log(`  ${chalk.bold('ID')}        ${chalk.bold('Date')}                  ${chalk.bold('Status')}    ${chalk.bold('Command')}`);
    for (const r of reports.slice(0, 20)) {
      const statusColor = r.status === 'success' ? chalk.green : r.status === 'aborted' ? chalk.yellow : chalk.red;
      console.log(`  ${r.id}  ${r.date.padEnd(22)}  ${statusColor(r.status.padEnd(10))}${r.command}`);
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
