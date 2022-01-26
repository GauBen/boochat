import type { SomeJTDSchemaType } from 'ajv/dist/core'
import Ajv from 'ajv/dist/jtd'

export const ajv = new Ajv()

export const compile = <T extends SomeJTDSchemaType>(schema: T) =>
  ajv.compile(schema)
