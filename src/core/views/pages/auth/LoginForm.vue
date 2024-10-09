<script setup>
import { member } from '@/core/services/login/login';
import { useConfigurationStore } from '@/core/stores/configuration';
import { useAuthStore } from '@/core/stores/login';

import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const configurationStore = useConfigurationStore();
const authStore = useAuthStore();
const toast = useToast();

const loginForm = ref({
    user: '',
    password: ''
});

const rules = ref({
    user: [{ required: true, message: 'User is required', trigger: 'submit' }],
    password: [{ required: true, message: 'Password is required', trigger: 'submit' }]
});

const options = ref([]);

const isLogged = ref(false);
const isMultipleApp = ref(false);

const errors = ref(false);
const showForm = ref(true);
const showAccess = ref(false);
const showInvalid = ref(false);
const showInvalidConfiguration = ref(false);

const getCurrentConfiguration = computed(() => useAuthStore.getCurrentConfiguration);

async function isMember(realmId) {
    try {
        const memberInformation = await member('', realmId);
        const apps = memberInformation || [];
        return apps.length > 0 && apps.includes(realmId);
    } catch (error) {
        console.error('Error checking Member:', error);
        return false;
    }
}

function checkLogOut() {
    const sessionOut = sessionStorage.getItem('sessionOut');
    if (sessionOut === '1') {
        toast.add({
            summary: 'Session Expires',
            detail: sessionStorage.getItem('sessionOutMessage') || 'The session expired due to timeout or some other problem, please login in the application.',
            severity: 'success',
            life: 10000,
            closable: true,
            position: 'top-right',
            icon: 'pi pi-info-circle'
        });
        sessionStorage.removeItem('sessionOut');
        sessionStorage.removeItem('sessionOutMessage');
    }
}

function goToLogin() {
    localStorage.clear();
    sessionStorage.clear();
    const platformUrl = import.meta.env.VITE_APP_PLATFORM;
    if (import.meta.env.VITE_APP_AUTH_TYPE === 'KEYCLOAK') {
        const keycloakRealmId = import.meta.env.VITE_APP_KEYCLOAK_REALMID;
        const keycloakApplication = import.meta.env.VITE_APP_APPLICATION;
        window.location.href = `/auth/realms/${keycloakRealmId}/protocol/openid-connect/logout?redirect_uri=${platformUrl}/web/${keycloakApplication}/`;
    } else {
        const webApplication = import.meta.env.VITE_APP_APPLICATION;
        window.location.href = `${platformUrl}/web/${webApplication}/login`;
    }
}

async function submitForm() {
    sessionStorage.clear();
    const valid = await validateForm();
    if (valid) {
        useAuthStore.loader(true);
        const data = {
            username: loginForm.value.user,
            password: loginForm.value.password
        };
        const user = await useAuthStore.preLogin(data);
        const isError = user instanceof Error;

        if (!isError) {
            toast.removeAll(); // Removemos todas las notificaciones antes de continuar
            isLogged.value = true;
            const configuration = await useAuthStore.getConfiguration();
            const availableApps = await useAuthStore.loadAvailableApplications();

            const nApps = configuration.filter((obj) => availableApps.includes(obj.realmId)).map(({ realmId, title }) => ({ value: realmId, label: title }));

            if (nApps.length === 0) {
                // handle no apps
            } else if (nApps.length === 1) {
                isMultipleApp.value = false;
                toast.add({
                    summary: `Accessing ${nApps[0].label}`,
                    detail: 'This User only has this Application available, loading its environment...',
                    severity: 'success',
                    life: 5000,
                    closable: true,
                    position: 'top-right',
                    icon: 'pi pi-check-circle'
                });
                const selectedApp = nApps[0].value;
                useAuthStore.setCurrentApplication(selectedApp);
                handleChangeApplication(selectedApp);
            } else {
                options.value = nApps;
                isMultipleApp.value = true;
                toast.add({
                    summary: 'Selection of Applications',
                    detail: 'This User has several Applications Available, please select which one you want to access...',
                    severity: 'success',
                    life: 30000,
                    closable: true,
                    position: 'top-right',
                    icon: 'pi pi-list'
                });
            }
            useAuthStore.loader(false);
        } else {
            toast.add({
                summary: 'Login error',
                detail: 'Check the username and password provided, and try again.',
                severity: 'error',
                life: 4000,
                closable: true,
                position: 'top-right',
                icon: 'pi pi-exclamation-circle'
            });
            useAuthStore.loader(false);
        }
    } else {
        errors.value = true;
        useAuthStore.loader(false);
    }
}

