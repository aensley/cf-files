import { Env } from '../../src/ts/types'
// import imageThumbnail, { Options } from 'image-thumbnail'
import { isImage, streamToBuffer } from '../../src/ts/image'

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
  if (isImage(fileName)) {
    const fileContentsBuffer: Buffer = await streamToBuffer(fileContents)
    /*const options: {
      responseType: 'buffer'
      jpegOptions: {
        force: true
        quality: 70
      }
      fit: 'contain'
    } & Options = {
      width: 100,
      height: 75,
      responseType: 'buffer',
      jpegOptions: { force: true, quality: 70 },
      fit: 'contain'
    }
    const thumbnail = await imageThumbnail(fileContentsBuffer, options)
    await context.env.FILESR2.put('thumbs/' + fileName + '.jpg', thumbnail)
    */
  }

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
  const file = context.params.file.toString()
  await context.env.FILESR2.delete(file)
  return new Response(`Deleted ${file} successfully!`)
}
