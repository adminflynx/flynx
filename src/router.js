import { createRouter, createWebHashHistory } from "vue-router";
import IfcAR from './views/IfcAR.vue';
import IfcVR from './views/IfcVR.vue';
import IfcGame from './views/IfcGame.vue';

const routes = [
    {
        meta: { title: "FLynx" },
        path: "/",
        name: "FLynx",
        component: () => import('./views/Home.vue'),
    },
    {
        meta: { title: "Proyectos" },
        path: "/proyectos",
        name: "Proyectos",
        component: () => import('./views/Proyectos.vue'),
    },
    {
        meta: { title: "Industria y Comunidad" },
        path: "/industria-comunidad",
        name: "IndustriaComunidad",
        component: () => import('./views/IndustriaComunidad.vue'),
    },
    {
        meta: { title: "TerritorialTwin" },
        path: "/territorial-twin",
        name: "TerritorialTwin",
        component: () => import('./views/TerritorialTwin.vue'),
    },
    {
        meta: { title: "Digital Terrain" },
        path: "/digital-terrain",
        name: "DigitalTerrain",
        component: () => import('./views/DigitalTerrain.vue'),
    },
    {
        meta: { title: "Ifc AR" },
        path: "/ifcAR",
        name: "IfcAR",
        component: IfcAR,
    },
    {
        meta: { title: "ifc VR" },
        path: "/ifcVR",
        name: "VR",
        component: IfcVR,
    },
    {
        meta: { title: "ifc Game" },
        path: "/ifcGame",
        name: "Game",
        component: IfcGame,
    },
    // Admin routes
    {
        meta: { title: "Admin Login" },
        path: "/admin/login",
        name: "AdminLogin",
        component: () => import('./views/admin/AdminLogin.vue'),
    },
    {
        meta: { title: "Admin Dashboard", requiresAuth: true },
        path: "/admin",
        name: "AdminDashboard",
        component: () => import('./views/admin/AdminDashboard.vue'),
    },
    {
        meta: { title: "Products", requiresAuth: true },
        path: "/admin/products",
        name: "AdminProducts",
        component: () => import('./views/admin/AdminProducts.vue'),
    },
    {
        meta: { title: "Licenses", requiresAuth: true },
        path: "/admin/licenses",
        name: "AdminLicenses",
        component: () => import('./views/admin/AdminLicenses.vue'),
    },
    {
        meta: { title: "License Detail", requiresAuth: true },
        path: "/admin/licenses/:id",
        name: "AdminLicenseDetail",
        component: () => import('./views/admin/AdminLicenseDetail.vue'),
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return savedPosition || { top: 0 }
    }
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            next({ name: 'AdminLogin' });
            return;
        }
    }
    next();
});

export default router;
