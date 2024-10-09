import { member } from '@/core/services/login/login';
import { useConfigurationStore } from '@/core/stores/configuration';
import { useAuthStore } from '@/core/stores/login';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export function useAuth() {
    // Refs y estados
    const showForm = ref(true);
    const showAccess = ref(false);
    const showInvalid = ref(false);
    const showInvalidConfiguration = ref(false);

    const authStore = useAuthStore();
    const configurationStore = useConfigurationStore();
    const router = useRouter();

    const DecodeJWT = (token) => JSON.parse(atob(token.split('.')[1]));

    const accessKeyCloak = async () => {
        if (localStorage.getItem('vue-token')) {
            showForm.value = false;
            const keyCloakToken = localStorage.getItem('vue-token');
            if (keyCloakToken) {
                await authStore.setJWTToken(keyCloakToken);
            }

            const keycloakInfo = await DecodeJWT(keyCloakToken);

            const project = import.meta.env.VITE_PROJECT;
            const appInfo = {
                realmId: keycloakInfo.azp,
                username: keycloakInfo.username,
                role: keycloakInfo.authorities[0],
                project: project
            };
            await authStore.setUser(appInfo);

            await sessionStorage.setItem('sessionToken', keyCloakToken);

            if (await isMember(appInfo.realmId)) {
                showAccess.value = true;
            } else {
                showAccess.value = false;
                showInvalid.value = true;
                console.log('paco');
                return { isloaded: false, error: 'User not allowed for this APP' };
            }
            const configuration = await configurationStore.getConfiguration();
            console.log(keycloakInfo, configuration);
            if (configuration instanceof SyntaxError || configuration.error) {
                showInvalid.value = false;
                showAccess.value = false;
                showInvalidConfiguration.value = true;
                return { isloaded: false, error: 'ERROR ON CENTRALIZED CONFIGURATION FILE' };
            } else {
                const selectedApp = configuration.find((x) => x.realmId === keycloakInfo.azp);
                configurationStore.setCurrentApplication(selectedApp);
            }
            console.log(appInfo, configuration);
            const environment = await authStore.loadEnvironment(appInfo, configuration);
            console.log(environment);
            const isEnvironmentError = environment instanceof Error;
            if (!isEnvironmentError) {
                if (environment.type === 'dashboard') {
                    console.log(environment);
                    router.push({ name: 'Dashboard', params: { dashboardId: environment.id } });
                } else if (environment.type === 'form') {
                    router.push({ name: 'Forms', params: { formcode: environment.id } });
                } else if (environment.type === 'other') {
                    router.push({ name: environment.id });
                } else {
                    router.push({ name: environment.id, path: environment.path, params: environment.params || {} });
                }
                return { isloaded: true };
            } else {
                console.error('Error loading environment');
                return { isloaded: false, error: 'Error loading environment' };
            }
        }
    };

    const isMember = async (realmId) => {
        try {
            console.log(realmId, 'realmId');
            const memberInformation = await member();
            const apps = memberInformation || [];
            console.log(apps);
            if (!memberInformation || apps.length === 0) {
                return false;
            }
            return apps.length > 0 && apps.includes(realmId);
        } catch (error) {
            console.error('Error checking Member:', error);
            return false;
        }
    };

    return {
        accessKeyCloak,
        isMember,
        showForm,
        showAccess,
        showInvalid,
        showInvalidConfiguration
    };
}
