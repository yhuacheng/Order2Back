<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm" size="small">
				<el-form-item label="客户编码">
					<el-input v-model="searchForm.searchWords" placeholder="请输入客户编码"></el-input>
				</el-form-item>
				<el-form-item label="提现状态">
					<el-select v-model="searchForm.state" placeholder="请选择状态">
						<el-option value="1" label="待处理"></el-option>
						<el-option value="2" label="提现成功"></el-option>
						<el-option value="3" label="提现失败"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button @click="searchData">查询</el-button>
					<el-button @click="resetSearch">重置</el-button>
					<el-button type="success" v-if="btnShow" :disabled="disabled" @click="changeState(2)">提现成功
					</el-button>
					<el-button type="danger" v-if="btnShow" :disabled="disabled" @click="changeState(3)">提现失败
					</el-button>
					<el-button type="warning" @click="exportExcel">导出</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!-- 列表 -->
		<el-table border :data="tableData" v-loading="listLoading" id="exportTable" style="width: 100%"
			:header-cell-style="{background:'#fafafa'}" @selection-change="handleSelectionChange" @row-click="rowClick"
			ref="table">
			<el-table-column type="selection" align="center"></el-table-column>
			<el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
			<el-table-column prop="RemoveMoenyNumber" label="流水号" align="center" width="140"></el-table-column>
			<el-table-column prop="CustomerId" label="客户编码" align="center"></el-table-column>
			<el-table-column prop="Name" label="客户名称" align="center"></el-table-column>
			<el-table-column prop="Phone" label="客户手机" align="center"></el-table-column>
			<el-table-column prop="RemoveMoeny" label="提现金额" align="center">
				<template slot-scope="scope">
					<span class="danger">{{scope.row.RemoveMoeny}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="RemoveMoenyTime" label="申请时间" align="center" width="180"></el-table-column>
			<el-table-column prop="RemoveMoenyStae" label="状态" align="center">
				<template slot-scope="scope">
					<span v-if="scope.row.RemoveMoenyStae==1">待处理</span>
					<span v-if="scope.row.RemoveMoenyStae==2" class="success">提现成功</span>
					<span v-if="scope.row.RemoveMoenyStae==3" class="danger">提现失败</span>
				</template>
			</el-table-column>
			<el-table-column prop="Bank" label="开户银行" align="center"></el-table-column>
			<el-table-column prop="BankName" label="开户名" align="center"></el-table-column>
			<el-table-column prop="BankAccount" label="银行账号" align="center" width="200"></el-table-column>
		</el-table>

		<el-col :span="24" class="toolbar">
			<el-pagination style="float: right;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
				:current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="10"
				layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</el-col>

	</section>
</template>

<script>
	import FileSaver from 'file-saver'
	import XLSX from 'xlsx'

	import {
		takemoneyList,
		takemoneyState,
		phoneCode,
		phoneCodeCheck
	} from '@/api/api';
	export default {
		name: 'takemoney',
		data() {
			return {
				title: '',
				pageIndex: 1,
				pageSize: 10,
				total: 0,
				disabled: true, //单项禁用
				disabledMore: true, //多项禁用
				listLoading: false,
				tableData: [],
				checkBoxData: [], //选中数据
				searchForm: {
					searchWords: '',
					state: ''
				},
				btnShow: false //提现成功、提现失败按钮是否显示
			}
		},
		created() {
			this.getAllData()
		},
		methods: {
			//获取数据
			getAllData() {
				let _this = this
				_this.listLoading = true

				// 根据角色判断提现列表上显示哪些按钮
				let roleId = sessionStorage.getItem('roleId')
				let z = roleId.indexOf(3) //财务
				//判断如果有财务权限则显示提现成功、提现失败按钮
				if (z >= 0) {
					_this.btnShow = true
				}

				let params = {
					keyWord: _this.searchForm.searchWords,
					state: _this.searchForm.state,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize,
				}
				takemoneyList(params).then(res => {
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

			//获取手机验证码
			getPhoneCode() {
				let _this = this
				let params = {
					Phone: sessionStorage.getItem('userPhone'),
					Id: sessionStorage.getItem('userId')
				}
				phoneCode(params).then(res => {
					if (res.IsSuccess) {
						_this.codeInput()
					}
				}).catch((e) => {})
			},

			//展示验证码输入框
			codeInput() {
				let _this = this
				let phone = sessionStorage.getItem('userPhone')
				let phonev = phone.substring(0, 3) + '****' + phone.substring(7)
				_this.$prompt('为了验证您的身份，已向您的手机 ' + phonev + ' 发送了验证码，请将验证码填入下方输入框进行验证', '身份验证', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					closeOnClickModal: false,
					inputPattern: /\S/,
					inputErrorMessage: '验证码不能为空'
				}).then(({
					value
				}) => {
					_this.checkPhoneCode(value)
				}).catch(() => {})
			},

			//验证手机验证码
			checkPhoneCode(value) {
				let params = {
					Code: value
				}
				phoneCodeCheck(params).then(res => {
					if (res.IsSuccess) {
						sessionStorage.setItem('code', 'pass')
					}
				}).catch((e) => {})
			},

			//更改状态
			changeState(val) {
				let _this = this
				//判断是否通过过手机验证
				let code = sessionStorage.getItem('code')
				if (code == 'pass') {
					let params = {
						Id: _this.checkBoxData[0].Id,
						State: val
					}
					takemoneyState(params).then((res) => {
						_this.getAllData()
					}).catch(() => {})
				} else {
					_this.getPhoneCode()
				}
			},

			//选中行
			rowClick(row) {
				let _this = this
				let findResult = _this.checkBoxData.findIndex((value, index) => {
					return value == row
				})
				if (findResult != -1) {
					_this.$refs.table.toggleRowSelection(row, false);
				} else {
					_this.$refs.table.toggleRowSelection(row, true);
				}
			},

			// 是否有选中
			handleSelectionChange(val) {
				let _this = this
				_this.checkBoxData = val
				let checkNum = _this.checkBoxData.length
				if (checkNum == 1) {
					let state = _this.checkBoxData[0].RemoveMoenyStae
					if (state == 1) {
						_this.disabled = false
						_this.disabledMore = false
					}
				} else if (checkNum > 1) {
					_this.disabled = true
					_this.disabledMore = false
				} else {
					_this.disabled = true
					_this.disabledMore = true
				}
			},

			// 重置
			resetSearch() {
				let _this = this
				_this.searchForm = {
					searchWords: '',
					state: ''
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
					}), '提现管理.xlsx')
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

<style>

</style>
