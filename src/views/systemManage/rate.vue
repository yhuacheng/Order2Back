<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm" size="mini">
				<el-form-item label="货币名称">
					<el-input v-model="searchForm.searchWords" placeholder="请输入货币名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button @click="searchData">查询</el-button>
					<el-button @click="resetSearch">重置</el-button>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<el-table border :data="tableData" v-loading="listLoading" id="exportTable" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
		 ref="table">
			<el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
			<el-table-column prop="RcurrencyName" label="货币名称" align="center"></el-table-column>
			<el-table-column prop="RcurrencyNumber" label="货币编码" align="center"></el-table-column>
			<el-table-column prop="RcurrencySymbol" label="货币符号" align="center"></el-table-column>
			<el-table-column prop="Rexchangerate" label="货币汇率" align="center"></el-table-column>
			<el-table-column prop="CcountryName" label="关联国家" align="center"></el-table-column>
			<el-table-column prop="handFee" label="官方手续费率" align="center"></el-table-column>
			<el-table-column prop="handMoney" label="固定手续费用" align="center"></el-table-column>
			<el-table-column label="操作" align="center" width="100">
				<template v-slot="scope">
					<el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination style="float: right;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
			 :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="10" layout="total, sizes, prev, pager, next, jumper"
			 :total="total">
			</el-pagination>
		</el-col>

		<!--新增/修改-->
		<el-dialog v-dialogDrag :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal" width="30%">
			<el-form :model='editForm' ref='editForm' :rules='Rules' label-width='110px' status-icon>
				<el-form-item label='货币名称' prop='CurrencyName'>
					<el-input v-model='editForm.CurrencyName'></el-input>
				</el-form-item>
				<el-form-item label='货币编码' prop='Currencynumber'>
					<el-input v-model='editForm.Currencynumber'></el-input>
				</el-form-item>
				<el-form-item label='货币符号' prop='CurrencySymbol'>
					<el-input v-model='editForm.CurrencySymbol'></el-input>
				</el-form-item>
				<el-form-item label='货币汇率' prop='Exchangerate'>
					<el-input v-model='editForm.Exchangerate'></el-input>
				</el-form-item>
				<el-form-item label='关联国家' prop='CountryId'>
					<el-select style="width: 100%;" v-model="editForm.CountryId" filterable placeholder="请选择国家">
						<el-option v-for="item in countryData" :key="item.Id" :label="item.CountryName" :value="item.Id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label='官方手续费率' prop='HandFee'>
					<el-input v-model='editForm.HandFee'></el-input>
				</el-form-item>
				<el-form-item label='固定手续费用' prop='HandMoney'>
					<el-input v-model='editForm.HandMoney'></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeModal">取消</el-button>
				<el-button type="primary" v-if="doType==='add'" @click="addSubmit" :loading="btnLoading">提交</el-button>
				<el-button type="primary" v-if="doType==='edit'" @click="editSubmit" :loading="btnLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import {
		rateList,
		rateAdd,
		rateEdit,
		countryList
	} from '@/api/api'
	export default {
		name: 'rate',
		data() {
			return {
				title: '',
				pageIndex: 1,
				pageSize: 10,
				total: 0,
				doType: '',
				editModal: false, //新增修改
				listLoading: false,
				btnLoading: false,
				tableData: [],
				selectId: '',
				countryData: [], //国家数据
				searchForm: {
					searchWords: '',
				},
				editForm: {
					CurrencyName: '',
					Currencynumber: '',
					CurrencySymbol: '',
					Exchangerate: '',
					CountryId: ''
				},
				Rules: {
					CurrencyName: [{
						required: true,
						message: '请输入货币名称',
						trigger: 'blur'
					}],
					Currencynumber: [{
						required: true,
						message: '请输入货币编码',
						trigger: 'blur'
					}],
					CurrencySymbol: [{
						required: true,
						message: '请输入货币符号',
						trigger: 'blur'
					}],
					Exchangerate: [{
							required: true,
							message: '请输入货币汇率',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
							message: '汇率格式不正确',
							trigger: 'blur'
						}
					],
					CountryId: [{
						required: true,
						message: '请选择关联国家',
						trigger: 'blur'
					}],
					HandFee: [{
							required: true,
							message: '请输官方手续费率',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
							message: '费率格式不正确',
							trigger: 'blur'
						}
					],
					HandMoney: [{
							required: true,
							message: '请输固定手续费用',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
							message: '固定费用格式不正确',
							trigger: 'blur'
						}
					],
				}
			}
		},
		created() {
			this.getAllData()
		},
		methods: {
			//获取国家数据
			getCountryData() {
				let _this = this
				let params = {
					country: '',
					pageIndex: 1,
					pageSize: 100000000
				}
				countryList(params).then(res => {
					_this.countryData = res.list
				}).catch((e) => {})
			},

			// 获取列表数据
			getAllData() {
				let _this = this
				_this.listLoading = true
				let params = {
					CurrencyName: _this.searchForm.searchWords,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize,
				}
				rateList(params).then(res => {
					_this.listLoading = false
					_this.tableData = res.list
					_this.total = Number(res.total)
				}).catch((e) => {})
			},

			//查询
			searchData() {
				let _this = this
				_this.pageIndex = 1 //页码归1
				_this.getAllData()
			},

			// 新增弹框
			handleAdd() {
				let _this = this
				_this.editModal = true
				_this.getCountryData() //获取国家数据
				_this.title = '汇率新增'
				_this.doType = 'add'
			},

			// 新增
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = Object.assign({}, this.editForm)
						rateAdd(params).then(res => {
							_this.btnLoading = false
							_this.closeModal()
							_this.getAllData()
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
			},

			// 修改弹框
			handleEdit(index, row) {
				let _this = this
				_this.editModal = true
				_this.getCountryData() //获取国家数据
				_this.title = '汇率编辑'
				_this.doType = 'edit'
				_this.selectId = row.Rid
				_this.editForm = {
					CurrencyName: row.RcurrencyName,
					Currencynumber: row.RcurrencyNumber,
					CurrencySymbol: row.RcurrencySymbol,
					Exchangerate: row.Rexchangerate,
					CountryId: row.cId,
					HandFee: row.handFee,
					HandMoney: row.handMoney
				}
			},

			// 修改
			editSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = Object.assign({}, _this.editForm)
						params.Id = _this.selectId
						rateEdit(params).then(res => {
							_this.btnLoading = false
							_this.closeModal()
							_this.getAllData()
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
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

			//关闭新增修改弹窗
			closeModal() {
				let _this = this
				_this.editModal = false
				_this.$refs['editForm'].resetFields()
				_this.editForm = {
					CurrencyName: '',
					Currencynumber: '',
					CurrencySymbol: '',
					Exchangerate: '',
					CountryId: ''
				}
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
			}
		}
	}
</script>