async function handleChangeApplication(app) {
    useAuthStore.loader(true);
    useAuthStore.resetGlobalFilters();
    const config = getCurrentConfiguration.value;
    const appConfig = config.find((x) => x.realmId === app);
    console.log(appConfig, 'lajkhsdloskjadkljkldj');
    useAuthStore.setCurrentApplication(app);

    appConfig.username = loginForm.value.user || config.find((o) => o.username).username;
    appConfig.password = loginForm.value.password || config.find((o) => o.password).password;

    const userApp = await useAuthStore.login(appConfig);
    const isAppError = userApp instanceof Error;

    if (!isAppError) {
        toast.removeAll(); // Removemos todas las notificaciones antes de continuar
        useAuthStore.setJWTToken(userApp.data.access_token);
        sessionStorage.setItem('sessionToken', userApp.data.access_token);
        appConfig.role = userApp.data.authorities[0];

        const i18nPlatform = await useAuthStore.getI18nData();
        const environment = await useAuthStore.loadEnvironment(appConfig);
        const isEnvironmentError = environment instanceof Error;

        if (!isEnvironmentError) {
            if (typeof environment === 'string') {
                router.push({ name: 'Dashboard', params: { dashboardId: environment } });
            } else if (Array.isArray(environment)) {
                const navigation = environment.find((x) => x.role === appConfig.role);
                if (navigation) {
                    router.push({ name: navigation.id, path: navigation.path, params: navigation.params || {} });
                }
            } else {
                router.push({ name: environment.id, path: environment.path, params: environment.params || {} });
            }
            useAuthStore.loader(false);
        } else {
            console.error('Error loading environment');
        }
    } else {
        console.error('Error during login');
    }
}

function accessToApp() {
    useAuthStore.loader(false);
    const accessAppRequest = localStorage.getItem('accessAppRequest');
    if (accessAppRequest) {
        showForm.value = false;
        showAccess.value = true;
        const accessData = JSON.parse(accessAppRequest);
        handleChangeApplication(accessData.realm);
    }
}

async function accessKeyCloak() {
    console.log('Holaa');
    if (localStorage.getItem('vue-token')) {
        showForm.value = false;
        const keyCloakToken = localStorage.getItem('vue-token');
        if (keyCloakToken) {
            authStore.setJWTToken(keyCloakToken);
        }

        const DecodeJWT = (token) => JSON.parse(atob(token.split('.')[1]));
        const keycloakInfo = DecodeJWT(keyCloakToken);

        const project = import.meta.env.VITE_PROJECT;
        const appInfo = {
            realmId: keycloakInfo.azp,
            username: keycloakInfo.username,
            role: keycloakInfo.authorities[0],
            project: project
        };
        authStore.setUser(appInfo);

        sessionStorage.setItem('sessionToken', keyCloakToken);

        if (await isMember(appInfo.realmId)) {
            showAccess.value = true;
        } else {
            showAccess.value = false;
            showInvalid.value = true;
            return false;
        }
        const configuration = await configurationStore.getConfiguration();
        console.log(keycloakInfo, configuration);
        console.log(configuration);
        if (configuration instanceof SyntaxError) {
            showInvalid.value = false;
            showAccess.value = false;
            showInvalidConfiguration.value = true;
            return false;
        } else {
            const selectedApp = configuration.find((x) => x.realmId === keycloakInfo.azp);
            console.log(selectedApp);
            configurationStore.setCurrentApplication(selectedApp);
        }
        console.log(appInfo, 'ñkajksdkdjskdj');
        const environment = await authStore.loadEnvironment(appInfo);
        const isEnvironmentError = environment instanceof Error;
        if (!isEnvironmentError) {
            console.log(isEnvironmentError, 'lakskdlajskldjklasjdlkasjdklsajdlksajd');
            router.push({ name: 'Dashboard', params: { dashboardId: environment } });
        } else {
            console.error('Error loading environment');
        }
    }
}

function validateForm() {
    return new Promise((resolve) => {
        if (loginForm.value.user && loginForm.value.password) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

onMounted(() => {
    // checkLogOut();
    // accessToApp();
    accessKeyCloak();
});
</script>

<template>
    <div class="surface-50 dark:surface-900 flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div v-if="showAccess" :class="['p-card', { 'p-overlay p-overlay-visible': loading && !mobile, 'p-overlay p-overlay-visible p-overlay-fullscreen p-overlay-lock': loading && mobile }]">
            <h2 class="p-card-title">Accessing the Application...</h2>
            <div class="p-card-content">
                <p>You are accessing the application, we are loading the Environment, in a few seconds you will be redirected...</p>
            </div>
        </div>

        <!-- invalid user in app -->
        <div v-if="showInvalid" :class="['p-card p-card-warn', { 'p-overlay p-overlay-visible': loading && !mobile, 'p-overlay p-overlay-visible p-overlay-fullscreen p-overlay-lock': loading && mobile }]">
            <h2 class="p-card-title"><i class="pi pi-exclamation-triangle"></i> User has no access to this APP.</h2>
            <div class="p-card-content">
                <p>You are a valid platform User, but you don't have permission on this APP. Please contact the administrator of the platform.</p>
                <div class="block">
                    <Button label="Back to Login" class="p-button p-button-primary" @click="goToLogin"></Button>
                </div>
            </div>
        </div>

        <!-- invalid centralized configuration -->
        <div v-if="showInvalidConfiguration" :class="['p-card p-card-warn', { 'p-overlay p-overlay-visible': loading && !mobile, 'p-overlay p-overlay-visible p-overlay-fullscreen p-overlay-lock': loading && mobile }]">
            <h2 class="p-card-title"><i class="pi pi-exclamation-triangle"></i> Centralized configuration Error</h2>
            <div class="p-card-content">
                <p>The centralized configuration file has errors, or can't be loaded, so the APP will not run. Please contact the administrator of the platform.</p>
                <div class="block">
                    <Button label="Back to Login" class="p-button p-button-primary" @click="goToLogin"></Button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Aquí se coloca el CSS del componente */
</style>

<style lang="scss" scoped></style>
