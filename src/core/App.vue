<script setup>
import eventBus from '@/core/composables/eventBus';
import { useAuth } from '@/core/composables/useAuth';
import { useLayout } from '@/core/layout/composables/layout';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';
import AppFooter from './layout/AppFooter.vue';
import AppSidebar from './layout/AppSidebar.vue';
import AppTopbar from './layout/AppTopbar.vue';
import { useRouter } from 'vue-router';
const { layoutConfig, layoutState, isSidebarActive, resetMenu } = useLayout();
const toast = useToast();
const outsideClickListener = ref(null);
const DashboardAppLoaded = ref(false);
const router = useRouter();
const appFolder = import.meta.env.VITE_APPLICATION || '';
//const theme = import.meta.env.VUE_THEME || '';
const allLoaded = ref(false);
const errorView = ref(false);
const loadingMessage = ref('Initializing...');
const environmentLoaded = ref({ isloaded: false, error: '' });
const { accessKeyCloak } = useAuth();
const scriptLoadOrder = [
    {
        name: 'Phase 1 Scripts',
        scripts: ['/controlpanel/static/vendor/onesait-ds/lib/vue.min.js', '/controlpanel/static/vendor/echarts-542/echarts.min.js']
    },
    {
        name: 'Phase 2 Scripts',
        scripts: [
            `/controlpanel/static/dashboards/scripts/vendor.js`,
            `/controlpanel/static/dashboards/gridster.js`,
            '/controlpanel/static/vendor/element-ui/index.js',
            '/controlpanel/static/vendor/onesait-ds/lib/index.js',
            `/web/${appFolder}/libs/vue-carousel.min.js`,
            `/controlpanel/static/vendor/vue-i18n/vue-i18n.js`,
            `/web/${appFolder}/libs/xlsx.full.min.js`,
            `/web/${appFolder}/libs/ol.js`,
            '/controlpanel/static/vendor/vue-echarts-660/vue-echarts.min.js',
            '/controlpanel/static/js/pages/dashboardMessageHandler.js',
            '/controlpanel/static/vendor/jsoneditor/jsoneditor.js',
            '/controlpanel/static/formsio/formiojs/dist/formio.full.js',
            '/controlpanel/static/js/pages/forms.js',
            '/controlpanel/static/formsio/libs/ace/1.4.12/ace.js'
        ]
    },
    {
        name: 'Specific Scripts',
        scripts: []
    },
    {
        name: 'Phase 3 Scripts',
        scripts: [
            '/controlpanel/static/vendor/element-ui/locale/es.min.js',
            '/controlpanel/static/vendor/element-ui/locale/en.min.js',
            '/controlpanel/static/dashboards/scripts/app.js'
            //maps
            // '/web/xeokit-bim-viewer_251_beta32/js/popper.js',
            // '/web/xeokit-bim-viewer_251_beta32/js/tippy.js'
        ],
        callback: () => {
            console.log('DS Engine Running...');
            DashboardAppLoaded.value = true;
            window.DashboardAppLoaded = true;
        }
    }
];

const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = import.meta.env.VITE_PLATFORM + src;
        script.onload = () => {
            resolve();
        };
        script.onerror = () => {
            console.error(`Error loading script: ${src}`);
            reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
    });
};

const loadScriptsInOrder = async () => {
    allLoaded.value = false;
    for (const phase of scriptLoadOrder) {
        loadingMessage.value = `Loading ${phase.name}...`;
        for (const src of phase.scripts) {
            loadingMessage.value = `Loading script: ${src}`;
            try {
                await loadScript(src);
            } catch (error) {
                console.error(`Error during ${phase.name}:`, error);
            }
        }

        if (phase.callback) {
            phase.callback();
        }
    }
    loadingMessage.value = 'Loading complete';
    allLoaded.value = true;
};

