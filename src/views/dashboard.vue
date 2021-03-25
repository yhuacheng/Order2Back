<template>
	<section>
		<el-card class="mt10">
			<el-row :gutter="30" class="mt10 mb15">
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<i class="el-icon-news tj-icon"></i>
						<p>总客户</p>
						<div class="num success">{{allCustomer}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<i class="el-icon-user tj-icon"></i>
						<p>今日客户</p>
						<div class="num warning">{{todayCustomer}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<i class="el-icon-document-copy tj-icon"></i>
						<p>总订单</p>
						<div class="num success">{{allOrder}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<i class="el-icon-tickets tj-icon"></i>
						<p>今日订单</p>
						<div class="num warning">{{todayOrder}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<i class="el-icon-date tj-icon"></i>
						<p>总任务</p>
						<div class="num success">{{allTask}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<i class="el-icon-edit-outline tj-icon"></i>
						<p>进行中的任务</p>
						<div class="num primary">{{doingTask}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<i class="el-icon-folder-delete tj-icon"></i>
						<p>7天未分配订单</p>
						<div class="num danger">{{taskNoAllot}}</div>
					</el-card>
				</el-col>
				<el-col :span="3" :xs="12">
					<el-card shadow="hover" class="box-card">
						<i class="el-icon-warning-outline tj-icon"></i>
						<p>预留位置</p>
						<div class="num info">***</div>
					</el-card>
				</el-col>
			</el-row>
		</el-card>

		<el-row :gutter="30" class="mt30">
			<el-col :span="6">
				<el-card>
					<div slot="header" class="clearfix">
						<span>总订单统计</span>
					</div>
					<ve-pie :data="chartData1" height="360px"></ve-pie>
				</el-card>
			</el-col>
			<el-col :span="12">
				<el-card>
					<div slot="header" class="clearfix">
						<span>
							<el-button class="pd0" type="text" @click="changeOrderYear(-1)">
								<i class="el-icon-arrow-left"></i> 前一年
							</el-button>
							<span> （{{year1}}） </span>
							<el-button class="pd0" type="text" @click="changeOrderYear(1)">
								后一年 <i class="el-icon-arrow-right"></i>
							</el-button>
							<span>年度月订单统计</span>
						</span>
					</div>
					<ve-line :data="chartData5" :settings="chartSettings5" height="360px"></ve-line>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card>
					<div slot="header" class="clearfix">
						<span>留评统计</span>
					</div>
					<ve-ring :data="chartData3" :settings="{radius: [60, 100]}" height="360px"></ve-ring>
				</el-card>
			</el-col>
		</el-row>

		<el-row :gutter="30" class="mt30 mb30">
			<el-col :span="6">
				<el-card>
					<div slot="header" class="clearfix">
						<span>总任务统计</span>
					</div>
					<ve-pie :data="chartData2" height="360px"></ve-pie>
				</el-card>
			</el-col>
			<el-col :span="12">
				<el-card>
					<div slot="header" class="clearfix">
						<span>
							<el-button class="pd0" type="text" @click="changeTaskYear(-1)">
								<i class="el-icon-arrow-left"></i> 前一年
							</el-button>
							<span> （{{year2}}） </span>
							<el-button class="pd0" type="text" @click="changeTaskYear(1)">
								后一年 <i class="el-icon-arrow-right"></i>
							</el-button>
							<span>年度月填单统计</span>
						</span>
					</div>
					<ve-line :data="chartData6" :settings="chartSettings6" height="360px"></ve-line>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card>
					<div slot="header" class="clearfix">
						<span>任务进度统计</span>
					</div>
					<ve-bar :data="chartData4" :settings="chartSettings4" height="360px"></ve-bar>
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
		taskStateNum,
		commentCount,
		orderList,
		taskList
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
						'统计': ['heji', 'meiri', 'bili']
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
				},
				year1: new Date().getFullYear(),
				year2: new Date().getFullYear(),
				chartData5: {
					columns: ['time', 'num'],
					rows: []
				},
				chartSettings5: {
					stack: {
						'xxx': ['num']
					},
					labelMap: {
						'num': '订单数'
					}
				},
				chartData6: {
					columns: ['time', 'num'],
					rows: []
				},
				chartSettings6: {
					stack: {
						'xxx': ['num']
					},
					labelMap: {
						'num': '上评数'
					}
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
			this.commentNumChart()
			this.taskProgressChart()
			this.orderCountYear()
			this.taskCountYear()
		},

		methods: {
			//客户统计数据
			customerCountShow() {
				let _this = this
				customerCount().then(res => {
					_this.allCustomer = Number(res.heji)
					_this.todayCustomer = Number(res.meiri)
				}).catch((e) => {})
			},

			//订单统计数据
			orderCountShow() {
				let _this = this
				orderCount().then(res => {
					_this.allOrder = Number(res.heji)
					_this.todayOrder = Number(res.meiri)
				}).catch((e) => {})
			},

			//任务统计数据
			taskCountShow() {
				let _this = this
				taskCount().then(res => {
					_this.allTask = Number(res.heji)
					_this.doingTask = Number(res.meiri)
				}).catch((e) => {})
			},

			//7天未分配任务数据
			taskNoAllotShow() {
				let _this = this
				taskNoAllot().then(res => {
					_this.taskNoAllot = Number(res.heji)
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
					PayState: 0,
					againTaskState: 0
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

			//留评率统计图
			commentNumChart() {
				let _this = this
				let params = {}
				commentCount(params).then(res => {
					let data = res
					let arry = []
					for (let x in data) {
						arry.push({
							'state': data[x].type,
							'num': data[x].num
						})
					}
					_this.chartData3.rows = arry
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
			},

			//年度订单数据
			orderCountYear() {
				let params = {
					keyWord: '',
					state: 0,
					countryId: 0,
					type: 0,
					Diff: 0,
					startTime: this.year1 + '-1-1',
					endTime: this.year1 + '-12-31',
					ServerType: 0,
					pageIndex: 1,
					pageSize: 100000000
				}
				orderList(params).then(res => {
					let v = res.Entity
					let data = []
					for (let x in v) {
						let vArr = v[x].OrderTime.split('/')
						data.push(vArr[0] + '-' + vArr[1])
					}
					this.orderChartShow(data)
				}).catch((e) => {})
			},

			//订单年度统计切换年度
			changeOrderYear(val) {
				let year = this.year1
				let newYear = Number(year) + Number(val)
				this.year1 = newYear
				this.orderCountYear()
			},

			//年度任务数据
			taskCountYear() {
				let params = {
					Id: 1,
					Key: 'Michale_009',
					keyWord: '',
					State: 0,
					countryId: 0,
					type: 0,
					Diff: 0,
					startTime: this.year2 + '-1-1',
					endTime: this.year2 + '-12-31',
					startEvaluateTime: '',
					endEvaluateTime: '',
					startDealTime: '',
					endDealTime: '',
					ServerType: 0,
					RepeatState: 0,
					PayState: 0,
					againTaskState: 0,
					pageIndex: 1,
					pageSize: 100000000,
					RoolId: 1,
				}
				taskList(params).then(res => {
					let v = res.Entity
					let data = []
					for (let x in v) {
						let vArr = v[x].AddTime.split('/')
						data.push(vArr[0] + '-' + vArr[1])
					}
					this.taskChartShow(data)
				}).catch((e) => {})
			},

			//填单年度统计切换年度
			changeTaskYear(val) {
				let year = this.year2
				let newYear = Number(year) + Number(val)
				this.year2 = newYear
				this.taskCountYear()
			},

			//年度订单走势图展示
			orderChartShow(data) {
				let obj = {}
				for (let i = 0; i < data.length; i++) {
					let item = data[i]
					obj[item] = (obj[item] + 1) || 1
				}
				let dataNew = []
				for (let i in obj) {
					dataNew.push({
						time: i,
						num: obj[i]
					})
				}
				let year = this.year1
				let xData = []
				for (let i = 1; i <= 12; i++) {
					let v = year + '-' + i
					xData.push({
						time: v,
						num: 0
					})
				}
				let list = Array.from(new Set(xData.concat(dataNew)))
				let arr = [list[0]]
				for (let i = 1; i < list.length; i++) {
					let item = list[i]
					let repeat = false
					for (let j = 0; j < arr.length; j++) {
						if (item.time == arr[j].time) {
							arr[j].num = item.num
							repeat = true
							break
						}
					}
					if (!repeat) {
						arr.push(item)
					}
				}
				this.chartData5.rows = arr
			},

			//年度填单数走势图展示
			taskChartShow(data) {
				let obj = {}
				for (let i = 0; i < data.length; i++) {
					let item = data[i]
					obj[item] = (obj[item] + 1) || 1
				}
				let dataNew = []
				for (let i in obj) {
					dataNew.push({
						time: i,
						num: obj[i]
					})
				}
				let year = this.year2
				let xData = []
				for (let i = 1; i <= 12; i++) {
					let v = year + '-' + i
					xData.push({
						time: v,
						num: 0
					})
				}
				let list = Array.from(new Set(xData.concat(dataNew)))
				let arr = [list[0]]
				for (let i = 1; i < list.length; i++) {
					let item = list[i]
					let repeat = false
					for (let j = 0; j < arr.length; j++) {
						if (item.time == arr[j].time) {
							arr[j].num = item.num
							repeat = true
							break
						}
					}
					if (!repeat) {
						arr.push(item)
					}
				}
				this.chartData6.rows = arr
			}

		}
	}
</script>
