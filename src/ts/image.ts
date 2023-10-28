export const isImage = (fileName: string): boolean => {
  const fileExtension: string = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'tiff', 'svg'].includes(fileExtension)
}

export const streamToBuffer = async (stream: ReadableStream): Promise<Buffer> => {
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

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return Buffer.from(result)
}
