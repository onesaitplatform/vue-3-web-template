<script setup>
import FloatingConfigurator from '@/core/components/FloatingConfigurator.vue';
const APP = import.meta.env.VITE_APPLICATION;
</script>

<template>
    <FloatingConfigurator />
    <div class="flex items-center justify-center min-h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div class="flex flex-row items-center justify-center w-full py-5">
                <svg id="OSPLogo" data-name="OSLogo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 36" width="100" height="80">
                    <title>ONESAIT PLATFORM LOGO</title>
                    <path id="Fill-1" d="M0,0V36l20-5.82V5.82ZM1.8,2.4L18.2,7.17V28.82L1.8,33.6V2.4Z" transform="translate(0 0)" class="cls-1" style="fill: var(--primary-color)"></path>
                </svg>
                <span class="font-bold text-3xl" style="">{{ APP || 'ONESAIT PLATFORM' }}</span>
            </div>
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color), transparent 60%) 10%, var(--surface-ground) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20 flex flex-col items-center" style="border-radius: 53px">
                    <span class="text-primary font-bold text-3xl">404</span>
                    <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2">Not Found</h1>
                    <div class="text-surface-600 dark:text-surface-200 mb-8">Requested resource is not available.</div>
                    <router-link to="/" class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b">
                        <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                            <i class="pi pi-fw pi-table !text-2xl"></i>
                        </span>
                        <span class="ml-6 flex flex-col">
                            <span class="text-surface-900 dark:text-surface-0 lg:text-lg font-medium mb-0 block">Frequently Asked Questions</span>
                            <span class="text-surface-600 dark:text-surface-200 lg:text-md">Ultricies mi quis hendrerit dolor.</span>
                        </span>
                    </router-link>
                    <router-link to="/" class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b">
                        <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                            <i class="pi pi-fw pi-question-circle !text-2xl"></i>
                        </span>
                        <span class="ml-6 flex flex-col">
                            <span class="text-surface-900 dark:text-surface-0 lg:text-lg font-medium mb-0">Solution Center</span>
                            <span class="text-surface-600 dark:text-surface-200 lg:text-md">Phasellus faucibus scelerisque eleifend.</span>
                        </span>
                    </router-link>
                    <router-link to="/" class="w-full flex items-center mb-8 py-8 border-surface-300 dark:border-surface-500 border-b">
                        <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                            <i class="pi pi-fw pi-unlock !text-2xl"></i>
                        </span>
                        <span class="ml-6 flex flex-col">
                            <span class="text-surface-900 dark:text-surface-0 lg:text-lg font-medium mb-0">Permission Manager</span>
                            <span class="text-surface-600 dark:text-surface-200 lg:text-md">Accumsan in nisl nisi scelerisque</span>
                        </span>
                    </router-link>
                    <Button as="router-link" label="Go to APP" to="/" />
                </div>
            </div>
        </div>
    </div>
</template>
