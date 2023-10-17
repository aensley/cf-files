import { Env } from '../../src/ts/types'

/**
 * Handle file Download
 *
 * @param context
 * @returns
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
      'Content-Type': contentType !== 'undefined' && contentType !== null ? contentType : 'application/octet-stream',
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
 * @param context
 * @returns
 */
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const file = context.params.file.toString()
  await context.env.FILESR2.put(file, context.request.body)
  return new Response(`Put ${file} successfully!`)
}

/**
 * Handle file Delete
 *
 * @param context
 * @returns
 */
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const file = context.params.file.toString()
  await context.env.FILESR2.delete(file)
  return new Response(`Deleted ${file} successfully!`)
}
