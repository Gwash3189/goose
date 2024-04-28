
export function milliseconds (milliseconds: number): number {
  return milliseconds
}

export function seconds (seconds: number): number {
  return milliseconds(seconds * 1000)
}

export function minutes (minutes: number): number {
  return seconds(minutes * 60)
}

export function hours (hours: number): number {
  return minutes(hours * 60)
}

export function days (days: number): number {
  return hours(days * 24)
}

export function weeks (weeks: number): number {
  return days(weeks * 7)
}

export function years (years: number): number {
  return days(years * 365)
}

export function datetime (date: Date): string {
  return (date ?? new Date()).toISOString()
}

export const FromNow = {
  years (years: number): Date {
    return new Date(new Date().setFullYear(new Date().getFullYear() + years))
  }
}

export const Past = {
  seconds (seconds: number): Date {
    return new Date(new Date().setSeconds(new Date().getSeconds() - seconds))
  }
}
