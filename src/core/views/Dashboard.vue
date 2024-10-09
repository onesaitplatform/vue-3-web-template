<script setup>
import { useLoading } from '@/core/composables/useLoading';
import { getDashboard } from '@/core/services/dashboards/dashboards';
// import { useFiltersStore } from '@/core/stores/filters';
// import { useAuthStore } from '@/core/stores/login';
import { useConfigurationStore } from '@/core/stores/configuration';
import { onBeforeUnmount, ref, watch } from 'vue';
import dashboardWrapper from '../components/dashboard/VueWrapperComponent.vue';

import { useRoute } from 'vue-router';
const { startLoading, stopLoading, isLoading } = useLoading();
const { getCurrentCustomization } = useConfigurationStore();
const dashboard = ref(null);
const token = ref(sessionStorage.sessionToken);
const platformbase = ref(import.meta.env.VITE_PLATFORM);
const params = ref({});

const currentDashboard = ref('');
const currentDashboardId = ref('');

const dashboardId = ref('');
//const { getUser, clearAuth } = useAuthStore();
const initialDatalink = ref({});

const route = useRoute();

const swapBoard = async (dashboardId) => {
    dashboard.value = dashboardId;

    // window.addEventListener('gadgetloaded', gadgetLoaded);
    stopLoading();
    window.addEventListener('resize', resize);
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        window.DSApi.inst1.api.forceRender();
    }, 2000);
};

watch(
    () => route.params,
    async (params) => {
        if (route.name !== 'Dashboard') return;
        startLoading();
        const dashboardIdHelper = route.params.dashboardId;
        const response = await getDashboard(dashboardIdHelper);
        if (response && response.id) {
            await loadHeaderLibs(response.headerlibs);

            currentDashboard.value = route.params.dashboardId;
            currentDashboardId.value = response.id;
            dashboardId.value = route.params.dashboardId;

            if (Object.keys(route.query).length > 0) {
                const paramsKeys = Object.keys(route.query);
                const paramsValues = Object.values(route.query);
                const paramsMap = {};

                paramsKeys.forEach((key, index) => {
                    if (key !== 'dashboardId') {
                        paramsMap[key] = paramsValues[index];
                    }
                });

                params.value = paramsMap;
            }
            swapBoard(currentDashboardId.value);
            //await checkFilters();
        }
    },
    { immediate: true }
);
const checkExists = (key, obj) => {
    obj = obj || window;
    key = key.split('.') || key;
    if (typeof obj !== 'object') {
        return false;
    }
    while (key.length && (obj = obj[key.shift()]) && typeof obj === 'object' && obj !== null) {
        return !key.length && typeof obj !== 'undefined';
    }
};

// RESIZE DASHBOARD
const resize = () => {
    if (checkExists('inst1', window.DSApi)) {
        window.DSApi.inst1.api.forceRender();
    }
};
// const gadgetLoaded = (event) => {
//     api.value = window.DSApi.inst1.api;
//     api.value.enableEventEdit();
//     api.value.disableToolBar();
//     // LOAD FILTERS
//     // loadFilters();
// };
// const loadFavorites = () => {
//     const getAllEndPoint = '/controlpanel/api/favoritegadget/getallbyapp';
//     const filterApp = 'app=' + store.getCurrentApplication; // Ajusta esto para Pinia

//     HTTP_PLATFORM.get(getAllEndPoint).then((response) => {
//         if (response.data.length > 0) {
//             const favoritesByApp = response.data.map(({ identification, metainf }) => ({ identification, metainf })).filter((x) => x.metainf === filterApp);

//             favorites.value = favoritesByApp.map((fav) => ({
//                 id: fav.identification,
//                 title: fav.identification,
//                 type: 'favoritegadget'
//             }));
//         }
//     });
// };
// Cargar filtros
// const loadFilters = async () => {
//     try {
//         const userInfo = getUser; // Ajusta según Pinia
//         const filterRole = await initDataRole({ user: userInfo.user, api: window.DSApi.inst1.api });
//         const filters = store.getFilterList; // Ajusta según Pinia
//         let filterData = {};

//         for (let i = 0; i < filters.length; i++) {
//             filterData = { filterId: filters[i], dashboardId: store.currentDashboard };
//             const setup = await initDataFilter(filterData);
//             const field = store.getGlobalFilters.find((x) => x.id === filters[i]);

