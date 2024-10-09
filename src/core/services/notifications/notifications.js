import { api } from '@/core/services/api';
import { notifierFactory } from '@/core/utils/notifier';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import messages from './lang';

Vue.use(VueI18n);
const i18n = new VueI18n(messages);
const notifier = notifierFactory(i18n);

/**
 * Controller for the GET notifications service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list of notifications
 * of Datasources
 * @param {string} endPoint               - configurable endPoint for request
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {listResponse} - An array of objects containing the list of Notifications
 */
export const list = async (endPoint, config = {}) => {
    const notify = notifier('list', ['error']);
    const { data: notifications } = await api.userDefined.get(endPoint, {
        ...config,
        notify
    });
    return notifications;
};

/**
 * Controller for the GET notifications service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list of notifications
 * @param {string} endPoint               - configurable endPoint for request
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {listResponse} - An array of objects containing the list of Notifications
 */
export const listAll = async (endPoint, config = {}) => {
    const notify = notifier('listAll', ['error']);
    const { data: notifications } = await api.userDefined.get(endPoint, {
        ...config,
        notify
    });
    return notifications;
};

/**
 * Controller for the GET notifications service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list of notifications unreaded
 * @param {string} endPoint               - configurable endPoint for request
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {listResponse} - An array of objects containing the list of Notifications
 */
export const listAllUnread = async (endPoint, config = {}) => {
    const notify = notifier('listAllUnread', ['error']);
    const { data: notifications } = await api.userDefined.get(endPoint, {
        ...config,
        notify
    });
    return notifications;
};

/**
 * Controller for the GET notifications service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the notification complete
 * of Datasources
 * @param {string} endPoint               - configurable endPoint for request
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {listResponse} - An object containing the Notification
 */
export const getById = async (endPoint, config = {}) => {
    const notify = notifier('getById', ['error']);
    const { data: notification } = await api.userDefined.get(endPoint, {
        ...config,
        notify
    });
    return notification;
};

/**
 * Controller for the POST notification service to update message with reply. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the reply message info
 * of users
 * @param {string} endPoint   - configurable endPoint for request
 * @param {form} body         - The reply parameters needed to perform the update
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {sendReply} - An object containing the info about the update action
 */
export const sendReply = async (endPoint, body, config = {}) => {
    const notify = notifier('sendReply', ['error', 'success']);
    const { data: reply } = await api.userDefined.post(endPoint, body, {
        ...config,
        notify
    });
    // API don´t response anything if all is OK (to-do: return msg)
    if (!reply) {
        return true;
    } else {
        return reply;
    }
};

/**
 * Controller for the POST notification service to create a notification. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the new notification info
 * of users
 * @param {string} endPoint   - configurable endPoint for request
 * @param {form} body         - The reply parameters needed to perform the update
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {createNotification} - An object containing the info about the create action
 */
export const createNotification = async (endPoint, body, config = {}) => {
    const notify = notifier('create', ['error', 'success']);
    const { data: newnotification } = await api.userDefined.post(endPoint, body, {
        ...config,
        notify
    });
    // API don´t response anything if all is OK
    if (!newnotification) {
        return true;
    } else {
        return newnotification;
    }
};

/**
 * Controller for the POST notification service to close notification. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the notification closed info
 * of users
 * @param {string} endPoint   - configurable endPoint for request
 * @param {form} body         - The reply parameters needed to perform the update, nothing by API.
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {close} - An object containing the info about the closed action
 */
export const close = async (endPoint, config = {}) => {
    const notify = notifier('close', ['error', 'success']);
    const { data: close } = await api.userDefined.post(endPoint, null, {
        ...config,
        notify
    });
    // API don´t response anything if all is OK (to-do: return msg)
    if (!close) {
        return true;
    } else {
        return close;
    }
};

/**
 * Controller for the POST notification service to update notification status. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the notification closed info
 * of users
 * @param {string} endPoint   - configurable endPoint for request
 * @param {form} body         - The reply parameters needed to perform the update, nothing by API.
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {update} - An object containing the info about the closed action
 */
export const update = async (endPoint, config = {}) => {
    const notify = notifier('update', ['error']);
    const { data: update } = await api.userDefined.post(endPoint, null, {
        ...config,
        notify
    });
    // API don´t response anything if all is OK (to-do: return msg)
    if (!update) {
        return true;
    } else {
        return update;
    }
};

/**
 * Controller for the POST notification service to update notification labels. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the notification closed info
 * of users
 * @param {string} endPoint   - configurable endPoint for request
 * @param {form} body         - The reply parameters needed to perform the update, nothing by API.
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {updateLabels} - An object containing the info about the update labels on notification action
 */
