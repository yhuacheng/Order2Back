<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm" size="small">
				<el-form-item label="搜索内容">
					<el-input v-model="searchForm.searchWords" placeholder="请输入流水号或客户编码"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button @click="searchData">查询</el-button>
					<el-button @click="resetSearch">重置</el-button>
					<el-button type="warning" @click="exportExcel">导出</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<el-table border :data="tableData" v-loading="listLoading" id="exportTable" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
		 ref="table">
			<el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
			<el-table-column prop="BusinessNumber" label="流水号" align="center"></el-table-column>
			<el-table-column prop="CustomerId" label="客户编码" align="center"></el-table-column>
			<el-table-column prop="PaymentState" label="交易类型" align="center">
				<template slot-scope="scope">
					<span v-if="scope.row.PaymentState==1" class="success">收入</span>
					<span v-if="scope.row.PaymentState==2" class="danger">支出</span>
					<span v-if="scope.row.PaymentState==3" class="warning">退单返本</span>
				</template>
			</el-table-column>
			<el-table-column prop="TransactionAmount" label="金额" align="center">
				<template slot-scope="scope">
					<span v-if="scope.row.PaymentState==1" class="success">{{scope.row.TransactionAmount}}</span>
					<span v-if="scope.row.PaymentState==2" class="danger">{{scope.row.TransactionAmount}}</span>
					<span v-if="scope.row.PaymentState==3" class="warning">{{scope.row.TransactionAmount}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="TransactionTime" label="交易时间" align="center"></el-table-column>
			<el-table-column prop="Remarks" label="备注" align="center" :show-overflow-tooltip='true' width="400"></el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination style="float: right;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
			 :current-page="pageIndex" :page-sizes="[10, 20, 50, 100, 1000]" :page-size="10" layout="total, sizes, prev, pager, next, jumper"
			 :total="total">
			</el-pagination>
		</el-col>

	</section>
</template>

<script>
	import FileSaver from 'file-saver'
	import XLSX from 'xlsx'

	import {
		customerMoney
	} from '@/api/api'
	export default {
		name: 'customerMoney',
		data() {
			return {
				pageIndex: 1,
				pageSize: 10,
				total: 0,
				tableData: [],
				listLoading: false,
				btnLoading: false,
				searchForm: {
					searchWords: ''
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
				let params = {
					keyWord: _this.searchForm.searchWords,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize,
				}
				customerMoney(params).then(res => {
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
					searchWords: ''
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

			// 导出
			exportExcel() {
				var xlsxParam = {
					raw: true
				}
				var wb = XLSX.utils.table_to_book(document.querySelector('#exportTable'), xlsxParam)
				var wbout = XLSX.write(wb, {
					bookType: 'xlsx',
					bookSST: true,
					type: 'array'
				})
				try {
					FileSaver.saveAs(new Blob([wbout], {
						type: 'application/octet-stream'
					}), '客户充值扣款记录.xlsx')
				} catch (e) {
					if (typeof console !== 'undefined') {
						console.log(e, wbout)
					}
				}
				return wbout
			}
		}
	}
</script>
