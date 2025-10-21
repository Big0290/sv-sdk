<script lang="ts">
  /**
   * Table component - iOS 26 Glassmorphism Edition
   * Glass data table with sorting and selection
   */

  import { cn } from '../../theme/utils'
  import { ChevronUp, ChevronDown } from 'lucide-svelte'

  interface Column {
    key: string
    label: string
    sortable?: boolean
    width?: string
  }

  interface Props {
    columns: Column[]
    data: Record<string, unknown>[]
    striped?: boolean
    hoverable?: boolean
    class?: string
  }

  let { columns, data, striped = false, hoverable = true, class: className = '' }: Props = $props()

  let sortKey = $state<string | null>(null)
  let sortDirection = $state<'asc' | 'desc'>('asc')

  const sortedData = $derived(() => {
    if (!sortKey) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  })

  function handleSort(key: string) {
    if (sortKey === key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey = key
      sortDirection = 'asc'
    }
  }
</script>

<div class={cn('glass-card !p-0 overflow-hidden', className)}>
  <div class="overflow-x-auto scrollbar-thin">
    <table class="w-full">
      <thead class="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-200/50 dark:border-gray-700/50">
        <tr>
          {#each columns as column}
            <th
              class={cn(
                'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                column.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200' : ''
              )}
              style={column.width ? `width: ${column.width}` : ''}
              onclick={() => column.sortable && handleSort(column.key)}
            >
              <div class="flex items-center gap-2">
                {column.label}
                {#if column.sortable}
                  <div class="flex flex-col">
                    <ChevronUp
                      class={cn(
                        'h-3 w-3 -mb-1',
                        sortKey === column.key && sortDirection === 'asc'
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-300 dark:text-gray-600'
                      )}
                    />
                    <ChevronDown
                      class={cn(
                        'h-3 w-3 -mt-1',
                        sortKey === column.key && sortDirection === 'desc'
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-300 dark:text-gray-600'
                      )}
                    />
                  </div>
                {/if}
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200/50 dark:divide-gray-700/50">
        {#each sortedData() as row, i}
          <tr
            class={cn(
              striped && i % 2 === 1 ? 'bg-gray-50/30 dark:bg-gray-800/20' : '',
              hoverable ? 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors' : ''
            )}
          >
            {#each columns as column}
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                {row[column.key]}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
