# rag-aws-ssm-command

**AWS SSM Command and File Transfer Tool for Humans and AI**

`rag-aws-ssm-command` is a utility built with the [AWS SDK](https://aws.amazon.com/sdk-for-javascript/) to send shell commands and transfer files to AWS EC2 instances via Systems Manager (SSM). It provides detailed output formatting and supports both CLI usage for direct operations and potential AI integration (though primarily CLI-focused in this version). Ideal for developers managing EC2 instances and AI systems automating AWS workflows.

- **Version**: 2.0.0
- **License**: Open-source (MIT, see [LICENSE](LICENSE))
- **Repository**: [github.com/aashari/rag-aws-ssm-command](https://github.com/aashari/rag-aws-ssm-command) _(Update with actual repo URL)_
- **Author**: Andi Ashari

---

## Features

- **Command Execution**: Run shell commands on EC2 instances via SSM.
- **File Transfer**: Upload local files to remote EC2 instances with base64 encoding.
- **Sudo Support**: Execute commands or write files with elevated privileges.
- **Wait Option**: Poll for command completion with detailed status reporting.
- **Output Formatting**: Rich, human-readable output with metadata and error suggestions.
- **Runtime**: Optimized for [Bun](https://bun.sh/), with Node.js/npm compatibility.

---

## Installation

### Prerequisites

- **Bun** (recommended): `curl -fsSL https://bun.sh/install | bash`
- **Node.js** (optional): Version 16+ with npm
- **AWS Credentials**: Configured via `~/.aws/credentials` or environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).

### Running the Tool

Run directly from GitHub using `bunx` or `npx`:

```bash
# Using Bun (Recommended)
bunx github:aashari/rag-aws-ssm-command --target i-0123456789abcdef0 --command "df -h"

# Using Node.js/npm
npx -y github:aashari/rag-aws-ssm-command --target i-0123456789abcdef0 --command "df -h"
```

To contribute or modify, clone the repository:

```bash
git clone https://github.com/aashari/rag-aws-ssm-command.git
cd rag-aws-ssm-command
bun install
bun run src/index.ts
```

---

## Usage

### CLI Mode

Execute commands or transfer files to EC2 instances.

#### Run a Command

```bash
# Using Bun
bunx github:aashari/rag-aws-ssm-command --target i-0123456789abcdef0 --command "df -h"

# Using Node.js/npm
npx -y github:aashari/rag-aws-ssm-command --target i-0123456789abcdef0 --command "df -h"
```

**Output**: Disk usage info with execution metadata.

#### Transfer a File

```bash
bunx github:aashari/rag-aws-ssm-command --target i-0123456789abcdef0 --local-file ./myfile.txt --remote-file /home/ec2-user/myfile.txt
```

**Output**: File transfer status and metadata.

#### Run a Command with Sudo

```bash
bunx github:aashari/rag-aws-ssm-command --target i-0123456789abcdef0 --command "apt update" --sudo
```

**Output**: Command output with sudo execution details.

#### Transfer a File to a Protected Directory

```bash
bunx github:aashari/rag-aws-ssm-command --target i-0123456789abcdef0 --local-file ./nginx.conf --remote-file /etc/nginx/nginx.conf --sudo
```

**Output**: File transfer confirmation with sudo privileges.

#### CLI Options

| Option          | Description                          | Example Value               |
| --------------- | ------------------------------------ | --------------------------- |
| `--target`      | EC2 instance ID (required)           | `i-0123456789abcdef0`       |
| `--command`     | Bash command to run                  | `"df -h"`                   |
| `--local-file`  | Local file to upload                 | `./myfile.txt`              |
| `--remote-file` | Remote destination path              | `/home/ec2-user/myfile.txt` |
| `--sudo`        | Use sudo privileges                  | (flag)                      |
| `--wait`        | Wait for completion (default: true)  | (flag)                      |
| `--region`      | AWS region (default: ap-southeast-1) | `us-west-2`                 |

---

## ForHumans

### Why Use rag-aws-ssm-command?

- **Simplify EC2 Management**: Execute commands or deploy files without SSH.
- **Detailed Feedback**: Rich output with timestamps, status, and error suggestions.
- **Secure Operations**: Leverages AWS SSM for secure, credential-free access.

### Example Workflow

1. Check disk space:
   ```bash
   bunx github:aashari/rag-aws-ssm-command --target i-0123456789abcdef0 --command "df -h"
   ```
2. Deploy a config file:
   ```bash
   bunx github:aashari/rag-aws-ssm-command --target i-0123456789abcdef0 --local-file ./app.conf --remote-file /etc/app/app.conf --sudo
   ```
3. Review detailed output for success or troubleshooting.

---

## ForAI

### Integration with AI Systems

`rag-aws-ssm-command` provides structured output suitable for AI system integration. The tool's consistent output format and error handling make it ideal for automated workflows and AI-driven infrastructure management.

### Capabilities

- **Command Execution**: Run any shell command with status tracking.
- **File Deployment**: Transfer files securely via base64 encoding.
- **Error Handling**: Detailed error messages and suggestions for resolution.

---

## Roadmap

Future enhancements planned for `rag-aws-ssm-command`:

1. **MCP Integration**: Add support for Model Control Protocol (MCP) server integration for seamless AI system communication.
2. **Batch Operations**: Support for executing commands across multiple instances simultaneously.
3. **Interactive Mode**: Shell-like interactive mode for running multiple commands in sequence.
4. **Output Templates**: Customizable output formatting templates.
5. **Enhanced AI Features**: 
   - Structured JSON output mode
   - AI-friendly error formats
   - Context-aware command suggestions
6. **Security Enhancements**:
   - Command allowlist/blocklist
   - Enhanced IAM role support
   - Command audit logging

---

## Development

### Project Structure

```
src/
├── commands/    # Command execution and file transfer logic
├── services/    # AWS SSM client utilities
├── types/       # TypeScript type definitions
├── utils/       # Formatting, error handling, file operations
└── index.ts     # Main entry point
```

### Build and Run Locally

```bash
bun install
bun run src/index.ts --target i-0123456789abcdef0 --command "uptime"
```

### Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/add-feature`).
3. Commit changes (`git commit -m "Add new feature"`).
4. Push to the branch (`git push origin feature/add-feature`).
5. Open a Pull Request.

---

## Troubleshooting

- **Error: "InvalidInstanceId"**: Verify the instance ID and ensure SSM Agent is running.
- **Error: "AccessDeniedException"**: Check IAM permissions (`ssm:SendCommand`, `ssm:GetCommandInvocation`).
- **No Output**: Use `--wait` and check SSM Agent status on the instance.

File issues at [github.com/aashari/rag-aws-ssm-command/issues](https://github.com/aashari/rag-aws-ssm-command/issues).

---

## License

MIT © Andi Ashari. See [LICENSE](LICENSE) for details.