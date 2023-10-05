import { Env } from '../../src/ts/types'

/**
 * Return file list
 *
 * @param context
 * @returns
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const obj = await context.env.FILESR2.list()
  return new Response(JSON.stringify(obj))
}
