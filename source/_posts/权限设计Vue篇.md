---
title: 权限设计Vue篇
categories: Vue
date: 2021-10-09
headimg: https://images.unsplash.com/photo-1681819675574-7bbb27d81561?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2565&q=80
---

使用Vue开发后台管理系统，必然要设计到权限的问题。比如系统的某些页面或者资源（按钮，操作等），需要该用户有对应的权限才能可见、可用。一个完整系统的权限，应当包括这些

- 接口权限/请求权限
  越权请求要进行拦截
- 路由权限
  用户登录后只能看到自己权限内的菜单，且只能访问自己权限内的路由地址
- 视图权限
  包括页面权限，按钮级权限，用户只能看到自己权限的内容和按钮

本文就从以上三个方面回顾下平时我在项目中是如何处理的（尤其是关于路由权限，可以设计的较为复杂），并且将Vue2搭配VueRouter v3和Vue3搭配VueRouter V4的处理方案进行一个比较。

## 接口权限

用户登录成功后得到token，将token持久化到本地，并通过axios的请求拦截器将token携带在头部

```javascript
api.interceptors.request.use(config => {
  let token = localStorage.getItem('token')
  const ret = _.assign({}, config, {
    headers: _.assign({}, config.headers, {
      ...token
    }),
  })
  return ret
})
```

当请求响应返回相应的表示无权限的状态码，这时候重定向到登录页

```javascript
axios.interceptors.response.use(res => {}, response => {
  if(response.data.code === 6666) {
    router.push('/login')
  }
})
```

## *路由权限

这种方案有很多，此处提供大部分系统常用的几个方案的对比，总结优缺点

### 注册全部路由

这种比较简单一点，很多系统都是采用的这种方式。在路由初始化的时候挂载全部路由，在路由项上标记响应的权限信息，在全局路由守卫beforeEach中进行校验。总而言之，需要完成这三点

1. 在路由配置项中做标识，告知该路由的全部权限
2. 需要一个地方记录该用户所拥有的的全部权限数据，如Vuex + 本地持久化
3. 在router.beforeEach中结合1,2两点判断

#### 1）路由配置项中做标识

```javascript router.js
const routes = [
  {path: 'home', component: () => import ('xxx/home.vue'), meta: { roles: ['admin', 'purchase'， 'storehouse'] }}
]
```

#### 2）登录后存储用户权限数据

要保证刷新后用户的信息依然能获取到，会想到localStorage, sesstionStorage, cookie。但是，一般来说，我们不直接将重要的数据保存在这里，容易被人篡改。应该使用vuex存储数据，但是刷新之后会面临数据丢失的问题， 这时候还是需要借助本地持久化存储，不同的是， 我们不直接存储完整数据，而是存储用户id之类的，这样，在刷新导致vuex数据丢失的时候，就能发起请求重新再获取数据。

```javascript
//types.js

export const SET_RIGHTS = 'SET_RIGHTS'

// permission.js

import * as types from './types'

const state = {
  rights: null
}

const getters = {
  rights: state => state.rights
}

const mutations = {
  [types.SET_RIGHTS](state, value) {
    state.rights = value
  }
}

const actions = {
  setRights({ commit }, value) {
    commit(types.SET_RIGHTS, value)
  }
}

export default {
  state,
  getter,
  mutations,
  actions
}
```

这里rights默认值要给null而不是[],用来区分是初始化状态还是没有任何权限，在刷新场景下是有使用场景的，通过判断是否为空数组才能判断是刷新了页面

为null又有两种情况

- 新的tab页创建的页面，或者从别的网站进入
- 刷新页面

为了区分这两种行为，需要判断web storage里有没有存储用户的userId字段，如果有，代表已经登陆过了，就算没有权限也会是[]

#### 3）导航守卫中校验权限

```javascript
// router.js

import store from './store'
import getUserInfo from '...'

function hasPermission(roles, route) {
  if(route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.indexOf(role) >= 0)
  } else {
    return true
  }
}

/**
 * 检查进入的路由是否需要权限控制
 * @return {Boolean} 返回true代表没有这个权限，需要进行控制
 * @param {Object} to - 即将进入的路由对象
 * @param {Object} from - 来自的路由对象
 * @param {Function} next - 路由跳转的函数
*/

const verifyRouteAuthority = async (to, from, next) => {
  // 仅对有权限控制需求的页面进行控制，路由表里的meta.roles没有设置或设置为null代表无需控制，[]代表什么权限都没有
  const route = to.matched[to.matched.length - 1]
  const permissionState = store.state.permission  // permission是模块名
  const rights = permissionState.
  if(route.meta.roles != null) {
    // 为null的场景,从空tab进入或其他网站过来；刷新页面
    if(permissionState.rights === null) {
      const userId = sesstionStorage.getItem('userId')
      // 如果是刷新了导致权限配置丢失， 需要重新获取权限
      if(userId) {
        const roles = await getUserInfo().roles
        store.dispatch('setRights', roles)
      } else {
        next({ path: '/' })
        return true
      }
    }

    // 如果是需要进行权限控制的页面，判断是否有权限
    if(!hasPermission(route, permissionStater.rights)) {
      next({ path: '/' })
      return true
    }
  }
  return false
}

router.beforeEach((to, from, next) => {
  // 没有匹配的路由
  if(to.matched.length === 0) {
    next({
      path: '/',
      query: to.query
    })
    return
  }
  const res = await verifyRouteAuthority(to, from ,next)
  if(res) return
})

```

