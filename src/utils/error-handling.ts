import { printHeader, printKeyValue } from './formatting';

/**
 * Print an error message with formatted details
 * @param message The main error message
 * @param error The error object
 * @param suggestion Optional suggestion to address the error
 */
export function printError(message: string, error: any, suggestion?: string): void {
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
export function getErrorType(error: any): string {
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
 * Extract and format the most useful information from an error object
 * @param error The error object
 * @returns A formatted error message
 */
export function getFormattedErrorMessage(error: any): string {
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
export function getSuggestion(error: any): string {
  // Network errors
  if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED' || 
      error?.message?.includes('connect')) {
    return "Check your internet connection and VPN status. Ensure you can reach AWS endpoints.";
  }
  
  // Credential errors
  if (error?.message?.includes('credentials') || 
      error?.message?.includes('could not be refreshed')) {
    return "Ensure you have valid AWS credentials configured. Check your environment variables, AWS config files, or use the appropriate credential provider.";
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