#!/usr/bin/env bun
import { Command } from 'commander';
import type { CommandOptions } from './types';
import { executeCommand } from './commands/execute-command';
import { transferFile } from './commands/transfer-file';
import { printError } from './utils/error-handling';

const program = new Command();

program
  .name('aws-send-ssm-command')
  .description('Send commands to AWS instances via SSM')
  .version('1.2.2')
  .requiredOption('--target <instanceId>', 'EC2 instance ID')
  .option('--command <command>', 'Bash command to run')
  .option('--local-file <path>', 'Local file to upload to the instance')
  .option('--remote-file <path>', 'Remote path where the file should be saved')
  .option('--sudo', 'Run commands or file operations with sudo privileges')
  .option('--wait', 'Wait for command to complete', true)
  .option('--region <region>', 'AWS region', 'ap-southeast-1');

// Add help text with examples
program.addHelpText('after', `
Examples:
  To run a command:
    $ aws-send-ssm-command --target i-0123456789abcdef0 --command "df -h"

  To transfer a file:
    $ aws-send-ssm-command --target i-0123456789abcdef0 --local-file ./myfile.txt --remote-file /home/ec2-user/myfile.txt

  To run a command with sudo:
    $ aws-send-ssm-command --target i-0123456789abcdef0 --command "apt update" --sudo

  To transfer a file to a protected directory:
    $ aws-send-ssm-command --target i-0123456789abcdef0 --local-file ./nginx.conf --remote-file /etc/nginx/nginx.conf --sudo
`);

program.parse();

// Convert Commander.js options to our CommandOptions type
const options: CommandOptions = program.opts();

/**
 * Validate command line options
 * @param options The command line options
 * @returns true if options are valid, otherwise false
 */
function validateOptions(options: CommandOptions): boolean {
  const { command, localFile, remoteFile } = options;

  // Ensure either command or both local-file and remote-file are provided
  if (!command && !(localFile && remoteFile)) {
    printError(
      'Invalid command options',
      new Error('Missing required parameters'),
      'You must provide either --command OR both --local-file and --remote-file'
    );
    return false;
  }

  // Ensure command and file transfer options are not mixed
  if (command && (localFile || remoteFile)) {
    printError(
      'Invalid command options',
      new Error('Conflicting parameters'),
      'You must provide either --command OR --local-file/--remote-file, not both'
    );
    return false;
  }

  // If one file path is provided, the other must also be provided
  if ((localFile && !remoteFile) || (!localFile && remoteFile)) {
    printError(
      'Invalid file transfer options',
      new Error('Incomplete file transfer parameters'),
      'When using file transfer, both --local-file and --remote-file must be provided'
    );
    return false;
  }

  return true;
}

async function main() {
  // Validate command line options
  if (!validateOptions(options)) {
    process.exit(1);
  }

  try {
    if (options.command) {
      // Execute a command
      await executeCommand(options);
    } else if (options.localFile && options.remoteFile) {
      // Transfer a file
      await transferFile(options);
    }
  } catch (error) {
    printError('Failed to complete operation', error, 'Check your inputs and AWS configuration');
    process.exit(1);
  }
}

main(); 