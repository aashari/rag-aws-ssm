import { printHeader, printKeyValue } from './formatting';

/**
 * Print an error message
 * @param message The error message
 * @param error The error object
 * @param suggestion The suggestion for resolving the error
 */
export function printError(message: string, error: any, suggestion?: string): void {
  console.error(`\n=== ERROR: ${getErrorType(error)} ===`);
  console.error(`❌ ${message}`);
  
  if (error) {
    console.error(`\n${getFormattedErrorMessage(error)}`);
  }
  
  if (suggestion) {
    console.error(`\n💡 SUGGESTION: ${suggestion}`);
  }
  
  console.error("\n=== END OF ERROR REPORT ===\n");
  
  // Log full error details to debug
  if (process.env.DEBUG) {
    console.error('Debug Error Details:', error);
  }
}

/**
 * Get the type of error
 * @param error The error object
 * @returns The categorized error type
 */
export function getErrorType(error: any): string {
  const errorName = error?.name || '';
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';
  const statusCode = error?.$metadata?.httpStatusCode;
  
  // AWS SSM-specific error types
  if (errorName === 'InvalidInstanceId' || errorMessage.includes('InvalidInstanceId')) {
    return 'AWS SSM Instance Error';
  }
  
  if (errorName === 'InvalidDocument' || errorMessage.includes('InvalidDocument')) {
    return 'AWS SSM Document Error';
  }
  
  if (errorName === 'InvalidParameters' || (errorMessage.includes('parameter') && errorMessage.includes('invalid'))) {
    return 'AWS SSM Parameter Error';
  }
  
  if (errorName === 'AccessDeniedException' || errorMessage.includes('AccessDenied')) {
    return 'AWS IAM Permission Error';
  }
  
  if (errorName === 'ThrottlingException' || errorMessage.includes('throttl')) {
    return 'AWS API Throttling Error';
  }
  
  if (errorName === 'ServiceUnavailable' || statusCode === 503) {
    return 'AWS Service Availability Error';
  }
  
  if (errorName === 'TooManyUpdates' || errorMessage.includes('TooManyUpdates')) {
    return 'AWS Resource Contention Error';
  }
  
  // Generic AWS API error
  if (statusCode) {
    return `AWS SSM API Error (${statusCode})`;
  }
  
  // Network errors
  if (errorCode === 'ENOTFOUND' || errorCode === 'ECONNREFUSED') {
    return 'Network Connectivity Error';
  }
  
  // Credential errors
  if (errorMessage.includes('credentials')) {
    return 'AWS Authentication Error';
  }
  
  // Permission errors
  if (errorMessage.includes('permission')) {
    return 'AWS Permission Error';
  }
  
  // SSM Agent errors
  if (errorMessage.toLowerCase().includes('ssm agent')) {
    return 'SSM Agent Error';
  }
  
  return 'General Operation Error';
}

/**
 * Extract and format the most useful information from an error object
 * @param error The error object
 * @returns A formatted error message
 */
export function getFormattedErrorMessage(error: any): string {
  const errorName = error?.name || '';
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';
  const statusCode = error?.$metadata?.httpStatusCode;
  const requestId = error?.$metadata?.requestId || 'Unknown';
  
  // If it's an AWS SDK error
  if (statusCode) {
    // Format AWS SSM-specific errors with more context
    if (errorName === 'InvalidInstanceId') {
      return `AWS SSM Error (${statusCode}): Instance ID invalid or not managed by SSM. RequestId: ${requestId}`;
    }
    
    if (errorName === 'TooManyUpdates') {
      return `AWS SSM Error (${statusCode}): Too many concurrent updates to AWS resources. RequestId: ${requestId}`;
    }
    
    if (errorName === 'ThrottlingException') {
      return `AWS SSM Error (${statusCode}): API rate limit exceeded. RequestId: ${requestId}`;
    }
    
    if (errorName === 'AccessDeniedException') {
      return `AWS SSM Error (${statusCode}): IAM permissions insufficient for this operation. RequestId: ${requestId}`;
    }
    
    if (errorName === 'InvalidParameters') {
      return `AWS SSM Error (${statusCode}): Invalid parameters in command execution. RequestId: ${requestId}`;
    }
    
    // Generic AWS error format with request ID
    return `AWS Error ${statusCode}: ${errorName} - ${errorMessage}. RequestId: ${requestId}`;
  }
  
  // If it's a network error
  if (errorCode === 'ENOTFOUND' || errorCode === 'ECONNREFUSED') {
    return `Network error: ${errorCode} - ${errorMessage} (Unable to reach AWS SSM endpoints)`;
  }
  
  // For credential errors
  if (errorMessage.includes('credentials')) {
    return `AWS credential error: ${errorMessage} (Check AWS credentials configuration)`;
  }
  
  // For permission errors
  if (errorMessage.includes('permission') || statusCode === 403) {
    return `AWS permission error: ${errorMessage} (IAM policy may be too restrictive)`;
  }
  
  // For SSM agent issues
  if (errorMessage.includes('SSM Agent')) {
    return `SSM Agent error: ${errorMessage} (Agent may need to be installed or restarted)`;
  }
  
  // Default case with more context if possible
  return error?.message || String(error);
}

