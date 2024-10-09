<script setup>
import { useLoading } from '@/core/composables/useLoading';
import { cloneData, getData, getForm, resolveDataSource, updateData } from '@/core/services/form/api-opServices';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// Props
const props = defineProps({
    formcode: String,
    dataoid: String,
    routername: String
});

// Pinia Store

// Vue Router
const router = useRouter();

// Vue I18n
const locale = ref('es');
const { startLoading, stopLoading, isLoading } = useLoading();
// Reactive variables
const divIdentifier = ref('builder-form-' + Math.random().toString(36).substr(2, 9));
const buildForm = ref(null);
const loading = ref(true);

const getInit = async () => {
    try {
        if (props.formcode) {
            window.formId = props.formcode;
            if (props.dataoid && props.dataoid !== 'null') {
                await initFromDataWithOid();
            } else {
                const response = await getForm(props.formcode);
                if (!response.i18nJson) response.i18nJson = null;
                if (response.datasources) window.ds = response.datasources;

                const build = await window.Formio.createForm(document.getElementById(divIdentifier.value), JSON.parse(response.jsonSchema), JSON.parse(response.i18nJson));

                buildForm.value = build;
                buildForm.value.language = locale.value.toUpperCase();
                window.setLanguage = (lang) => (buildForm.value.language = lang);

                buildForm.value.on('redirect', (redirecto) => checkRedirect(redirecto));
                buildForm.value.on('submit', (submission) => handleSubmit(submission, props.formcode));
            }
            console.log('pacopaco');
        }
    } catch (error) {
        console.error(error);
        stopLoading();
    }
};
const handleSubmit = async (submission, formcode) => {
    try {
        if (window.buttonJustCreate) {
            const data = await cloneData(formcode, submission);
            if (data.ids && data.ids.length > 0) window.resultId = data.ids[0];
        } else {
            const data = await updateData(formcode, props.dataoid, submission);
            if (data.ids && data.ids.length > 0) window.resultId = data.ids[0];
        }
        buildForm.value.emit('submitDone', submission);
    } catch (error) {
        buildForm.value.emit('submitError', error);
        console.log(error);
    }
};
const waitForFormio = async () => {
    startLoading();
    await window.Formio;
    if (window.Formio) {
        getInit();
    }
    console.log('pacopaco2');
    setTimeout(() => {
        stopLoading();
    }, 2200);
};
const checkRedirect = (redirecto) => {
    router.push({ path: `/forms/${redirecto.formcode}/${redirecto.dataoid}` });
};

