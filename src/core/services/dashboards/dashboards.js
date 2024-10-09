// dashboards.js

import { api } from '@/core/services/api';

export const getDashboard = async (id, config = {}) => {
    try {
        const { data: dashboard } = await api.platform.get(`/dashboards/dashboard/${id}`, { ...config });
        return dashboard;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
