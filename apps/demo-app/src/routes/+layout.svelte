<script lang="ts">
  import '../app.css'
  import { page } from '$app/stores'

  const { data, children } = $props()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Profile', href: '/profile' },
  ]
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
  <!-- Navbar -->
  <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center gap-8">
          <a href="/" class="text-xl font-bold text-primary-600 dark:text-primary-400"> SV-SDK Demo </a>
          <div class="hidden md:flex gap-4">
            {#each navigation as item}
              <a
                href={item.href}
                class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
                class:text-primary-600={$page.url.pathname === item.href}
              >
                {item.name}
              </a>
            {/each}
          </div>
        </div>

        <div class="flex items-center gap-4">
          {#if data.user}
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {data.user.email}
            </span>
            <form method="POST" action="/logout">
              <button
                type="submit"
                class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Logout
              </button>
            </form>
          {:else}
            <a href="/login" class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
              Login
            </a>
            <a
              href="/signup"
              class="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-md"
            >
              Sign Up
            </a>
          {/if}
        </div>
      </div>
    </div>
  </nav>

  <!-- Main content -->
  <main>
    {@render children?.()}
  </main>

  <!-- Footer -->
  <footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <p class="text-center text-gray-600 dark:text-gray-400 text-sm">Built with SV-SDK © 2024</p>
    </div>
  </footer>
</div>