const initFromDataWithOid = async () => {
    try {
        const responsedata = await getData(props.formcode, props.dataoid);
        const resp = responsedata;

        // Manejo de internacionalización y datasources
        if (!resp.i18nJson) resp.i18nJson = null;
        if (resp?.datasources) window.ds = resp.datasources;

        // Creación del formulario usando Formio
        const build = await window.Formio.createForm(document.getElementById(divIdentifier.value), resp.schema, JSON.parse(resp.i18nJson));

        buildForm.value = build;
        buildForm.value.submission = { data: resp.data[0] };

        // Establecer el idioma del formulario
        if (locale.value) {
            buildForm.value.language = locale.value.toUpperCase();
        }

        window.setLanguage = (lang) => {
            buildForm.value.language = lang;
        };

        // Listener para redirección
        buildForm.value.on('redirect', (redirecto) => {
            router.push({ path: `/forms/${redirecto.formcode}/${redirecto.dataoid}` });
        });

        // Listener para manejar el submit
        buildForm.value.on('submit', async (submission) => {
            try {
                if (window.buttonJustCreate) {
                    const data = await cloneData(props.formcode, submission);
                    if (data.ids && data.ids.length > 0) {
                        window.resultId = data.ids[0];
                    }
                    buildForm.value.emit('submitDone', submission);
                } else {
                    const data = await updateData(props.formcode, props.dataoid, submission);
                    if (data.ids && data.ids.length > 0) {
                        window.resultId = data.ids[0];
                    }
                    buildForm.value.emit('submitDone', submission);
                }
            } catch (error) {
                buildForm.value.emit('submitError', error);
                console.error(error);
            } finally {
                // Remover los iconos de carga después del submit
                document.querySelectorAll('.fa-refresh.fa-spin').forEach((el) => el.remove());
            }
        });
    } catch (error) {
        console.error(error);
        stopLoading();
    }
};
const initFromDataSourceWithOid = async (msg, count) => {
    try {
        const promises = [];

        // Obtener los datos del formulario
        const getDat = getData(props.formcode, props.dataoid).then((res) => ({ res, entity: true }));
        promises.push(getDat);

        // Resolver las fuentes de datos adicionales
        if (msg && msg.length > 0) {
            for (const dsObj of msg) {
                const dsname = dsObj.ds;
                const promise = resolveDataSource(dsObj).then((res) => ({ res, ds: dsname, entity: false }));
                promises.push(promise);
            }
        }

        const respDatasource = await Promise.all(promises);

        let resp = null;
        for (const dsItem of respDatasource) {
            if (dsItem.entity) {
                resp = dsItem.res;
            }
        }

        for (const dsItem of respDatasource) {
            if (!dsItem.entity) {
                resp.data[0][dsItem.ds] = dsItem.res;
            }
        }

        if (!resp.i18nJson) {
            resp.i18nJson = null;
        }

        if (resp?.datasources) {
            window.ds = resp.datasources;
        }

        // Crear el formulario con Formio
        const build = await window.Formio.createForm(document.getElementById(divIdentifier.value), resp.schema, JSON.parse(resp.i18nJson));

        buildForm.value = build;
        buildForm.value.submission = { data: resp.data[0] };

        if (locale.value) {
            buildForm.value.language = locale.value.toUpperCase();
        }

        window.setLanguage = (lang) => {
            buildForm.value.language = lang;
        };

        // Listener para redirección
        buildForm.value.on('redirect', (redirecto) => {
            router.push({ path: `/forms/${redirecto.formcode}/${redirecto.dataoid}` });
        });

        // Listener para manejar el submit
        buildForm.value.on('submit', async (submission) => {
            try {
                await updateData(props.formcode, props.dataoid, submission);
                buildForm.value.emit('submitDone', submission);
            } catch (error) {
                console.error(error);
                buildForm.value.emit('submitError', error);
            } finally {
                // Remover los iconos de carga después del submit
                document.querySelectorAll('.fa-refresh.fa-spin').forEach((el) => el.remove());
            }
        });

        setTimeout(() => {
            stopLoading();
        }, 1200);
    } catch (error) {
        if (count > 0) {
            initFromDataSourceWithOid(msg, count - 1);
        }
        console.error(error);
        stopLoading();
    }
};
const cleanSubmission = (submission) => {
    if (buildForm.value?.components && buildForm.value.components.length > 0) {
        buildForm.value.components.forEach((component) => {
            if (component.component?.type === 'button') {
                deletePropoertyPath(submission, component.component.key);
            }
        });
    }
    return submission;
};

// Función para eliminar una propiedad de un objeto
const deletePropoertyPath = (obj, path) => {
    if (!obj || !path) return;

    if (typeof path === 'string') {
        path = path.split('.');
    }

    for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]];
        if (typeof obj === 'undefined') return;
    }

    delete obj[path.pop()];
};
watch(() => props.formcode, waitForFormio);
watch(locale, waitForFormio, { immediate: true });
</script>

<template>
    <div v-if="isLoading" class="loading-container">
        <div class="loading-content">
            <ProgressSpinner styleClass="custom-spinner" />
            <p class="loading-text">Cargando</p>
        </div>
    </div>

    <div v-show="!isLoading" id="builder" style="height: 100% !important; width: 100% !important">
        <div :id="divIdentifier"></div>
    </div>
</template>
<style lang="scss">
#builder {
    padding: 24px !important;
}

.formio-component-datagrid .datagrid-table,
.formio-component-datagrid .datagrid-table th {
    border: 0px solid #ddd !important;
    padding: 10px;
}

::v-deep .formio-form {
    max-width: 100%;
    width: 100%;
}

a {
    text-decoration: none !important;
}

.max50vh {
    max-height: 50vh;
}
</style>
