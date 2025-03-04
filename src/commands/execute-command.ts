import fs from 'fs';
import path from 'path';
import type { CommandOptions, CommandMetadata } from '../types';
import { printInfo, printCommandOutput, formatTimestamp, printError, getSuggestion } from '../utils';
import { createSsmClient, sendCommand, getCommandInvocation } from '../services/aws-ssm';

/**
 * Execute a command on an EC2 instance
 * @param options Command line options
 */
export async function executeCommand(options: CommandOptions): Promise<void> {
  const { target, command, region, wait, sudo } = options;

  if (!command) {
    printError(
      'Command is required for command execution',
      new Error('Missing command parameter'),
      'Please provide a command using the --cmd option'
    );
    process.exit(1);
  }

  // If sudo flag is provided, prefix the command with sudo if needed
  const trimmedCommand = command.trim();
  const alreadyHasSudo = trimmedCommand.startsWith('sudo ');
  const effectiveCommand = sudo && !alreadyHasSudo ? `sudo ${command}` : command;

  // Determine sudo status message
  let sudoStatusMessage: string;
  if (alreadyHasSudo && sudo) {
    sudoStatusMessage = 'Yes (in command and via flag)';
  } else if (alreadyHasSudo) {
    sudoStatusMessage = 'Yes (in command)';
  } else if (sudo) {
    sudoStatusMessage = 'Yes (via flag)';
  } else {
    sudoStatusMessage = 'No';
  }

  // Display command information
  printInfo('SENDING COMMAND', {
    'Target Instance': target,
    'Region': region || 'ap-southeast-1',
    'Command': effectiveCommand,
    'Using Sudo': sudoStatusMessage
  });

  try {
    // Create SSM client
    const ssmClient = createSsmClient(region || 'ap-southeast-1');

    // Send the command
    const sendCommandResponse = await sendCommand(ssmClient, target, effectiveCommand);
    const commandId = sendCommandResponse.Command?.CommandId;

    if (!commandId) {
      printError(
        'Failed to get Command ID from response',
        { message: 'Command ID was not returned in the response' },
        'This could be an AWS service issue. Try again later or check the AWS SSM service status.'
      );
      process.exit(1);
    }

    // Command sent successfully
    printInfo('COMMAND SENT SUCCESSFULLY', {
      'Command ID': commandId,
      'Document Name': 'AWS-RunShellScript',
      'Target Instance': target
    });

    if (wait) {
      console.log('Waiting for the result of the command execution...');
      console.log('The system is polling AWS SSM service for command completion...\n');

      // Poll for command completion
      let status = 'Pending';
      let output = '';
      let executionStartTime = new Date().toISOString();
      let executionEndTime: string | null = null;
      let duration = 0;

      const startPollTime = Date.now();

      while (['Pending', 'InProgress'].includes(status)) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
          const invocationResult = await getCommandInvocation(ssmClient, commandId, target);
          
          status = invocationResult.Status || 'Unknown';
          
          if (invocationResult.ExecutionStartDateTime) {
            executionStartTime = invocationResult.ExecutionStartDateTime;
          }
          
          if (invocationResult.ExecutionEndDateTime) {
            executionEndTime = invocationResult.ExecutionEndDateTime;
          }
          
          if (invocationResult.StandardOutputContent) {
            output = invocationResult.StandardOutputContent;
          }
          
          // If there's an error output, capture it
          if (invocationResult.StandardErrorContent) {
            output += '\n\n--- Standard Error ---\n' + invocationResult.StandardErrorContent;
          }
        } catch (error) {
          printError('Error fetching command status', error, getSuggestion(error));
          process.exit(1);
        }
      }

      // Calculate duration
      const endPollTime = Date.now();
      duration = (endPollTime - startPollTime) / 1000;

      // Get current timestamp for response received
      const responseTime = formatTimestamp();

      // Create metadata for command output
      const metadata: CommandMetadata = {
        commandId,
        targetInstance: target,
        operation: 'Command execution',
        executionStart: executionStartTime,
        executionEnd: executionEndTime || 'Unknown',
        duration: `${duration.toFixed(2)} seconds`,
        responseTime: responseTime.localTime,
        responseTimeUTC: responseTime.utcTime
      };

      // Print command output with metadata
      printCommandOutput(output.trim(), status, metadata);

      if (status !== 'Success') {
        printError(
          `Command execution completed with non-success status: ${status}`,
          { message: `Command execution failed with status: ${status}` },
          'Check the output above for error details. There may be information in the standard error output.'
        );
        process.exit(1);
      } else {
        printInfo('EXECUTION COMPLETED SUCCESSFULLY', {
          'Status': 'Success',
          'Command ID': commandId,
          'Target Instance': target,
          'Duration': `${duration.toFixed(2)} seconds`,
          'Output Length': `${output.trim().length} characters`
        });
      }
    } else {
      printInfo('SUCCESS - COMMAND INITIATED', {
        'Message': 'Command initiated successfully, but not waiting for results',
        'Command ID': commandId,
        'Target Instance': target,
        'Note': 'To check results later, use AWS console or AWS CLI with the Command ID'
      });
    }
  } catch (error) {
    printError('Error executing SSM command', error, getSuggestion(error));
    process.exit(1);
  }
} 