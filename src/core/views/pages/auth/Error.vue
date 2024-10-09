<script setup>
import FloatingConfigurator from '@/core/components/FloatingConfigurator.vue';
import { useRoute } from 'vue-router';

const APP = import.meta.env.VITE_APPLICATION;
const route = useRoute();
const errorMessage = route.query.message || 'An unknown error occurred'; // Mensaje por defecto si no hay query
</script>

<template>
    <main>
        <FloatingConfigurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div class="flex flex-row items-center justify-center w-full py-7">
                    <svg id="OSPLogo" data-name="OSLogo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 36" width="100" height="80">
                        <title>ONESAIT PLATFORM LOGO</title>
                        <path id="Fill-1" d="M0,0V36l20-5.82V5.82ZM1.8,2.4L18.2,7.17V28.82L1.8,33.6V2.4Z" transform="translate(0 0)" class="cls-1" style="fill: var(--primary-color)"></path>
                    </svg>
                    <span class="font-bold text-3xl" style="">{{ APP || 'ONESAIT PLATFORM' }}</span>
                </div>
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(233, 30, 99, 0.4) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20 flex flex-col items-center" style="border-radius: 53px">
                        <div class="gap-4 flex flex-col items-center">
                            <div class="flex justify-center items-center border-2 border-pink-500 rounded-full" style="height: 3.2rem; width: 3.2rem">
                                <i class="pi pi-fw pi-exclamation-circle !text-2xl text-pink-500"></i>
                            </div>
                            <h1 class="text-surface-900 dark:text-surface-0 font-bold text-5xl mb-2">Error Occured</h1>
                            <span class="text-muted-color mb-8">{{ errorMessage }}</span>
                            <img src="/demo/images/error/asset-error.svg" alt="Error" class="mb-8" width="80%" />
                            <div class="col-span-12 mt-8 text-center">
                                <Button as="router-link" label="Go to App" to="/" severity="danger" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>
