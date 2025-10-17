<script lang="ts">
  import { Card, Button, Input, Alert } from '@sv-sdk/ui'

  let saved = $state(false)

  async function saveSettings() {
    // Implementation would save settings to database
    saved = true
    setTimeout(() => (saved = false), 3000)
  }
</script>

<div class="p-8">
  <div class="page-header">
    <h1 class="page-title">Settings</h1>
    <p class="text-gray-600 dark:text-gray-400 mt-1">
      Configure system settings
    </p>
  </div>

  {#if saved}
    <Alert variant="success" class="mb-6" dismissible>
      Settings saved successfully!
    </Alert>
  {/if}

  <div class="space-y-6">
    <!-- General Settings -->
    <Card>
      <h2 class="text-lg font-semibold mb-4">General Settings</h2>
      <div class="space-y-4">
        <Input label="Application Name" value="SV-SDK Admin" />
        <Input label="Support Email" value="support@example.com" type="email" />
        <Input label="Default Locale" value="en" />
      </div>
    </Card>

    <!-- Email Provider Settings -->
    <Card>
      <h2 class="text-lg font-semibold mb-4">Email Provider</h2>
      <div class="space-y-4">
        <Input label="Provider" value="brevo" disabled />
        <Input label="From Address" value="noreply@example.com" type="email" />
        <Alert variant="info">
          Configure email provider settings in environment variables.
        </Alert>
      </div>
    </Card>

    <!-- Security Settings -->
    <Card>
      <h2 class="text-lg font-semibold mb-4">Security</h2>
      <div class="space-y-4">
        <Input label="Session Timeout (minutes)" value="43200" type="number" />
        <Input label="Max Login Attempts" value="5" type="number" />
        <Input label="Rate Limit Window (ms)" value="900000" type="number" />
      </div>
    </Card>

    <!-- Audit Settings -->
    <Card>
      <h2 class="text-lg font-semibold mb-4">Audit & Retention</h2>
      <div class="space-y-4">
        <Input label="Log Retention (days)" value="365" type="number" />
        <Alert variant="warning">
          Logs older than retention period will be archived and deleted.
        </Alert>
      </div>
    </Card>

    <div class="flex justify-end">
      <Button variant="primary" onclick={saveSettings}>
        Save Settings
      </Button>
    </div>
  </div>
</div>

