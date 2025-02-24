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
