<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm" size="mini">
				<el-form-item label="国家">
					<el-input v-model="searchForm.searchWords" placeholder="请输入服务名称"></el-input>
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
			<el-table-column prop="ServiceName" label="服务名称" align="center"></el-table-column>
			<el-table-column prop="ServiceMoney" label="服务价格" align="center"></el-table-column>
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

		<!--编辑界面-->
		<el-dialog v-dialogDrag :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal"
		 width="30%">
			<el-form :model='editForm' ref='editForm' :rules='rules' label-width='90px' status-icon>
				<el-form-item label='服务名称' prop='name'>
					<el-input v-model='editForm.name'></el-input>
				</el-form-item>
				<el-form-item label='服务价格' prop='price'>
					<el-input v-model='editForm.price'></el-input>
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
		serviceOtherList,
		serviceOtherAdd,
		serviceOtherEdit
	} from '@/api/api'

	export default {
		name: 'serviceOther',
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
						message: '请输入名称',
						trigger: 'blur'
					},
					price: [{
							required: true,
							message: '请输入价格',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
							message: '价格格式不正确',
							trigger: 'blur'
						}
					]
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
					keyWord: _this.searchForm.searchWords,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize
				}
				serviceOtherList(params).then(res => {
					_this.listLoading = false
					_this.tableData = res.Entity
					_this.total = Number(res.TotalCount)
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
				_this.title = '新增特殊服务费'
				_this.doType = 'add'
				_this.editModal = true
			},

			// 显示编辑框
			handleEdit(index, row) {
				let _this = this
				_this.title = '编辑特殊服务费'
				_this.doType = 'edit'
				_this.selectId = row.Id
				_this.editModal = true
				_this.editForm = {
					name: row.ServiceName,
					price: row.ServiceMoney
				}
			},

			//新增提交
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = {
							ServiceName: _this.editForm.name,
							ServiceMoney: _this.editForm.price
						}
						serviceOtherAdd(params).then(res => {
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
							ServiceName: _this.editForm.name,
							ServiceMoney: _this.editForm.price
						}
						serviceOtherEdit(params).then(res => {
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
					price: ''
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
