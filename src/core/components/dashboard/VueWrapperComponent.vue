<script setup>
import { useRoute } from 'vue-router';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
/* global angular */
/* eslint no-undef: "error" */

// Define props
const props = defineProps({
    loadScripts: Boolean,
    id: String,
    token: String,
    model: Object,
    i18n: Boolean,
    dashboard: String,
    editmode: Boolean,
    params: Object,
    platformbase: String,
    initialDatalink: Object,
    dashboardReady: Boolean
});

// Refs y reactive state

const nginst = ref(null);
const api = ref(null);
const __env = ref(null);
const parent = ref(null); // Ref para el elemento principal
const route = useRoute();
// Funciones utilitarias
const getURLParameters = () => {
    const sPageURL = window.location.search.substring(1);
    const sURLVariables = sPageURL.split('&');
    const urlParametersMap = {};
    sURLVariables.forEach((variable) => {
        if (variable.length > 0) {
            const [key, value] = variable.split('=');
            if (key !== 'oauthtoken') {
                urlParametersMap[key] = value;
            }
        }
    });
    return urlParametersMap;
};

//const isEmptyJson = (obj) => Object.keys(obj).length === 0 && obj.constructor === Object;

const setConfig = (token, params, platformbase, initialDatalink) => {
    __env.value = window.__env || {};
    __env.value.socketEndpointConnect = `${platformbase || ''}/dashboardengine/dsengine/solver`;
    __env.value.dashboardEngineProtocol = 'rest';
    __env.value.socketEndpointSend = '/dsengine/solver';
    __env.value.socketEndpointSubscribe = '/dsengine/broker';
    __env.value.endpointControlPanel = `${platformbase || ''}/controlpanel`;
    __env.value.endpointDashboardEngine = `${platformbase || ''}/dashboardengine`;
    __env.value.dashboardEngineUsername = '';
    __env.value.dashboardEnginePassword = '';
    sessionStorage.setItem('dashboardEngineOauthtoken', token);
    __env.value.dashboardEngineUserRole = sessionStorage.getItem('role');
    __env.value.dashboardEngineLoginRest = '/loginRest';
    __env.value.enableDebug = false;
    __env.value.urlParameters = params || getURLParameters();

    if (initialDatalink) __env.value.initialDatalink = initialDatalink;
    __env.value.dashboardEngineBungleMode = true;

    angular.module('dashboardFramework').constant('__env', __env.value);
    window.__env = __env.value;
};

const setCacheValue = (model) => {
    angular.module('dashboardFramework').value('cacheBoard', model);
};

// const drawError = (error) => {
//     document.getElementsByTagName('dashboard')[0].innerHTML = `
//     <div style="padding:15px;background:#fbecec">
//       <div class="no-data-title">Dashboard Engine Error ${error.status || ''}</div>
//       <div class="no-data-text">
//         ${error.config ? `Rest Call: ${error.config.url}. ` : ''} Detail: ${error.data ? JSON.stringify(error.data) : error}
//       </div>
//     </div>`;
// };

const clearApp = (parent, subapp) => {
    if (typeof angular !== 'undefined' && typeof subapp !== 'undefined') {
        const ngapp = angular.element(subapp);

        if (ngapp.injector() && ngapp.injector().get('$rootScope')) {
            const $rootScope = ngapp.injector().get('$rootScope');
            ngapp.data('$injector', '');
            $rootScope.$destroy();
            ngapp.empty();
        }
        nginst.value = null;
    }
};

