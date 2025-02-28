/**
 * Types for rag-aws-ssm-command
 */

export interface CommandOptions {
  target: string;
  command?: string;
  localFile?: string;
  remoteFile?: string;
  sudo?: boolean;
  wait?: boolean;
  region?: string;
}

export interface FormattedTimestamp {
  localTime: string;
  utcTime: string;
}

export interface CommandMetadata {
  commandId: string;
  targetInstance: string;
  operation: string;
  executionStart: string;
  executionEnd: string;
  duration: string;
  responseTime: string;
  responseTimeUTC: string;
  [key: string]: string;
} 