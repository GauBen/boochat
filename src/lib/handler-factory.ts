import type { RequestEvent, RequestHandler } from '@sveltejs/kit'
import type { JSONString } from '@sveltejs/kit/types/helper'
import type { JTDDataType, SomeJTDSchemaType } from 'ajv/dist/core'
import { compile } from './ajv'

/**
 * Creates a type-safe request handler.
 *
 * @param schema An AJV *JSON Type Definition* schema
 * @param handler A request handler, that receives an object and produces another
 */
export const postFactory = <T extends SomeJTDSchemaType, U extends JSONString>(
  schema: T,
  handler: (event: RequestEvent & { body: JTDDataType<T> }) => Promise<U>
): RequestHandler => {
  const validate = compile(schema)

  return async (event) => {
    try {
      const body: unknown = await event.request.json()
      if (!validate(body)) throw new Error('Invalid data')
      return {
        status: 200,
        // @ts-expect-error Typecheck breaks below for unknown reasons
        body: await handler({ ...event, body }),
      }
    } catch (error: unknown) {
      return {
        status: 400,
        body: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