const generateDSApi = (appRootNode) => {
    const app = angular.element(appRootNode);
    console.log(app);
    const apiInstance = app.isolateScope().vm.api;
    // Métodos para enviar valores y filtros
    apiInstance.sendValue = (gadgetOrigin, key, value) => {
        apiInstance.sendFilter(gadgetOrigin, key, value, null, 'value');
    };
    apiInstance.sendFilter = (gadgetOrigin, key, value, op, typeAction) => {
        let jsonModel = {};
        if (typeof key === 'string') {
            jsonModel[key] = {
                value,
                id: gadgetOrigin,
                op: op || '=',
                typeAction: typeAction || 'filter'
            };
        } else {
            jsonModel = key;
        }

        app.injector().get('interactionService').sendBroadcastFilter(gadgetOrigin, jsonModel);
    };
    // Asignación de servicios adicionales
    apiInstance.httpService = app.injector().get('httpService');
    apiInstance.ds = {
        get: app.injector().get('datasourceSolverService').get,
        getOne: app.injector().get('datasourceSolverService').getOne,
        from: app.injector().get('datasourceSolverService').from
    };
    apiInstance.msgApi = window.DSMessageApi;

    // Métodos para obtener y modificar el modelo
    apiInstance.getModel = () => {
        return app.isolateScope().vm.dashboard;
    };

    apiInstance.setModel = (dashboard) => {
        return (app.isolateScope().vm.dashboard = dashboard);
    };

    // Métodos para manejar eventos de drag and drop
    apiInstance.getDropElementEvent = () => {
        return app.isolateScope().vm.dashboard.gridOptions.emptyCellDropCallback;
    };

    apiInstance.setDropElementEvent = (dropElementEvent) => {
        app.isolateScope().vm.dashboard.gridOptions.emptyCellDropCallback = dropElementEvent;
    };

    // Métodos para habilitar y deshabilitar edición de eventos
    apiInstance.enableEventEdit = () => {
        app.isolateScope().vm.dashboard.gridOptions.eventedit = true;
    };

    apiInstance.disableEventEdit = () => {
        app.isolateScope().vm.dashboard.gridOptions.eventedit = false;
    };

    // Método para deshabilitar la barra de herramientas
    apiInstance.disableToolBar = () => {
        app.isolateScope().vm.dashboard.editButtonsIframe = {
            urlParameterButton: false,
            trashButton: false,
            editGadgetMenu: true,
            closeButton: false,
            configButton: false,
            dataLinkButton: false,
            addElementButton: false,
            moveToolBarButton: false,
            active: false,
            filterGadgetMenu: true,
            removeGadgetMenu: true
        };
        apiInstance.forceRender();
    };

    // Asignación de más servicios
    apiInstance.datalink = app.injector().get('interactionService');
    apiInstance.utilService = app.injector().get('utilsService');
    apiInstance.params = app.injector().get('urlParamService');
    apiInstance.sendParam = app.injector().get('urlParamService').sendBroadcastParam;
    apiInstance.sendParams = app.injector().get('urlParamService').sendBroadcastParams;
    apiInstance.gmanagerService = app.injector().get('gadgetManagerService');
    apiInstance.favoriteService = app.injector().get('favoriteGadgetService');

    // Métodos para manejar el tipo de drag en línea y forzar renderización
    apiInstance.setInlineDragType = (type) => {
        return (app.isolateScope().vm.dashboard.dragGadgetType = type);
    };

    apiInstance.forceRender = () => {
        app.injector().get('utilsService').forceRender(app.isolateScope());
    };

    // Método para limpiar el caché
    apiInstance.clearCache = (dashboard) => {
        if (dashboard) {
            setCacheValue({});
        } else {
            setCacheValue({});
        }
    };

    // Métodos relacionados con plantillas
    apiInstance.template = {
        templateToInitParams: (str) => {
            const regexTagHTML = /<![\-\-\s\w\>\=\"\'\,\:\+\_\/]*\-->/g;
            const regexTagJS = /\/\*[\-\-\s\w\>\=\"\'\,\:\+\_\/]*\*\//g;
            const regexName = /name\s*=\s*\"[\s\w\>\=\-\'\+\_\/]*\s*\"/g;
            const regexOptions = /options\s*=\s*\"[\s\w\>\=\-\'\:\,\+\_\/]*\s*\"/g;
            let found = [];

            const searchTag = (regex, str) => {
                let m;
                let foundTags = [];
                while ((m = regex.exec(str)) !== null) {
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    m.forEach((item, index, arr) => {
                        foundTags.push(arr[0]);
                    });
                }
                return foundTags;
            };

            const searchTagContentName = (regex, str) => {
                let m;
                let content;
                while ((m = regex.exec(str)) !== null) {
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    m.forEach((item, index, arr) => {
                        content = arr[0].match(/"([^"]+)"/)[1];
                    });
                }
                return content;
            };

            const searchTagContentOptions = (regex, str) => {
                let m;
                let content = ' ';
                while ((m = regex.exec(str)) !== null) {
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    m.forEach((item, index, arr) => {
                        content = arr[0].match(/"([^"]+)"/)[1];
                    });
                }
                return content.split(',');
            };

            found = searchTag(regexTagHTML, str).concat(searchTag(regexTagJS, str));

            // Método para obtener elementos únicos
            found.unique = (function unique(a) {
                return function () {
                    return this.filter(a);
                };
            })(function (a, b, c) {
                return c.indexOf(a, b + 1) < 0;
            });
            found = found.unique();

            const parserList = [];
            for (let i = 0; i < found.length; i++) {
                const tag = found[i];
                if (tag.replace(/\s/g, '').search('type="text"') >= 0 && tag.replace(/\s/g, '').search('label-osp') >= 0) {
                    parserList.push({
                        label: searchTagContentName(regexName, tag),
                        value: 'parameterTextLabel',
                        type: 'labelsText'
                    });
                } else if (tag.replace(/\s/g, '').search('type="number"') >= 0 && tag.replace(/\s/g, '').search('label-osp') >= 0) {
                    parserList.push({
                        label: searchTagContentName(regexName, tag),
                        value: 0,
                        type: 'labelsNumber'
                    });
                } else if (tag.replace(/\s/g, '').search('type="ds"') >= 0 && tag.replace(/\s/g, '').search('label-osp') >= 0) {
                    parserList.push({
                        label: searchTagContentName(regexName, tag),
                        value: 'parameterDsLabel',
                        type: 'labelsds'
                    });
                } else if (tag.replace(/\s/g, '').search('type="ds_parameter"') >= 0 && tag.replace(/\s/g, '').search('label-osp') >= 0) {
                    parserList.push({
                        label: searchTagContentName(regexName, tag),
                        value: 'parameterNameDsLabel',
                        type: 'labelsdspropertie'
                    });
                } else if (tag.replace(/\s/g, '').search('type="ds"') >= 0 && tag.replace(/\s/g, '').search('select-osp') >= 0) {
                    const optionsValue = searchTagContentOptions(regexOptions, tag);
                    parserList.push({
                        label: searchTagContentName(regexName, tag),
                        value: 'parameterSelectLabel',
                        type: 'selects',
                        optionsValue: optionsValue
                    });
                }
            }
            return parserList;
        }
    };

    return apiInstance;
};

