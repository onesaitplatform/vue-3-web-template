<script setup>
import { onMounted, ref } from 'vue';

import { useLayout } from '@/core/layout/composables/layout';
import { useConfigurationStore } from '@/core/stores/configuration';
import AppMenuItem from './AppMenuItem.vue';

//custom
//import { commonItems } from '@/modules/modules-common-files/navbar';

const { onMenuToggle, layoutState } = useLayout();
const navigationStore = useConfigurationStore().getCurrentNavigation;
const menuItems = ref([]);
const isMenuOpen = ref(true);

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'UI Components',
        items: [{ label: 'Form Layout', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' }]
    },
    {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            {
                label: 'Landing',
                icon: 'pi pi-fw pi-globe',
                to: '/landing'
            },
            {
                label: 'Auth',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Error',
                        icon: 'pi pi-fw pi-times-circle',
                        to: '/auth/error'
                    },
                    {
                        label: 'Access Denied',
                        icon: 'pi pi-fw pi-lock',
                        to: '/auth/access'
                    }
                ]
            },
            {
                label: 'Not Found',
                icon: 'pi pi-fw pi-exclamation-circle',
                to: '/pages/notfound'
            },
            {
                label: 'Empty',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/empty'
            }
        ]
    },
    {
        label: 'Hierarchy',
        items: [
            {
                label: 'Submenu 1',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                    {
                        label: 'Submenu 1.1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                        ]
                    },
                    {
                        label: 'Submenu 1.2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                    }
                ]
            },
            {
                label: 'Submenu 2',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                    {
                        label: 'Submenu 2.1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                        ]
                    },
                    {
                        label: 'Submenu 2.2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
                    }
                ]
            }
        ]
    },
    {
        label: 'Get Started',
        items: [
            {
                label: 'Documentation',
                icon: 'pi pi-fw pi-book',
                to: '/documentation'
            }
        ]
    }
]);

const mapNavigationToMenuItems = (navigationHelper, type) => {
    const menu = [];

    const navigation = navigationHelper;

    Object.keys(navigation).forEach((key) => {
        const item = navigation[key];

        const menuItem = {
            label: key.charAt(0).toUpperCase() + key.slice(1),
            icon: 'pi pi-fw ' + item.icon,
            to: item.to || null,
            items: item.children ? mapNavigationToMenuItems(item.children, 'submenu') : null
        };

        menu.push(menuItem);
    });
    if (type === 'submenu') return menu;

    return [{ label: '', items: menu }];
};

onMounted(async () => {
    menuItems.value = await mapNavigationToMenuItems(navigationStore[0]);

    model.value = menuItems.value;
});
const changeNavbar = () => {
    onMenuToggle();
    isMenuOpen.value = false;
    window.DSApi.inst1.api.forceRender();
    setTimeout(() => {
        resize();
    }, 500);
};

const resize = () => {
    window.dispatchEvent(new Event('resize'));
    window.DSApi.inst1.api.forceRender();
};
</script>

<template>
    <div :class="{ 'just-icon-visible': layoutState.staticMenuDesktopInactive }" class="layout-sidebar" :style="{ width: layoutState.staticMenuDesktopInactive ? '70px' : '300px' }">
        <ul class="layout-menu">
            <template v-for="(item, i) in model" :key="i">
                <app-menu-item @toggle="layoutState.staticMenuDesktopInactive" :isMenuOpen="layoutState.staticMenuDesktopInactive" :justOneIcon="layoutState.staticMenuDesktopInactive" v-if="!item.separator" :item="item" :index="i"></app-menu-item>
                <li v-if="item.separator" class="menu-separator"></li>
            </template>
        </ul>
        <div :class="[layoutState.staticMenuDesktopInactive ? 'place-content-center' : ' justify-end']" class="flex">
            <Button text rounded @click="changeNavbar">
                <i style="font-size: 2rem; color: black" :class="layoutState.staticMenuDesktopInactive ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'"></i>
            </Button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.layout-menu {
    margin-top: 0.5rem;
}

.just-icon-visible {
    padding: 0;
    transition: width 0.5s;
}
.layout-menu {
    height: 95%;
}
.layout-sidebar {
    transition: width 0.5s;
}
</style>
