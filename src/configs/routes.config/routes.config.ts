import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes = [
    {
        key: 'dashboard',
        path: '/dashboard',
        component: lazy(() => import('@/views/Dashboard')),
        authority: [],
    },
    {
        key: 'underpriceProperty',
        path: '/underprice-property',
        component: lazy(() => import('@/views/UnderpriceProperty')),
        authority: [],
    },
    {
        key: 'underpriceProperty',
        path: '/underprice-property/manage',
        component: lazy(() => import('@/views/UnderpricePropertyManage')),
        authority: [],
    },
    {
        key: 'property',
        path: '/property',
        component: lazy(() => import('@/views/Property')),
        authority: [],
    },
    {
        key: 'userManagement',
        path: '/user-management',
        component: lazy(() => import('@/views/UserManagement')),
        authority: [],
    },
    {
        key: 'propertyTracking',
        path: '/property-tracking',
        component: lazy(() => import('@/views/PropertyTracking')),
        authority: [],
    },
    {
        key: 'subscription',
        path: '/subscription',
        component: lazy(() => import('@/views/Subscription')),
        authority: [],
    },
    {
        key: 'financialMetrics',
        path: '/financial-metrics',
        component: lazy(() => import('@/views/FinancialMetrics')),
        authority: [],
    },
    {
        key: 'engagementMetrics',
        path: '/engagement-metrics',
        component: lazy(() => import('@/views/EngagementMetrics')),
        authority: [],
    },
    {
        key: 'userProfile',
        path: '/user-profile',
        component: lazy(() => import('@/views/UserProfile')),
        authority: [],
    },
    {
        key: 'logout',
        path: '/logout',
        component: lazy(() => import('@/views/Logout')),
        authority: [],
    },
]