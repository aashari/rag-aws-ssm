# AWS Send SSM Command

## Overview

**AWS Send SSM Command** is a CLI tool for executing shell commands on AWS EC2 instances via AWS Systems Manager (SSM). It produces clear, structured, and timestamped output optimized for both human readability and AI systems.

## Features

- Remote command execution on SSM-enabled EC2 instances
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
aws-send-ssm-command --target <instance-id> --command "<bash-command>" [options]
```

### Required Parameters

| Parameter | Description | Example |
| --- | --- | --- |
| `--target` | EC2 instance ID to target | `i-0123456789abcdef0` |
| `--command` | Bash command to execute (in quotes) | `"ps aux \| grep nginx"` |

### Optional Parameters

| Parameter | Description | Default | Example |
| --- | --- | --- | --- |
| `--region` | AWS region for the operation | `ap-southeast-1` | `us-east-1` |
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

# Using saved profile
aws-sso-util run-as --profile my-aws-profile -- \\
  aws-send-ssm-command --target i-0123456789abcdef0 --command "curl -s <http://localhost:8080/health>"
```

## Output Format

The tool produces clearly structured output with the following sections:

### 1. Command Initiation

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

## Troubleshooting

### Common Issues

| Issue | Error Message | Solution |
| --- | --- | --- |
| Authentication Error | `Could not load credentials from any providers` | Run `aws sso login` to refresh credentials |
| Instance Not Found | `InvalidInstanceId: i-0123456789abcdef0` | Verify instance ID and state |
| SSM Agent Issues | `Failed to connect to the instance` | Ensure SSM agent is running |
| Permission Denied | `User not authorized to perform ssm:SendCommand` | Check IAM permissions |
| Command Timeout | `CommandTimedOut` | Increase timeout value |

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

    A CLI tool for securely executing commands on AWS EC2 instances via Systems Manager (SSM).

    ## OVERVIEW

    This tool provides a streamlined interface for remote command execution on EC2 instances, simplifying instance management, troubleshooting, and automation.

    ## KEY BENEFITS

    - Execute commands without SSH access or port exposure
    - All commands are logged in AWS CloudTrail and SSM for compliance
    - Run commands across multiple instances simultaneously
    - Clear, consistent results formatted for both human and machine consumption
    - Leverage AWS IAM for fine-grained access control

    ## PREREQUISITES

    - AWS CLI configured with valid credentials
    - IAM permissions for SSM:StartSession and SSM:SendCommand
    - EC2 instances with SSM Agent installed and running
    - Network connectivity to AWS SSM endpoints

    ## SYNTAX

    ```
    aws-send-ssm-command --target <instance-id> --command "<bash-command>" [options]
    ```

    ### REQUIRED PARAMETERS

    | Parameter   | Description                         | Example                  |
    | ----------- | ----------------------------------- | ------------------------ |
    | `--target`  | EC2 instance ID to target           | `i-0123456789abcdef0`    |
    | `--command` | Bash command to execute (in quotes) | `"ps aux \\| grep nginx"` |

    ### OPTIONAL PARAMETERS

    | Parameter         | Description                  | Default          | Example                 |
    | ----------------- | ---------------------------- | ---------------- | ----------------------- |
    | `--region`        | AWS region for the operation | `ap-southeast-1` | `us-east-1`             |
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

    ### Advanced Usage

    ```bash
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

    # Using saved profile
    aws-sso-util run-as --profile my-aws-profile -- \\
    aws-send-ssm-command --target i-0123456789abcdef0 --command "curl -s <http://localhost:8080/health>"
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
    | Authentication Error | `Could not load credentials from any providers`  | Run `aws sso login` to refresh credentials |
    | Instance Not Found   | `InvalidInstanceId: i-0123456789abcdef0`         | Verify instance ID and state              |
    | SSM Agent Issues     | `Failed to connect to the instance`              | Ensure SSM agent is running               |
    | Permission Denied    | `User not authorized to perform ssm:SendCommand` | Check IAM permissions                      |
    | Command Timeout      | `CommandTimedOut`                                | Increase timeout value                     |

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