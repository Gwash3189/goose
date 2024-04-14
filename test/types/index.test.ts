import { beforeEach, describe, expect, it, vi, Mock } from 'vitest'
import * as T from '../../src/types'
import { z } from 'zod'
describe('T', () => {
  describe('.success', () => {
    describe('when the result is a boolean', () => {
      describe('when the result is true', () => {
        let mock: Mock
        let returnValue: boolean

        beforeEach(async () => {
          mock = vi.fn(() => true)
          returnValue = await T.success(true, mock) as boolean
        })

        it('runs the provided function', () => {
          expect(mock).toHaveBeenCalled()
        })

        it('returns the result of the provided function', () => {
          expect(returnValue).to.eq(true)
        })
      })

      describe('when the result is false', () => {
        let mock: Mock

        beforeEach(async () => {
          mock = vi.fn(() => true)
          await T.success(false, mock)
        })

        it('runs the provided function', () => {
          expect(mock).not.toHaveBeenCalled()
        })
      })

      describe('when the result is undefined', () => {
        let mock: Mock

        beforeEach(async () => {
          mock = vi.fn(() => true)
          await T.success(undefined, mock)
        })

        it('runs the provided function', () => {
          expect(mock).not.toHaveBeenCalled()
        })
      })

      describe('when the result is null', () => {
        let mock: Mock

        beforeEach(async () => {
          mock = vi.fn(() => true)
          await T.success(null, mock)
        })

        it('runs the provided function', () => {
          expect(mock).not.toHaveBeenCalled()
        })
      })
    })

    describe('when the result is a zod parse error', () => {
      let mock: Mock

      beforeEach(async () => {
        mock = vi.fn(() => true)
        await T.success(z.string().min(2).safeParse(''), mock)
      })

      it('does not run the provided function', () => {
        expect(mock).not.toHaveBeenCalled()
      })
    })

    describe('when the result is an array', () => {
      let mock: Mock
      let returnValue: boolean
      let value

      beforeEach(async () => {
        mock = vi.fn(() => true)
        value = [true]
        returnValue = await T.success(value, mock) as boolean
      })

      describe('when the array contains only true values', () => {
        it('runs the provided function', () => {
          expect(mock).toHaveBeenCalled()
        })

        it('returns the result of the provided function', () => {
          expect(returnValue).to.eq(true)
        })
      })

      describe('when the array contains true and false', () => {
        beforeEach(async () => {
          mock = vi.fn(() => true)
          value = [false, true]
          returnValue = await T.success(value, mock) as boolean
        })

        it('does not run the provided function', () => {
          expect(mock).not.toHaveBeenCalled()
        })
      })

      describe('when the array contains only true', () => {
        beforeEach(async () => {
          mock = vi.fn(() => true)
          value = [true, true]
          returnValue = await T.success(value, mock) as boolean
        })

        it('runs the provided function', () => {
          expect(mock).toHaveBeenCalled()
        })
      })

      describe('when the array contains only truthy values', () => {
        beforeEach(async () => {
          mock = vi.fn(() => true)
          value = [{}, { name: 'Adam' }]
          returnValue = await T.success(value, mock) as boolean
        })

        it('runs the provided function', () => {
          expect(mock).toHaveBeenCalled()
        })
      })
    })
  })

  describe('.failure', () => {
    describe('when the result is a boolean', () => {
      describe('when the result is true', () => {
        let mock: Mock

        beforeEach(async () => {
          mock = vi.fn(() => true)
          await T.failure(true, mock)
        })

        it('does not run the provided function', () => {
          expect(mock).not.toHaveBeenCalled()
        })
      })

      describe('when the result is false', () => {
        let mock: Mock
        let returnValue: boolean

        beforeEach(async () => {
          mock = vi.fn(() => true)
          returnValue = await T.failure(false, mock) as boolean
        })

        it('runs the provided function', () => {
          expect(mock).toHaveBeenCalled()
        })

        it('returns the result of the provided function', () => {
          expect(returnValue).to.eq(true)
        })
      })
    })

    describe('when the result is an array', () => {
      let mock: Mock
      let returnValue: boolean
      let value

      beforeEach(async () => {
        mock = vi.fn(() => true)
        value = [false]
        returnValue = await T.failure(value, mock) as boolean
      })

      describe('when the array contains only false values', () => {
        it('runs the provided function', () => {
          expect(mock).toHaveBeenCalled()
        })

        it('returns the result of the provided function', () => {
          expect(returnValue).to.eq(true)
        })
      })

      describe('when the array contains false and true', () => {
        beforeEach(async () => {
          mock = vi.fn(() => true)
          value = [false, true]
          returnValue = await T.failure(value, mock) as boolean
        })

        it('runs the provided function', () => {
          expect(mock).toHaveBeenCalled()
        })

        it('returns the result of the provided function', () => {
          expect(returnValue).to.eq(true)
        })
      })

      describe('when the array contains only true', () => {
        beforeEach(async () => {
          mock = vi.fn(() => true)
          value = [true, true]
          returnValue = await T.failure(value, mock) as boolean
        })

        it('does not runs the provided function', () => {
          expect(mock).not.toHaveBeenCalled()
        })
      })

      describe('when the array contains only truthy values', () => {
        beforeEach(async () => {
          mock = vi.fn(() => true)
          value = [{}, { name: 'Adam' }]
          returnValue = await T.failure(value, mock) as boolean
        })

        it('does not runs the provided function', () => {
          expect(mock).not.toHaveBeenCalled()
        })
      })
    })

    describe('when the result is a zod parse error', () => {
      let mock: Mock

      beforeEach(async () => {
        mock = vi.fn(() => true)
        await T.failure(z.string().min(2).safeParse(''), mock)
      })

      it('does run the provided function', () => {
        expect(mock).toHaveBeenCalled()
      })
    })
  })
})
