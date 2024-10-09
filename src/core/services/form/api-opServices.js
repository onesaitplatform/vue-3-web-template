import { api } from '@/core/services/api';
export const loadEntities = async () => {
    const response = await api.platform.get('/ontologies/');
    const data = await response.data;
    return data;
};

export const loadFormsList = async () => {
    const response = await api.platform.get('/forms/');
    const data = await response.data;
    return data;
};

export const getSchema = async (formid) => {
    const response = await api.platform.get(`/forms/${formid}/schema`);
    const data = await response.data;
    return data;
};

export const getForm = async (formid) => {
    const response = await api.platform.get(`/forms/${formid}`);
    const data = await response.data;
    return data;
};

export const getData = async (formid, dataoid) => {
    const response = await api.platform.get(`/forms/${formid}/data/${dataoid}`);
    const data = await response.data;
    return data;
};

export const createData = async (formid, body) => {
    body.metadata.formId = formid;
    delete body.data.submit;
    const response = await api.platform.post('/forms/submit', body);
    const data = await response.data;
    return data;
};

export const cloneData = async (formid, body) => {
    body.metadata.formId = formid;
    delete body.metadata.dataId;
    delete body.data.submit;
    const response = await api.platform.post('/forms/clonedata', body);
    const data = await response.data;
    return data;
};

export const updateData = async (formid, dataoid, body) => {
    body.metadata.formId = formid;
    body.metadata.dataId = dataoid;
    delete body.data.submit;
    const response = await api.platform.post('/forms/submit/update', body);
    const data = await response.data;
    return data;
};

export const resolveDataSource = async (body) => {
    const response = await api.platform.post('/forms/datasource', body);
    const data = await response.data;
    return data;
};

export default {
    loadEntities,
    loadFormsList,
    getSchema,
    getForm,
    getData,
    createData,
    updateData,
    resolveDataSource
};
