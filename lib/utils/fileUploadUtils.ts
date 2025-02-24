import type { Attachment } from "ai";

/**
 * Converts a File object to a Data URI.
 *
 * @param {File} inputFile - The file to be converted to a Data URI.
 * @returns {Promise<string | null>} A promise that resolves to the Data URI of the file, or null if the conversion fails.
 * @throws {DOMException} If there is a problem parsing the input file.
 */
export function convertFileToDataUri(inputFile: File): Promise<string | null> {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onerror = () => {
      reader.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(inputFile);
  });
}
// Custom error class
export class FileValidationError extends Error {
  type: "size" | "type" | "count" | "duplicate";
  affectedFiles?: string[];

  constructor(
    message: string,
    type: "size" | "type" | "count" | "duplicate",
    affectedFiles?: string[]
  ) {
    super(message);
    this.name = "FileValidationError";
    this.type = type;
    this.affectedFiles = affectedFiles;
  }
}

// Main processor function that orchestrates all the validation and conversion steps
export const processFilesForUpload = async (
  inputFiles: File[],
  currentAttachments: Attachment[],
  options: {
    maxAttachments: number;
    maxFileSize: number;
    validTypes: string[];
    onError: (error: FileValidationError) => void;
  }
): Promise<Attachment[]> => {
  const { maxAttachments, maxFileSize, validTypes, onError } = options;

  if (
    !checkAttachmentLimit(
      currentAttachments.length,
      inputFiles.length,
      maxAttachments,
      onError
    )
  ) {
    return [];
  }

  // Check for duplicate files
  const existingFileNames = currentAttachments
    .map((attachment) => attachment.name)
    .filter((name): name is string => name !== undefined);

  const uniqueFiles = filterDuplicates(inputFiles, existingFileNames, onError);
  if (uniqueFiles.length === 0) return [];

  // Check file sizes
  const sizeValidFiles = filterBySize(uniqueFiles, maxFileSize, onError);
  if (sizeValidFiles.length === 0) return [];

  // Check file types
  const typeValidFiles = filterByType(sizeValidFiles, validTypes, onError);
  if (typeValidFiles.length === 0) return [];

  // Convert valid files to attachments
  return await convertFilesToAttachments(typeValidFiles, onError);
};

// Check if adding new files would exceed the attachment limit
export const checkAttachmentLimit = (
  currentCount: number,
  newFilesCount: number,
  maxAttachments: number,
  onError: (error: FileValidationError) => void
): boolean => {
  if (currentCount + newFilesCount > maxAttachments) {
    onError(
      new FileValidationError(
        `Maximum of ${maxAttachments} attachments allowed`,
        "count"
      )
    );
    return false;
  }
  return true;
};

// Filter out duplicate files based on existing attachment names
export const filterDuplicates = (
  files: File[],
  existingFileNames: string[],
  onError: (error: FileValidationError) => void
): File[] => {
  const duplicateFiles = files.filter((file) =>
    existingFileNames.includes(file.name)
  );

  if (duplicateFiles.length > 0) {
    onError(
      new FileValidationError(
        "Duplicate files detected",
        "duplicate",
        duplicateFiles.map((f) => f.name)
      )
    );
  }

  return files.filter((file) => !existingFileNames.includes(file.name));
};

// Filter out files that exceed the size limit
export const filterBySize = (
  files: File[],
  maxFileSize: number,
  onError: (error: FileValidationError) => void
): File[] => {
  const oversizedFiles = files.filter((file) => file.size > maxFileSize);

  if (oversizedFiles.length > 0) {
    onError(
      new FileValidationError(
        "Files must be smaller than 10 MB",
        "size",
        oversizedFiles.map((f) => f.name)
      )
    );
  }

  return files.filter((file) => file.size <= maxFileSize);
};

// Filter out files with invalid types
export const filterByType = (
  files: File[],
  validTypes: string[],
  onError: (error: FileValidationError) => void
): File[] => {
  const invalidTypeFiles = files.filter(
    (file) => !validTypes.includes(file.type)
  );

  if (invalidTypeFiles.length > 0) {
    onError(
      new FileValidationError(
        "Unsupported file type(s)",
        "type",
        invalidTypeFiles.map((f) => f.name)
      )
    );
  }

  return files.filter((file) => validTypes.includes(file.type));
};

// Convert a file to an attachment
export const convertFileToAttachment = async (
  file: File,
  onError: (error: FileValidationError) => void
): Promise<Attachment | null> => {
  try {
    return {
      name: file.name,
      contentType: file.type,
      url: await convertFileToDataUri(file),
      size: file.size,
    } as Attachment;
  } catch (error) {
    console.error(`Error converting file ${file.name}:`, error);
    onError(
      new FileValidationError(`Failed to process ${file.name}`, "type", [
        file.name,
      ])
    );
    return null;
  }
};

// Convert multiple files to attachments
export const convertFilesToAttachments = async (
  files: File[],
  onError: (error: FileValidationError) => void
): Promise<Attachment[]> => {
  try {
    const attachments = await Promise.all(
      files.map((file) => convertFileToAttachment(file, onError))
    );

    // Filter out failed conversions
    return attachments.filter(
      (attachment): attachment is Attachment => attachment !== null
    );
  } catch (error) {
    console.error("Error in file conversion:", error);
    onError(new FileValidationError("Failed to process files", "type"));
    return [];
  }
};
