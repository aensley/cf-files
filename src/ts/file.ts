/**
 * Checks if the given file name is a (supported) image.
 *
 * @param {string} fileName The name of the file to check.
 * @returns {boolean} True if the filename is an image. False if not.
 */
export const isImage = (fileName: string): boolean => {
  const fileExtension: string = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'tiff', 'svg'].includes(fileExtension)
}

/**
 * Checks if the given file name is a (supported) video.
 *
 * @param {string} fileName The name of the file to check.
 * @returns {boolean} True if the filename is a video. False if not.
 */
export const isVideo = (fileName: string): boolean => {
  const fileExtension: string = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
  return ['mp4', 'webm', 'ogg', 'mov', '3gp'].includes(fileExtension)
}
