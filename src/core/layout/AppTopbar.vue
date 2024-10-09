<script setup>
import { useLayout } from '@/core/layout/composables/layout';
import KeyCloakService from '@/core/security/KeycloackService';
import { useAuthStore } from '@/core/stores/login';
import { useOnline } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppConfigurator from './AppConfigurator.vue';
import { useConfigurationStore } from '@/core/stores/configuration';

const configurationStore = useConfigurationStore();
const { onMenuToggle, toggleDarkMode, toggleFullScreen, isDarkTheme, isFullScreenActive } = useLayout();
const router = useRouter();
const route = useRoute();

// breadcrumb
const breadcrumbHome = ref({ icon: 'pi pi-home', to: '/' });
const breadcrumbItems = ref([{ label: 'onesait Dashboard' }]);

// Watch para actualizar el breadcrumb cuando cambien los params de la ruta
watch(
    () => route.params,
    (newParams) => {
        // Actualizar el breadcrumb con el valor del parámetro dinámico
        console.log(newParams);
        const dynamicLabel = route.meta.breadcrumbTextKey || 'Default Label'; // Parámetro de la ruta o un valor por defecto
        breadcrumbItems.value = [{ label: dynamicLabel }];
    },
    { immediate: true }
);

// flags and language
const toggleLanguage = (event) => {
    menuLanguage.value.toggle(event);
};

const changeLanguage = (lang) => {
    currentLanguage.value = lang;
};

var currentLanguage = ref('es');
const currentLanguageFlag = computed(() => 'flag flag-' + currentLanguage.value);
const menuLanguage = ref();
// to-do: load from service
const items = ref([
    {
        label: 'Options',
        items: [
            {
                label: 'Spanish',
                icon: 'es'
            },
            {
                label: 'English',
                icon: 'gb'
            },
            {
                label: 'Portuguese',
                icon: 'pt'
            }
        ]
    }
]);

// USER menu
const menuUser = ref();
const toggleUser = (event) => {
    menuUser.value.toggle(event);
};

const projectTitle = ref(configurationStore.getCurrentAppTitle);
// TO-DO: composable userItems
const userItems = ref([
    {
        separator: true
    },
    {
        label: 'Documents',
        items: [
            {
                label: 'New',
                icon: 'pi pi-plus'
            },
            {
                label: 'Search',
                icon: 'pi pi-search'
            }
        ]
    },
    {
        label: 'Profile',
        items: [
            {
                label: 'Settings',
                icon: 'pi pi-cog'
            },
            {
                label: 'Notifications',
                icon: 'pi pi-inbox',
                badge: 2
            }
        ]
    },
    {
        separator: true
    }
]);

// ONLINE STATUS
const online = useOnline();

// USER STATUS
const { getUser, clearAuth } = useAuthStore();
const logOut = () => {
    clearAuth();
    if (import.meta.env.VITE_AUTH_TYPE === 'KEYCLOAK') {
        // KEYCLOAK
        console.log('KEYCLOAK LOGOUT...');
        KeyCloakService.logout();
    } else {
        // REALM
        console.log('REALM LOGOUT...');
        // TO-DO
    }
};
</script>

<template>
    <div class="layout-topbar">
        <!-- LOGO CONTAINER -->
        <div class="layout-topbar-logo-container">
            <router-link to="/" class="layout-topbar-logo">
                <svg id="OSPLogo" data-name="OSLogo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 36">
                    <title>{{ projectTitle }}</title>
                    <path id="Fill-1" d="M0,0V36l20-5.82V5.82ZM1.8,2.4L18.2,7.17V28.82L1.8,33.6V2.4Z" transform="translate(0 0)" class="cls-1" style="fill: var(--primary-color)"></path>
                </svg>
                <span>{{ projectTitle }}</span>
            </router-link>
            <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </button>
        </div>
        <!-- BREADCRUMB -->
        <div class="layout-topbar-breadcrumb">
            <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
        </div>
        <!-- TOPBAR ACTIONS MENUS-->
        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" @click="toggleFullScreen">
                        <i :class="['pi', { 'pi-window-minimize': isFullScreenActive, 'pi-window-maximize': !isFullScreenActive }]"></i>
                        <span>Fullscreen</span>
                    </button>
                    <!-- USER PROFILE AND MENU -->
                    <div class="relative">
                        <OverlayBadge :severity="online ? 'success' : 'danger'">
                            <button type="button" class="layout-topbar-action" @click="toggleUser">
                                <i class="pi pi-user"></i>
                                <span>Profile</span>
                            </button>
                        </OverlayBadge>
                        <Menu ref="menuUser" :model="userItems" class="w-full md:w-60" :popup="true">
                            <template #start>
                                <button v-ripple class="relative overflow-hidden w-full border-0 bg-transparent flex items-start p-2 pl-4 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-none cursor-pointer transition-colors duration-200">
                                    <Avatar v-if="getUser.image.length === 1" :label="getUser.image" class="mr-2" size="large" shape="circle" />
                                    <Avatar v-else image="getUser.image" class="mr-2" size="large" shape="circle" />
                                    <span class="inline-flex flex-col items-start">
                                        <span class="font-bold">{{ getUser?.userName ? getUser?.userName : 'Usuario desconectado' }}</span>
                                        <span class="text-sm">{{ getUser?.role || '' }}</span>
                                    </span>
                                </button>
                            </template>
                            <template #submenulabel="{ item }">
                                <span class="text-secondary font-bold">{{ item.label }}</span>
                            </template>
                            <template #item="{ item, props }">
                                <a v-ripple class="flex items-center" v-bind="props.action">
                                    <span :class="item.icon" />
                                    <span>{{ item.label }}</span>
                                    <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
                                    <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
                                </a>
                            </template>
                            <template #end>
                                <ul class="p-menu-list" role="menu">
                                    <li class="p-menu-item" @click="logOut">
                                        <div class="p-menu-item-content" data-pc-section="itemcontent">
                                            <a class="flex items-center p-menu-item-link"><span class="pi pi-sign-out"></span><span>LogOut</span></a>
                                        </div>
                                    </li>
                                </ul>
                            </template>
                        </Menu>
                    </div>
                    <!-- CONFIG. -->
                    <!-- <button type="button" class="layout-topbar-action">
                        <i class="pi pi-spin pi-cog"></i>
                        <span>Configuration</span>
                    </button> -->
                    <!-- LANGUAGE SELECTOR -->
                    <div class="relative flex items-center">
                        <button type="button" class="flex" @click="toggleLanguage" aria-haspopup="true" aria-controls="overlay_menu">
                            <span class="text-secondary">{{ currentLanguage.toUpperCase() }}</span>
                        </button>
                        <Menu ref="menuLanguage" id="overlay_menu" :model="items" :popup="true">
                            <template #submenulabel>
                                <span class="text-secondary font-bold"> Language</span>
                            </template>
                            <template #item="{ item }">
                                <a class="flex flex-center px-2 py-3" @click="changeLanguage(item.icon)">
                                    <img alt="flag" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`flag flag-${item.icon}`" />
                                    <span class="text-secondary ml-3">{{ item.label }}</span>
                                </a>
                            </template>
                        </Menu>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
