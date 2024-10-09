import { createRouter, createWebHistory } from 'vue-router';

const setBreadcrumbParams = (to) => {
    // eslint-disable-next-line no-unused-vars
    const breadcrumbParams = {
        dashboardId: 'dashboardId', // dinamically changed if a dashboard is routed
        componentId: 'componentId' // dinamically changed if a component is routed
    };
    // get messages from i18n to get breadcrums defined for each element in route
    // this elements can be: Dashboards or components or single pages.

    // apply breadcrums for each matched route
    to.matched.forEach((e) => {
        // detect element
        var type = to.params?.formcode ? 'form' : to.params?.dashboardId ? 'dashboard' : 'other';
        switch (type) {
            case 'form':
                to.meta.breadcrumbTextKey = to.params.formcode || e.meta.breadcrumbTextKey;
                break;
            case 'dashboard':
                console.log('DASHBOARD: ', to.params.dashboardId);
                to.meta.breadcrumbTextKey = to.params.dashboardId || 'default';
                break;
            case 'other':
                to.meta.breadcrumbTextKey = e.meta.breadcrumbTextKey;
                break;
        }
    });
};
let baseRoute = '';
const mode = import.meta.env.MODE;

if (mode === 'development') {
    baseRoute = '/'; // Para modo desarrollo
} else {
    baseRoute = '/web/' + import.meta.env.VITE_APPLICATION + '/';
}

const router = createRouter({
    history: createWebHistory(baseRoute),
    routes: [
        {
            path: '/home',
            redirect: { name: 'Home' },
            children: [
                {
                    path: '/',
                    name: 'Home',
                    component: () => import('@/core/App.vue')
                },
                {
                    path: '/login',
                    name: 'Login',
                    component: () => import('@/core/views/pages/auth/LoginForm.vue')
                },
                {
                    path: '/dashboard/:dashboardId',
                    name: 'Dashboard',
                    component: () => import('@/core/views/Dashboard.vue'),
                    props: (route) => ({
                        edit: route.params.edit || route.params.id === 'new'
                    }),
                    meta: {
                        private: true,
                        breadcrumbTextKey: 'dashboardId'
                    }
                },
                {
                    path: '/forms/:formcode/:dataoid?',
                    name: 'Forms',
                    component: () => import('@/core/views/Forms.vue'),
                    meta: {
                        private: true,
                        breadcrumbTextKey: 'formcode'
                    }
                },
                {
                    path: '/views/:iframeId',
                    name: 'Iframes',
                    component: () => import('@/core/views/Iframes.vue'),
                    meta: {
                        private: true,
                        breadcrumbTextKey: 'iframe'
                    }
                }
            ]
        },

        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/core/views/pages/Landing.vue'),
            meta: {
                private: false,
                breadcrumbTextKey: 'landing'
            }
        },
        {
            // will match everything
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('@/core/views/pages/NotFound.vue')
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/core/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/core/views/pages/auth/Access.vue'),
            meta: {
                private: true,
                breadcrumbTextKey: 'accessDenied'
            }
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/core/views/pages/auth/Error.vue'),
            meta: {
                private: true,
                breadcrumbTextKey: 'error'
            }
        }
    ],
    scrollBehavior(to) {
        if (to.hash) {
            return {
                selector: to.hash,
                behavior: 'smooth'
            };
        }
        return {
            x: 0,
            y: 0,
            behavior: 'smooth'
        };
    }
});

// GUARDS
router.beforeEach((to, from, next) => {
    const hashIndex = to.fullPath.indexOf('#');

    if (hashIndex !== -1) {
        const cleanPath = to.fullPath.substr(0, hashIndex);
        next(cleanPath);
    } else {
        next();
    }
    setBreadcrumbParams(to);
});

export default router;
