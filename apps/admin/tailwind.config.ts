import type { Config } from 'tailwindcss';
import uiConfig from '../../packages/ui/tailwind.config';

const config: Config = {
	...uiConfig,
	content: ['./src/**/*.{html,js,svelte,ts}', '../../packages/ui/src/**/*.{html,js,svelte,ts}']
};

export default config;
