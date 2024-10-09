import { api } from '@/core/services/api';

// A LIST OF SERVICES RELATED TO LOGIN PROCESS *************************************************************

/**
 * @typedef {Object} member
 * @property {array} member - A list of realms (apps) where current user has at least one role, so is valid.
 */

/**
 * Controller for the GET MEMBER service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list
 * of REALMS related to current user.
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetDatatasourcesResponse} - An object containing data and the list of realms
 */
export const member = async (params, config = {}) => {
    // const notify = notifier('member', ['error']);
    const { data: member } = await api.platform.get('/realms/member', {
        ...config
        //notify
    });
    return member || [];
};

export const getConfigurationService = async (url) => {
    // const notify = notifier('member', ['error']);
    const data = await api.platform.get('/configurations/' + url);
    return data || [];
};
export const getRealms = async (url) => {
    // const notify = notifier('member', ['error']);
    const data = await api.platform.get('/realms/' + url);
    return data || [];
};
export const getApps = async (url) => {
    // const notify = notifier('member', ['error']);
    const data = await api.platform.get('/projects/' + url);
    return data || [];
};
export const getResources = async (url) => {
    // const notify = notifier('member', ['error']);
    const data = await api.platform.get('/realms/' + url);
    return data || [];
};
export default {
    member,
    getConfigurationService,
    getRealms,
    getApps
};

//https://territorios-clm-dev.onesaitplatform.com/controlpanel/api/realms/citiesweb_realm/users/citieswebprojects
//https://territorios-clm-dev.onesaitplatform.com/controlpanel/api/dashboards/dashboard/cdef38a3-7055-11ef-ae88-0a580a800454
