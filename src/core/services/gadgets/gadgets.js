import { api } from '@/core/services/api';
import Vue from 'vue';

import { notifierFactory } from '@/core/utils/notifier';
import VueI18n from 'vue-i18n';
import messages from './lang';

Vue.use(VueI18n);
const i18n = new VueI18n(messages);
const notifier = notifierFactory(i18n);

/**
 * @typedef {Object} GetGadgetsResponse
 * @property {array} gadgets - A list of gadgets
 */

/**
 * @typedef {Object} GetGadgetResponse
 * @property {Object} gadget - A single Gadget
 */

/**
 * @typedef {Object} PostGadgetResponse
 * @property {object} gadget - The new Gadget that has been created
 */

/**
 * @typedef {Object} PutGadgetResponse
 * @property {object} gadget - The Gadget that has been updated
 */

/**
 * @typedef {Object} RequestConfiguration
 * @property {object} params  - Query params used for the request such as filters, queries and so on
 * @property {boolean} notify - Sets whether the notification system should or should not be used
 */

/**
 * Controller for the GET gadgets service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list
 * of Gadgets
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetGadgetsResponse} - An object containing the list of Gadgets
 */
export const getGadgets = async (config = {}) => {
    const group = config.group || 'default';
    const endpoint = group === 'default' ? '/gadgets/' : group === 'custom' ? '/gadgettemplates/' : '/favoritegadget/getall';
    const notify = notifier('getGadgets', ['error']);
    const { data: gadgets } = await api.platform.get(endpoint, { notify });
    return gadgets;
};

/**
 * Controller for the GET gadget service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns a single Gadget
 * @param {string} id               - Id of Gadget that is needed recover data
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetGadgetResponse} - An object containing a single Gadget
 */
export const getGadget = async (id, config = {}) => {
    const group = config.group || 'custom';
    // const endpoint = group === 'custom' ? `/gadgettemplates/export/${id}` : group === 'default' ? `/gadgets/${id}` : `/favoritegadget/${id}`
    const endpoint = group === 'custom' ? `/gadgettemplates/${id}` : group === 'default' ? `/gadgets/${id}` : `/favoritegadget/${id}`;
    const notify = notifier('getGadget', ['error'], { id });
    const { data: gadget } = await api.platform.get(endpoint, { notify });
    return gadget;
};

/**
 * Controller for the POST gadget service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the new Gadget that has been created
 * @param {form} body             - The Gadget data which will be sent within the request
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {PostGadgetResponse}  - An object containing the new Gadget
 */
export const createGadget = async (body, config = {}) => {
    const notify = notifier('createGadget', ['error', 'success']);
    const { data: gadget } = await api.platform.post('/gadgets/', body, {
        ...config,
        notify
    });
    return gadget;
};

/**
 * Controller for the PUT gadget service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the updated Gadget
 * @param {string} id         - The id of the Gadget that should be modified
 * @param {form} body         - The form parameters needed to perform the update
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {PutGadgetResponse}  - An object containing the updated Gadget
 */
export const updateGadget = async (id, body, config) => {
    const notify = notifier('updateGadget', ['error', 'success'], { id });
    const { data: gadget } = await api.platform.put('/gadgets/', body, {
        ...config,
        notify
    });
    return gadget;
};

/**
 * Controller for the DELETE gadget service. This method performs the request regarding the configuration and
 * parameters passed as arguments and delete a single Gadget
 * @param {string} id               - Id of Gadget that is needed recover data
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 */
export const deleteGadget = async (id, config = {}) => {
    const group = config.group || 'default';
    const endpoint = group === 'default' ? `/gadgets/${id}` : `/favoritegadget/${id}`;
    const notify = notifier('deleteGadget', ['error', 'success'], { id });
    const response = await api.platform.delete(endpoint, { notify });
    return response;
};

/**
 * Controller for the GET fav gadget exists service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns a boolean
 * @param {string} id             - Id of Gadget that is needed recover data
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {boolean} - If the fav gadget already exists or not
 */
export const getFavGadgetExists = async (id, config = {}) => {
    const notify = notifier('getGadget', ['error'], { id });
    const { data: exists } = await api.platform.get(`/favoritegadget/existwithidentification/${id}`, { ...config, notify });
    return exists;
};

/**
 * Controller for the POST fav gadget service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an empty object
 * @param {form} body             - The Fav Gadget data which will be sent within the request
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 */
export const addFavGadget = async (body, config) => {
    const notify = notifier('addFavGadget', ['error', 'success']);
    const response = await api.platform.post('/favoritegadget/', body, {
        ...config,
        notify
    });
    return response;
};

/**
 * Controller for the DELETE fav gadget service. This method performs the request regarding the configuration and
 * parameters passed as arguments and delete a single Fav Gadget
 * @param {string} id               - Id of the Fav Gadget that is needed recover data
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 */
export const removeFavGadget = async (id, config = {}) => {
    const notify = notifier('removeFavGadget', ['error', 'success'], { id });
    const response = await api.platform.delete(`/favoritegadget/${id}`, {
        ...config,
        notify
    });
    return response;
};

export default {
    getGadgets,
    getGadget,
    createGadget,
    updateGadget,
    deleteGadget,
    getFavGadgetExists,
    addFavGadget,
    removeFavGadget
};
