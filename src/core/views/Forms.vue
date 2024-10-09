<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ShowForm from '../components/form/ShowForm.vue';

const route = useRoute();

const formcode = ref(null);
const dataoid = ref(null);
const routername = ref(null);

watch(
    () => route.params,
    (params) => {
        if (!params.formcode) return;
        formcode.value = params.formcode;
        dataoid.value = params.dataoid;
        routername.value = params.routername;
    },
    { immediate: true }
);

onMounted(() => {
    const platformUrl = import.meta.env.VITE_PLATFORM;
    const styles = [
        { id: 'bootstrap-style', href: `${platformUrl}/controlpanel/static/formsio/boostrap.css` },
        { id: 'formio-full', href: `${platformUrl}/controlpanel/static/formsio/formiojs/dist/formio.full.css` },
        { id: 'styles-css', href: `${platformUrl}/controlpanel/static/formsio/assets/styles.css` },
        { id: 'boostrap-form', href: `${platformUrl}/controlpanel/static/formsio/assets/boostrap-form.css` },
        { id: 'form-editor', href: `${platformUrl}/controlpanel/static/formsio/assets/form-editor.css` },
        { id: 'flatpickr', href: `${platformUrl}/controlpanel/static/formsio/libs/flatpickr-formio/4.6.13-formio.1/flatpickr.min.css` }
    ];

    styles.forEach(({ id, href }) => {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.id = id;
        document.head.appendChild(link);
    });

    // Inicialización de variables para Formio, etc.
    window.useCache = false;
    window.redirectBy = 'events';
    window.urlLibraries = `${platformUrl}/controlpanel/static/formsio/libs`;
    // store authorization
    window.authorization = { token_type: 'bearer', access_token: sessionStorage.sessionToken };
    window.showformbase = `${platformUrl}/${import.meta.env.VITE_APPLICATION}/${formcode.value}`;
    // store host for platform base
    window.platformbase = platformUrl;
    window.appbase = platformUrl;
    // store current user and role
    window.formUser = sessionStorage.getItem('username');
    window.formUserRole = sessionStorage.getItem('role');

    window.formsBaseURLCreate = platformUrl + '/controlpanel/api/forms';
});

onBeforeUnmount(() => {
    const stylesIds = ['bootstrap-style', 'formio-full', 'styles-css', 'boostrap-form', 'form-editor', 'flatpickr'];
    stylesIds.forEach((id) => {
        const link = document.getElementById(id);
        if (link) {
            link.remove();
        }
    });
});
</script>

<template>
    <div>
        <ShowForm :formcode="formcode" :dataoid="dataoid" :routername="routername"></ShowForm>
    </div>
</template>

<style scoped lang="scss">
.containerD {
    &__layout {
        display: flex;
    }

    &__dashboard {
        width: 100%;
        overflow: hidden;
        margin: rem 8;
        position: relative;
        display: block;
    }
}
::v-deep .ods-accordion {
    padding: 0 16rem;
    &-item {
        &:first-child {
            border-top: 0;
        }
        &__wrap {
            padding: 0 rem 8;
        }
        &__header {
            padding: rem 20 rem 8;
        }
        &__content {
            .settings-form {
                .ods-form-item {
                    margin: rem 12 0;
                }
            }
        }
    }
}

.gridster-item--selected {
    border: 1px solid red;
}

.gridster-item--no-selected {
    border: none;
}
</style>
