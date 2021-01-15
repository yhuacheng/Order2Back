import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
	return originalPush.call(this, location).catch(err => err)
}

export default new Router({
	// mode: 'history',
	routes: [{
			path: '/Login',
			component: () => import('./views/login.vue'),
			name: '',
			hidden: true
		},
		{
			path: '/404',
			component: () => import('./views/404.vue'),
			name: '',
			hidden: true
		},
		{
			path: '/',
			component: () => import('./views/home.vue'),
			name: '首页',
			hidden: true,
			children: [{
				path: '/Welcome',
				component: () => import('./views/welcome.vue'),
				name: '欢迎',
				hidden: true
			}]
		},
		{
			path: '/',
			component: () => import('./views/home.vue'),
			name: '系统首页',
			children: [{
				path: '/Dashboard',
				component: () => import('./views/dashboard.vue'),
				name: '控制面板',
			}]
		},
		{
			path: '/',
			component: () => import('./views/home.vue'),
			name: '订单管理',
			children: [{
				path: '/order',
				component: () => import('./views/orderManage/order.vue'),
				name: '订单列表'
			}]
		},
		{
			path: '/',
			component: () => import('./views/home.vue'),
			name: '任务管理',
			children: [{
				path: '/task',
				component: () => import('./views/taskManage/task.vue'),
				name: '任务列表'
			}]
		},
		{
			path: '/',
			component: () => import('./views/home.vue'),
			name: '客户管理',
			children: [{
					path: '/customer',
					component: () => import('./views/customerManage/customer.vue'),
					name: '客户列表'
				},
				{
					path: '/customerMoney',
					component: () => import('./views/customerManage/customerMoney.vue'),
					name: '客户交易记录'
				},
				{
					path: '/customerLog',
					component: () => import('./views/customerManage/customerLog.vue'),
					name: '充值扣款记录'
				}
			]
		},
		{
			path: '/',
			component: () => import('./views/home.vue'),
			name: '提现管理',
			children: [{
				path: '/takeMoney',
				component: () => import('./views/takeMoneyManage/takeMoney.vue'),
				name: '提现列表'
			}]
		},
		{
			path: '/',
			component: () => import('./views/home.vue'),
			name: '系统设置',
			children: [{
					path: '/user',
					component: () => import('./views/systemManage/user.vue'),
					name: '用户管理'
				},
				{
					path: '/role',
					component: () => import('./views/systemManage/role.vue'),
					name: '角色管理'
				},
				{
					path: '/country',
					component: () => import('./views/systemManage/country.vue'),
					name: '国家管理'
				},
				{
					path: '/rate',
					component: () => import('./views/systemManage/rate.vue'),
					name: '汇率管理'
				},
				{
					path: '/serviceFee',
					component: () => import('./views/systemManage/serviceFee.vue'),
					name: '服务费'
				},
				{
					path: '/addedFee',
					component: () => import('./views/systemManage/addedFee.vue'),
					name: '增值费'
				},
				{
					path: '/code',
					component: () => import('./views/systemManage/code.vue'),
					name: '推荐码'
				},
				{
					path: '/payType',
					component: () => import('./views/systemManage/payType.vue'),
					name: '支付方式'
				},
				{
					path: '/notice',
					component: () => import('./views/systemManage/notice.vue'),
					name: '网站公告'
				}
			]
		},
		{
			path: '*',
			hidden: true,
			redirect: {
				path: '/404'
			}
		}
	]
})
