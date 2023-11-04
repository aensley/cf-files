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
 * Converts the given ReadableStream to a Buffer.
 *
 * @param {ReadableStream} stream The stream to convert.
 * @returns {Promise<Buffer>} The Buffer.
 */
export const streamToBuffer = async (stream: ReadableStream): Promise<Buffer> => {
  const chunks: Uint8Array[] = await getChunks(stream)
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return Buffer.from(result)
}

/**
 * Gets binary chunks from the ReadableStream.
 *
 * @param stream The stream to get data from.
 * @returns {Promise<Uint8Array[]>} The binary chunks of data as an array of unsigned 8-bit integers.
 */
const getChunks = async (stream: ReadableStream): Promise<Uint8Array[]> => {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    if (value.length > 0) {
      chunks.push(value)
    }
  }

  return chunks
}
