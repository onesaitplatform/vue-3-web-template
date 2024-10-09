<script setup>
import { useLoading } from '@/core/composables/useLoading';
//import { getIframe } from '@/core/services/iframes/iframes'; // Cambié el servicio a iframes
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
const { startLoading, stopLoading, isLoading } = useLoading();

const iframeUrl = ref('');
const token = ref(sessionStorage.sessionToken);
const platformbase = ref(import.meta.env.VITE_PLATFORM);
const params = ref({});

const currentIframe = ref('');
const currentIframeId = ref('');

const iframeId = ref('');
const initialDatalink = ref({});

const route = useRoute();

const swapIframe = async (iframeId) => {
    iframeUrl.value = iframeId;
    stopLoading();
};

watch(
    () => route.params,
    async (params) => {
        startLoading();
        const iframeIdHelper = route.params.iframeId;

        // Llamamos al servicio para obtener la URL del iframe
        //const response = await getIframe(iframeIdHelper); // Cambié a getIframe
        const response = {
            id: 1,
            data: {
                url: 'https://www.google.com'
            }
        };
        if (response && response.id) {
            currentIframe.value = route.params.iframeId; // Cambié a iframeId
            currentIframeId.value = response.id;
            iframeId.value = route.params.iframeId;

            if (Object.keys(route.query).length > 0) {
                const paramsKeys = Object.keys(route.query);
                const paramsValues = Object.values(route.query);
                const paramsMap = {};

                paramsKeys.forEach((key, index) => {
                    if (key !== 'iframeId') {
                        // Cambié a iframeId
                        paramsMap[key] = paramsValues[index];
                    }
                });

                params.value = paramsMap;
            }

            // Pasamos la URL obtenida del servicio al iframe
            swapIframe(response.data.url); // La URL del iframe
        }
    },
    { immediate: true }
);
</script>

<template>
    <div>
        <div v-if="isLoading" class="loading-container">
            <div class="loading-content">
                <ProgressSpinner styleClass="custom-spinner" />
                <p class="loading-text">Cargando</p>
            </div>
        </div>
        <iframe v-if="iframeUrl && !isLoading" :src="iframeUrl" class="iframe-content" width="100%" height="100%" frameborder="0"></iframe>
    </div>
</template>

<style lang="scss">
.containerD__layout {
    height: calc(100vh - 56px);
}
.iframe-content {
    width: 100%;
    height: 100%;
    border: none;
}
</style>
