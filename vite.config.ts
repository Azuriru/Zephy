import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use '$lib/index.scss' as *;`
            },
        },
    },
	build: {
		sourcemap: true
	},
	server: {
		port: 3000,
		open: true,
		host: true
	},
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			devOptions: {
		  		enabled: true
			}
		})
	]
});
