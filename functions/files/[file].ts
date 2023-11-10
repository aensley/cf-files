import { Env } from '../../src/ts/types'
import { isImage } from '../../src/ts/file'

/**
 * Handle file Download
 *
 * @param context The request context.
 *
 * @returns {Response} The Response object.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const fileName: string = context.params.file.toString()
  const file: R2ObjectBody = (await context.env.FILESR2.get(fileName)) as R2ObjectBody
  if (file === null) {
    return new Response('Not found', { status: 404 })
  }

  const contentType: string = file.httpMetadata?.contentType as string
  return new Response(file.body, {
    headers: {
      'Content-Description': 'File Transfer',
      'Content-Type':
        typeof contentType !== 'undefined' && contentType !== null ? contentType : 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="' + file.key + '"',
      'Content-Length': file.size.toString(),
      ETag: file.httpEtag,
      'Last-Modified': file.uploaded.toUTCString()
    }
  })
}

/**
 * Handle file Upload
 *
 * @param context The request context.
 *
 * @returns {Response} The Response object.
 */
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const fileName: string = context.params.file.toString()
  const fileContents: ReadableStream = context.request.body as ReadableStream
  await context.env.FILESR2.put(fileName, fileContents)
  return new Response(`Put ${fileName} successfully!`)
}

/**
 * Handle file Delete.
 *
 * @param context The request context.
 *
 * @returns {Response} The Response object.
 */
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const fileName: string = context.params.file.toString()
  await context.env.FILESR2.delete(fileName)
  if (isImage(fileName)) {
    await context.env.FILESR2.delete('thumbs/' + fileName + '.jpg')
  }

  return new Response(`Deleted ${fileName} successfully!`)
}
