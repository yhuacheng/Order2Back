<template>
	<section>
		<div class="wel-box">
			<i class="icon el-icon-s-custom"></i>
			<div class="mt15 fz16">{{name}}</div>
			<div class="mt15 fz16">
				<span>角色：{{userData.RoleName}}</span>
				<span class="ml10" v-if="showCode">推荐码：{{userData.Code}}</span>
			</div>
			<div class="mt30">欢迎来到下单后台管理系统</div>
		</div>
	</section>
</template>

<script>
	import {
		userList
	} from '@/api/api'

	export default {
		name: 'welcome',
		data() {
			return {
				userData: {},
				name: sessionStorage.getItem('userName'),
				showCode: false
			}
		},
		created() {
			this.getUserData()
		},
		methods: {
			// 获取列表数据
			getUserData() {
				let _this = this
				_this.listLoading = true
				let params = {
					name: '',
					pageIndex: 1,
					pageSize: 100000000,
				}
				userList(params).then(res => {
					let data = res.Entity
					let userId = sessionStorage.getItem('userId')
					for (let x in data) {
						if (data[x].Id == userId) {
							_this.userData = data[x]
							let roleId = data[x].RoolId
							if (roleId.indexOf(5) < 0) {
								_this.showCode = true
							}
						}
					}
				}).catch((e) => {})
			}
		}
	}
</script>
