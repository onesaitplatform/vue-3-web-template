import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import Components from 'unplugin-vue-components/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    // eslint-disable-next-line no-undef
    const env = loadEnv(mode, process.cwd(), '');

    // Balancer or default app defined in .env.
    let BALANCER = '';
    if (mode === 'development') {
        BALANCER = '/';
    } else {
        BALANCER = env.VITE_BALANCER.length ? env.VITE_BALANCER : '/web/' + env.VITE_APPLICATION + '/';
    }

    return {
        // vite config
        define: {
            VUE_APP_APPLICATION: JSON.stringify(env.VUE_APP_APPLICATION),
            VUE_APP_AUTH_TYPE: JSON.stringify(env.VUE_APP_AUTH_TYPE),
            VUE_APP_KEYCLOAK_REALMID: JSON.stringify(env.VUE_APP_KEYCLOAK_REALMID),
            VUE_APP_KEYCLOAK_CLIENTID: JSON.stringify(env.VUE_APP_KEYCLOAK_CLIENTID)
        },
        server: {
            port: 5173,
            strictPort: true,
            hmr: {
                port: 5173
            }
        },
        base: BALANCER,
        plugins: [
            vue(),
            Components({
                resolvers: [PrimeVueResolver()]
            })
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        }
    };
});
