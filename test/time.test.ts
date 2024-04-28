import { describe, it, expect } from 'vitest'
import { minutes, hours, days } from '../src/time'

describe('Time functions', () => {
  describe('minutes', () => {
    it('should return the correct number of milliseconds', () => {
      expect(minutes(1)).to.equal(60000)
      expect(minutes(0)).to.equal(0)
      expect(minutes(-1)).to.equal(-60000)
    })
  })

  describe('hours', () => {
    it('should return the correct number of milliseconds', () => {
      expect(hours(1)).to.equal(3600000)
      expect(hours(0)).to.equal(0)
      expect(hours(-1)).to.equal(-3600000)
    })
  })

  describe('days', () => {
    it('should return the correct number of milliseconds', () => {
      expect(days(1)).to.equal(86400000)
      expect(days(0)).to.equal(0)
      expect(days(-1)).to.equal(-86400000)
    })
  })
})
