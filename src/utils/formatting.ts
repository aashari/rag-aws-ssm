import type { FormattedTimestamp } from '../types';

/**
 * Format the current date and time in human-readable local and UTC ISO formats
 * @returns Object containing formatted local and UTC times
 */
export function formatTimestamp(): FormattedTimestamp {
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
export function printHeader(title: string): void {
  const timestamp = formatTimestamp();
  console.log(`\n=== ${title} (${timestamp.localTime}) ===`);
}

/**
 * Print a key-value pair with proper formatting
 * @param key The label or key
 * @param value The value to display
 */
export function printKeyValue(key: string, value: string): void {
  console.log(`${key.padEnd(20)}: ${value}`);
}

/**
 * Print an info message with details
 * @param title The title of the section
 * @param details Object containing details to print as key-value pairs
 */
export function printInfo(title: string, details?: Record<string, string>): void {
  printHeader(title);
  
  if (details) {
    Object.entries(details).forEach(([key, value]) => {
      printKeyValue(key, value);
    });
    console.log();
  }
}

/**
 * Print command output with enhanced contextual information
 * @param output The command output
 * @param status The command status
 * @param metadata Additional metadata about the command execution
 */
export function printCommandOutput(output: string, status: string, metadata: Record<string, string>): void {
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