// APP AND ROUTER
import { createApp, markRaw } from 'vue';
import App from './core/App.vue';
import router from './core/router';

// PINIA FOR STORE MANAGEMENT
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// PRIMEVUE
import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
// PRIME VUE THEMES, TAILWIND AND ICONs
import '@/core/assets/styles.scss';
import '@/core/assets/tailwind.css';
import 'primeicons/primeicons.css';
import { definePreset } from '@primevue/themes';

const onesait = definePreset(Aura, {
    semantic: {
        colorScheme: {
            light: {
                surface: {
                    0: '#f5f5f5',
                    50: '#f5f5f5',
                    100: '{zinc.100}'
                },

                primary: {
                    50: '{blue.50}',
                    100: '{blue.100}',
                    200: '{blue.200}',
                    300: '{blue.300}',
                    400: '{blue.400}',
                    500: '{blue.500}',
                    600: '{blue.600}',
                    700: '{blue.700}',
                    800: '{blue.800}',
                    900: '{blue.900}',
                    950: '{blue.950}'
                }
            },
            dark: {
                surface: {
                    0: '#121212' // Fondo general para el esquema oscuro
                },
                primary: {
                    50: '{blue.50}',
                    100: '{blue.100}',
                    200: '{blue.200}',
                    300: '{blue.300}',
                    400: '{blue.400}',
                    500: '{blue.500}',
                    600: '{blue.600}',
                    700: '{blue.700}',
                    800: '{blue.800}',
                    900: '{blue.900}',
                    950: '{blue.950}'
                }
            }
        }
    }
});

import { createI18n } from 'vue-i18n';
const i18n = createI18n({
    // options here
});

// DAYS
import { dayjs } from 'dayjs';

// KEYCLOAK
// eslint-disable-next-line no-unused-vars
import KeyCloakService from '@/core/security/KeycloackService';

// ----------------------- APP Onesait Platform -----------------------
const app = createApp(App);

app.config.globalProperties.$dayjs = dayjs;
app.use(pinia);
pinia.use(({ store }) => {
    store.router = markRaw(router);
});

const renderApp = () => {
    // APP USEs
    app.use(router);
    app.use(PrimeVue, {
        theme: {
            preset: onesait,
            options: {
                darkModeSelector: '.app-dark', //system para que coja la del sistema
                ripple: true,
                inputVariant: 'filled',
                prefix: 'p',
                cssLayer: false
            }
        }
    });
    app.use(ToastService);
    app.component('Toast', Toast);
    app.use(ConfirmationService);
    app.use(i18n);
    app.mount('#app');

    // DEFINE APP TO USE EXTERNAL
    window.osvm = app;
};

// AUTH APP MODE
if (import.meta.env.VITE_AUTH_TYPE === 'KEYCLOAK') {
    // KEYCLOAK
    console.log('KEYCLOAK MODE...');
    KeyCloakService.CallLogin(renderApp);
} else {
    // REALM
    console.log('REALM MODE...');
    renderApp();
}
