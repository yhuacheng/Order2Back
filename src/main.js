import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/css/style.scss'
import '@/utils/dialog'
import router from './routes'

import plTable from 'pl-table'
import 'pl-table/themes/index.css'
import 'pl-table/themes/plTableStyle.css'
Vue.use(plTable)

Vue.use(ElementUI, {
	size: 'small'
})

//图表组件
import VePie from 'v-charts/lib/pie.common'
import VeRing from 'v-charts/lib/ring.common'
import VeBar from 'v-charts/lib/bar.common'
Vue.component(VePie.name, VePie)
Vue.component(VeRing.name, VeRing)
Vue.component(VeBar.name, VeBar)

Vue.prototype.$IMG_URL = 'http://203.195.212.239:90/' //统一设置页面上图片URL路径入口（前台图片）

Vue.prototype.$IMG_URL_BACK = 'http://203.195.212.239:9090/' //统一设置页面上图片URL路径入口（后台图片，列表导出图片需要用到完整路径）

router.beforeEach((to, from, next) => {
	let userId = sessionStorage.getItem('userId')
	if (!userId && to.path !== '/login') {
		next({
			path: '/login'
		})
	} else {
		//从session获取用户可以跳转的path进行权限限制（数组存入session的时候会变为字符串，在此先将字符串转为数组，最后加入公共页path）
		let pathArr = sessionStorage.getItem('pathArr')
		let pathArray = []
		if (pathArr) {
			pathArray = pathArr.split(',')
		}
		pathArray.push('/login')
		pathArray.push('/welcome')

		let index = pathArray.indexOf(to.path)
		//如果数组中不包含将要跳转的path，如果不包含则跳转至404，如果包含则正常跳转
		if (index < 0) {
			if (to.path == '/404') {
				next()
			} else {
				next({
					path: '/404'
				})
			}
		} else {
			next()
		}
	}
})

new Vue({
	el: '#app',
	router,
	render: h => h(App)
}).$mount('#app')
