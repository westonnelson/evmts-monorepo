import { vitePluginEvmts } from '@evmts/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
	define: {
		global: 'globalThis',
	},
	build: {
		rollupOptions: {
			external: [
				'@safe-globalThis/safe-apps-provider',
				'@safe-globalThis/safe-apps-sdk',
			],
		},
	},
	plugins: [
		nodePolyfills({
			include: ['stream'],
			globals: {
				process: true,
				Buffer: true,
				global: true,
			},
		}),
		react(),
		vitePluginEvmts({}) as any,
	],
})
