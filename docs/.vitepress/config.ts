import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'SV-SDK',
  description: 'Full-stack authentication, authorization, and platform SDK for Svelte 5',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/getting-started/introduction' },
      { text: 'Packages', link: '/packages/core' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Examples', link: '/examples/admin-dashboard' },
      {
        text: 'v0.0.1',
        items: [
          { text: 'Changelog', link: 'https://github.com/your-org/sv-sdk/releases' },
          { text: 'Contributing', link: 'https://github.com/your-org/sv-sdk/blob/main/CONTRIBUTING.md' },
        ],
      },
    ],

    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/getting-started/introduction' },
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Quick Start', link: '/getting-started/quick-start' },
            { text: 'Configuration', link: '/getting-started/configuration' },
          ],
        },
      ],

      '/core-concepts/': [
        {
          text: 'Core Concepts',
          items: [
            { text: 'Architecture', link: '/core-concepts/architecture' },
            { text: 'Plugin System', link: '/core-concepts/plugin-system' },
            { text: 'Event Bus', link: '/core-concepts/event-bus' },
          ],
        },
      ],

      '/packages/': [
        {
          text: 'Core Packages',
          items: [
            { text: 'Core SDK', link: '/packages/core' },
            { text: 'Authentication', link: '/packages/auth' },
            { text: 'Permissions', link: '/packages/permissions' },
            { text: 'Database', link: '/packages/db-config' },
          ],
        },
        {
          text: 'Feature Packages',
          items: [
            { text: 'Email', link: '/packages/email' },
            { text: 'Audit', link: '/packages/audit' },
            { text: 'Cache', link: '/packages/cache' },
            { text: 'Security', link: '/packages/security' },
          ],
        },
        {
          text: 'UI & Utilities',
          items: [
            { text: 'UI Components', link: '/packages/ui' },
            { text: 'CLI', link: '/packages/cli' },
            { text: 'Validators', link: '/packages/validators' },
            { text: 'Shared', link: '/packages/shared' },
            { text: 'Observability', link: '/packages/observability' },
          ],
        },
      ],

      '/guides/': [
        {
          text: 'Guides',
          items: [
            { text: 'Authentication', link: '/guides/authentication' },
            { text: 'Permissions & RBAC', link: '/guides/permissions' },
            { text: 'Email Setup', link: '/guides/email-setup' },
            { text: 'Deployment', link: '/guides/deployment' },
          ],
        },
      ],

      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Admin Dashboard', link: '/examples/admin-dashboard' },
            { text: 'User Management', link: '/examples/user-management' },
            { text: 'Email Workflows', link: '/examples/email-workflows' },
            { text: 'Protected Routes', link: '/examples/protected-routes' },
            { text: 'Custom Plugins', link: '/examples/custom-plugins' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/sv-sdk' },
      { icon: 'discord', link: 'https://discord.gg/your-server' },
      { icon: 'twitter', link: 'https://twitter.com/your_handle' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Your Name/Organization',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/your-org/sv-sdk/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'SV-SDK' }],
  ],
})
