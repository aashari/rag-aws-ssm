import fs from 'fs';
import path from 'path';
import type { CommandOptions, CommandMetadata } from '../types';
import { 
  printInfo, 
  printCommandOutput, 
  formatTimestamp, 
  printError, 
  getSuggestion,
  readLocalFile,
  generateFileTransferCommand
} from '../utils';
import { createSsmClient, sendCommand, getCommandInvocation } from '../services/aws-ssm';

/**
 * Transfer a file to an EC2 instance
 * @param options Command line options
 */
export async function transferFile(options: CommandOptions): Promise<void> {
  const { target, localFile, remoteFile, region, wait, sudo } = options;

  if (!localFile || !remoteFile) {
    printError(
      'Both local and remote file paths are required for file transfer',
      new Error('Missing file path parameters'),
      'Please provide both --local-file and --remote-file options'
    );
    process.exit(1);
  }

  try {
    // Read local file and encode it for transfer
    const fileContent = readLocalFile(localFile);
    
    // Get file stats for reporting
    const stats = fs.statSync(localFile);
    const fileSizeKB = Math.round(stats.size / 1024);
    const fileName = path.basename(localFile);
    
    // Generate the file transfer command
    const transferCommand = generateFileTransferCommand(fileContent, remoteFile, sudo);

    // Display file transfer information
    printInfo('FILE TRANSFER INITIATED', {
      'Source File': localFile,
      'Destination': remoteFile,
      'File Size': `${fileSizeKB} KB`,
      'File Name': fileName,
      'Using Sudo': sudo ? 'Yes (for directory creation and file writing)' : 'No',
      'Target Instance': target,
      'Region': region || 'ap-southeast-1'
    });

    // Create SSM client
    const ssmClient = createSsmClient(region || 'ap-southeast-1');

    // Send the transfer command
    const sendCommandResponse = await sendCommand(ssmClient, target, transferCommand);
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
    printInfo('FILE TRANSFER COMMAND SENT SUCCESSFULLY', {
      'Command ID': commandId,
      'Document Name': 'AWS-RunShellScript',
      'Target Instance': target,
      'Transfer Type': 'Base64 encoded file transfer',
      'Source File': localFile,
      'Destination Path': remoteFile
    });

    if (wait) {
      console.log('Waiting for file transfer to complete...');
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
          printError('Error fetching file transfer status', error, getSuggestion(error));
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
        operation: 'File transfer',
        executionStart: executionStartTime,
        executionEnd: executionEndTime || 'Unknown',
        duration: `${duration.toFixed(2)} seconds`,
        responseTime: responseTime.localTime,
        responseTimeUTC: responseTime.utcTime,
        sourceFile: localFile,
        destinationFile: remoteFile,
        fileSize: `${fileSizeKB} KB`
      };

      // Print file transfer result with metadata
      printCommandOutput(output.trim(), status, metadata);

      if (status !== 'Success') {
        printError(
          `File transfer completed with non-success status: ${status}`,
          { message: `File transfer failed with status: ${status}` },
          'Check the output above for error details. There may be information in the standard error output.'
        );
        process.exit(1);
      } else {
        printInfo('FILE TRANSFER COMPLETED SUCCESSFULLY', {
          'Status': 'Success',
          'Command ID': commandId,
          'Target Instance': target,
          'Duration': `${duration.toFixed(2)} seconds`,
          'Source File': localFile,
          'Destination File': remoteFile
        });
      }
    } else {
      printInfo('SUCCESS - FILE TRANSFER INITIATED', {
        'Message': 'File transfer initiated successfully, but not waiting for results',
        'Command ID': commandId,
        'Target Instance': target,
        'Note': 'To check results later, use AWS console or AWS CLI with the Command ID'
      });
    }
  } catch (error) {
    printError('Error transferring file via SSM', error, getSuggestion(error));
    process.exit(1);
  }
} 