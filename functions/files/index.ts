import { Env, FileProperties } from '../../src/ts/types'

/**
 * Return file list
 *
 * @param context
 * @returns
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const obj = await context.env.FILESR2.list()
  const files: FileProperties[] = []

  obj.objects.forEach((file) => {
    if (file.key.startsWith('thumbs/')) {
      // Skip thumbnails
      return
    }

    files.push({
      key: file.key,
      size: file.size,
      uploaded: file.uploaded
    })
  })

  return new Response(JSON.stringify(files))
}