//             if (field?.schema.filterTo.length > 0 && field.filter.activeFilter) {
//                 const filtered = field.schema.filterTo;
//                 for (let y = 0; y < filtered.length; y++) {
//                     const action = { id: filtered[y], field: field.filter.field, value: field.filter.activeFilter };
//                     filterDataFilter(action);
//                 }
//             }
//         }
//     } catch (error) {
//         console.log(error);
//     }
// };
// const checkFilters = () => {
//     if (store.showFilters) {
//         // Ajusta según Pinia
//         checkInitialFilters({ id: store.currentDashboard });

//         store.initialDatalink = store.getInitialDataLink; // Ajusta según Pinia
//     }

//     console.log('loading Dashboard...', currentDashboardId.value); // Ajusta según Pinia
//     swapBoard(currentDashboardId.value);
// };
// const gadgetSelect = (e) => {
//     jsongadget.value = e.detail;
// };

// // Comprobar si un objeto tiene una clave
// // const checkExists = (key, obj = window) => {
// //   key = key.split('.');
// //   while (key.length && (obj = obj[key.shift()]) && typeof obj === 'object' && obj !== null) {
// //     if (!key.length && typeof obj !== 'undefined') return true;
// //   }
// //   return false;
// // };
// const checkSession = (event) => {
//     if (event.type === 'ErrorConnect') {
//         console.log('ERROR DE CONEXION o REFRESH TOKEN: redirect to login', event);
//         localStorage.clear();
//         sessionStorage.clear();

//         if (errorCount() === 1) {
//             const status = event.detail.status;
//             const message = status === -1 || status === 404 ? 'Session expired, You must log-in again in the App' : 'Network Problems.';

//             store.$notify({
//                 title: 'The session has expired',
//                 message,
//                 type: 'success',
//                 iconClass: 'ods-icon-filter',
//                 duration: 10000,
//                 position: 'top-right',
//                 showClose: true
//             });
//         }

//         sessionStorage.setItem('sessionOut', 1);
//         sessionStorage.setItem('sessionOutMessage', message);

//         const appId = process.env.VUE_APP_APPLICATION;
//         setTimeout(() => {
//             window.location.href = `/web/${appId}/login`;
//         }, 4000);
//     }
// };
// const errorCount = () => {
//     errorCounter.value++;
//     return errorCounter.value;
// };

const removeHeaderLibs = () => {
    return new Promise((resolve) => {
        const tags = document.head.querySelectorAll('[data-dynamic="true"]');
        tags.forEach((tag) => tag.remove());
        resolve();
    });
};

const loadCSS = (linkElement) => {
    const existingLink = document.head.querySelector(`link[href="${linkElement.href}"]`);
    if (existingLink) {
        console.log(`CSS already loaded: ${linkElement.href}`);
        return;
    }

    const newLink = document.createElement('link');
    newLink.rel = linkElement.rel || 'stylesheet';
    newLink.href = linkElement.href;
    newLink.type = linkElement.type || 'text/css';

    newLink.setAttribute('data-dynamic', 'true');

    newLink.onload = () => {
        console.log(`CSS loaded: ${newLink.href}`);
    };

    newLink.onerror = () => {
        console.error(`Error loading CSS: ${newLink.href}`);
    };

    document.head.appendChild(newLink);
};

const loadStyle = (styleElement) => {
    const newStyle = document.createElement('style');
    newStyle.textContent = styleElement.textContent;

    newStyle.setAttribute('data-dynamic', 'true');

    newStyle.onload = () => {};

    newStyle.onerror = () => {
        console.error('Error loading style.');
    };

    document.head.appendChild(newStyle);
};

const loadScript = (scriptElement) => {
    return new Promise((resolve, reject) => {
        const existingScript = document.head.querySelector(`script[src="${scriptElement.src}"]`);
        if (existingScript) {
            console.log(`Script already loaded: ${scriptElement.src}`);
            resolve();
            return;
        }

        const newScript = document.createElement('script');
        newScript.type = scriptElement.type || 'text/javascript';
        newScript.src = scriptElement.src;
        newScript.charset = scriptElement.charset || 'UTF-8';
        newScript.async = scriptElement.async || false;
        newScript.defer = scriptElement.defer || false;

        newScript.setAttribute('data-dynamic', 'true');

        newScript.onload = () => {
            resolve();
        };

        newScript.onerror = () => {
            console.error(`Error loading script: ${scriptElement.src}`);
            reject(new Error(`Error loading script: ${scriptElement.src}`));
        };

        document.head.appendChild(newScript);
    });
};

