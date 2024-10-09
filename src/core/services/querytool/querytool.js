import { api } from '@/core/services/api';
import { notifierFactory } from '@/core/utils/notifier';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import messages from './lang';

Vue.use(VueI18n);
const i18n = new VueI18n(messages);
const notifier = notifierFactory(i18n);

/**
 * Controller for the GET and POST dashboard service. This method performs a clone of the dashboard select with a new indetification
 * @param {string} query    - query to run
 * @param {string} ontology - Ontology / main table
 * @param {string} offset   - offset if needed
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {queryResult} - An array of data result of query
 */
export const query = async (query, ontology, offset = 0, config) => {
    const notify = notifier('query', ['error']);
    const { data: queryResult } = await api.platform.get('/querytool?query=' + encodeURIComponent(query) + '&ontology=' + ontology + '&querytype=SQL&offset=' + offset, { ...config, notify }).catch((err) => {
        if (!(err instanceof Error)) {
            err = new Error(err);
        }
        console.log('ERROR SQL: ', err);
        console.log('ERROR RESULT: ', queryResult);
    });
    return queryResult;
};

export default {
    query
};
