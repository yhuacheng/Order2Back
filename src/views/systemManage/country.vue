<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm" size="small">
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

		<!--列表-->
		<el-table border :data="tableData" v-loading="listLoading" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
		 id="tableData" ref='table'>
			<el-table-column type="index" label="#" align="center"></el-table-column>
			<el-table-column prop="CountryName" label="国家" align="center"></el-table-column>
			<el-table-column prop="CounteyShorthand" label="英文简称" align="center"></el-table-column>
			<el-table-column label="操作" align="center" width="200">
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

		<!--编辑界面-->
		<el-dialog v-dialogDrag :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal"
		 width="30%">
			<el-form :model='editForm' ref='editForm' :rules='rules' label-width='90px' status-icon>
				<el-form-item label='国家名称' prop='name'>
					<el-input v-model='editForm.name'></el-input>
				</el-form-item>
				<el-form-item label='英文简称' prop='simple'>
					<el-input v-model='editForm.simple'></el-input>
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
		countryList,
		countryAdd,
		countryEdit
	} from '@/api/api'

	export default {
		name: 'country',
		data() {
			return {
				title: '',
				pageIndex: 1,
				pageSize: 10,
				total: 0,
				doType: '',
				editModal: false,
				listLoading: false,
				btnLoading: false,
				tableData: [],
				selectId: '',
				searchForm: {
					searchWords: ''
				},
				editForm: {
					name: '',
					simple: ''
				},
				rules: {
					name: {
						required: true,
						message: '请输入国家名称',
						trigger: 'blur'
					},
					simple: {
						required: true,
						message: '请输入简称',
						trigger: 'blur'
					}
				}
			}
		},
		created() {
			this.getData()
		},
		methods: {
			// 获取列表数据
			getData() {
				let _this = this
				_this.listLoading = true
				let params = {
					country: _this.searchForm.searchWords,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize,
				}
				countryList(params).then(res => {
					_this.listLoading = false
					_this.tableData = res.result.Entity
					_this.total = Number(res.result.TotalCount)
				}).catch((e) => {})
			},

			//查询
			searchData() {
				let _this = this
				_this.pageIndex = 1
				_this.getData()
			},

			//重置
			resetSearch() {
				let _this = this
				_this.pageIndex = 1
				_this.searchForm = {
						searchWords: ''
					},
					_this.getData()
			},

			// 显示新增框
			handleAdd() {
				let _this = this
				_this.title = '新增国家'
				_this.doType = 'add'
				_this.editModal = true
			},

			// 显示编辑框
			handleEdit(index, row) {
				let _this = this
				_this.title = '编辑国家'
				_this.doType = 'edit'
				_this.selectId = row.Id
				_this.editModal = true
				_this.editForm = {
					name: row.CountryName,
					simple: row.CounteyShorthand
				}
			},

			//新增提交
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = {
							CountryName: _this.editForm.name,
							CountryShorthand: _this.editForm.simple
						}
						countryAdd(params).then(res => {
							_this.btnLoading = false
							_this.closeModal()
							_this.getData()
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
			},

			//编辑提交
			editSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = {
							Id: _this.selectId,
							Country: _this.editForm.name,
							CountryJX: _this.editForm.simple
						}
						countryEdit(params).then(res => {
							_this.btnLoading = false
							_this.closeModal()
							_this.getData()
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
			},

			//关闭新增编辑弹窗
			closeModal() {
				let _this = this
				_this.editModal = false
				_this.btnLoading = false
				_this.$refs['editForm'].resetFields()
				_this.editForm = {
					name: '',
					simple: ''
				}
			},

			//翻页
			handleSizeChange(val) {
				let _this = this
				_this.pageSize = val
				_this.getData()
			},
			//跳转
			handleCurrentChange(val) {
				let _this = this
				_this.pageIndex = val
				_this.getData()
			}

		}
	}
</script>
