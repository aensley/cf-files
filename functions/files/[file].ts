import { Env } from '../../src/ts/types'

/**
 * Handle file Download
 *
 * @param context
 * @returns
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const file = context.params.file.toString()
  const obj = await context.env.FILESR2.get(file)
  if (obj === null) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(obj.body)
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
