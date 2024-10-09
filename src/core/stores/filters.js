// IMPORT
import moment from 'moment';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

// Datasources for user role and configuration actions
const roleDs = {
    userDS: import.meta.env.VITE_USERDS,
    appDS: import.meta.env.VITE_APPDS
};

// Define the Pinia store
export const useFiltersStore = defineStore('filters', () => {
    // STATE
    const globalFilter = ref([]);
    const isGlobalFilterLoaded = ref(false);
    const filterList = ref([]);
    const initialDataLink = ref({});
    const role = ref('');
    const isAdmin = ref(false);

    // GETTERS (computed properties)
    const getGlobalFilters = computed(() => globalFilter.value);
    const getGlobalIsLoaded = computed(() => isGlobalFilterLoaded.value);
    const getFilterList = computed(() => filterList.value);
    const getInitialDataLink = computed(() => initialDataLink.value);
    const getRole = computed(() => role.value);
    const getIsAdmin = computed(() => isAdmin.value);
    const getUserRoleDS = computed(() => roleDs.userDS);
    const getAppRoleDS = computed(() => roleDs.appDS);

    // AUX para campos de tipo datePicker
    const dateParser = (value, format = 'yyyymm') => {
        let date = typeof value === 'number' ? new Date(value) : value;
        const year = date.getFullYear().toString();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        if (format === 'yyyymm') return parseInt(year + month);
        if (format === 'yyyymmdd') return parseInt(year + month + day);
        if (format === 'yyyymmddhh') {
            const hour = date.getHours().toString().padStart(2, '0');
            return parseInt(year + month + day + hour);
        }
    };

    // AUX para campos que usan una clave única
    const keyParser = (data) => {
        if (typeof data === 'string' && data === '') return data;
        if (Array.isArray(data) && data.length === 0) return data;
        return typeof data === 'string' ? data.split('-')[1] : data.map((x) => x.split('-')[1]);
    };

    // AUX para obtener solo los campos autorizados
    const getAuthorized = (dashboardId) => {
        return getGlobalFilters.value
            .filter((field) => {
                if (field.schema.authorizations.length === 0) {
                    return true;
                } else if (dashboardId !== undefined && field.schema.authorizations.length > 0 && field.schema.authorizations.includes(dashboardId)) {
                    return true;
                }
                return false;
            })
            .map((y) => y.id);
    };
    // AUXILIARY FUNCTIONS
    const getFiltersByApp = (field, role, appVersion) => {
        let filterResult = [];
        if (appVersion === 0) {
            return filterResult;
        }
        if (appVersion < 2) {
            return typeof role !== 'object' ? [] : typeof role === 'string' ? [{ field, exp: `'${role}'`, op: '=' }] : [{ field, exp: role, op: '=' }];
        } else {
            for (const key in role) {
                if (field === key) {
                    const filter = role[key];
                    const multipleFilters = [];
                    for (let i = 0; i < filter.length; i++) {
                        if (filter[i].operator?.toUpperCase() === 'IN') {
                            const inValue = filter[i].type?.toUpperCase() === 'STRING' ? `(${filter[i].values.map((x) => `'${x}'`).join()})` : `(${filter[i].values.join()})`;
                            filterResult = [{ field, exp: inValue, op: 'IN' }];
                            return filterResult;
                        } else if (filter[i].operator?.toUpperCase() === 'BETWEEN') {
                            const betweenValue = filter[i].type?.toUpperCase() === 'STRING' ? filter[i].values.map((x) => `'${x}'`).join(' and ') : filter[i].values.join(' and ');
                            filterResult = [{ field, exp: betweenValue, op: 'BETWEEN' }];
                            return filterResult;
                        } else {
                            const standardMultipleValue = filter[i].type.toUpperCase() === 'STRING' ? `"${filter[i].values[0]}"` : filter[i].type.toUpperCase() === 'NUMBER' ? filter[i].values[0] : filter[i].values[0];
                            const standardMultipleOp = filter[i].operator;
                            multipleFilters.push({ field, exp: standardMultipleValue, op: standardMultipleOp });
                        }
                        filterResult = multipleFilters;
                    }
                    return filterResult;
                }
            }
            return filterResult;
        }
    };

    const getDynamicDate = (date, format) => {
        const ranges = {
            today: moment().format(format).toString(),
            yesterday: moment().subtract(1, 'day').format(format).toString(),
            startWeek: moment().startOf('week').format('dddd') === 'Sunday' ? moment().startOf('week').add(1, 'day').format(format).toString() : moment().startOf('week').format(format).toString(),
            endWeek: moment().endOf('week').format(format).toString(),
            oneWeekAgo: moment().subtract(7, 'day').format(format).toString(),
            startMonth: moment().startOf('month').format(format).toString(),
            endMonth: moment().subtract(1, 'month').startOf('month').format(format).toString(),
            oneMonthsAgo: moment().subtract(1, 'months').format(format).toString(),
            firstDayMonthAgo: moment().subtract(1, 'months').startOf('month').format(format),
            firstDayTwoMonthsAgo: moment().subtract(2, 'months').startOf('month').format(format),
            twoMonthsAgo: moment().subtract(2, 'months').format(format).toString(),
            threeMonthsAgo: moment().subtract(3, 'months').format(format).toString(),
            sixMonthsAgo: moment().subtract(6, 'months').format(format).toString(),
            nineMonthsAgo: moment().subtract(9, 'months').format(format).toString(),
            yearAgo: moment().subtract(1, 'year').format(format).toString(),
            startYear: moment().startOf('year').format(format).toString()
        };
        return ranges[date] || date;
    };

    // ACTIONS
    const resetGlobalFilters = () => {
        resetLoaders();
        globalFilter.value = [];
    };

    const updateOutsideGlobalFilter = (payload) => {
        updateGlobalFilters({
            id: payload.filterId,
            key: 'filter',
            elem: 'activeFilter',
            data: payload.value
        });
    };

    const initGlobalFilters = (rootGetters) => {
        const currentGlobalFilter = rootGetters.getCurrentFilters;
        globalFilter.value = currentGlobalFilter;

        const filters = currentGlobalFilter.length > 0 ? currentGlobalFilter.map((x) => x.id).sort((a, b) => a.filterOrder - b.filterOrder) : [];
        filterList.value = filters;
        isGlobalFilterLoaded.value = true;
    };

    const initDataRole = async (action, rootGetters) => {
        try {
            let currentRole = '';
            const user = `"${action.user}"`;
            const app = `"${rootGetters.getCurrentApplication}"`;
            const appVersion = rootGetters.getCurrentApp.appVersion || 0;

            if (appVersion === 0) {
                role.value = currentRole;
                isAdmin.value = false;
                return currentRole;
            }
            if (appVersion < 2) {
                const roleData = await window.DSApi.inst1.api.ds.from(getUserRoleDS.value).filter('user_entity.user', user).exec();
                currentRole = roleData[0].user_entity.org_niv1;
                role.value = currentRole;
                isAdmin.value = currentRole === '#admin';
                return currentRole;
            } else {
                const filters = [
                    { field: 'user', exp: user },
                    { field: 'app', exp: app }
                ];
                const roleApp = await window.DSApi.inst1.api.ds.from(getAppRoleDS.value).filter(filters).exec();
                currentRole = JSON.parse(roleApp[0].config);
                isAdmin.value = roleApp[0].role === '#admin';
                role.value = currentRole;
                return currentRole;
            }
        } catch (error) {
            console.error(error);
            return error;
        }
    };

    const initDataFilter = async (data, getters, rootGetters) => {
        try {
            const filterId = data.filterId;
            const dashboardId = data.dashboardId;
            const appVersion = rootGetters.getCurrentApp.appVersion || 0;
            const filterConfiguration = getters.getGlobalFilters.value.find((x) => x.id === filterId).filter;
            const filterSchema = getters.getGlobalFilters.value.find((x) => x.id === filterId).schema;
            const authorizations = filterSchema.authorizations;
            const authorizated = authorizations.length > 0 ? authorizations.includes(dashboardId) : true;
            let filterData = [];
            let roleFilter = [];

            if (filterConfiguration.source && authorizated) {
                if (getters.getIsAdmin.value) {
                    roleFilter = [];
                    filterData = await window.DSApi.inst1.api.ds.from(filterConfiguration.source).filter(roleFilter).exec();
                    filterData = filterData.length > 0 ? filterData.map((x) => ({ ...x, id: Math.random() })) : filterData;
                } else if (filterConfiguration.isFilterable) {
                    const role = getters.getRole.value;
                    roleFilter = getFiltersByApp(filterConfiguration.field, role, appVersion);
                    filterData = await window.DSApi.inst1.api.ds.from(filterConfiguration.source).filter(roleFilter).exec();
                    filterData = filterData.length > 0 ? filterData.map((x) => ({ ...x, id: Math.random() })) : filterData;

                    if (filterData.length === 1) {
                        const activeFilter = filterSchema.multi ? [filterData[0][filterSchema.key || filterConfiguration.field]] : filterData[0][filterSchema.key || filterConfiguration.field];
                        updateGlobalFilters({ id: filterId, key: 'filter', elem: 'activeFilter', data: activeFilter });
                        updateGlobalFilters({ id: filterId, key: 'schema', elem: 'isVisible', data: false });
                    }
                }
            }
            return filterData;
        } catch (error) {
            console.error(error);
            return error;
        }
    };

    const sendFilter = (filter, getters) => {
        if (!window.DSApi) {
            console.error('Waiting for DSApi in sendFilter...');
            return;
        }

        const filterId = filter.filterId;
        const filterValue = filter.value;
        const filterOp = filter.op || '';
        const filterConfiguration = getters.getGlobalFilters.value.find((x) => x.id === filterId).filter;
        const externalFilterId = filterConfiguration.id;
        const sendValueEnable = filterConfiguration.isSendingValues || false;

        const keyParser = (data) => {
            if (typeof data === 'string') return data.split('-')[1];
            if (Array.isArray(data)) return data.map((x) => x.split('-')[1]);
            return data;
        };

        if (filterConfiguration.fieldType === 'datePicker') {
            window.DSApi.inst1.api.sendFilter(externalFilterId, filterConfiguration.field, filterValue, filterOp);
            if (sendValueEnable) {
                window.DSApi.inst1.api.sendValue(`SV-${externalFilterId}`, filterConfiguration.field, {
                    field: filterConfiguration.field,
                    value: filterValue,
                    operator: filterOp
                });
            }
        } else if (filterConfiguration.fieldType === 'SelectList') {
            const activeValue = filterConfiguration.key ? keyParser(filterConfiguration.activeFilter) : filterConfiguration.activeFilter;
            const value = filterConfiguration.multi ? `(${activeValue.join(',')})` : activeValue;

            window.DSApi.inst1.api.sendFilter(externalFilterId, filterConfiguration.field, value, 'IN');
            if (sendValueEnable) {
                window.DSApi.inst1.api.sendValue(`SV-${externalFilterId}`, filterConfiguration.field, {
                    field: filterConfiguration.field,
                    value,
                    operator: 'IN'
                });
            }
        }
    };
    const checkInitialFilters = (payload) => {
        const currentGlobalFilter = getGlobalFilters.value;
        let filters = getFilterList.value;
        let initial = [];
        let dashboardId = payload.id || '';
        let field = {};

        // Obtener solo los campos autorizados
        filters = getAuthorized(dashboardId);

        // Iterar sobre todos los campos y añadir a initialDataLink si tiene valor activeFilter
        filters.forEach((filterId) => {
            field = currentGlobalFilter.find((x) => x.id === filterId);

            if (field.schema.fieldType === 'datePicker') {
                const dateOp = 'between';
                const dateParserDef = field.schema.dateParser || 'yyyymm';
                let dateValue = field.filter.activeFilter || '';

                if (dateValue) {
                    if (field.schema.dateManager === 'custom') {
                        if (field.schema.dateType === 'daterange' || field.schema.dateType === 'datetimerange') {
                            dateValue = field.filter.activeFilterIsDynamic ? getDynamicDate(dateValue[0], dateParserDef) + ' and ' + getDynamicDate(dateValue[1], dateParserDef) : dateValue[0] + ' and ' + dateValue[1];
                        } else {
                            dateValue = field.filter.activeFilterIsDynamic ? getDynamicDate(dateValue, dateParserDef) + ' and ' + getDynamicDate(dateValue, dateParserDef) : dateValue + ' and ' + dateValue;
                        }
                    } else {
                        const now = new Date();
                        const dateNowParsed = dateParser(now, dateParserDef);
                        dateValue = field.filter.activeFilterIsDynamic ? getDynamicDate(dateValue, dateParserDef) + ' and ' + dateNowParsed : dateValue + ' and ' + dateNowParsed;
                    }

                    initial = { field: field.filter.field, value: dateValue, op: dateOp };
                    if (!initialDataLink.value[field.filter.id]) initialDataLink.value[field.filter.id] = [];
                    initialDataLink.value[field.filter.id].push(initial);

                    if (dashboardId !== undefined && field.schema.authorizations.length > 0 && !field.schema.authorizations.includes(dashboardId)) {
                        initialDataLink.value[field.filter.id].pop();
                    }
                } else {
                    // Comprobación para valor por defecto si no hay filtro activo definido
                    if (field.schema.dateType === 'daterange' || field.schema.dateType === 'datetimerange') {
                        if (field.filter.defaultFilter?.length > 0) {
                            dateValue = field.filter.activeFilterIsDynamic
                                ? getDynamicDate(field.filter.defaultFilter[0], dateParserDef) + ' and ' + getDynamicDate(field.filter.defaultFilter[1], dateParserDef)
                                : field.filter.defaultFilter[0] + ' and ' + field.filter.defaultFilter[1];

                            initial = { field: field.filter.field, value: dateValue, op: dateOp };
                            if (!initialDataLink.value[field.filter.id]) initialDataLink.value[field.filter.id] = [];
                            initialDataLink.value[field.filter.id].push(initial);

                            if (dashboardId !== undefined && field.schema.authorizations.length > 0 && !field.schema.authorizations.includes(dashboardId)) {
                                initialDataLink.value[field.filter.id].pop();
                            }
                        }
                    }
                }
            } else if (field.schema.fieldType === 'SelectList') {
                let activeValue = '';
                if (field.schema.multi) {
                    if (field.filter.activeFilter.length > 0) {
                        activeValue = field.schema.key ? keyParser(field.filter.activeFilter) : field.filter.activeFilter;
                        const multiValue = field.schema.type === 'string' ? `(${activeValue.map((x) => `'${x}'`).join(',')})` : `(${activeValue.join(',')})`;

                        initial = { field: field.filter.field, value: multiValue, op: 'IN' };
                        if (!initialDataLink.value[field.filter.id]) initialDataLink.value[field.filter.id] = [];
                        initialDataLink.value[field.filter.id].push(initial);

                        if (dashboardId !== undefined && field.schema.authorizations.length > 0 && !field.schema.authorizations.includes(dashboardId)) {
                            initialDataLink.value[field.filter.id].pop();
                        }
                    }
                } else {
                    if (field.filter.activeFilter !== '') {
                        activeValue = field.schema.key ? keyParser(field.filter.activeFilter) : field.filter.activeFilter;
                        initial = { field: field.filter.field, value: activeValue, op: '=' };
                        if (!initialDataLink.value[field.filter.id]) initialDataLink.value[field.filter.id] = [];
                        initialDataLink.value[field.filter.id].push(initial);

                        if (dashboardId !== undefined && field.schema.authorizations.length > 0 && !field.schema.authorizations.includes(dashboardId)) {
                            initialDataLink.value[field.filter.id].pop();
                        }
                    }
                }
            }
        });

        // Configurar initialDataLink aunque esté vacío
        initialDataLink.value = initialDataLink;
    };
    // MUTATIONS
    const resetLoaders = () => {
        isGlobalFilterLoaded.value = false;
    };

    const updateGlobalFilters = (payload) => {
        const filter = globalFilter.value.find((x) => x.id === payload.id);
        if (filter) {
            if (payload.key !== '') {
                Object.assign(filter[payload.key], { [payload.elem]: payload.data });
            } else {
                Object.assign(filter, { [payload.elem]: payload.data });
            }
        }
    };

    // Return state and methods
    return {
        globalFilter,
        isGlobalFilterLoaded,
        filterList,
        initialDataLink,
        role,
        isAdmin,
        getGlobalFilters,
        getGlobalIsLoaded,
        getFilterList,
        getInitialDataLink,
        getRole,
        getIsAdmin,
        getUserRoleDS,
        getAppRoleDS,
        checkInitialFilters,
        resetGlobalFilters,
        updateOutsideGlobalFilter,
        initGlobalFilters,
        initDataRole,
        initDataFilter,
        sendFilter,
        resetLoaders,
        updateGlobalFilters
    };
});
