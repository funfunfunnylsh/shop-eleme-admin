import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('components/Login')
  },
  {
    path: '/home',
    component: () => import('components/Home'),
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: () => import('components/Welcome')
      },
      {
        path: '/users',
        component: () => import('components/user/User')
      },
      {
        path: '/rights',
        component: () => import('components/permission/Rights')
      },
      {
        path: '/roles',
        component: () => import('components/permission/Roles')
      },
      {
        path: '/categories',
        component: () => import('components/goods/Category')
      },
      {
        path: '/params',
        component: () => import('components/goods/Params')
      },
      {
        path: '/goods',
        component: () => import('components/goods/GoodsList')
      },
      {
        path: '/goods/add',
        component: () => import('components/goods/GoodsList')
      },
      {
        path: '/orders',
        component: () => import('components/permission/Roles')
      },
      {
        path: '/reports',
        component: () => import('components/permission/Roles')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 挂载路由导航守卫,to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作 next('/login')强制跳转login
router.beforeEach((to, from, next) => {
  // 访问登录页，放行
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token, 强制跳转到登录页
  if (!tokenStr) return next('/login')
  next()
})

export default router