export const updateLabels = async (endPoint, body, config = {}) => {
    const notify = notifier('updateLabels', ['error', 'success']);
    const { data: updateLabels } = await api.userDefined.post(endPoint, body, {
        ...config,
        notify
    });
    // API don´t response anything if all is OK (to-do: return msg)
    if (!updateLabels) {
        return true;
    } else {
        return updateLabels;
    }
};

/**
 * Controller for the DELETE notification service to delete notification. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the action information about deleting notification (count: 1)
 * of users
 * @param {string} endPoint   - configurable endPoint for request
 * @param {form} body         - The reply parameters needed to perform the delete action, nothing by API.
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {remove} - An object containing the info about the closed action
 */
export const remove = async (endPoint, config = {}) => {
    const notify = notifier('remove', ['error', 'success']);
    const { data: remove } = await api.userDefined.delete(
        endPoint,
        {},
        {
            ...config,
            notify
        }
    );
    // API don´t response anything if all is OK (to-do: return msg)
    if (!remove) {
        return true;
    } else {
        return remove;
    }
};

/**
 * Controller for the GET count of unreaded notifications service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an a value
 * @param {string} endPoint               - configurable endPoint for request
 * @param {RequestConfiguration}    - Custom axios configuration that is used to control the behaviour of the request
 * @return {countResponse} - A number of unread Notifications
 */
export const count = async (endPoint, config = {}) => {
    const notify = notifier('count', ['error']);
    const { data: count } = await api.userDefined.get(endPoint, {
        ...config,
        notify
    });
    return count.value;
};

/**
 * Controller for the GET count of notifications (all) service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an a value
 * @param {string} endPoint               - configurable endPoint for request
 * @param {RequestConfiguration}    - Custom axios configuration that is used to control the behaviour of the request
 * @return {countAllResponse} - A number of Notifications (count)
 */
export const countAll = async (endPoint, config = {}) => {
    const notify = notifier('countAll', ['error']);
    const { data: count } = await api.userDefined.get(endPoint, {
        ...config,
        notify
    });
    return count.value;
};

/**
 * Controller for the GET list of notification types. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an a array of types, id and a count for each type
 * @param {string} endPoint               - configurable endPoint for request
 * @param {RequestConfiguration}    - Custom axios configuration that is used to control the behaviour of the request
 * @return {countResponse} - An array of types of notifications
 */
export const types = async (endPoint, config = {}) => {
    const notify = notifier('types', ['error']);
    const { data: types } = await api.userDefined.get(endPoint, {
        ...config,
        notify
    });
    return types;
};

/**
 * Controller for the GET list of notification types for create new notifications. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an a array of types, id and a count for each type
 * @param {string} endPoint               - configurable endPoint for request
 * @param {RequestConfiguration}    - Custom axios configuration that is used to control the behaviour of the request
 * @return {countResponse} - An array of types of notifications
 */
export const newTypes = async (endPoint, config = {}) => {
    const notify = notifier('newTypes', ['error']);
    const { data: newtypes } = await api.userDefined.get(endPoint, {
        ...config,
        notify
    });
    return newtypes;
};

/**
 * Controller for the GET list of notification status. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an a array of status, id  and a count for each type
 * @param {string} endPoint               - configurable endPoint for request
 * @param {RequestConfiguration}    - Custom axios configuration that is used to control the behaviour of the request
 * @return {countResponse} - An array of status of notifications
 */
export const status = async (endPoint, config = {}) => {
    const notify = notifier('status', ['error']);
    const { data: status } = await api.userDefined.get(endPoint, {
        ...config,
        notify
    });
    return status;
};

/**
 * Controller for the GET list of notification labels. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an a array of types and a count for each label
 * @param {string} endPoint               - configurable endPoint for request
 * @param {RequestConfiguration}    - Custom axios configuration that is used to control the behaviour of the request
 * @return {countResponse} - An array of labels of notifications
 */
export const labels = async (endPoint, config = {}) => {
    const notify = notifier('labels', ['error']);
    const { data: labels } = await api.userDefined.get(endPoint, {
        ...config,
        notify
    });
    return labels;
};

/**
 * Controller for the GET download file service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns a file from notification
 * of Datasources
 * @param {string} endPoint               - configurable endPoint for request
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {downloadFile} - info of donwload action
 */
export const downloadFile = async (file, config = {}) => {
    const notify = notifier('downloadFile', ['error', 'success']);
    const fileEncoded = encodeURIComponent(file);
    const { data: downloaded } = await api.platform.get('/objectstorage?filePath=' + fileEncoded, {
        ...config,
        notify
    });
    return downloaded;
};

export default {
    list,
    listAll,
    listAllUnread,
    getById,
    sendReply,
    createNotification,
    update,
    updateLabels,
    close,
    count,
    types,
    newTypes,
    status,
    labels,
    downloadFile
};
