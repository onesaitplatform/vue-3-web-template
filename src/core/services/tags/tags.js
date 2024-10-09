import { api } from '@/core/services/api';
import Vue from 'vue';

import { notifierFactory } from '@/core/utils/notifier';
import VueI18n from 'vue-i18n';
import messages from './lang';

Vue.use(VueI18n);
const i18n = new VueI18n(messages);
const notifier = notifierFactory(i18n);

/**
 * @typedef {Object} getResourcesByTag
 * @property {array} resources - A list of resources tagged
 */

/**
 * @typedef {Object} addResourcesByTag
 * @property {array} resources - A list of resources added to tag
 */

/**
 * Controller for the GET Resources by Tag service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list of Resources of platform that use a defined Tag
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @param {string} queryParams    - Params that is needed recover data
 * @return {getResourcesByTagResponse} - An object containing the list of Resources
 */
export const getResourcesByTag = async (tag, type, config = {}) => {
    const notify = notifier('getResourcesByTag', ['error']);
    const { data: resources } = await api.platform.get(`/tags/${tag}/resources`, { params: config }, { notify });
    // generic resources using tags filter by name and type
    return resources.filter((d) => d.type === type);
};

/**
 * Controller for the POST add Resources by Tag service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list of Resources of platform that use a defined Tag
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @param {object} body - and array of objects with objects with tag and resourceId to add
 * @return {addResourcesByTagResponse} - An object containing the list of Resources added
 */
export const addResourcesByTag = async (body, config = {}) => {
    const notify = notifier('addResourcesByTag', ['error']);
    const { data: resources } = await api.platform.post('/tags', body, { params: config }, { notify });
    return resources;
};

export default {
    getResourcesByTag,
    addResourcesByTag
};
