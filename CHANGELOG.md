# Changelog for aws-send-ssm-command

## 1.2.3 (2023-05-28)

### Enhanced Error Handling

- Added detailed AWS SSM-specific error messages with better categorization
- Enhanced error suggestions with specific troubleshooting guidance
- Improved error formatting with clear error types and structured output
- Added specific handling for common SSM errors:
  - InvalidInstanceId
  - TooManyUpdates
  - ThrottlingException
  - AccessDeniedException
  - InvalidParameters
  - UnsupportedPlatformType
  - ServiceUnavailable
- Improved network and credential error guidance
- Added debug mode support (enable with DEBUG=true environment variable)

## 1.2.2 (2023-05-15)

### Removed Options

- Removed the following CLI options:
  - `--output-format` 
  - `--timeout`
  - `--comment`
- Enhanced sudo status messages in command execution:
  - **Yes (in command and via flag)**: Command contains "sudo" and --sudo flag is used.
  - **Yes (in command)**: Command contains "sudo" but --sudo flag is not used.
  - **Yes (via flag)**: --sudo flag is used, but command does not contain "sudo".
  - **No**: Neither condition is met.
- Enhanced sudo status messages in file transfer:
  - **Yes (for directory creation and file writing)**: When the --sudo flag is used.
  - **No**: When the --sudo flag is not used.

## 1.2.1 (2023-05-01)

### Initial Public Release

- Command execution via AWS SSM
- File transfer functionality 
- Support for sudo operations
- Configurable wait for completion
- Region selection support 