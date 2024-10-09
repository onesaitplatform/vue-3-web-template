import { useAuthStore } from '@/core/stores/login';
import Keycloak from 'keycloak-js';

const KEYCLOAK_REALM_ID = import.meta.env.VITE_KEYCLOAK_REALMID;
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENTID;
const KEYCLOAK_CLIENT_URL = import.meta.env.VITE_KEYCLOAK_URL;
const KEYCLOAK_CLIENT_SECRET = import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET;

const options = {
    url: KEYCLOAK_CLIENT_URL,
    realm: KEYCLOAK_REALM_ID,
    clientId: KEYCLOAK_CLIENT_ID,
    secret: KEYCLOAK_CLIENT_SECRET || '',
    onLoad: 'login-required'
};

const keycloakInstance = new Keycloak(options);

const Login = (onAuthenticatedCallback) => {
    const authStore = useAuthStore();
    keycloakInstance
        .init({ onLoad: 'login-required' })
        .then((authenticated) => {
            console.log(authenticated);
            if (authenticated) {
                const token = keycloakInstance.token;
                const refreshToken = keycloakInstance.refreshToken;

                if (token && refreshToken) {
                    authStore.setAuthData(token, refreshToken);
                    localStorage.setItem('vue-token', token);
                    localStorage.setItem('vue-refresh-token', refreshToken);
                }

                onAuthenticatedCallback();
                console.log('Authenticated!');
            } else {
                alert('Not authenticated');
            }
        })
        .catch((er) => {
            console.dir(er);
            console.log(`Keycloak init exception: ${er}`);
        });
};

const logout = () => {
    const authStore = useAuthStore();
    keycloakInstance.logout();
    authStore.clearAuth();
};

const KeyCloakService = {
    CallLogin: Login,
    logout
};

export default KeyCloakService;
