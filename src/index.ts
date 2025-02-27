#!/usr/bin/env bun
import { Command } from 'commander';
import { 
  SSMClient, 
  SendCommandCommand,
  GetCommandInvocationCommand 
} from '@aws-sdk/client-ssm';

const program = new Command();

program
  .name('aws-send-ssm-command')
  .description('Send commands to AWS instances via SSM')
  .version('1.0.0')
  .requiredOption('--target <instanceId>', 'EC2 instance ID')
  .requiredOption('--command <command>', 'Bash command to run')
  .option('--wait', 'Wait for command to complete', true)
  .option('--region <region>', 'AWS region', 'ap-southeast-1');

program.parse();

const options = program.opts();

/**
 * Format the current date and time in human-readable local and UTC ISO formats
 * @returns Object containing formatted local and UTC times
 */
function formatTimestamp() {
  const now = new Date();
  
  // Format local time
  const localOptions: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false
  };
  const localTime = now.toLocaleString(undefined, localOptions);
  
  // Format UTC time
  const utcTime = now.toISOString();
  
  return { localTime, utcTime };
}

/**
 * Print a section header with timestamp
 * @param title The title to display
 */
function printHeader(title: string) {
  const timestamp = formatTimestamp();
  console.log(`\n=== ${title} (${timestamp.localTime}) ===`);
}

/**
 * Print a key-value pair with proper formatting
 * @param key The label or key
 * @param value The value to display
 */
function printKeyValue(key: string, value: string) {
  console.log(`${key.padEnd(20)}: ${value}`);
}

/**
 * Print an info message with details
 * @param title The title of the section
 * @param details Object containing details to print as key-value pairs
 */
function printInfo(title: string, details?: Record<string, string>) {
  printHeader(title);
  
  if (details) {
    Object.entries(details).forEach(([key, value]) => {
      printKeyValue(key, value);
    });
    console.log();
  }
}

/**
 * Print an error message with formatted details
 * @param message The main error message
 * @param error The error object
 * @param suggestion Optional suggestion to address the error
 */
function printError(message: string, error: any, suggestion?: string) {
  printHeader('ERROR');
  console.log(`Error Type: ${getErrorType(error)}`);
  console.log(`Error Message: ${message}`);
  
  // Extract error details
  const errorMessage = getFormattedErrorMessage(error);
  console.log(`Details: ${errorMessage}`);
  
  if (suggestion) {
    console.log(`\nSuggestion: ${suggestion}`);
  }
  
  console.log();
}

/**
 * Get the type of error
 * @param error The error object
 * @returns The categorized error type
 */
function getErrorType(error: any): string {
  if (error?.$metadata?.httpStatusCode) {
    return 'AWS API Error';
  }
  
  if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
    return 'Network Error';
  }
  
  if (error?.message?.includes('credentials')) {
    return 'Authentication Error';
  }
  
  if (error?.message?.includes('permission')) {
    return 'Permission Error';
  }
  
  return 'General Error';
}

/**
 * Print command output with enhanced contextual information
 * @param output The command output
 * @param status The command status
 * @param metadata Additional metadata about the command execution
 */
function printCommandOutput(output: string, status: string, metadata: Record<string, string>) {
  printHeader('COMMAND OUTPUT');
  
  // Print metadata first for better context
  Object.entries(metadata).forEach(([key, value]) => {
    printKeyValue(key, value);
  });
  
  console.log(`\nStatus: ${status}`);
  console.log('-'.repeat(60));
  
  // If output is empty
  if (!output.trim()) {
    console.log('No output returned from command.');
    console.log('This may indicate the command executed successfully without any output,');
    console.log('or that the command failed silently without generating an error.');
  } else {
    // Count lines for context
    const lines = output.trim().split('\n');
    console.log(`Output (${lines.length} lines):`);
    console.log(output.trim());
  }
  
  console.log('-'.repeat(60));
  console.log();
}

/**
 * Extract and format the most useful information from an error object
 * @param error The error object
 * @returns A formatted error message
 */
