# rag-aws-ssm

**AWS SSM Command and File Transfer Tool for Humans and AI**

`rag-aws-ssm` is a utility built with the [AWS SDK](https://aws.amazon.com/sdk-for-javascript/) to send shell commands and transfer files to AWS EC2 instances via Systems Manager (SSM). It provides detailed output formatting and supports both CLI usage for direct operations and potential AI integration (though primarily CLI-focused in this version). Ideal for developers managing EC2 instances and AI systems automating AWS workflows.

- **Version**: 3.1.2
- **License**: Open-source (MIT, see [LICENSE](LICENSE))
- **Repository**: [github.com/aashari/rag-aws-ssm](https://github.com/aashari/rag-aws-ssm) _(Update with actual repo URL)_
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
bunx github:aashari/rag-aws-ssm command --target i-0123456789abcdef0 --cmd "df -h"

# Using Node.js/npm
npx -y github:aashari/rag-aws-ssm command --target i-0123456789abcdef0 --cmd "df -h"
```

### Installing Locally

If you prefer to install the tool locally without publishing to npm, you have two simple options:

#### Option 1: Install Directly from GitHub

This is the easiest way to install the tool globally on your machine:

```bash
# Using Bun (Recommended)
bun install -g github:aashari/rag-aws-ssm

# Using npm
npm install -g github:aashari/rag-aws-ssm
```

After installation, you can run it directly:

```bash
rag-aws-ssm command --target i-0123456789abcdef0 --cmd "df -h"
```

#### Option 2: Clone and Install Locally

For development or customization:

```bash
# Clone the repository
git clone https://github.com/aashari/rag-aws-ssm.git
cd rag-aws-ssm

# Install dependencies
bun install  # or npm install

# Build the project
npm run build

# Link the package globally
bun link     # or npm link
```

After linking, you can run it directly:

```bash
rag-aws-ssm command --target i-0123456789abcdef0 --cmd "df -h"
```

---

## Usage

### CLI Mode

Execute commands or transfer files to EC2 instances using subcommands.

#### Run a Command

```bash
# Using Bun
bunx github:aashari/rag-aws-ssm command --target i-0123456789abcdef0 --cmd "df -h"

# Using Node.js/npm
npx -y github:aashari/rag-aws-ssm command --target i-0123456789abcdef0 --cmd "df -h"
```

**Output**: Disk usage info with execution metadata.

#### Transfer a File

```bash
bunx github:aashari/rag-aws-ssm copy --target i-0123456789abcdef0 --local ./myfile.txt --remote /home/ec2-user/myfile.txt
```

**Output**: File transfer status and metadata.

#### Run a Command with Sudo

```bash
bunx github:aashari/rag-aws-ssm command --target i-0123456789abcdef0 --cmd "apt update" --sudo
```

**Output**: Command output with sudo execution details.

#### Transfer a File to a Protected Directory

```bash
bunx github:aashari/rag-aws-ssm copy --target i-0123456789abcdef0 --local ./nginx.conf --remote /etc/nginx/nginx.conf --sudo
```

**Output**: File transfer confirmation with sudo privileges.

#### CLI Options

**Command Subcommand**

| Option          | Description                          | Example Value           |
| --------------- | ------------------------------------ | ----------------------- |
| `--target`      | EC2 instance ID (required)           | `i-0123456789abcdef0`   |
| `--cmd`         | Bash command to run (required)       | `"df -h"`               |
| `--sudo`        | Use sudo privileges                  | (flag)                  |
| `--background`  | Run command without waiting          | (flag)                  |
| `--region`      | AWS region (default: ap-southeast-1) | `us-west-2`             |

**Copy Subcommand**

| Option          | Description                          | Example Value           |
| --------------- | ------------------------------------ | ----------------------- |
| `--target`      | EC2 instance ID (required)           | `i-0123456789abcdef0`   |
| `--local`       | Local file to upload (required)      | `./myfile.txt`          |
| `--remote`      | Remote destination path (required)   | `/home/ec2-user/myfile.txt` |
| `--sudo`        | Use sudo privileges                  | (flag)                  |
| `--background`  | Run file transfer without waiting    | (flag)                  |
| `--region`      | AWS region (default: ap-southeast-1) | `us-west-2`             |

### Example Workflow

1. Check disk space:
   ```bash
   bunx github:aashari/rag-aws-ssm command --target i-0123456789abcdef0 --cmd "df -h"
   ```
2. Deploy a config file:
   ```bash
   bunx github:aashari/rag-aws-ssm copy --target i-0123456789abcdef0 --local ./app.conf --remote /etc/app/app.conf --sudo
   ```
3. Run a command in the background:
   ```bash
   bunx github:aashari/rag-aws-ssm command --target i-0123456789abcdef0 --cmd "apt update" --background
   ```

---

## ForHumans

### Why Use rag-aws-ssm?

- **Simplify EC2 Management**: Execute commands or deploy files without SSH.
- **Detailed Feedback**: Rich output with timestamps, status, and error suggestions.
- **Secure Operations**: Leverages AWS SSM for secure, credential-free access.

### Example Workflow

1. Check disk space:
   ```bash
   bunx github:aashari/rag-aws-ssm command --target i-0123456789abcdef0 --cmd "df -h"
   ```
2. Deploy a config file:
   ```bash
   bunx github:aashari/rag-aws-ssm copy --target i-0123456789abcdef0 --local ./app.conf --remote /etc/app/app.conf --sudo
   ```
3. Run a command in the background:
   ```bash
   bunx github:aashari/rag-aws-ssm command --target i-0123456789abcdef0 --cmd "apt update" --background
   ```
4. Review detailed output for success or troubleshooting.

---

## ForAI

### Integration with AI Systems

`rag-aws-ssm` provides structured output suitable for AI system integration. The tool's consistent output format and error handling make it ideal for automated workflows and AI-driven infrastructure management.

### Capabilities

- **Command Execution**: Run any shell command with status tracking.
- **File Deployment**: Transfer files securely via base64 encoding.
- **Error Handling**: Detailed error messages and suggestions for resolution.

---

## Roadmap

Future enhancements planned for `rag-aws-ssm`:

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
bun run src/index.ts command --target i-0123456789abcdef0 --cmd "uptime"
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

File issues at [github.com/aashari/rag-aws-ssm/issues](https://github.com/aashari/rag-aws-ssm/issues).

---

## License

MIT © Andi Ashari. See [LICENSE](LICENSE) for details.