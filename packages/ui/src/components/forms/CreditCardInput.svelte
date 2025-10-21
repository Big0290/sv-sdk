<script lang="ts">
  import { cn } from '../../theme/utils'
  import { CreditCard } from 'lucide-svelte'

  interface Props {
    number?: string
    expiry?: string
    cvv?: string
    name?: string
    class?: string
    onChange?: (data: { number: string; expiry: string; cvv: string; name: string }) => void
  }

  let {
    number = $bindable(''),
    expiry = $bindable(''),
    cvv = $bindable(''),
    name = $bindable(''),
    class: className = '',
    onChange,
  }: Props = $props()

  function formatCardNumber(value: string) {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
  }

  function formatExpiry(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substring(0, 5)
  }

  function handleChange() {
    onChange?.({ number, expiry, cvv, name })
  }
</script>

<div class={cn('glass-card', className)}>
  <div class="mb-4">
    <label for="card-number" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      <CreditCard class="inline h-4 w-4 mr-2" />
      Card Number
    </label>
    <input
      id="card-number"
      bind:value={number}
      oninput={(e) => {
        number = formatCardNumber((e.target as HTMLInputElement).value)
        handleChange()
      }}
      placeholder="1234 5678 9012 3456"
      maxlength="19"
      class="input"
    />
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label for="card-expiry" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expiry</label>
      <input
        id="card-expiry"
        bind:value={expiry}
        oninput={(e) => {
          expiry = formatExpiry((e.target as HTMLInputElement).value)
          handleChange()
        }}
        placeholder="MM/YY"
        maxlength="5"
        class="input"
      />
    </div>
    <div>
      <label for="card-cvv" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">CVV</label>
      <input
        id="card-cvv"
        bind:value={cvv}
        oninput={handleChange}
        type="password"
        placeholder="123"
        maxlength="4"
        class="input"
      />
    </div>
  </div>

  <div class="mt-4">
    <label for="cardholder-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
      >Cardholder Name</label
    >
    <input
      id="cardholder-name"
      bind:value={name}
      oninput={handleChange}
      placeholder="JOHN DOE"
      class="input uppercase"
    />
  </div>
</div>
