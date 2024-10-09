<script setup>
import { useLayout } from '@/core/layout/composables/layout';
import { computed } from 'vue';

const { layoutConfig } = useLayout();

const logoUrl = computed(() => {
    return `/provisioner-ui/layout/images/${layoutConfig.darkTheme.value ? 'Onesait_territories_negative_full' : 'Onesait_territories_full'}.svg`;
});
</script>

<template>
    <div class="layout-footer">
        <div class="justify-center mr-2">
            <router-link to="/" class="flex justify-center gap-2 items-center">
                <span class="font-medium mr-2">Powered by </span>
                <svg style="width: 1.5rem" id="OSPLogo" data-name="OSLogo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 36">
                    <title>ONESAIT PLATFORM LOGO</title>
                    <path id="Fill-1" d="M0,0V36l20-5.82V5.82ZM1.8,2.4L18.2,7.17V28.82L1.8,33.6V2.4Z" transform="translate(0 0)" class="cls-1" style="fill: var(--primary-color)"></path>
                </svg>
                <span>ONESAIT PLATFORM</span>
            </router-link>
        </div>
    </div>
</template>
<style lang="scss" scoped></style>
