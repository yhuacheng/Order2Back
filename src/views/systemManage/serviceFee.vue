<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm" size="mini">
				<el-form-item label="国家">
					<el-input v-model="searchForm.searchWords" placeholder="请输入国家名称"></el-input>
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
			<el-table-column prop="CountryName" label="国家" align="center"></el-table-column>
			<el-table-column prop="Probability" label="留评率" align="center"></el-table-column>
			<el-table-column prop="FeePrice" label="每单服务费" align="center"></el-table-column>
			<el-table-column prop="State" label="状态" align="center">
				<template slot-scope="scope">
					<span v-if="scope.row.State==1" class="success">有效</span>
					<span v-if="scope.row.State==0" class="danger">无效</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" width="200">
				<template v-slot="scope">
					<el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button v-if="scope.row.State==0" size="mini" type="success" @click="changeState(scope.$index, scope.row,1)">有效</el-button>
					<el-button v-if="scope.row.State==1" size="mini" type="warning" @click="changeState(scope.$index, scope.row,0)">无效</el-button>
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

		<!-- 新增/修改 -->
		<el-dialog v-dialogDrag :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal"
		 width="30%">
			<el-form :model='editForm' ref='editForm' :rules='Rules' label-width='100px' status-icon>
				<el-form-item label="国家" prop="CountryId">
					<el-select style="width: 100%;" v-model="editForm.CountryId" filterable placeholder="请选择国家">
						<el-option v-for="item in countryData" :key="item.Id" :label="item.CountryName" :value="item.Id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="留评率" prop="Probability">
					<template>
						<el-select v-model="editForm.Probability" placeholder="请选择留评比例" style="width: 100%;">
							<el-option label="0%" value="0%"></el-option>
							<el-option label="10%" value="10%"></el-option>
							<el-option label="20%" value="20%"></el-option>
							<el-option label="30%" value="30%"></el-option>
							<el-option label="40%" value="40%"></el-option>
							<el-option label="50%" value="50%"></el-option>
							<el-option label="60%" value="60%"></el-option>
							<el-option label="70%" value="70%"></el-option>
							<el-option label="80%" value="80%"></el-option>
							<el-option label="90%" value="90%"></el-option>
							<el-option label="100%" value="100%"></el-option>
						</el-select>
					</template>
				</el-form-item>
				<el-form-item label="每单服务费" prop="FeePrice">
					<el-input v-model="editForm.FeePrice"></el-input>
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
		serviceFeeList,
		serviceFeeAdd,
		serviceFeeEdit,
		serviceFeeState,
		countryList
	} from '@/api/api'
	export default {
		name: 'serviceFee',
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
				searchForm: {
					searchWords: ''
				},
				countryData: [], //国家数据
				editForm: {
					CountryId: '',
					Probability: '',
					FeePrice: ''
				},
				Rules: {
					CountryId: [{
						required: true,
						message: '请选择国家',
						trigger: 'blur'
					}],
					Probability: [{
						required: true,
						message: '请选择留评率',
						trigger: 'blur'
					}],
					FeePrice: [{
							required: true,
							message: '请输入每单服务费',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
							message: '服务费格式不正确',
							trigger: 'blur'
						}
					]
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
					_this.countryData = res.result.Entity
				}).catch((e) => {})
			},

			// 获取列表数据
			getAllData() {
				let _this = this
				_this.listLoading = true
				let params = {
					currencyName: _this.searchForm.searchWords,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize
				}
				serviceFeeList(params).then(res => {
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

			// 新增弹框
			handleAdd() {
				let _this = this
				_this.editModal = true
				_this.getCountryData() //获取国家数据
				_this.title = '服务费新增'
				_this.doType = 'add'
			},

			// 新增
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = Object.assign({}, this.editForm)
						serviceFeeAdd(params).then(res => {
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
				_this.title = '服务费编辑'
				_this.doType = 'edit'
				_this.selectId = row.Id
				_this.editForm = {
					CountryId: row.CountryId,
					Probability: row.Probability,
					FeePrice: row.FeePrice
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
						serviceFeeEdit(params).then(res => {
							_this.btnLoading = false
							_this.closeModal()
							_this.getAllData()
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
			},

			//更改状态
			changeState(index, row, val) {
				let _this = this
				let params = {
					Id: row.Id,
					State: val
				}
				serviceFeeState(params).then((res) => {
					_this.getAllData()
				}).catch(() => {})
			},

			//关闭新增修改弹窗
			closeModal() {
				let _this = this
				_this.editModal = false
				_this.$refs['editForm'].resetFields()
				_this.editForm = {
					CountryId: '',
					Probability: '',
					FeePrice: ''
				}
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
			}
		}
	}
</script>
