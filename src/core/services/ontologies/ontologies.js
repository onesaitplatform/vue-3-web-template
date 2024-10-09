import { api } from '@/core/services/api';
import Vue from 'vue';

import { getResourcesByTag } from '@/core/services/tags/tags';
import { notifierFactory } from '@/core/utils/notifier';
import VueI18n from 'vue-i18n';
import messages from './lang';

Vue.use(VueI18n);
const i18n = new VueI18n(messages);
const notifier = notifierFactory(i18n);

/**
 * @typedef {Object} getOntologiesResponse
 * @property {array} ontologies - A list of ontologies
 */

/**
 * @typedef {Object} GetDatasourceFieldsResponse
 * @property {Array} fields - A list of datasource fields
 */

/**
 * Controller for the GET Ontologies service. This method performs the request regarding the configuration and
 * parameters passed as arguments and returns an object containing the list
 * of Ontologies, but also get ontologies from project resources and finally get unique ontologies. may be filter by tag if tag service is enabled on dashboards component.
 * @param {RequestConfiguration}  - Custom axios configuration that is used to control the behaviour of the request
 * @return {getOntologiesResponse} - An object containing the list of Ontologies
 */
export const getOntologies = async (config = {}) => {
    const notify = notifier('getOntologies', ['error']);
    var { data: ontologies } = await api.platform.get('/ontologies', {
        ...config,
        notify
    });
    // adding ontologies from project
    // var { data: projectOntologies } = await api.platform.get(`/projects/${config.project}/resources/role/${config.role}`, { temporalmente bug , pasamos a user
    var { data: projectOntologies } = await api.platform.get(`/projects/${config.project}/resources/${config.user}`, {
        ...config,
        notify
    });
    console.log('RESOURCES FROM ONTOLOGIES: ', ontologies);
    // adjust to ontologies and add identification key
    projectOntologies = projectOntologies.length > 0 ? projectOntologies.filter((x) => x.resourceType === 'ONTOLOGY' && x.role === config.role).map((y) => ({ ...y, identification: y.resource })) : [];
    console.log('RESOURCES FROM PROJECT: ', projectOntologies);

    // merge with ontologies
    const mergedOntologies = ontologies.concat(projectOntologies.filter((y) => !ontologies.some((x) => x.identification === y.identification)));
    ontologies = mergedOntologies;
    console.log('RESOURCES FROM MERGED: ', ontologies);
    // generic filters using tags
    // if options contains filter key , then apply, if not just only identification.
    if (config.tag !== '' && config.tag) {
        const resources = await getResourcesByTag(config.tag, 'Ontology');
        const resourcesList = resources.length > 0 ? resources.map((x) => x.name) : [];
        return resourcesList.length > 0 ? ontologies.filter((d) => resourcesList.includes(d.identification)) : [];
    } else {
        // no filter using tags
        return ontologies;
    }
};

export default {
    getOntologies
};