const loadInlineScript = (scriptElement) => {
    const existingScripts = document.querySelectorAll('script[data-dynamic="true"]');
    // Verificamos si ya existe un script con el mismo contenido o estructura
    for (let existingScript of existingScripts) {
        // Comparamos el contenido del script (textContent) y el tipo (type)
        if (existingScript.innerHTML.trim() === scriptElement.innerHTML.trim() && existingScript.type === (scriptElement.type || 'text/javascript')) {
            console.log('El script ya existe, no se agregará de nuevo.');
            return; // Si ya existe, no lo agregamos
        }
    }

    // Si no existe un script con el mismo contenido, lo creamos y añadimos
    const newScript = document.createElement('script');
    newScript.type = scriptElement.type || 'text/javascript';
    newScript.textContent = scriptElement.textContent;

    newScript.setAttribute('data-dynamic', 'true');

    newScript.onload = () => {
        console.log('Inline script loaded.');
    };

    newScript.onerror = () => {
        console.error('Error loading inline script.');
    };

    document.head.appendChild(newScript);
};

// Función principal que carga los recursos del header
const loadHeaderLibs = async (headerLibs) => {
    await removeHeaderLibs();

    // Crear un contenedor temporal para los elementos
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = headerLibs;

    // Arrays para clasificar los elementos
    const inlineScripts = [];
    const externalScripts = [];
    const links = [];
    const styles = [];

    // Clasificar los elementos según su tipo

    const excludedKeywords = ['Constantes.js', 'FuncionesComunes.js', 'constantes.js', 'MapaChanged.js', 'Mapa1.111Changed.js'];
    [...tempContainer.children].forEach((child) => {
        if (child.tagName === 'SCRIPT') {
            if (child.src) {
                if (!excludedKeywords.some((keyword) => child.src.includes(keyword))) {
                    externalScripts.push(child);
                }
            } else {
                inlineScripts.push(child); // Scripts sin src (inline)
            }
        } else if (child.tagName === 'LINK') {
            links.push(child);
        } else if (child.tagName === 'STYLE') {
            styles.push(child); // Agregar estilos
        }
    });
    for (const link of links) {
        loadCSS(link);
    }

    // Cargar los estilos inline después de los enlaces CSS
    styles.forEach((style) => {
        loadStyle(style);
    });
    if (await getCurrentCustomization.loadDashboardsOwnHeaders) {
        for (const script of externalScripts) {
            await loadScript(script);
        }

        inlineScripts.forEach((script) => {
            loadInlineScript(script);
        });
    }
};
onBeforeUnmount(() => {
    window.removeEventListener('resize', resize); // Asegurarse de eliminar el listener al desmontar el componente
});
</script>

<template>
    <div>
        <div v-if="isLoading" class="loading-container">
            <div class="loading-content">
                <ProgressSpinner styleClass="custom-spinner" />
                <p class="loading-text">Cargando</p>
            </div>
        </div>
        <div v-if="dashboard != null && !isLoading" class="containerD">
            <div class="containerD__dashboard">
                <div class="containerD__layout">
                    <dashboard-wrapper
                        v-if="dashboard != null"
                        id="inst1"
                        :editmode="handleEditMode"
                        :dashboardReady="true"
                        :dashboard="dashboard"
                        :params="params"
                        :token="token"
                        :platformbase="platformbase"
                        :initialDatalink="initialDatalink"
                        i18n="true"
                    ></dashboard-wrapper>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.containerD {
    &__layout {
        display: flex;
    }

    &__dashboard {
        width: 100%;
        overflow: hidden;
        margin: 4rem 1rem;
        position: relative;
        display: block;
    }
}
.containerD__layout {
    height: calc(100vh - 56px);
}
.wrapper-dashboard {
    width: 100%;
    height: 100%;
}
.gridster-item--selected {
    border: 1px solid red;
}

.gridster-item--no-selected {
    border: none;
}
</style>
