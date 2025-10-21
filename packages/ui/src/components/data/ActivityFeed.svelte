<script lang="ts">
  import { cn } from '../../theme/utils'

  interface Activity {
    id: string
    user: string
    action: string
    timestamp: Date
    icon?: string
  }

  interface Props {
    activities: Activity[]
    class?: string
  }

  let { activities, class: className = '' }: Props = $props()
</script>

<div class={cn('glass-card', className)}>
  <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
  <div class="space-y-4">
    {#each activities as activity}
      <div class="flex items-start gap-3">
        <span class="text-2xl">{activity.icon || '📌'}</span>
        <div class="flex-1">
          <p class="text-sm text-gray-900 dark:text-gray-100">
            <span class="font-medium">{activity.user}</span>
            {activity.action}
          </p>
          <p class="text-xs text-gray-500 mt-0.5">{activity.timestamp.toLocaleString()}</p>
        </div>
      </div>
    {/each}
  </div>
</div>
