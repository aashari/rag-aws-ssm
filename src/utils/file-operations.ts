import fs from 'fs';

/**
 * Read a local file and prepare it for transfer
 * @param filePath Path to the local file
 * @returns The base64-encoded file content
 */
export function readLocalFile(filePath: string): string {
  try {
    // Check if file exists and is readable
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read file as buffer
    const fileContent = fs.readFileSync(filePath);
    
    // Convert to base64 for safe transmission
    return fileContent.toString('base64');
  } catch (error) {
    throw new Error(`Failed to read local file: ${(error as Error).message}`);
  }
}

/**
 * Generate a command to write base64 content to a remote file
 * @param base64Content Base64-encoded file content
 * @param remotePath Destination path on the remote instance
 * @param useSudo Whether to use sudo for the command
 * @returns A shell command string
 */
export function generateFileTransferCommand(base64Content: string, remotePath: string, useSudo: boolean = false): string {
  const sudoPrefix = useSudo ? 'sudo ' : '';
  const dirPath = remotePath.substring(0, remotePath.lastIndexOf('/'));
  
  return `
# Ensure destination directory exists
if [ ! -d "${dirPath}" ]; then
  ${sudoPrefix}mkdir -p "${dirPath}"
  if [ $? -ne 0 ]; then
    echo "Failed to create directory: ${dirPath}"
    exit 1
  fi
fi

# Transfer the file
${sudoPrefix}bash -c "echo '${base64Content}' | base64 --decode > \\"${remotePath}\\""
if [ $? -eq 0 ]; then
  echo "File successfully transferred to ${remotePath}"
  ls -la "${remotePath}"
else
  echo "Failed to write file to ${remotePath}"
  exit 1
fi
`;
} 