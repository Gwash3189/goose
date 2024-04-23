type Milliseconds = number
type Minutes = number

export function minutes (minutes: Minutes): Milliseconds {
  return ((minutes * 1000) * 60)
}
