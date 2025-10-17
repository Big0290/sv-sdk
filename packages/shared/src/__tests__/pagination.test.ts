import { describe, it, expect } from 'vitest'
import { calculatePaginationMeta, calculateOffset, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../types/pagination.js'

describe('Pagination utilities', () => {
  describe('calculatePaginationMeta', () => {
    it('should calculate metadata for first page', () => {
      const meta = calculatePaginationMeta({ page: 1, pageSize: 20 }, 100)

      expect(meta.page).toBe(1)
      expect(meta.pageSize).toBe(20)
      expect(meta.totalPages).toBe(5)
      expect(meta.totalCount).toBe(100)
      expect(meta.hasNextPage).toBe(true)
      expect(meta.hasPreviousPage).toBe(false)
    })

    it('should calculate metadata for middle page', () => {
      const meta = calculatePaginationMeta({ page: 3, pageSize: 20 }, 100)

      expect(meta.page).toBe(3)
      expect(meta.hasNextPage).toBe(true)
      expect(meta.hasPreviousPage).toBe(true)
    })

    it('should calculate metadata for last page', () => {
      const meta = calculatePaginationMeta({ page: 5, pageSize: 20 }, 100)

      expect(meta.page).toBe(5)
      expect(meta.hasNextPage).toBe(false)
      expect(meta.hasPreviousPage).toBe(true)
    })

    it('should handle partial last page', () => {
      const meta = calculatePaginationMeta({ page: 1, pageSize: 20 }, 15)

      expect(meta.totalPages).toBe(1)
      expect(meta.totalCount).toBe(15)
      expect(meta.hasNextPage).toBe(false)
    })
  })

  describe('calculateOffset', () => {
    it('should calculate offset for first page', () => {
      const offset = calculateOffset({ page: 1, pageSize: 20 })
      expect(offset).toBe(0)
    })

    it('should calculate offset for second page', () => {
      const offset = calculateOffset({ page: 2, pageSize: 20 })
      expect(offset).toBe(20)
    })

    it('should calculate offset for any page', () => {
      const offset = calculateOffset({ page: 5, pageSize: 10 })
      expect(offset).toBe(40)
    })
  })

  describe('constants', () => {
    it('should export default values', () => {
      expect(DEFAULT_PAGE).toBe(1)
      expect(DEFAULT_PAGE_SIZE).toBe(20)
    })
  })
})
