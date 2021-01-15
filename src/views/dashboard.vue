<template>
	<section>
		<el-card class="mt10">
			<div slot="header" class="clearfix">
				<span>数据统计</span>
			</div>
			<el-row :gutter="30" class="mt10 mb15">
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<div>总客户</div>
						<div class="num success">{{allCustomer}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<div>今日客户</div>
						<div class="num warning">{{todayCustomer}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<div>总订单</div>
						<div class="num success">{{allOrder}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<div>今日订单</div>
						<div class="num warning">{{todayOrder}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<div>总任务</div>
						<div class="num success">{{allTask}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<div>进行中的任务</div>
						<div class="num primary">{{doingTask}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<div>7天未分配订单</div>
						<div class="num danger">{{taskNoAllot}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<div>预留位置</div>
						<div class="num info">***</div>
					</el-card>
				</el-col>
			</el-row>
		</el-card>

		<el-row :gutter="30" class="mt40">
			<el-col :span="6">
				<el-card>
					<div slot="header" class="clearfix">
						<span>订单统计</span>
					</div>
					<ve-pie :data="chartData1"></ve-pie>
				</el-card>
			</el-col>

			<el-col :span="6">
				<el-card>
					<div slot="header" class="clearfix">
						<span>任务统计</span>
					</div>
					<ve-pie :data="chartData2" :settings="{roseType: 'radius'}"></ve-pie>
				</el-card>
			</el-col>

			<el-col :span="6">
				<el-card>
					<div slot="header" class="clearfix">
						<span>留评统计</span>
					</div>
					<ve-ring :data="chartData3" :settings="{radius: [60, 100]}"></ve-ring>
				</el-card>
			</el-col>

			<el-col :span="6">
				<el-card>
					<div slot="header" class="clearfix">
						<span>任务进度统计</span>
					</div>
					<ve-bar :data="chartData4" :settings="chartSettings4"></ve-bar>
				</el-card>
			</el-col>

		</el-row>

	</section>
</template>

<script>
	import {
		customerCount,
		orderCount,
		taskCount,
		taskProgress,
		taskNoAllot,
		orderStateNum,
		taskStateNum
	} from '@/api/api';
	export default {
		name: 'dashboard',
		data() {
			return {
				allCustomer: 0,
				todayCustomer: 0,
				allOrder: 0,
				todayOrder: 0,
				allTask: 0,
				doingTask: 0,
				taskNoAllot: 0,
				chartData1: {
					columns: ['状态', '数量'],
					rows: []
				},
				chartData2: {
					columns: ['状态', '数量'],
					rows: []
				},
				chartData3: {
					columns: ['状态', '数量'],
					rows: []
				},
				chartSettings4: {
					stack: {
						'xxx': ['heji', 'meiri', 'tj']
					},
					labelMap: {
						'heji': '已完成',
						'meiri': '进行中',
						'tj': '完成率'
					}
				},
				chartData4: {
					columns: ['userName', 'heji', 'meiri', 'tj'],
					rows: []
				}
			}
		},

		created() {
			this.customerCountShow()
			this.orderCountShow()
			this.taskCountShow()
			this.taskNoAllotShow()
			// this.orderDataShow()
			// this.taskDataShow()
			this.taskProgressShow()
		},

		methods: {
			//客户统计数据
			customerCountShow() {
				let _this = this
				customerCount().then(res => {
					_this.allCustomer = Number(res.list[0].heji)
					_this.todayCustomer = Number(res.list[0].meiri)
				}).catch((e) => {})
			},

			//订单统计数据
			orderCountShow() {
				let _this = this
				orderCount().then(res => {
					_this.allOrder = Number(res.list[0].heji)
					_this.todayOrder = Number(res.list[0].meiri)
				}).catch((e) => {})
			},

			//任务统计数据
			taskCountShow() {
				let _this = this
				taskCount().then(res => {
					_this.allTask = Number(res.list[0].heji)
					_this.doingTask = Number(res.list[0].meiri)
				}).catch((e) => {})
			},

			//7天未分配任务数据
			taskNoAllotShow() {
				let _this = this
				taskNoAllot().then(res => {
					_this.taskNoAllot = Number(res.list[0].heji)
				}).catch((e) => {})
			},

			//任务进度数据
			taskProgressShow() {
				let _this = this
				let nameArry = []
				let okDataArry = []
				let noDataArry = []
				taskProgress().then(res => {
					let data = res
					data.forEach(item => {
						item.heji = item.heji ? item.heji : 0
						item.meiri = item.meiri ? item.meiri : 0
						item.tj = Number(item.heji / (Number(item.heji) + Number(item.meiri))).toFixed(2)
					})
					_this.chartData4.rows = data
				}).catch((e) => {})
			}

		}
	}
</script>
