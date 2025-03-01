# Changelog

All notable changes to the `rag-aws-ssm-command` project will be documented in this file.

## [2.1.0] - 2024-07-10

### Added
- Added TypeScript type definitions for commander package
- Added detailed installation instructions in README.md
- Added CHANGELOG.md to track project changes

### Changed
- Updated shebang line in index.ts for better compatibility
- Improved documentation for local installation options
- Removed npm publishing references from documentation

### Fixed
- Fixed TypeScript module resolution errors
- Added @types/node for proper Node.js type support

## [2.0.0] - Initial Release

- Initial release of rag-aws-ssm-command
- Command execution on EC2 instances via SSM
- File transfer to EC2 instances with base64 encoding
- Sudo support for commands and file operations
- Wait option for command completion
- Rich output formatting with metadata 