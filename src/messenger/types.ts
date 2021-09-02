import type { DetailedMessage, RichMessage } from '../types'

export type Thread = Array<
  | { type: 'message'; message: RichMessage }
  | { type: 'detailed-message'; message: DetailedMessage }
  | { type: 'notice'; message: string }
>
