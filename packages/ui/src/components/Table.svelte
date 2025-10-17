<script lang="ts" generics="T">
  /**
   * Table component
   * Sortable, filterable data table with pagination
   */

  interface Column<T> {
    key: keyof T
    label: string
    sortable?: boolean
    render?: (value: any, row: T) => any
  }

  interface Props<T> {
    data: T[]
    columns: Column<T>[]
    selectable?: boolean
    onRowClick?: (row: T) => void
  }

  let {
    data,
    columns,
    selectable = false,
    onRowClick,
  }: Props<T> = $props()

  let selectedRows = $state<Set<number>>(new Set())
  let sortColumn = $state<keyof T | null>(null)
  let sortDirection = $state<'asc' | 'desc'>('asc')

  const sortedData = $derived(() => {
    if (!sortColumn) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  })

  function handleSort(column: Column<T>) {
    if (!column.sortable) return

    if (sortColumn === column.key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn = column.key
      sortDirection = 'asc'
    }
  }

  function toggleRowSelection(index: number) {
    if (selectedRows.has(index)) {
      selectedRows.delete(index)
    } else {
      selectedRows.add(index)
    }
    selectedRows = new Set(selectedRows)
  }
</script>

<div class="overflow-x-auto">
  <table class="data-table">
    <thead>
      <tr>
        {#if selectable}
          <th class="w-12">
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300"
              onchange={(e) => {
                if ((e.target as HTMLInputElement).checked) {
                  selectedRows = new Set(data.map((_, i) => i))
                } else {
                  selectedRows = new Set()
                }
              }}
            />
          </th>
        {/if}
        {#each columns as column}
          <th
            class:cursor-pointer={column.sortable}
            onclick={() => handleSort(column)}
          >
            <div class="flex items-center gap-2">
              {column.label}
              {#if column.sortable && sortColumn === column.key}
                <span class="text-xs">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              {/if}
            </div>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each sortedData() as row, index}
        <tr
          class:cursor-pointer={!!onRowClick}
          onclick={() => onRowClick?.(row)}
        >
          {#if selectable}
            <td>
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300"
                checked={selectedRows.has(index)}
                onchange={() => toggleRowSelection(index)}
                onclick={(e) => e.stopPropagation()}
              />
            </td>
          {/if}
          {#each columns as column}
            <td>
              {#if column.render}
                {@render column.render(row[column.key], row)}
              {:else}
                {row[column.key]}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

