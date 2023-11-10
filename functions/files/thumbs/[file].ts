import { Env } from '../../../src/ts/types'

/**
 * Handle file Download
 *
 * @param context The request context.
 *
 * @returns {Response} The Response object.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const fileName: string = context.params.file.toString()
  const file: R2ObjectBody = (await context.env.FILESR2.get('thumbs/' + fileName)) as R2ObjectBody
  if (file === null) {
    return new Response('Not found', { status: 404 })
  }

  const expiry = new Date()
  expiry.setFullYear(expiry.getFullYear() + 1)
  return new Response(file.body, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': file.size.toString(),
      ETag: file.httpEtag,
      Expires: expiry.toUTCString(),
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
  await context.env.FILESR2.put('thumbs/' + fileName, fileContents)
  return new Response(`Put ${fileName} successfully!`)
}
