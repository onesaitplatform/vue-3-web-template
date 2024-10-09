import eventBus from '@/core/composables/eventBus'; // Importamos el event bus
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { merge } from 'lodash';

/** @class Services */
class Services {
    /**
     * Constructor function that sets the base configuration for every microservice. It uses the BaseURL passed as an argument for determining
     * the endpoint and merges the custom configuration with the preconfigured configuration.
     * @param {string} baseURL          - The base url for all the microservices that share the same server entry point
     * @param {object} configuration    - Custom axios and notifications configuration that will be merged with the default configuration
     */
    constructor(baseURL, config) {
        const configuration = merge(this._defaultConfiguration, config);
        this._services = new Set();
        this._configuration = {
            axios: merge(configuration.axiosConfiguration, {
                baseURL: baseURL.replace(/\/$/, '')
            }),
            notification: configuration.notificationConfiguration
        };
        this._unauthorized = {
            cb: configuration.unauthorizedCallback,
            notification: configuration.unauthorizedNotification
        };
        if (configuration.setClean) {
            this._createBaseInstance();
        }
    }

    URL_REGEX = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

    _defaultConfiguration = {
        axiosConfiguration: this._axiosConfig,
        notificationConfiguration: this._notificationConfig,
        unauthorizedCallback: null,
        unauthorizedNotification: null,
        setClean: false
    };

    _axiosConfig = {
        baseURL: null,
        headers: {
            Accept: 'application/json',
            ContentType: 'application/json'
        }
    };

    _notificationConfig = {
        position: 'top-right',
        type: 'success',
        title: '',
        message: '',
        offset: 0,
        duration: '0',
        showClose: true,
        notify: true
    };

    _isHandlerEnabled(config = {}) {
        return !Object.prototype.hasOwnProperty.call(config, 'handlerEnabled') || config.handlerEnabled;
    }

    _successHandler = (response) => {
        //if (!this._isHandlerEnabled(response.config)) return response;
        this._responseHandler(response.config, response.status, 'success');
        return response;
    };

    _errorHandler = (error) => {
        //if (!this._isHandlerEnabled(error.config) || !error.response) return Promise.reject(error);
        this._responseHandler(error.response.config, error.response.status, 'error');
        return Promise.reject(error);
    };

    _responseHandler = (status = 500, type = 'success') => {
        if (status === 401) {
            if (this._unauthorized.notification) {
                eventBus.emit('toast', {
                    severity: 'error',
                    summary: 'Unauthorized',
                    detail: this._unauthorized.notification,
                    life: 3000
                });
            }
            if (this._unauthorized.cb) this._unauthorized.cb();
        }

        eventBus.emit('toast', {
            severity: 'success',
            summary: 'Sucess',
            detail: 'Servicio cargado correctamente',
            life: 3000
        });
    };

    _createBaseInstance() {
        this._baseInstance = axios.create(this._configuration.axios);

        this._baseInstance.interceptors.response.use(this._successHandler, this._errorHandler);
        this._services.add('_baseInstance');
    }

    add(name, retry, { endpoint, ...config } = {}) {
        const baseURL = `${config.baseURL || this._configuration.axios.baseURL}${endpoint || `/${name}`}`;
        const service = axios.create({
            ...merge(config, this._configuration.axios),
            baseURL
        });

        if (retry) {
            axiosRetry(service, { retries: 2 });
        }

        service.interceptors.response.use(this._successHandler, this._errorHandler);
        this._services.add(name);
        this[name] = service;
    }

    setToken(token, name) {
        if (name) {
            this[name].defaults.headers.Authorization = `Bearer ${token}`;
        } else {
            this._services.forEach((service) => {
                this[service].defaults.headers.Authorization = `Bearer ${token}`;
            });
        }
    }

    setUnauthorizedCallback(callback) {
        this._unauthorized.cb = () => {
            return callback();
        };
    }
}

export default Services;
