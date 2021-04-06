<template>
	<el-row class="home-container">

		<el-col :span="24" class="header">
			<el-col :span="4" class="logo" :class="collapsed?'logo-collapse-width':'logo-width'">
				<span @click="$router.push('welcome')" style="cursor: pointer;">
					<i class="el-icon-price-tag"></i>
					<span>{{collapsed?'':sysName}}</span>
				</span>
			</el-col>
			<el-col :span="4">
				<span class="tools" @click.prevent="collapse">
					<i :class="collapsed?'el-icon-notebook-2':'el-icon-tickets'"></i>
				</span>
				<span class="ml10">F11 可全屏</span>
			</el-col>
			<el-col :span="16" class="userinfo">
				<span style="margin-right: 30px;">
					<span class="ml10">{{nowDate}}</span>
					<span class="ml10">{{nowTime}}</span>
					<span class="ml10">{{nowWeek}}</span>
				</span>
				<el-dropdown trigger="hover">
					<span class="el-dropdown-link userinfo-inner">
						<el-avatar class="icon" icon="el-icon-user-solid" :size="23"></el-avatar>
						<span class="username">{{sysUserName}}</span>
					</span>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-col>
		</el-col>

		<el-col :span="24" class="main">

			<aside :class="collapsed?'menu-collapsed':'menu-expanded'">
				<!--导航菜单-未折叠状态-->
				<el-menu :default-active="$route.path" unique-opened router v-show="!collapsed">
					<template v-for="(item,index) in routes">
						<!-- 非单节点菜单 -->
						<el-submenu :index="index+''" :key="item.NavigationName" v-if="!item.leaf">
							<template slot="title"><i :class="item.Icon"></i>{{item.NavigationName}}</template>
							<el-menu-item v-for="child in routeChildren(item)" :index="child.Path" :key="child.Path">
								{{child.NavigationName}}
							</el-menu-item>
						</el-submenu>
						<!-- 单节点菜单 -->
						<el-menu-item v-if="item.leaf&&item.childs.length>0" :index="item.childs[0].Path"
							:key="item.NavigationName">
							<i :class="item.Icon"></i>{{item.childs[0].NavigationName}}
						</el-menu-item>
					</template>
				</el-menu>
				<!-- 导航菜单-折叠状态 -->
				<ul class="el-menu collapsed" v-show="collapsed" ref="menuCollapsed">
					<li v-for="(item,index) in routes" :key="item.NavigationName" class="el-submenu item">
						<div class="el-submenu__title" style="padding-left: 18px;" @mouseover="showMenu(index,true)"
							@mouseout="showMenu(index,false)"><i :class="item.Icon"></i></div>
						<ul class="el-menu submenu" :class="'submenu-hook-'+index" @mouseover="showMenu(index,true)"
							@mouseout="showMenu(index,false)">
							<li v-for="child in item.childs" :key="child.Path" class="el-menu-item"
								:class="$route.path===child.Path?'is-active':''" @click="$router.push(child.Path)">
								{{child.NavigationName}}
							</li>
						</ul>
					</li>
				</ul>
			</aside>

			<section class="content-container">
				<!-- 顶部tabs -->
				<div class="top-tabs">
					<el-tabs type="card" v-model="activeTab" @tab-remove="removeTab" @tab-click="tabClick">
						<el-tab-pane v-for="item in tabsItem" :key="item.name" :label="item.title" :name="item.name"
							:closable="item.closable" :ref="item.ref">
						</el-tab-pane>
					</el-tabs>
				</div>

				<!-- 主体内容 -->
				<div class="main-container">
					<!-- 面包屑导航条 -->
					<!-- <el-col :span="24" class="breadcrumb-container">
						<strong class="title">{{$route.name}}</strong>
						<el-breadcrumb separator="/" class="breadcrumb-inner">
							<el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
								{{ item.name }}
							</el-breadcrumb-item>
						</el-breadcrumb>
					</el-col> -->
					<el-col :span="24" class="content-wrapper">
						<transition name="fade" mode="out-in">
							<keep-alive>
								<router-view></router-view>
							</keep-alive>
						</transition>
					</el-col>
				</div>
			</section>

		</el-col>

	</el-row>
</template>

