import { api } from '@/core/services/api';
import Vue from 'vue';

import { notifierFactory } from '@/core/utils/notifier';
import VueI18n from 'vue-i18n';
import messages from './lang';

Vue.use(VueI18n);
const i18n = new VueI18n(messages);
const notifier = notifierFactory(i18n);
const REALM = process.env.VUE_APP_APPLICATION;

/**
 * @typedef {Object} GetUsersResponse
 * @property {array} users - A list of users
 */

/**
 * Controller for the GET users service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list
 * of users
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetUsersResponse} - An object containing the list of Users
 */
export const getUsers = async (params, config = {}) => {
    const notify = notifier('getUsers', ['error']);
    const { data: users } = await api.platform.get('/realms/' + REALM + '/users/', {
        ...config,
        notify
    });
    // check for extrafields info and add to data.
    const extraUsers = users.map((user) => ({
        ...user,
        extra: user.extraFields ? JSON.parse(user.extraFields) : null
    }));

    console.log('RETRY USERs: ', extraUsers);
    return extraUsers;
};

/**
 * Controller for the GET user service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the user info
 * of users
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {GetUserResponse} - An array containing the User info
 */
export const getUser = async (id, params, config = {}) => {
    const notify = notifier('getUser', ['error']);
    const { data: user } = await api.platform.get('/realms/' + REALM + '/users/' + id, {
        ...config,
        notify
    });
    return user;
};

/**
 * Controller for the PATCH user service to update user data or password. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the user info
 * of users
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @param {form} body         - The form user parameters needed to perform the update
 * @return {UpdateUserResponse} - An object containing the info about the update action
 */
export const updateUser = async (body, params, config = {}) => {
    const notify = notifier('updateUser', ['error', 'success']);
    const { data: user } = await api.platform.patch('/users', body, {
        ...config,
        notify
    });
    // API don´t response anything if all is OK (to-do: return msg)
    if (!user) {
        return true;
    } else {
        return user;
    }
};

export default {
    getUsers,
    getUser,
    updateUser
};
