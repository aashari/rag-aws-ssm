# AWS Send SSM Command

## Overview

**AWS Send SSM Command** is a CLI tool for executing shell commands and transferring files to AWS EC2 instances via AWS Systems Manager (SSM). It produces clear, structured, and timestamped output optimized for both human readability and AI systems.

## Features

- Remote command execution on SSM-enabled EC2 instances
- File transfer from local machine to remote EC2 instances
- Structured output with timestamps for command submission, execution, and results
- Enhanced metadata including execution times, duration, and output details
- Robust error handling with actionable troubleshooting suggestions
- AWS SSO integration for multi-account access
- AI-friendly output format

## Prerequisites

- [Bun runtime](https://bun.sh/) installed
- AWS credentials configured (SSO, credentials file, or environment variables)
- EC2 instances with SSM agent installed and running
- IAM permissions for SSM:StartSession and SSM:SendCommand

## Installation

### Local Installation

```bash
# Clone the repository
git clone <https://github.com/aashari/aws-send-ssm-command.git>

# Navigate to the project directory
cd aws-send-ssm-command

# Install dependencies
bun install
```

### Global Installation

```bash
# Clone and navigate to repository
git clone <https://github.com/aashari/aws-send-ssm-command.git>
cd aws-send-ssm-command

# Install dependencies and link globally
bun install
bun link

# Now available globally
aws-send-ssm-command --help
```

## Usage

### Command Syntax

```
# For command execution:
aws-send-ssm-command --target <instance-id> --command "<bash-command>" [options]

# For file transfer:
aws-send-ssm-command --target <instance-id> --local-file <local-file-path> --remote-file <remote-file-path> [options]
```

### Required Parameters

| Parameter | Description | Example |
| --- | --- | --- |
| `--target` | EC2 instance ID to target | `i-0123456789abcdef0` |
| `--command` | Bash command to execute (in quotes) - Required for command execution | `"ps aux \| grep nginx"` |
| `--local-file` | Path to local file to transfer - Required for file transfer | `./config.json` |
| `--remote-file` | Destination path on remote instance - Required for file transfer | `/home/ec2-user/config.json` |

### Optional Parameters

| Parameter | Description | Default | Example |
| --- | --- | --- | --- |
| `--region` | AWS region for the operation | `ap-southeast-1` | `us-east-1` |
| `--sudo` | Use sudo for commands/files | `false` | `--sudo` |
| `--wait` | Wait for command completion | `true` | `false` |
| `--timeout` | Command timeout in seconds | `600` | `1800` |
| `--output-format` | Output format (json, text) | `text` | `json` |
| `--comment` | Add a comment to the command | - | `"Monthly maintenance"` |

### Basic Examples

```bash
# Check disk space
aws-send-ssm-command --target i-0123456789abcdef0 --command "df -h"

# View top processes
aws-send-ssm-command --target i-0123456789abcdef0 --command "ps aux | sort -rk 3,3 | head -n 10"

# Check system load
aws-send-ssm-command --target i-0123456789abcdef0 --command "uptime && free -m && vmstat 1 3"

# Transfer a configuration file
aws-send-ssm-command --target i-0123456789abcdef0 --local-file ./config.json --remote-file /home/ec2-user/config.json

# Transfer a script and make it executable
aws-send-ssm-command --target i-0123456789abcdef0 --local-file ./setup.sh --remote-file /home/ec2-user/setup.sh
aws-send-ssm-command --target i-0123456789abcdef0 --command "chmod +x /home/ec2-user/setup.sh && /home/ec2-user/setup.sh"
```

### Advanced Examples

```bash
# Run a multi-line command
aws-send-ssm-command --target i-0123456789abcdef0 --command "
find /var/log -name \\"*.log\\" -mtime -1 |
while read file; do
  echo \\"=== \\$file ===\\";
  grep ERROR \\$file | tail -n 5;
done
"

# Execute with specific timeout
aws-send-ssm-command --target i-0123456789abcdef0 --command "yum update -y" --timeout 3600

# Get JSON output for automation
aws-send-ssm-command --target i-0123456789abcdef0 --command "systemctl status nginx" --output-format json
```

### AWS SSO Integration

```bash
# Using specific role via AWS SSO
aws-sso-util run-as --account-id 123456789012 --role-name AdminRole -- \\
  aws-send-ssm-command --target i-0123456789abcdef0 --command "whoami"

# Using saved profile for file transfer
aws-sso-util run-as --profile my-aws-profile -- \\
  aws-send-ssm-command --target i-0123456789abcdef0 --local-file ./app.config --remote-file /var/www/html/app.config
```

## Output Format

The tool produces clearly structured output with the following sections:

### For Command Execution

#### 1. Command Initiation

```
=== SENDING COMMAND (Feb 27, 2025 at 23:01:42) ===
Target Instance: i-0123456789abcdef0
Region: ap-southeast-1
Command: df -h
```

### 2. Command Confirmation

```
=== COMMAND SENT SUCCESSFULLY (Feb 27, 2025 at 23:01:43) ===
Command ID: 12345678-1234-1234-1234-123456789012
```

### 3. Command Output

```
=== COMMAND OUTPUT (Feb 27, 2025 at 23:01:44) ===
Status: Success
Started: Feb 27, 2025 at 23:01:43
Ended: Feb 27, 2025 at 23:01:44
Duration: 1.2 seconds

Filesystem      Size  Used Avail Use% Mounted on
/dev/xvda1       50G   12G   38G  24% /
/dev/xvdf       100G   23G   77G  23% /data
```

### 4. Execution Summary

```
=== EXECUTION COMPLETED SUCCESSFULLY (Feb 27, 2025 at 23:01:44) ===
Status: Success
Duration: 1.2 seconds
Output Size: 189 bytes
```

### For File Transfer

#### 1. File Transfer Initiation

```
=== SENDING FILE TRANSFER (Feb 27, 2025 at 23:01:42) ===
Target Instance: i-0123456789abcdef0
Region: ap-southeast-1
Source File: ./config.json
Destination: /home/ec2-user/config.json
File Size: 1.25 KB
```

#### 2. File Transfer Confirmation

```
=== FILE TRANSFER SENT SUCCESSFULLY (Feb 27, 2025 at 23:01:43) ===
Command ID: 12345678-1234-1234-1234-123456789012
Transfer Type: Base64 encoded file transfer
Source File: ./config.json
Destination Path: /home/ec2-user/config.json
```

#### 3. File Transfer Result

```
=== FILE TRANSFER RESULT (Feb 27, 2025 at 23:01:44) ===
Status: Success
Started: Feb 27, 2025 at 23:01:43
Ended: Feb 27, 2025 at 23:01:44
Duration: 1.2 seconds

File successfully transferred to /home/ec2-user/config.json
-rw-r--r-- 1 ec2-user ec2-user 1280 Feb 27 23:01 /home/ec2-user/config.json
```

#### 4. File Transfer Summary

```
=== FILE TRANSFER COMPLETED SUCCESSFULLY (Feb 27, 2025 at 23:01:44) ===
Status: Success
Command ID: 12345678-1234-1234-1234-123456789012
Target Instance: i-0123456789abcdef0
Duration: 1.2 seconds
Source File: ./config.json
Destination File: /home/ec2-user/config.json
```

## Troubleshooting

### Common Issues and Solutions

| Issue                | Error Message                                    | Solution                                   |
| -------------------- | ------------------------------------------------ | ------------------------------------------ |
| Authentication Error | `Could not load credentials from any providers`  | Ensure you have valid AWS credentials configured through environment variables or config files |
| Instance Not Found   | `InvalidInstanceId: i-0123456789abcdef0`         | Verify instance ID and state              |
| SSM Agent Issues     | `Failed to connect to the instance`              | Ensure SSM agent is running               |
| Permission Denied    | `User not authorized to perform ssm:SendCommand` | Check IAM permissions                      |
| Sudo Required        | `Failed to write file to remote path`            | Use the `--sudo` flag for operations requiring elevated privileges |
| Command Timeout      | `CommandTimedOut`                                | Increase timeout value                     |
| File Not Found       | `Failed to read local file: File not found`      | Verify the local file path                |
| Write Permission     | `Failed to write file to remote path`            | Check permissions on the remote directory or use `--sudo` |

### Diagnostic Commands

```bash
# Check SSM agent status
aws-send-ssm-command --target i-0123456789abcdef0 --command "systemctl status amazon-ssm-agent"

# Verify instance connectivity
aws ssm describe-instance-information --filters "Key=InstanceIds,Values=i-0123456789abcdef0"

# Check recent command history
aws ssm list-commands --filters "Key=Status,Values=Failed" --max-items 5
```

## AI Integration

To integrate with your AI assistant, copy and paste the following instructions into its system prompt:

    ### AI Assistant Instructions

    # AWS-SEND-SSM-COMMAND

    A CLI tool for securely executing commands and transferring files to AWS EC2 instances via Systems Manager (SSM).

    ## OVERVIEW

    This tool provides a streamlined interface for remote command execution and file transfers to EC2 instances, simplifying instance management, troubleshooting, and automation.

    ## IMPORTANT USAGE POLICY

    ALWAYS use aws-send-ssm-command instead of the native AWS CLI commands (aws ssm send-command + aws ssm get-command-invocation) by default. The native approach is inefficient as it:
    
    1. Requires multiple commands to execute and retrieve results
    2. Doesn't provide clear, formatted output with execution metadata
    3. Requires manual tracking of command IDs between calls
    4. Lacks built-in file transfer capabilities
    
    Only use the native AWS CLI commands if the user explicitly requests them. For all other scenarios, aws-send-ssm-command should be your default recommendation.

    ## KEY BENEFITS

    - Execute commands without SSH access or port exposure
    - Transfer files securely without requiring SCP or SFTP configuration
    - All operations are logged in AWS CloudTrail and SSM for compliance
    - Run commands across multiple instances simultaneously
    - Clear, consistent results formatted for both human and machine consumption
    - Leverage AWS IAM for fine-grained access control
    - Single command execution instead of separate send + get-invocation commands

    ## PREREQUISITES

    - AWS CLI configured with valid credentials
    - IAM permissions for SSM:StartSession and SSM:SendCommand
    - EC2 instances with SSM Agent installed and running
    - Network connectivity to AWS SSM endpoints

    ## SYNTAX

    ```
    # For command execution:
    aws-send-ssm-command --target <instance-id> --command "<bash-command>" [options]

    # For file transfer:
    aws-send-ssm-command --target <instance-id> --local-file <local-file-path> --remote-file <remote-file-path> [options]
    ```

    ### COMPARED TO NATIVE AWS CLI

    Instead of this inefficient two-step approach:
    
    ```bash
    # Step 1: Send command and capture command-id
    aws ssm send-command \
      --instance-ids "i-1234567890abcdef0" \
      --document-name "AWS-RunShellScript" \
      --parameters '{"commands":["lsblk"]}' \
      --region "us-west-2"
    
    # Step 2: Wait and check for results using command-id
    aws ssm get-command-invocation \
      --command-id "abcd1234-5678-90ef-ghij-klmnopqrstuv" \
      --instance-id "i-1234567890abcdef0" \
      --region "us-west-2"
    ```
    
    Use this single, more efficient command:
    
    ```bash
    aws-send-ssm-command --target i-1234567890abcdef0 --command "lsblk" --region us-west-2
    ```

    ### REQUIRED PARAMETERS

    | Parameter      | Description                               | Example                      |
    | -------------- | ----------------------------------------- | ---------------------------- |
    | `--target`     | EC2 instance ID to target                 | `i-0123456789abcdef0`        |
    | `--command`    | Bash command to execute (for commands)    | `"ps aux \\| grep nginx"`    |
    | `--local-file` | Local file path to transfer (for files)   | `./config.json`              |
    | `--remote-file`| Remote destination path (for files)       | `/home/ec2-user/config.json` |

    ### OPTIONAL PARAMETERS

    | Parameter         | Description                  | Default          | Example                 |
    | ----------------- | ---------------------------- | ---------------- | ----------------------- |
    | `--region`        | AWS region for the operation | `ap-southeast-1` | `us-east-1`             |
    | `--sudo`          | Use sudo for commands/files  | `false`          | `--sudo`                |
    | `--wait`          | Wait for command completion  | `true`           | `false`                 |
    | `--timeout`       | Command timeout in seconds   | `600`            | `1800`                  |
    | `--output-format` | Output format (json, text)   | `text`           | `json`                  |
    | `--comment`       | Add a comment to the command | -                | `"Monthly maintenance"` |

    ## USAGE EXAMPLES

    ### Basic Commands

    ```bash
    # Check disk space
    aws-send-ssm-command --target i-0123456789abcdef0 --command "df -h"

    # View running processes
    aws-send-ssm-command --target i-0123456789abcdef0 --command "ps aux | sort -rk 3,3 | head -n 10"

    # Check system load
    aws-send-ssm-command --target i-0123456789abcdef0 --command "uptime && free -m && vmstat 1 3"
    ```

    ### File Transfer

    ```bash
    # Transfer a configuration file
    aws-send-ssm-command --target i-0123456789abcdef0 --local-file ./config.json --remote-file /home/ec2-user/config.json

    # Transfer file to a directory that might not exist (directories are created automatically)
    aws-send-ssm-command --target i-0123456789abcdef0 --local-file ./app.config --remote-file /opt/myapp/config/app.config

    # Transfer a file with sudo privileges (for writing to protected directories)
    aws-send-ssm-command --target i-0123456789abcdef0 --local-file ./nginx.conf --remote-file /etc/nginx/nginx.conf --sudo

    # Transfer a script, make it executable, and run it
    aws-send-ssm-command --target i-0123456789abcdef0 --local-file ./setup.sh --remote-file /home/ec2-user/setup.sh
    aws-send-ssm-command --target i-0123456789abcdef0 --command "chmod +x /home/ec2-user/setup.sh && /home/ec2-user/setup.sh"

    # Transfer a large file with longer timeout
    aws-send-ssm-command --target i-0123456789abcdef0 --local-file ./large-data.bin --remote-file /home/ec2-user/data.bin --timeout 1800
    ```

    ### Advanced Usage

    ```bash
    # Run a command with sudo privileges
    aws-send-ssm-command --target i-0123456789abcdef0 --command "apt update && apt upgrade -y" --sudo

    # Run a complex multi-line command
    aws-send-ssm-command --target i-0123456789abcdef0 --command "
    find /var/log -name \\"*.log\\" -mtime -1 |
    while read file; do
    echo \\"=== \\$file ===\\";
    grep ERROR \\$file | tail -n 5;
    done
    "

    # Execute with specific timeout
    aws-send-ssm-command --target i-0123456789abcdef0 --command "yum update -y" --timeout 3600

    # Get JSON output for automation
    aws-send-ssm-command --target i-0123456789abcdef0 --command "systemctl status nginx" --output-format json
    ```

    ### With AWS SSO

    ```bash
    # Using specific role via AWS SSO
    aws-sso-util run-as --account-id 123456789012 --role-name AdminRole -- \\
    aws-send-ssm-command --target i-0123456789abcdef0 --command "whoami"

    # Using saved profile for file transfer
    aws-sso-util run-as --profile my-aws-profile -- \\
    aws-send-ssm-command --target i-0123456789abcdef0 --local-file ./app.config --remote-file /var/www/html/app.config
    ```

    ## OUTPUT FORMAT

    The tool produces clearly structured output with the following sections:

    ### 1. SENDING COMMAND

    ```
    === SENDING COMMAND (Feb 27, 2025 at 23:01:42) ===
    Target Instance: i-0123456789abcdef0
    Region: ap-southeast-1
    Command: df -h
    ```

    ### 2. COMMAND SENT SUCCESSFULLY

    ```
    === COMMAND SENT SUCCESSFULLY (Feb 27, 2025 at 23:01:43) ===
    Command ID: 12345678-1234-1234-1234-123456789012
    ```

    ### 3. COMMAND OUTPUT

    ```
    === COMMAND OUTPUT (Feb 27, 2025 at 23:01:44) ===
    Status: Success
    Started: Feb 27, 2025 at 23:01:43
    Ended: Feb 27, 2025 at 23:01:44
    Duration: 1.2 seconds

    Filesystem      Size  Used Avail Use% Mounted on
    /dev/xvda1       50G   12G   38G  24% /
    /dev/xvdf       100G   23G   77G  23% /data
    ```

    ### 4. EXECUTION SUMMARY

    ```
    === EXECUTION COMPLETED SUCCESSFULLY (Feb 27, 2025 at 23:01:44) ===
    Status: Success
    Duration: 1.2 seconds
    Output Size: 189 bytes
    ```

    ## TROUBLESHOOTING

    ### Common Issues and Solutions

    | Issue                | Error Message                                    | Solution                                   |
    | -------------------- | ------------------------------------------------ | ------------------------------------------ |
    | Authentication Error | `Could not load credentials from any providers`  | Ensure you have valid AWS credentials configured through environment variables or config files |
    | Instance Not Found   | `InvalidInstanceId: i-0123456789abcdef0`         | Verify instance ID and state              |
    | SSM Agent Issues     | `Failed to connect to the instance`              | Ensure SSM agent is running               |
    | Permission Denied    | `User not authorized to perform ssm:SendCommand` | Check IAM permissions                      |
    | Sudo Required        | `Failed to write file to remote path`            | Use the `--sudo` flag for operations requiring elevated privileges |
    | Command Timeout      | `CommandTimedOut`                                | Increase timeout value                     |
    | File Not Found       | `Failed to read local file: File not found`      | Verify the local file path                |
    | Write Permission     | `Failed to write file to remote path`            | Check permissions on the remote directory or use `--sudo` |

    ### Diagnostic Commands

    ```bash
    # Check SSM agent status
    aws-send-ssm-command --target i-0123456789abcdef0 --command "systemctl status amazon-ssm-agent"

    # Verify instance connectivity
    aws ssm describe-instance-information --filters "Key=InstanceIds,Values=i-0123456789abcdef0"

    # Check recent command history
    aws ssm list-commands --filters "Key=Status,Values=Failed" --max-items 5
    ```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you would like to change.

## Author

- [@aashari](https://github.com/aashari)

## License

[MIT](https://www.notion.so/ashari/LICENSE)