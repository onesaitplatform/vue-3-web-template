import { api } from '@/core/services/api';
import Vue from 'vue';

import { addResourcesByTag, getResourcesByTag } from '@/core/services/tags/tags';
import { notifierFactory } from '@/core/utils/notifier';
import VueI18n from 'vue-i18n';
import messages from './lang';

Vue.use(VueI18n);
const i18n = new VueI18n(messages);
const notifier = notifierFactory(i18n);

/**
 * @typedef {Object} GetDatasourcesResponse
 * @property {array} datasources - A list of datasources
 */

/**
 * @typedef {Object} GetDatasourceFieldsResponse
 * @property {Array} fields - A list of datasource fields
 */

/**
 * Controller for the GET datasources service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list
 * of Datasources
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetDatatasourcesResponse} - An object containing the list of Datasources
 */
export const getDatasources = async (config = {}) => {
    const notify = notifier('getDatasources', ['error']);
    const { data: datasources } = await api.platform.get('/gadgetdatasources/', {
        ...config,
        notify
    });
    // generic filters using tags
    // if options contains filter key , then apply, if not just only identification.
    if (config.tag !== '' && config.tag) {
        const resources = await getResourcesByTag(config.tag, 'GadgetDatasource');
        const resourcesList = resources.length > 0 ? resources.map((x) => x.name) : [];
        return resourcesList.length > 0 ? datasources.filter((d) => resourcesList.includes(d.identification)) : [];
    } else {
        // no filter using tags
        return datasources;
    }
};

/**
 * Controller for the GET datasource fields service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an array of fields
 * @param {string} id               - Id of Datasource that is needed recover data
 * @param {RequestConfiguration}    - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetDatasourceFieldsResponse} - An array containing a list of Datasource fields
 */
export const getDatasourceFields = async (id, config = {}) => {
    const notify = notifier('getDatasourceFields', ['error'], { id });
    const { data: fields } = await api.platform.get(`/gadgetdatasources/getFields/${id}`, { ...config, notify });
    return fields;
};

/**
 * Controller for the POST datasource service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the new Datasource that has been created
 * @param {form} body             - The Datasource data which will be sent within the request
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {PostDatasourceResponse}  - An object containing the new Datasource
 */
export const createDatasource = async (body, config) => {
    const notify = notifier('createDatasource', ['error', 'success']);
    const { data: datasource } = await api.platform.post('/gadgetdatasources', body, {
        ...config,
        notify
    });
    // id tag system enable, after return datasource, add it to the tag system
    if (config?.tag) {
        const body = [{ name: config.tag, resourceId: datasource.id }];
        const resources = await addResourcesByTag(body);
        console.log('createDatasource, add datasource to tag system: ', config.tag, 'resource: ', resources);
    }
    return datasource;
};

/**
 * Controller for the POST datasource service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the edited Datasource that has been edited
 * @param {form} body             - The Datasource data which will be sent within the request
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {PostDatasourceResponse}  - An object containing the edited Datasource
 */
export const editDatasource = async (body, config) => {
    const notify = notifier('editDatasource', ['error', 'success']);
    const { data: datasource } = await api.platform.put('/gadgetdatasources', body, {
        ...config,
        notify
    });
    return datasource;
};

export default {
    getDatasources,
    getDatasourceFields,
    createDatasource,
    editDatasource
};
