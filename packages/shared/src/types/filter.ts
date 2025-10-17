/**
 * Filter operators
 */
export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  IN = 'in',
  NOT_IN = 'nin',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
}

/**
 * Filter condition
 */
export interface FilterCondition<T = unknown> {
  field: string
  operator: FilterOperator
  value?: T
}

/**
 * Logical operators for combining filters
 */
export enum LogicalOperator {
  AND = 'and',
  OR = 'or',
}

/**
 * Filter group with logical operator
 */
export interface FilterGroup {
  operator: LogicalOperator
  conditions: (FilterCondition | FilterGroup)[]
}

/**
 * Sort order
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Sort parameter
 */
export interface SortParam {
  field: string
  order: SortOrder
}

/**
 * Search parameters
 */
export interface SearchParams {
  query: string
  fields?: string[] // Fields to search in
}

/**
 * Complete query parameters
 */
export interface QueryParams {
  filters?: FilterCondition[]
  filterGroup?: FilterGroup
  sort?: SortParam[]
  search?: SearchParams
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  from?: Date
  to?: Date
}

/**
 * Number range filter
 */
export interface NumberRangeFilter {
  min?: number
  max?: number
}