#### 注销清空权限

`store.dispatch('setRights', null)`

#### 优缺点

- 优点：不用动态去注册路由，处理逻辑主要在beforeEach中处理
- 缺点：注册了很多路由，还有菜单和路由也没有解耦，这个在后文会优化

### 动态注册路由

这里先着重介绍下vue-router v3版本下的动态路由。在v3版本中，仅提供了addRoutes一个api，这个在使用过程中会出现一些问题，没有办法删除，替换路由。当权限发生变更时，需要追加新路由，旧路由不会被删除；且也可能会发生重复追加同名路由的情况

因此使用`addRoutes`我们需要解决以下三个问题

- 切换用户或者身份时，权限发生变化，最理想的情况是删除已经注册的路由，追加新理由
- 刷新页面时，如果用户鉴权还是通过的，那么权限允许访问的页面依然能进行访问
- 退出系统，清除已经注册的路由

最暴力的办法就是切换用户或身份时，刷新一下页面，此时路由会重新初始化，事实上很多网站都是这么做的，如果登录系统和当前应用不是一个单页应用时，这种就更没问题，登录后本身就能重新初始化

如果你不是属于以上情况，并且不想刷新时，那么你可以

```javascript
// router.js

import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);

// 创建路由实例的函数
// 这里的staticRoutes表示你系统的静态路由
const createRouter = () => {
  return new Router({
    routes: staticRoutes
  });
};  

const router = createRouter();
/**
* 重置注册的路由导航map
* 主要是为了通过addRoutes方法动态注入新路由时，避免重复注册相同name路由
*/

const resetRouter = () => {
  const newRouter = createRouter();
  router && (router.matcher = newRouter.matcher);
};

export { resetRouter };
export default router;

```

```javascript
//store.js
import {
  asyncRouterMap
} from '@/router/index'
import {
  SET_ROUTERS
} from '**types'  // 伪代码

const permission = {
  namespaced: true,
  state: {
    addRoutes: [],
  },
  mutations: {
    [SET_ROUTERS]: (state, routes) => {
      state.addRoutes = routes
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {            
      return new Promise(resolve => {
        const { roles } = data
        let accessedRouters
        if (roles.indexOf('admin') >= 0) {
          console.log('admin>=0')
          accessedRouters = asyncRouterMap
        } else {
          console.log('admin<0')
          accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
          // accessedRouters = ''
          // accessedRouters = asyncRouterMap
        }
        console.log('accessedRouters', accessedRouters)
        commit('SET_ROUTES', accessedRouters)	
        resolve()
      })
    }
  }
}

function hasPermission(roles, route) {
  if(route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.indexOf(role) >= 0)
  } else {
    return true
  }
}

//根据角色、过滤出路由列表
export function filterAsyncRouter(asyncRouterMap, roles) {
  const accessedRoutes = asyncRouterMap.filter((route) => {
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles);
      }
      return true;
    }
    return false;
  });
  return accessedRoutes;
}

export default permission;


```

接下来需要在`router.beforeEach`中动态的去注册路由，为方便，新建permission.js注册逻辑，在入口文件引入即可

```javascript
// permission.js

import router from './router'
import store from './store'
import cookie from 'js-cookie'

// 不需要登录就可以访问的页面
const whiteList = ["/", "/404", "/401"];
router.beforeEach((to, from, next) => {
  const shiroCookie = cookie.get("userInfo");
  if (shiroCookie) {
    if (store.state.roles.length === 0) {
      // 登录操作后，以及当刷新页面是store中的数据恢复到初始值，需要重新设置
      const roles = [JSON.parse(cookie.get("userInfo")).position];
      store.commit("SET_ROLES", roles);
      store.dispatch("GenerateRoutes", { roles }).then(() => {
        // d根据roles权限生成可访问的路由表
        router.addRoutes(store.state.addRouters); // 动态添加可访问路由表
        next({ ...to, replace: true }); // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
      });
    } else {
      // 没有刷新页面对路由权限验证
      if (to.meta.roles && to.meta.roles.length) {
        // 当前路由有权限限制时，经过验证后，允许跳转
        if (hasPermission(store.state.roles, to.meta.roles)) {
          next();
        }
      } else {
        // 不存在权限限制时，则允许跳转
        next();
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      // 如果在白名单之列，则允许跳转
      next();
    } else {
      // 如果不在白名单之列，则返回登录页
      next("/");
    }
  }
});

```
登录时往cookie中存储userInfo;注销时，清空cookie的userInfo，并清空store中roles，以及resetRouter

在每次通过addRoutes追加路有前先resetRouter重置一下路由映射，再追加。但是其实addRoutes还存在一个问题，如果静态路由中有子路由，再追加该路由的子路由时，会重复添加，这个时候只能人为约定不能为静态路由追加子孙路由了