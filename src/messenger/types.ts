import type { DetailedMessage, RichMessage } from '../types'

export enum Type {
  Basic = 'basic',
  Detailed = 'message',
  Notice = 'notice',
}

export type Thread = Array<
  | { type: Type.Basic; message: RichMessage }
  | { type: Type.Detailed; message: DetailedMessage }
  | { type: Type.Notice; message: string }
>
