import Api from '@/core/services/services';

const baseURL = import.meta.env.VITE_PLATFORM;

export const api = new Api(baseURL, {
    unauthorizedNotification: 'Unauthorized Action.',
    setClean: true
});
// New Axios Service Add: @name, @retry, @options
api.add('platform', false, { endpoint: '/controlpanel/api' }); // platform API Services
api.add('userDefined', true, { endpoint: '/api-manager/server/api' }); // User defined API Services
///controlpanel/api/configurations/citiesweb_configuration/type/EXTERNAL_CONFIG/environment/default