const loadApp = async (id, token, appRootNode, i18n, apiHelper, dashboard) => {
    const subapp = parent.value.getElementsByTagName('dashboard')[0];
    await clearApp(parent.value, subapp);
    appRootNode.setAttribute('editmode', props.editmode ? props.editmode : 'false');

    if (i18n) {
        fetch(`${__env.value.endpointControlPanel}/dashboards/i18n/${dashboard}`, {
            method: 'get',
            headers: new Headers({
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            })
        })
            .then((res) => {
                if (res && res.status === 401) {
                    res.config = {
                        url: `${__env.value.endpointControlPanel}/dashboards/i18n/${dashboard}`
                    };
                    res.data = res.statusText;
                    throw res;
                }
                return res.json();
            })
            .then(async (i18nData) => {
                __env.value.i18njson = i18nData;
                if (!nginst.value) {
                    nginst.value = angular.bootstrap(angular.element(appRootNode), ['dashboardFramework']);
                }

                api.value = await generateDSApi(appRootNode);

                if (!window.DSApi) {
                    window.DSApi = {};
                }
                window.DSApi[id] = {};
                window.DSApi[id].api = api.value;
            });
    } else {
        if (i18n !== undefined) {
            __env.value.i18njson = i18n;
        }
        if (!nginst.value) {
            nginst.value = angular.bootstrap(angular.element(appRootNode), ['dashboardFramework']);
        }
        api.value = await generateDSApi(appRootNode);

        if (!window.DSApi) {
            window.DSApi = {};
        }
        window.DSApi[id] = { api: api.value };
    }
};

const startApp = async () => {
    await clearApp(parent.value, parent.value.getElementsByTagName('dashboard')[0]);
    console.log('Iniciando aplicación');
    console.log('Dashboard cambiado');
    await setConfig(props.token, props.params, props.platformbase, props.initialDatalink);
    const subapp = parent.value.getElementsByTagName('dashboard')[0];
    subapp.id = props.dashboard;
    loadApp(props.id, props.token, subapp, props.i18n ? props.i18n === 'true' : false, api.value, props.dashboard);
};

const loadCssForDashboardCapsulated = async () => {
    const css = document.createElement('link');
    css.href = `${__env.value.endpointDashboardEngine}/css/dashboard.css`;
    css.rel = 'stylesheet';
    css.type = 'text/css';
    document.head.appendChild(css);
};
// Hooks de Vue
onMounted(() => {
    if (route.name !== 'Dashboard') {
        return;
    }
    if (props.dashboardReady) {
        startApp();
    }
});
onBeforeUnmount(async () => {
    console.log('paco');
    await clearApp(parent.value, parent.value.getElementsByTagName('dashboard')[0]);
});

watch(
    () => props.dashboard,
    (newVal) => {
        const subapp = parent.value.getElementsByTagName('dashboard')[0];

        subapp.id = props.dashboard;

        if (props.dashboardReady) {
            setConfig(props.token, props.params, props.platformbase, props.initialDatalink);
            loadApp(props.id, props.token, subapp, props.i18n, api.value, newVal);
        }
    }
);
</script>

<template>
    <div ref="parent" v-loading="loadScripts" class="wrapper-dashboard">
        <div v-pre>
            <dashboard wrapper="true" editmode="false" iframe="true" selectedpage="0" public="false" class="flex layout-column" v-pre></dashboard>
        </div>
    </div>
</template>

<style scoped>
.wrapper-dashboard {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: scroll;
}
</style>
