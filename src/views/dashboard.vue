<template>
	<section>
		<el-card class="mt10">
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
					columns: ['state', 'num'],
					rows: []
				},
				chartData2: {
					columns: ['state', 'num'],
					rows: []
				},
				chartData3: {
					columns: ['state', 'num'],
					rows: []
				},
				chartSettings4: {
					stack: {
						'xxx': ['heji', 'meiri', 'bili']
					},
					labelMap: {
						'heji': '已完成',
						'meiri': '进行中',
						'bili': '完成率'
					}
				},
				chartData4: {
					columns: ['userName', 'heji', 'meiri', 'bili'],
					rows: []
				}
			}
		},

		created() {
			this.customerCountShow()
			this.orderCountShow()
			this.taskCountShow()
			this.taskNoAllotShow()
			this.orderNumChart()
			this.taskNumChart()
			this.taskProgressChart()
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

			//订单数量统计图
			orderNumChart() {
				let _this = this
				let params = {
					keyWord: '',
					countryId: 0,
					type: 0,
					Diff: 0,
					startTime: '',
					endTime: '',
					ServerType: 0
				}
				orderStateNum(params).then(res => {
					let data = res
					let arry = []
					arry.push({
						'state': '待确认',
						'num': res.OrderStateInOne
					}, {
						'state': '待分配',
						'num': res.OrderStateInTwo
					}, {
						'state': '已分配',
						'num': res.OrderStateInThree
					}, {
						'state': '已完成',
						'num': res.OrderStateInFour
					}, {
						'state': '已取消',
						'num': res.OrderStateInFive
					})
					_this.chartData1.rows = arry
				}).catch((e) => {})
			},

			//任务数量统计图
			taskNumChart() {
				let _this = this
				let params = {
					Id: 1,
					Key: 'Michale_009',
					keyWord: '',
					RoolId: 1,
					countryId: 0,
					type: 0,
					Diff: 0,
					startTime: '',
					endTime: '',
					startEvaluateTime: '',
					endEvaluateTime: '',
					startDealTime: '',
					endDealTime: '',
					ServerType: 0,
					RepeatState: 0,
					PayState: 0
				}
				taskStateNum(params).then(res => {
					let data = res
					let arry = []
					arry.push({
						'state': '待分配',
						'num': res.OrderStateInOne
					}, {
						'state': '待购买',
						'num': res.OrderStateInTwo
					}, {
						'state': '待确认出单',
						'num': res.OrderStateInThree
					}, {
						'state': '待评价',
						'num': res.OrderStateInFour
					}, {
						'state': '待确认评价',
						'num': res.OrderStateInFive
					}, {
						'state': '已完成',
						'num': res.OrderStateInSix
					}, {
						'state': '已取消',
						'num': res.OrderStateInSeven
					}, {
						'state': '异常',
						'num': res.OrderStateInEight
					})
					_this.chartData2.rows = arry
				}).catch((e) => {})
			},

			//任务进度统计图
			taskProgressChart() {
				let _this = this
				let nameArry = []
				let okDataArry = []
				let noDataArry = []
				taskProgress().then(res => {
					let data = res
					data.forEach(item => {
						item.heji = item.heji ? item.heji : 0
						item.meiri = item.meiri ? item.meiri : 0
						item.bili = Number(item.heji / (Number(item.heji) + Number(item.meiri))).toFixed(2)
					})
					_this.chartData4.rows = data
				}).catch((e) => {})
			}

		}
	}
</script>
