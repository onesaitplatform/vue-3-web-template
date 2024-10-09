<script setup>
import { useLayout } from '@/core/layout/composables/layout';
import { nextTick, onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const tieredMenu = ref(null);
const showSubItems = (event) => {
    if (tieredMenu.value) {
        tieredMenu.value.toggle(event);
    }
};
const positionMenuRight = () => {
    nextTick(() => {
        const menuEl = tieredMenu.value.$el;
        const triggerEl = tieredMenu.value.$el.previousElementSibling;

        if (menuEl && triggerEl) {
            const triggerRect = triggerEl.getBoundingClientRect();
            menuEl.style.position = 'absolute';
            menuEl.style.top = `${triggerRect.top}px`;
            menuEl.style.left = `${triggerRect.right}px`;
        }
    });
};
const hideSubItems = () => {
    if (tieredMenu.value) {
        tieredMenu.value.hide();
    }
};
const route = useRoute();

const { layoutState, setActiveMenuItem, onMenuToggle } = useLayout();

const props = defineProps({
    isMenuOpen: Boolean,
    item: {
        type: Object,
        default: () => ({})
    },
    index: {
        type: Number,
        default: 0
    },
    root: {
        type: Boolean,
        default: true
    },
    parentItemKey: {
        type: String,
        default: null
    },
    justOneIcon: {
        type: Boolean,
        default: true
    }
});

const isActiveMenu = ref(false);
const itemKey = ref(null);

onBeforeMount(() => {
    itemKey.value = props.parentItemKey ? props.parentItemKey + '-' + props.index : String(props.index);

    const activeItem = layoutState.activeMenuItem;

    isActiveMenu.value = activeItem === itemKey.value || activeItem ? activeItem.startsWith(itemKey.value + '-') : false;
});

watch(
    () => props.justOneIcon,
    (newVal) => {
        if (newVal) {
            isActiveMenu.value = false;
        }
    }
);

watch(
    () => layoutState.activeMenuItem,
    (newVal) => {
        isActiveMenu.value = newVal === itemKey.value || newVal.startsWith(itemKey.value + '-');
    }
);

const itemClick = (event, item) => {
    if (item.disabled) {
        event.preventDefault();
        return;
    }

    if ((item.to || item.url) && (layoutState.staticMenuMobileActive || layoutState.overlayMenuActive)) {
        onMenuToggle();
    }

    if (item.command) {
        item.command({ originalEvent: event, item: item });
    }

    const foundItemKey = item.items ? (isActiveMenu.value ? props.parentItemKey : itemKey) : itemKey.value;

    setActiveMenuItem(foundItemKey);

    if (props.parentItemKey && props.parentItemKey !== '0') {
        setActiveMenuItem(props.parentItemKey);
    }
};

const checkActiveRoute = (item) => {
    return route.path === item.to;
};

const checkActiveItem = (item) => {
    if (route.path === item.to) {
        return true;
    }

    if (item.items && item.items.length > 0) {
        return item.items.some((subItem) => checkActiveItem(subItem));
    }

    return false;
};
</script>

<template>
    <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActiveMenu || checkActiveItem(item), 'is-icon': props.justOneIcon }">
        <div v-if="root && item.visible !== false && !props.justOneIcon" class="layout-menuitem-root-text">{{ item.label }}</div>

        <!-- Solo ícono, mostrar el TieredMenu en hover si tiene subitems -->
        <a v-if="(!item.to || item.items) && item.visible !== false && !props.justOneIcon" :href="item.url" @click="itemClick($event, item, index)" :class="[item.class, { 'active-route': checkActiveItem(item) }]" :target="item.target" tabindex="0">
            <i :class="[item.icon, { 'active-route': checkActiveRoute(item) }]" class="layout-menuitem-icon"></i>
            <span v-if="!props.justOneIcon" class="layout-menuitem-text">{{ item.label }}</span>
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items"></i>
        </a>

        <!-- Íconos solos -->
        <router-link
            v-tooltip="props.justOneIcon && item.label"
            v-if="item.to && !item.items && item.visible !== false"
            @click="itemClick($event, item, index)"
            :class="[item.class, { 'active-route': checkActiveRoute(item) }]"
            tabindex="0"
            :to="item.to"
        >
            <i :class="item.icon" :style="props.justOneIcon && 'font-size:1.5rem;margin:0;'" class="layout-menuitem-icon"></i>
            <span v-if="!props.justOneIcon" class="layout-menuitem-text">{{ item.label }}</span>
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items"></i>
        </router-link>

        <!-- TieredMenu para subitems cuando está en modo solo íconos -->
        <template v-if="props.justOneIcon && item.items">
            <a :class="[item.class, { 'active-route': checkActiveItem(item) }]" v-tooltip="item.label" class="is-icon" @click="showSubItems($event, item, index)">
                <i :class="[item.icon]" :style="props.justOneIcon && 'font-size:1.5rem;margin:0;'" class="layout-menuitem-icon"></i>
            </a>
            <TieredMenu @show="positionMenuRight" @mouseleave="hideSubItems" popup ref="tieredMenu" :model="item.items">
                <template #item="{ item, props, hasSubmenu }">
                    <router-link v-if="item.to" v-slot="{ href, navigate }" :to="item.to" custom>
                        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                            <span :class="item.icon" />
                            <span class="ml-2">{{ item.label }}</span>
                        </a>
                    </router-link>
                    <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                        <span :class="item.icon" />
                        <span class="ml-2">{{ item.label }}</span>
                        <span v-if="hasSubmenu" class="pi pi-angle-right ml-auto" />
                    </a>
                </template>
            </TieredMenu>
        </template>

        <!-- Submenu tradicional cuando no está en modo solo íconos -->
        <Transition v-if="item.items && item.visible !== false" name="layout-submenu">
            <ul v-show="root ? true : isActiveMenu" class="layout-submenu">
                <app-menu-item
                    :class="[item.class, { 'active-route': checkActiveItem(item) }]"
                    :justOneIcon="props.justOneIcon"
                    v-for="(child, i) in item.items"
                    :key="child"
                    :index="i"
                    :item="child"
                    :parentItemKey="itemKey"
                    :root="false"
                ></app-menu-item>
            </ul>
        </Transition>
    </li>
</template>

<style lang="scss" scoped>
.layout-menuitem-text {
    font-size: 13px;
}
.layout-menu ul .is-icon a {
    place-content: center;
}
.p-tieredmenu {
    position: absolute;
    top: 0;
    left: 100%;
    z-index: 1000;
}
</style>
