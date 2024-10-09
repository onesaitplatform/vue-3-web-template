import { api } from '@/core/services/api';
import { member } from '@/core/services/login/login';
import { getApps, getRealms } from '@/core/services/login/login';
import { jwtDecode } from 'jwt-decode';
import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
export const useAuthStore = defineStore('auth', () => {
    // STATE
    const token = ref(null);
    const refreshToken = ref(null);
    const loading = ref(false);
    const isPasswordText = ref(false);
    const mqPhone = ref(window.matchMedia('(max-width: 767px)'));
    const navigation = ref([]);
    const languages = ref([]);
    const messages = ref([]);
    const applications = ref([]);
    const customization = ref({});
    const i18nId = ref(import.meta.env.VITE_PLATFORM_I18n || '');
    const keyCloakToken = ref('');

    // Use reactive for complex state like objects
    const user = reactive({
        userName: 'aclaramonte',
        fullName: 'Alex Claramonte',
        role: 'Admin',
        email: 'aclaramonte@minsait.com',
        image: ''
    });

    const loginType = ref({
        type: import.meta.env.VITE_LOGIN_TYPE
    });

    const loginEndpoints = ref({
        userData: import.meta.env.VITE_USERINFO,
        userRealmData: import.meta.env.VITE_USERINFO_REALM,
        userRealmElements: import.meta.env.VITE_USERINFO_REALM_ELEMENTS,
        availableUserApps: import.meta.env.VITE_USER_AVAILABLE_APPS
    });

    /*
    GETTERS
    */
    const getToken = computed(() => token.value);
    const getRefreshToken = computed(() => refreshToken.value);
    const getUser = computed(() => user);
    const isAuthenticated = computed(() => user !== null);
    const getLoaderState = computed(() => loading.value);
    const getIsMobile = computed(() => mqPhone.value.matches);
    const getIsPasswordForm = computed(() => isPasswordText.value);
    const getLoginType = computed(() => loginType.value.type);
    const getUserDataEndpoint = computed(() => loginEndpoints.value.userData);
    const getUserDataRealmEndpoint = computed(() => loginEndpoints.value.userRealmData);
    const getUserDataRealmElements = computed(() => loginEndpoints.value.userRealmElements);
    const getAvailableUserApps = computed(() => loginEndpoints.value.availableUserApps);
    const getNavigation = computed(() => navigation.value);
    const getI18n = computed(() => i18nId.value);
    const getLanguages = computed(() => languages.value);
    const getMessages = computed(() => messages.value);
    const getLoginToken = computed(() => keyCloakToken.value);
    const getRealmsApp = computed(() => applications.value);
    const isMultipleApp = computed(() => applications.value.length > 0);
    const getCustomization = computed(() => customization.value);
    const getApplications = computed(() => applications.value);
    /*
    ACTIONS
    */

    // SET USER DATA BY KEYCLOAK
    const setAuthData = (newToken, newRefreshToken) => {
        token.value = newToken;
        refreshToken.value = newRefreshToken;
        if (newToken) {
            const decoded = jwtDecode(newToken);
            console.log('AUTH: ', decoded, token.value);
            user.userName = decoded.username;
            user.fullName = decoded.preferred_username || decoded.sub;
            if (Array.isArray(decoded.role)) {
                user.role = decoded.role[0] || '---';
            } else {
                user.role = decoded.role || '---';
            }
            if (!decoded.image) {
                const initial = (user.fullName || user.userName || 'U')[0].toUpperCase();
                user.image = initial;
            } else {
                user.image = decoded.image;
            }
            user.email = decoded.email;
        }
    };

    // CLEAR AUTH ON LOGOUT
    const clearAuth = () => {
        token.value = null;
        refreshToken.value = null;
        // Using Object.assign to clear reactive object
        Object.assign(user, { userName: '', fullName: '', role: '', email: '', image: '' });
    };

    // LOADER
    const loader = (actions) => {
        loading.value = actions.loader === true;
        isPasswordText.value = actions.password === true;
    };
    const loadEnvironment = async (app, configuration) => {
        try {
            console.log('|--> loading environment for App:', app);
            await getAppUserUserInfo(app);
            console.log('  |--> Loading User Session Info.');

            await getDashboards(app);
            console.log('  |--> Loading Available Dashboards.');

            console.log('  |--> Loading Available Navigation.');
            await loadAvailableApplications(configuration);
            // filters
            ///const currentFilters = getFilters();
            console.log('  |--> Loading Available Filters.');

            let showFavorites = true;
            let customization = getCustomization.value || {};
            if (customization && customization.showfavorites !== 'undefined') {
                showFavorites = customization.showfavorites;
            } else {
                showFavorites = false;
            }

            let dashboardRoute;

            if (showFavorites) {
                dashboardRoute = `${app.username}_${app.realmId}_fav`;
            } else {
                console.log(getApplications.value, app);
                let config = getApplications.value;

                if (config && config.initialNavigation && Array.isArray(config.initialNavigation)) {
                    const role = sessionStorage.getItem('role');
                    console.log(role, config.initialNavigation);

                    const initHomePage = config.initialNavigation.find((element) => element.role === role);
                    console.log('  |--> Available InitHomePage:', initHomePage);

                    if (!initHomePage) {
                        const rolesComponentes = config.components.navigation.find((element) => element.role === role);

                        if (!rolesComponentes) {
                            const firstNavigationKey = Object.keys(config.navigation)[0];
                            dashboardRoute = config.navigation[firstNavigationKey];
                        } else if (rolesComponentes.allowed.length > 0) {
                            dashboardRoute = rolesComponentes.allowed[0];
                        } else {
                            const firstNavigationKey = Object.keys(config.navigation)[0];
                            console.log('Navigation:', config.navigation[firstNavigationKey]);
                            dashboardRoute = config.navigation[firstNavigationKey];
                        }
                    } else {
                        dashboardRoute = initHomePage;
                    }
                    console.log(dashboardRoute);
                } else {
                    const initHomePage = config && config.initialNavigation ? config.initialNavigation : '';
                    console.log('  |--> Available InitHomePage:', initHomePage, config);
                    dashboardRoute = initHomePage;
                }

                loading.value = true;
                return dashboardRoute;
            }
        } catch (error) {
            console.log('Loading Environment error: ', error);
            return error;
        }
    };
    const getAppUserUserInfo = async (app) => {
        try {
            const urlUserInfo = `${app.realmId}/users/${app.username}`;
            const info = await getRealms(urlUserInfo);
            if (!info || !info.data || !info.data.length) {
                //router.push({ name: 'error' });
                return;
            }
            console.log('  |--> User Info:', info);
            sessionStorage.username = info.data[0].username;
            sessionStorage.usermail = info.data[0].mail;
            sessionStorage.role = info.data[0].role;

            const userInfo = {
                user: info.data[0].username,
                username: info.data[0].fullName,
                email: info.data[0].mail,
                role: info.data[0].role
            };

            setUser(userInfo);

            return userInfo;
        } catch (error) {
            console.error('Error al obtener la información del usuario:', error);
            throw error;
        }
    };

    const updateApplications = () => {
        const availableApps = JSON.parse(localStorage.getItem('vuex'));
        if (availableApps && availableApps.login && availableApps.login.applications && availableApps.login.applications.length > 0) {
            console.log('updating applications to make reactive for suites menus...', availableApps.login.applications);
            applications.value = availableApps.login.applications;
        }
    };
    // LOAD AVAILABLE USER APPLICATIONS
    const loadAvailableApplications = async (configuration) => {
        try {
            resetApplications();
            const findAppByRealmId = (apps, appData) => {
                return apps.find((app) => appData.includes(app.realmId));
            };
            const memberInformation = await member();
            const apps = memberInformation || [];

            const result = findAppByRealmId(configuration, apps);
            console.log(result);
            if (!result) {
                // no encuentra apliaciones
                //router.push({ name: 'error' });
                console.log('  |--> No available applications for user:', apps);
                return;
            }
            console.log('  |--> Available Applications:', result);
            setApplications(result);
            return result;
        } catch (error) {
            console.log(error);
            return error;
        }
    };

    // SET JWT TOKEN
    const setJWTToken = async (data) => {
        await setToken(data);
        await setTokenService({ token: data });
    };

    // GET DASHBOARDS
    const getDashboards = async (app) => {
        const urlProjects = `${app.project}/resources/role/${app.role}`;
        const elements = await getApps(urlProjects);
        const dashboards = elements.data.filter((x) => x.resourceType === 'DASHBOARD').map((o) => ({ name: o.resource, id: o.resource }));
        setNavigation(dashboards);
        return dashboards;
    };

    // MUTATIONS
    const setUser = (newUser) => {
        Object.assign(user, newUser);
    };

    const setToken = (newToken) => {
        keyCloakToken.value = newToken;
    };

    const setNavigation = (payload) => {
        navigation.value = payload;
    };

    const setLanguages = (payload) => {
        languages.value = payload;
    };

    const setMessages = (payload) => {
        messages.value = payload;
    };

    const setApplications = (payload) => {
        applications.value = payload;
    };

    const resetApplications = () => {
        applications.value = [];
    };

    const setTokenService = (tokenData) => {
        api.setToken(tokenData.token);
        token.value = tokenData.token;
        sessionStorage.setItem('keycloakToken', tokenData.token);
    };

    const setLoad = (payload) => {
        // Assuming there's a load state to handle in actions
        loading.value = payload;
    };

    return {
        token,
        refreshToken,
        user,
        setAuthData,
        clearAuth,
        getUser,
        getToken,
        isAuthenticated,
        getRefreshToken,
        loading,
        isPasswordText,
        mqPhone,
        navigation,
        languages,
        messages,
        applications,
        i18nId,
        keyCloakToken,
        getLoaderState,
        getIsMobile,
        getIsPasswordForm,
        getLoginType,
        getUserDataEndpoint,
        getUserDataRealmEndpoint,
        getUserDataRealmElements,
        getAvailableUserApps,
        getNavigation,
        getI18n,
        getLanguages,
        getMessages,
        getLoginToken,
        getRealmsApp,
        isMultipleApp,
        loader,
        loadAvailableApplications,
        setJWTToken,
        getDashboards,
        setUser,
        setToken,
        setNavigation,
        setLanguages,
        setMessages,
        setApplications,
        resetApplications,
        setTokenService,
        setLoad,
        updateApplications,
        loadEnvironment
    };
});
