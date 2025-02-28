import { 
  SSMClient, 
  SendCommandCommand,
  GetCommandInvocationCommand
} from '@aws-sdk/client-ssm';
import type { SendCommandCommandInput } from '@aws-sdk/client-ssm';

/**
 * Initialize a new SSM client
 * @param region AWS region
 * @returns SSM client instance
 */
export function createSsmClient(region: string): SSMClient {
  return new SSMClient({ region });
}

/**
 * Send a command to an EC2 instance
 * @param client SSM client
 * @param instanceId Target EC2 instance ID
 * @param command Command to execute
 * @param options Additional command options
 * @returns Response from SSM SendCommand
 */
export async function sendCommand(
  client: SSMClient, 
  instanceId: string, 
  command: string
) {
  const input: SendCommandCommandInput = {
    DocumentName: 'AWS-RunShellScript',
    InstanceIds: [instanceId],
    Parameters: {
      commands: [command],
    },
  };
  
  return client.send(new SendCommandCommand(input));
}

/**
 * Get the result of a command invocation
 * @param client SSM client
 * @param commandId Command ID from sendCommand
 * @param instanceId Target EC2 instance ID
 * @returns Command invocation result
 */
export async function getCommandInvocation(
  client: SSMClient,
  commandId: string,
  instanceId: string
) {
  return client.send(
    new GetCommandInvocationCommand({
      CommandId: commandId,
      InstanceId: instanceId,
    })
  );
} 