/**
 * Get a suggestion based on the error
 * @param error The error object
 * @returns A helpful suggestion
 */
export function getSuggestion(error: any): string {
  const errorName = error?.name || '';
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';
  const statusCode = error?.$metadata?.httpStatusCode;

  // AWS SSM-specific errors
  if (errorName === 'InvalidInstanceId' || errorMessage.includes('InvalidInstanceId')) {
    return "The specified instance ID is invalid or the SSM Agent is not running on the instance. Verify the instance ID and check that the SSM Agent is installed, running, and has proper connectivity.";
  }

  if (errorName === 'TooManyUpdates' || errorMessage.includes('TooManyUpdates')) {
    return "Too many concurrent updates to AWS resources. Wait a few minutes and retry your command.";
  }

  if (errorName === 'InvalidDocument' || errorMessage.includes('InvalidDocument')) {
    return "The SSM document specified is invalid. Check document name and ensure it's compatible with the instance's platform.";
  }

  if (errorName === 'InvalidParameters' || errorMessage.includes('parameter') && errorMessage.includes('invalid')) {
    return "One or more parameters provided to the command are invalid. Check parameter format and values.";
  }

  if (errorName === 'UnsupportedPlatformType' || errorMessage.includes('platform') && errorMessage.includes('support')) {
    return "The instance platform is not supported for this operation. Verify instance operating system compatibility.";
  }

  if (errorName === 'AccessDeniedException' || errorMessage.includes('AccessDenied')) {
    return "Access denied. Your IAM user/role needs ssm:SendCommand and ssm:GetCommandInvocation permissions. Check your IAM policy and/or resource-level permissions.";
  }

  if (errorName === 'CommandAlreadyInvoked' || errorMessage.includes('already invoked')) {
    return "The command has already been invoked. Use a new command ID or check the status of the existing command.";
  }

  if (errorName === 'ThrottlingException' || errorMessage.includes('throttl')) {
    return "API request throttling detected. Reduce request frequency or implement exponential backoff in your scripts.";
  }

  if (errorName === 'ServiceUnavailable' || statusCode === 503) {
    return "AWS SSM service is temporarily unavailable. This is usually a transient error - please wait a few minutes and try again.";
  }

  // Network errors
  if (errorCode === 'ENOTFOUND' || errorCode === 'ECONNREFUSED' || 
      errorMessage.includes('connect')) {
    return "Check your internet connection and VPN status. Ensure you can reach AWS SSM endpoints at ssm.[region].amazonaws.com.";
  }
  
  // Credential errors
  if (errorMessage.includes('credentials') || 
      errorMessage.includes('could not be refreshed')) {
    return "Ensure you have valid AWS credentials configured. Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables, ~/.aws/credentials file, or use AWS SSO sign-in.";
  }
  
  // Permission errors
  if (errorMessage.includes('permission') || statusCode === 403) {
    return "You may not have permission to perform this action. Your IAM role/user needs ssm:SendCommand and ssm:GetCommandInvocation permissions, plus EC2 instance resource permissions.";
  }
  
  // Instance-related errors
  if (errorMessage.includes('InstanceId') || errorMessage.includes('Target')) {
    return "Check that the instance ID is correct and the instance is running with SSM Agent installed and registered. Verify in the AWS console under Systems Manager > Fleet Manager.";
  }
  
  // Default suggestion
  return "Check your AWS configuration and try again. For detailed logs, run with AWS_SDK_LOAD_CONFIG=1 and AWS_DEBUG=true environment variables set.";
} 