function getFormattedErrorMessage(error: any): string {
  // If it's an AWS SDK error
  if (error?.$metadata?.httpStatusCode) {
    return `AWS Error ${error.$metadata.httpStatusCode}: ${error.name} - ${error.message}`;
  }
  
  // If it's a network error
  if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
    return `Network error: ${error.code} - ${error.message}`;
  }
  
  // For credential errors
  if (error?.message?.includes('credentials')) {
    return `Credential error: ${error.message}`;
  }
  
  // For permission errors
  if (error?.message?.includes('permission') || error?.$metadata?.httpStatusCode === 403) {
    return `Permission error: ${error.message}`;
  }
  
  // Default case
  return error?.message || String(error);
}

/**
 * Get a suggestion based on the error
 * @param error The error object
 * @returns A helpful suggestion
 */
function getSuggestion(error: any): string {
  // Network errors
  if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED' || 
      error?.message?.includes('connect')) {
    return "Check your internet connection and VPN status. Ensure you can reach AWS endpoints.";
  }
  
  // Credential errors
  if (error?.message?.includes('credentials') || 
      error?.message?.includes('could not be refreshed')) {
    return "Try running 'aws sso login' to refresh your credentials, or check your AWS config.";
  }
  
  // Permission errors
  if (error?.message?.includes('permission') || error?.$metadata?.httpStatusCode === 403) {
    return "You may not have permission to perform this action. Verify your IAM permissions.";
  }
  
  // Instance-related errors
  if (error?.message?.includes('InstanceId') || error?.message?.includes('Target')) {
    return "Check that the instance ID is correct and the instance is running with SSM installed.";
  }
  
  // Default suggestion
  return "Check AWS CLI configuration and try again. Run with AWS_DEBUG=true for more details.";
}

async function main() {
  const { target, command, region, wait } = options;
  
  // Get current timestamp for command send
  const sendTime = formatTimestamp();
  printInfo('SENDING COMMAND', {
    'Target EC2 Instance': target,
    'AWS Region': region,
    'Local Time': sendTime.localTime,
    'UTC Time': sendTime.utcTime,
    'Command': command,
    'Wait for completion': wait ? 'Yes' : 'No'
  });
  
  let ssmClient: SSMClient;
  
  try {
    ssmClient = new SSMClient({ region });
  } catch (error) {
    printError('Failed to initialize AWS SDK client', error, getSuggestion(error));
    process.exit(1);
  }
  
  try {
    // Send the command to the instance
    const sendCommandResponse = await ssmClient.send(
      new SendCommandCommand({
        DocumentName: 'AWS-RunShellScript',
        InstanceIds: [target],
        Parameters: {
          commands: [command],
        },
      })
    );
    
    const commandId = sendCommandResponse.Command?.CommandId;
    
    if (!commandId) {
      printError('Failed to get Command ID from response', 
                { message: 'Command ID was not returned in the response' }, 
                'This could be an AWS service issue. Try again later or check the AWS SSM service status.');
      process.exit(1);
    }
    
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
          const invocationResult = await ssmClient.send(
            new GetCommandInvocationCommand({
              CommandId: commandId,
              InstanceId: target,
            })
          );
          
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
      
      // Print the command output with enhanced metadata
      printCommandOutput(output.trim(), status, {
        'Command ID': commandId,
        'Target Instance': target,
        'Execution Start': executionStartTime,
        'Execution End': executionEndTime || 'Unknown',
        'Duration': `${duration.toFixed(2)} seconds`,
        'Response Time': responseTime.localTime,
        'Response Time UTC': responseTime.utcTime
      });
      
      if (status !== 'Success') {
        printError(`Command completed with non-success status: ${status}`, 
                  { message: `The command execution failed with status: ${status}` },
                  'Check the output above for error details. There may be information in the standard error output.');
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
      printInfo('SUCCESS - COMMAND SENT', {
        'Message': 'Command sent successfully, but not waiting for results',
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

main(); 