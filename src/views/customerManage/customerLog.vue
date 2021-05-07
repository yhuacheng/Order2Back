<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm" size="small">
				<el-form-item label="搜索">
					<el-input v-model="searchForm.searchWords" placeholder="客户编码"></el-input>
				</el-form-item>
				<el-form-item label="交易类型">
					<el-select v-model="searchForm.state" placeholder="请选择类型">
						<el-option :value="0" label="全部"></el-option>
						<el-option :value="1" label="收入"></el-option>
						<el-option :value="2" label="支出"></el-option>
						<el-option :value="3" label="退单返本"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="交易时间">
					<el-date-picker v-model="searchForm.time" :unlink-panels='true' type="datetimerange"
						range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间"
						value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-button @click="searchData">查询</el-button>
					<el-button @click="resetSearch">重置</el-button>
					<el-button type="warning" @click="exportExcel">导出</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<pl-table border :data="tableData" v-loading="listLoading" id="exportTable" style="width: 100%"
			:header-cell-style="{background:'#fafafa'}" ref="table" use-virtual max-height="680" :row-height="45">
			<pl-table-column type="index" label="序号" align="center" width="50"></pl-table-column>
			<pl-table-column prop="BusinessNumber" label="流水号" align="center"></pl-table-column>
			<pl-table-column prop="CustomerId" label="客户编码" align="center"></pl-table-column>
			<pl-table-column prop="PaymentState" label="交易类型" align="center">
				<template slot-scope="scope">
					<span v-if="scope.row.PaymentState==1" class="success">收入</span>
					<span v-if="scope.row.PaymentState==2" class="danger">支出</span>
					<span v-if="scope.row.PaymentState==3" class="warning">退单返本</span>
				</template>
			</pl-table-column>
			<pl-table-column prop="TransactionAmount" class="danger" label="金额" align="center">
				<template slot-scope="scope">
					<span v-if="scope.row.PaymentState==1" class="success">{{scope.row.TransactionAmount}}</span>
					<span v-if="scope.row.PaymentState==2" class="danger">{{scope.row.TransactionAmount}}</span>
					<span v-if="scope.row.PaymentState==3" class="warning">{{scope.row.TransactionAmount}}</span>
				</template>
			</pl-table-column>
			<pl-table-column prop="TransactionTime" label="交易时间" align="center"></pl-table-column>
			<pl-table-column prop="Remarks" label="备注" width="400">
			</pl-table-column>
		</pl-table>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination style="float: right;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
				:current-page="pageIndex" :page-sizes="[10, 20, 50, 100, 1000, 10000,100000]" :page-size="pageSize"
				layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</el-col>
	</section>
</template>

<script>
	import table2excel from 'js-table2excel'

	import {
		customerLog
	} from '@/api/api'
	export default {
		name: 'customerLog',
		data() {
			return {
				pageIndex: 1,
				pageSize: 10,
				total: 0,
				tableData: [],
				listLoading: false,
				btnLoading: false,
				searchForm: {
					searchWords: '',
					state: 0,
					time: []
				}
			}
		},
		created() {
			this.getAllData()
		},
		methods: {
			// 获取列表数据
			getAllData() {
				let _this = this
				_this.listLoading = true
				let time = _this.searchForm.time
				let time1 = ''
				let time2 = ''
				if (time != '' && time != null) {
					time1 = time[0]
					time2 = time[1]
				}
				let params = {
					KeyWords: _this.searchForm.searchWords,
					State: _this.searchForm.state,
					StartTime: time1,
					EndTime: time2,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize
				}
				customerLog(params).then(res => {
					_this.listLoading = false
					_this.tableData = res.Entity
					_this.total = Number(res.TotalCount)
				}).catch((e) => {})
			},

			//查询
			searchData() {
				let _this = this
				_this.pageIndex = 1 //页码归1
				_this.getAllData()
			},

			// 重置
			resetSearch() {
				let _this = this
				_this.searchForm = {
					searchWords: '',
					state: 0,
					time: []
				}
				_this.pageIndex = 1
				_this.getAllData()
			},

			//翻页
			handleSizeChange(val) {
				let _this = this
				_this.pageSize = val
				_this.getAllData()
			},
			handleCurrentChange(val) {
				let _this = this
				_this.pageIndex = val
				_this.getAllData()
			},

			//导出
			exportExcel() {
				const column = [{
						title: '流水号',
						key: 'BusinessNumber',
						type: 'text'
					},
					{
						title: '客户编号',
						key: 'CustomerId',
						type: 'text'
					},
					{
						title: '客户名称',
						key: 'Name',
						type: 'text'
					},
					{
						title: '交易类型',
						key: 'ExpType',
						type: 'text'
					},
					{
						title: '金额',
						key: 'TransactionAmount',
						type: 'text'
					},
					{
						title: '交易时间',
						key: 'TransactionTime',
						type: 'text'
					},
					{
						title: '备注',
						key: 'Remarks',
						type: 'text'
					}
				]

				// 1.title为列名
				// 2.key为data数据每个对象对应的key
				// 3.若为图片格式, 需要加type为image的说明,并且可以设置图片的宽高
				const data = this.tableData
				// data数据一些特殊处理
				for (const t in data) {
					let TxtType = ''
					if (data[t].PaymentState == 1) {
						TxtType = '收入'
					}
					if (data[t].PaymentState == 2) {
						TxtType = '支出'
					}
					if (data[t].PaymentState == 3) {
						TxtType = '退单返本'
					}
					data[t].ExpType = TxtType
				}
				const excelName = '客户交易日志.xls'
				table2excel(column, data, excelName)
			}
		}
	}
</script>
