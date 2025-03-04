#!/usr/bin/env bun
import { Command } from 'commander';
import type { CommandOptions } from './types';
import { executeCommand } from './commands/execute-command';
import { transferFile } from './commands/transfer-file';
import { printError } from './utils/error-handling';

const program = new Command();

program
  .name('rag-aws-ssm')
  .description('A utility for AWS SSM command execution and file transfer, part of the RAG tool suite')
  .version('3.1.0');

// Command subcommand
program
  .command('command')
  .description('Execute a shell command on an EC2 instance via SSM')
  .requiredOption('--target <instanceId>', 'EC2 instance ID')
  .requiredOption('--cmd <command>', 'Bash command to run')
  .option('--sudo', 'Run commands with sudo privileges')
  .option('--background', 'Run command without waiting for completion')
  .option('--region <region>', 'AWS region', 'ap-southeast-1')
  .action(async (options) => {
    try {
      const cmdOptions: CommandOptions = {
        target: options.target,
        command: options.cmd,
        sudo: options.sudo,
        wait: !options.background,
        region: options.region
      };
      await executeCommand(cmdOptions);
    } catch (error) {
      printError('Failed to execute command', error, 'Check your inputs and AWS configuration');
      process.exit(1);
    }
  });

// Copy subcommand
program
  .command('copy')
  .description('Transfer a file to an EC2 instance via SSM')
  .requiredOption('--target <instanceId>', 'EC2 instance ID')
  .requiredOption('--local <path>', 'Local file to upload to the instance')
  .requiredOption('--remote <path>', 'Remote path where the file should be saved')
  .option('--sudo', 'Use sudo privileges for file operations')
  .option('--background', 'Run file transfer without waiting for completion')
  .option('--region <region>', 'AWS region', 'ap-southeast-1')
  .action(async (options) => {
    try {
      const cmdOptions: CommandOptions = {
        target: options.target,
        localFile: options.local,
        remoteFile: options.remote,
        sudo: options.sudo,
        wait: !options.background,
        region: options.region
      };
      await transferFile(cmdOptions);
    } catch (error) {
      printError('Failed to transfer file', error, 'Check your inputs and AWS configuration');
      process.exit(1);
    }
  });

// Add help text with examples
program.addHelpText('after', `
Examples:
  To run a command:
    $ rag-aws-ssm command --target i-0123456789abcdef0 --cmd "df -h"

  To transfer a file:
    $ rag-aws-ssm copy --target i-0123456789abcdef0 --local ./myfile.txt --remote /home/ec2-user/myfile.txt

  To run a command with sudo:
    $ rag-aws-ssm command --target i-0123456789abcdef0 --cmd "apt update" --sudo

  To transfer a file to a protected directory:
    $ rag-aws-ssm copy --target i-0123456789abcdef0 --local ./nginx.conf --remote /etc/nginx/nginx.conf --sudo
`);

program.parse(); 