const setMetaInfo = () => {
    const head = document.head;

    const links = [
        { href: `${import.meta.env.VITE_PLATFORM}/controlpanel/static/dashboards/styles/vendor.css`, rel: 'stylesheet' },
        { href: `${import.meta.env.VITE_PLATFORM}/controlpanel/static/dashboards/gridster.css`, rel: 'stylesheet' },
        { href: `${import.meta.env.VITE_PLATFORM}/controlpanel/static/dashboards/styles/app.css`, rel: 'stylesheet' },
        { href: `/web/${appFolder}/theme-onesait/index.css`, rel: 'stylesheet' },
        { href: `/web/${appFolder}/libs/materialIcons.css`, rel: 'stylesheet' },
        { href: `/web/${appFolder}/libs/ol.css`, rel: 'stylesheet' },
        // { href: '/web/resources-2/vendor/bootstrap/4.3.1/css/bootstrap.min.css', rel: 'stylesheet' },
        // { href: '/web/resources-2/vendor/bootstrap-toggle/2.2.2/css/bootstrap-toggle.min.css', rel: 'stylesheet' },
        // { href: '/web/resources-2/vendor/buttons/1.6.1/css/buttons.dataTables.min.css', rel: 'stylesheet' },
        { href: '/controlpanel/static/dashboards/utils/gadget-form-creator.css', rel: 'stylesheet' },

        { href: '/controlpanel/static/vendor/element-ui/theme-chalk/index.css', rel: 'stylesheet' },
        // { href: '/web/web-resources/libs/css/dashboard.css', rel: 'stylesheet' },
        // { href: '/web/web-resources/fonts/fonts.css', rel: 'stylesheet' },
        // {
        //     href: `/controlpanel/api/themes/css/${theme}`,
        //     rel: 'stylesheet',
        //     disabled: skipUseTheme
        // },
        { href: `/web/${appFolder}/favicon.ico`, rel: 'icon' }
    ];

    links.forEach((link) => {
        const linkElement = document.createElement('link');
        linkElement.rel = link.rel;
        linkElement.href = link.href;
        if (link.disabled) {
            linkElement.disabled = true;
        }
        head.appendChild(linkElement);
    });
};

const containerClass = computed(() => {
    return {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                resetMenu();
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};

const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};

const isOutsideClicked = (event) => {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};

watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

onMounted(async () => {
    environmentLoaded.value = await accessKeyCloak();
    console.log(environmentLoaded.value);
    if (environmentLoaded.value.isloaded === false) {
        console.log('alksdjpasjdkñasjd');
        errorView.value = true;
        router.push({ name: 'error', query: { message: environmentLoaded.value.error } });
        return;
    } else {
        errorView.value = false;
    }
    await setMetaInfo();
    await loadScriptsInOrder();
    console.log(allLoaded.value, environmentLoaded.value);
    eventBus.on('toast', (data) => {
        toast.add(data);
    });
});
</script>

<template>
    <main>
        <div v-if="allLoaded && environmentLoaded.isloaded" class="layout-wrapper" :class="containerClass">
            <app-topbar></app-topbar>
            <div class="flex">
                <app-sidebar></app-sidebar>
                <div style="flex: 1" class="layout-main-container">
                    <router-view />
                    <Toast />
                </div>
            </div>
            <app-footer></app-footer>
            <div class="layout-mask"></div>
        </div>

        <div v-else-if="errorView" class="basic-view">
            <router-view />
        </div>

        <!-- Mostrar spinner mientras allLoaded es false -->
        <div v-if="!allLoaded && environmentLoaded.isloaded" class="loading-container">
            <div class="loading-content">
                <ProgressSpinner styleClass="custom-spinner" />
                <p class="loading-text">{{ loadingMessage }}</p>
            </div>
        </div>
    </main>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f7f9fc;
}

.loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.custom-spinner {
    width: 50px !important;
    height: 50px !important;
    --spinner-color: #007bff;
}

.loading-text {
    font-size: 1.1rem;
    color: #555;
    font-weight: 500;
    text-align: center;
}
</style>