<script>
	import {
		menuOfUser,
		userCheckedRole
	} from '@/api/api'
	export default {
		name: 'home',
		data() {
			return {
				sysName: '下单后台管理',
				collapsed: true,
				sysUserName: sessionStorage.getItem('userName'),
				routes: [],
				nowDate: '',
				nowTime: '',
				nowWeek: '',
				// 顶部tabs相关参数
				activePath: '',
				activeTab: '1', //默认显示的tab
				tabIndex: 1, //tab目前显示数
				tabsItem: [{
					title: '欢迎',
					name: '1',
					closable: false,
					ref: 'tabs',
					content: '/welcome'
				}],
				tabsPath: [{
					name: "1",
					path: '/welcome'
				}]

			}
		},

		mounted() {
			/*
			 * 监听页面刷新事件
			 * 页面刷新前 需要保存当前打开的tabs的位置，刷新后按刷新前的顺序展示
			 * 使用js的sessionStorage保存刷新页面前的数据
			 * */
			window.addEventListener('beforeunload', e => {
				sessionStorage.setItem("tabsItem", JSON.stringify({
					currTabsItem: this.tabsItem.filter(item => item.name !== "1"),
					currTabsPath: this.tabsPath.filter(item => item.name !== "1"),
					currActiveTabs: this.activeTab,
					currIndex: this.tabIndex
				}))
			})
		},

		created() {
			this.getTreeData()
			this.getRole()
			this.nowTimes()
			this.getSessionTabs()
		},

		computed: {
			// 利用闭包实现计算属性传参。
			routeChildren: function(route) {
				return function(route) {
					return route.childs
				}
			}
		},

		methods: {
			// 根据登录人获取菜单目录树数据及权限path
			getTreeData() {
				let _this = this
				let userId = sessionStorage.getItem('userId')
				let params = {
					Id: userId
				}
				menuOfUser(params).then(res => {
					let data = res.topModels
					_this.routes = data

					//获取权限path存入session
					let pathArr = []
					for (const x in data) {
						let child = data[x].childs
						if (child.length > 0) {
							for (const y in child) {
								let path = child[y].Path
								if (path.length > 0) {
									pathArr.push(path)
								}
							}
						}
					}
					sessionStorage.setItem('pathArr', pathArr)

				}).catch((e) => {})
			},

			//根据用户Id获取用户角色存入session
			getRole() {
				let userId = sessionStorage.getItem('userId')
				let params = {
					Id: userId
				}
				userCheckedRole(params).then(res => {
					sessionStorage.setItem('roleId', res.list)
				}).catch((e) => {})
			},

			// 退出登录
			logout: function() {
				var _this = this
				this.$confirm('确定退出系统吗?', '信息提示', {
					type: 'warning'
				}).then(() => {
					sessionStorage.clear()
					_this.$router.push('/Login')
				}).catch(() => {})
			},

			// 折叠导航栏
			collapse: function() {
				this.collapsed = !this.collapsed
			},
			showMenu(i, status) {
				this.$refs.menuCollapsed.getElementsByClassName('submenu-hook-' + i)[0].style.display = status ? 'block' :
					'none'
			},


			//获取年月日时分秒星期
			timeFormate(timeStamp) {
				let year = new Date(timeStamp).getFullYear()
				let month = new Date(timeStamp).getMonth() + 1 < 10 ? "0" + (new Date(timeStamp).getMonth() + 1) :
					new Date(timeStamp).getMonth() + 1
				let date = new Date(timeStamp).getDate() < 10 ? "0" + new Date(timeStamp).getDate() : new Date(timeStamp)
					.getDate()
				let hh = new Date(timeStamp).getHours() < 10 ? "0" + new Date(timeStamp).getHours() : new Date(timeStamp)
					.getHours()
				let mm = new Date(timeStamp).getMinutes() < 10 ? "0" + new Date(timeStamp).getMinutes() : new Date(
					timeStamp).getMinutes()
				let ss = new Date(timeStamp).getSeconds() < 10 ? "0" + new Date(timeStamp).getSeconds() : new Date(
					timeStamp).getSeconds()
				let week = new Date(timeStamp).getDay()
				let weeks = ["日", "一", "二", "三", "四", "五", "六"]
				this.nowDate = year + "年" + month + "月" + date + "日"
				this.nowTime = hh + ":" + mm + ':' + ss
				this.nowWeek = "星期" + weeks[week]
			},
			nowTimes() {
				this.timeFormate(new Date())
				setInterval(this.nowTimes, 1000)
				this.clear()
			},
			clear() {
				clearInterval(this.nowTimes)
				this.nowTimes = null
			},


			// 顶部tabs操作的相关方法
			removeTab(targetName) { //删除Tab
				let tabs = this.tabsItem //当前显示的tab数组
				let activeName = this.activeTab //点前活跃的tab
				//如果当前tab正活跃 被删除时执行
				if (activeName === targetName) {
					tabs.forEach((tab, index) => {
						if (tab.name === targetName) {
							let nextTab = tabs[index + 1] || tabs[index - 1];
							if (nextTab) {
								activeName = nextTab.name;
								this.tabClick(nextTab)
							}
						}
					})
				}
				this.activeTab = activeName;
				this.tabsItem = tabs.filter(tab => tab.name !== targetName);
				//在tabsPath中删除当前被删除tab的path
				this.tabsPath = this.tabsPath.filter(item => item.name !== targetName)
			},
			tabClick(thisTab) {
				//thisTab:当前选中的tabs的实例,通过当前选中tabs的实例获得当前实例的path 重新定位路由
				let val = this.tabsPath.filter(item => thisTab.name == item.name)
				this.$router.push({
					path: val[0].path
				})
			},

			//获取sessionStorage读取刷新前的数据，并按刷新前的tabs顺序重新生成tabs
			getSessionTabs() {
				const sessionTabs = JSON.parse(sessionStorage.getItem("tabsItem"))
				if (sessionTabs) {
					if (sessionTabs.currTabsItem.length != 0 && sessionTabs.currTabsPath.length != 0) {
						for (let i = 0; i < sessionTabs.currTabsItem.length; i++) {
							this.tabsItem.push({
								title: sessionTabs.currTabsItem[i].title,
								name: sessionTabs.currTabsItem[i].name,
								closable: true,
								ref: sessionTabs.currTabsItem[i].ref,
								content: sessionTabs.currTabsItem[i].content
							})
						}
						for (let j = 0; j < sessionTabs.currTabsPath.length; j++) {
							this.tabsPath.push({
								name: sessionTabs.currTabsPath[j].name,
								path: sessionTabs.currTabsPath[j].path
							})
						}
						this.activeTab = sessionTabs.currActiveTabs
						this.tabIndex = sessionTabs.currIndex
						//避免强制修改url 出现浏览器的url输入框的路径和当前tabs选中的路由路径不匹配
						const activePath = this.tabsPath.filter(item => item.name == this.activeTab)
						this.$router.push({
							path: activePath[0].path
						})
					}
				}
			}
		},

		watch: {
			'$route': function(to) { //监听路由的变化，动态生成tabs
				let flag = true //判断是否需要新增页面
				if (to.name) {
					for (let i = 0; i < this.$refs.tabs.length; i++) {
						// 如果页面已存在，则直接定位当页面，否则新增tab页面
						if (this.$refs.tabs[i].label == to.name) {
							this.activeTab = this.$refs.tabs[i].name //定位到已打开页面
							flag = false
							break
						}
					}
					//新增页面
					if (flag) {
						//获得路由元数据的name和组件名
						const thisName = to.name
						const thisComp = to.path
						//对tabs的当前激活下标和tabs数量进行自加
						let newActiveIndex = ++this.tabIndex + ''
						//动态双向追加tabs
						this.tabsItem.push({
							title: thisName,
							name: String(newActiveIndex),
							closable: true,
							ref: 'tabs',
							content: thisComp
						})
						this.activeTab = newActiveIndex
						/*
						 * 当添加tabs的时候，把当前tabs的name作为key，path作为value存入tabsPath数组中
						 * key:tabs的name
						 * value:tabs的path
						 * {key: name,value: path}
						 * 后面需要得到当前tabs的时候可以通过当前tabs的name获得path
						 */
						if (this.tabsPath.indexOf(to.path) == -1) {
							this.tabsPath.push({
								name: newActiveIndex,
								path: to.path
							})
						}
					}
				}
			}
		}

	}
</script>
