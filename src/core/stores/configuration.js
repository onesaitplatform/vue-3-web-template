// CONFIGURATION STORE

// IMPORT SECTION
import { getConfigurationService } from '@/core/services/login/login';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
// CONFIGURATION STORE
export const useConfigurationStore = defineStore('configuration', () => {
    // CONFIGURATION STATE
    const externalConfigurationId = import.meta.env.VITE_PLATFORM_CONFIGURATION;
    const configurationId = ref(externalConfigurationId);
    const loading = ref(false);
    const configuration = ref([]);
    const applicationList = ref([]);
    const currentApplication = ref('');
    const currentNavigation = ref({});
    const currentFilters = ref({});
    const customization = ref({});
    const filter = ref();
    const productInfoLocal = ref({
        suite: 'platform',
        product: 'Application',
        productModule: '',
        secondary: false,
        negative: false,
        simple: false,
        onesait: false,
        accentBlock: false
    }); // let {} to load default logo
    const productInfo = ref({});

    // CONFIGURATION GETTERS (Computed Properties in Pinia)
    const getCurrentConfiguration = computed(() => configuration.value);
    const getCurrentApplication = computed(() => currentApplication.value);
    const getConfigurationEndpoint = () => import.meta.env.VITE_CONFIGURATION;
    const getConfigurationId = computed(() => configurationId.value);
    const getAppI18nId = computed(() => {
        const currentApp = currentApplication.value;
        return configuration.value.filter((app) => app.realmId === currentApp).map((item) => item.i18n)[0] || '';
    });
    const getCurrentNavigation = computed(() => {
        const currentApp = currentApplication.value.realmId;
        const currentConfig = configuration.value.filter((app) => app.realmId === currentApp);
        const currentNavigation = currentConfig.map((item) => item.navigation) || {};
        return currentNavigation || {};
    });
    const getCurrentAppTitle = computed(() => {
        const currentApp = currentApplication.value;
        return currentApp.title || currentApp.productInfo?.product || 'ONESAIT PLATFORM';
    });
    const getCurrentCustomization = computed(() => {
        const currentApp = currentApplication.value.realmId;
        const currentConfig = configuration.value.filter((app) => app.realmId === currentApp);
        return currentConfig.map((item) => item.customization)[0];
    });
    const getCurrentApp = computed(() => {
        const currentApp = currentApplication.value;
        return configuration.value.filter((app) => app.realmId === currentApp)[0] || {};
    });
    const getCurrentProductInfo = computed(() => {
        const currentApp = currentApplication.value;
        if (currentApp !== '' && currentApp !== undefined) {
            return configuration.value.filter((app) => app.realmId === currentApp)[0].productInfo || productInfoLocal.value;
        } else {
            return productInfoLocal.value;
        }
    });

    // CONFIGURATION ACTIONS (Async functions in Pinia)
    const getConfiguration = async () => {
        try {
            const endpoint = getConfigurationId.value + '/type/EXTERNAL_CONFIG/environment/default';
            const configurationData = await getConfigurationService(endpoint);
            const configStr = configurationData.data.yml || '{}';
            const config = configStr.replace(/\s+/g, ' ').trim();

            // Intentar parsear el JSON
            let parsedConfig;
            try {
                parsedConfig = JSON.parse(config);
            } catch (error) {
                console.log('ERROR ON CENTRALIZED CONFIGURATION FILE');
                return { error: 'Syntax Error' };
            }

            // Configuración correcta
            setConfiguration(parsedConfig);
            setApplicationList(parsedConfig.map((x) => x.realmId));

            // Configuración de producto
            let productInfo = {};
            if (parsedConfig.map((x) => x.realmId).productInfo !== undefined && Object.keys(parsedConfig.map((x) => x.realmId).productInfo).length > 0) {
                productInfo = parsedConfig.map((x) => x.realmId).productInfo;
            }
            setCurrentProduct(productInfo);
            return parsedConfig;
        } catch (error) {
            console.log(error);

            return error;
        }
    };

    const setCurrentApplication = (app) => {
        setApplication(app);

        const navigation = configuration.value.filter((app) => app.realmId === app).map((item) => item.navigation)[0];
        setCurrentNavigation(navigation);

        const filters = configuration.value.filter((app) => app.realmId === app).map((item) => item.globalFilters)[0];
        setCurrentFilters(filters);

        const customization = configuration.value.filter((app) => app.realmId === app).map((item) => item.customization)[0];
        // set i18n for reload
        const currentI18n = getAppI18nId.value;
        sessionStorage.setItem('currentI18n', currentI18n);
    };

    const setCurrentNavigation = (navigation) => {
        setNavigation(navigation);
    };

    const setCurrentFilters = (filters) => {
        setFilters(filters);
    };

    // CONFIGURATION MUTATIONS (Setters in Pinia)
    const setFilter = (payload) => {
        filter.value = payload;
    };

    const setConfiguration = (payload) => {
        configuration.value = payload;
    };

    const setApplicationList = (payload) => {
        applicationList.value = payload;
    };

    const setApplication = (payload) => {
        currentApplication.value = payload;
    };

    const setNavigation = (payload) => {
        currentNavigation.value = payload;
    };
    const setCustomization = (payload) => {
        customization.value = payload;
    };
    const setFilters = (payload) => {
        currentFilters.value = payload;
    };

    const setCurrentProduct = (payload) => {
        productInfo.value = payload;
    };

    return {
        // State
        configurationId,
        loading,
        configuration,
        applicationList,
        currentApplication,
        currentNavigation,
        currentFilters,
        productInfoLocal,
        productInfo,

        // Getters
        getCurrentConfiguration,
        getCurrentApplication,
        getConfigurationEndpoint,
        getConfigurationId,
        getAppI18nId,
        getCurrentNavigation,

        getCurrentAppTitle,
        getCurrentCustomization,

        getCurrentApp,
        getCurrentProductInfo,

        // Actions
        getConfiguration,
        setCurrentApplication,
        setCurrentNavigation,
        setCurrentFilters,
        setCustomization,
        // Mutations
        setFilter,
        setConfiguration,
        setApplicationList,
        setApplication,
        setNavigation,
        setFilters,
        setCurrentProduct
    };
});
