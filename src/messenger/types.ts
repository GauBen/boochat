import type { RichMessage } from 'src/api'

export type Thread = Array<
  | { type: 'message'; message: RichMessage }
  | { type: 'notice'; message: string }
>
