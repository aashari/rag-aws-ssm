# Changelog

All notable changes to the `rag-aws-ssm` project will be documented in this file.

## [3.0.0] - 2024-03-XX

### Changed
- **BREAKING**: Rebranded from `rag-aws-ssm-command` to `rag-aws-ssm`
- **BREAKING**: Implemented subcommand structure with `command` and `copy` subcommands
- **BREAKING**: Changed parameter names for better clarity:
  - `--command` → `--cmd` (in command subcommand)
  - `--local-file` → `--local` (in copy subcommand)
  - `--remote-file` → `--remote` (in copy subcommand)
- Updated documentation to reflect new command structure

## [2.1.1] - 2024-03-01

### Fixed
- Improved error handling for AWS SSM service errors
- Fixed file transfer progress reporting

## [2.1.0] - 2024-02-28

### Added
- Enhanced output formatting for better readability
- Added detailed metadata in command output
- Improved error suggestions based on common AWS SSM issues

### Changed
- Optimized polling mechanism for command status
- Updated dependencies to latest versions

## [2.0.0] - 2024-02-15

### Added
- Support for file transfer operations
- Base64 encoding for secure file transfers
- Sudo support for both command execution and file operations

### Changed
- Complete rewrite in TypeScript
- Improved command-line interface with better option validation
- Enhanced error handling and user feedback

## [1.0.0] - 2024-01-30

### Added
- Initial release with basic command execution functionality
- Support for AWS SSM SendCommand and GetCommandInvocation
- Wait option for command completion
- Basic error handling 