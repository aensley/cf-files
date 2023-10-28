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
  const file: R2ObjectBody = (await context.env.FILESR2.get('thumbs/' + fileName + '.jpg')) as R2ObjectBody
  if (file === null) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(file.body, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': file.size.toString(),
      ETag: file.httpEtag,
      'Last-Modified': file.uploaded.toUTCString()
    }
  })
}
