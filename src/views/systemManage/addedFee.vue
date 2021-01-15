<template>
	<div>
		<el-collapse-transition>
			<div class="searchBox mb20">
				<el-form ref="searchForm" :model="searchForm" class="form-item" label-width="80px">
					<el-row>
						<el-col :xs="24" :span="6">
							<el-form-item label="开始区间">
								<el-input v-model="searchForm.start" placeholder="请输入开始区间" size="small"></el-input>
							</el-form-item>
						</el-col>
						<el-col :xs="24" :span="6">
							<el-form-item label="结束区间">
								<el-input v-model="searchForm.end" placeholder="请输入结束区间" size="small"></el-input>
							</el-form-item>
						</el-col>
						<el-col :xs="24" :span="12">
							<el-form-item>
								<el-button type="primary" size="small" @click="searchData">查询</el-button>
								<el-button size="small" @click="resetSearch">重置</el-button>
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
			</div>
		</el-collapse-transition>

		<section>
			<!--工具条-->
			<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
				<el-form :inline="true" :model="searchForm" size="mini">
					<el-form-item label="开始区间">
						<el-input v-model="searchForm.start" placeholder="请输入开始区间"></el-input>
					</el-form-item>
					<el-form-item label="结束区间">
						<el-input v-model="searchForm.end" placeholder="请输入结束区间"></el-input>
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
				<el-table-column type="selection" align="center"></el-table-column>
				<el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
				<el-table-column prop="Start" label="开始区间($)" align="center"></el-table-column>
				<el-table-column prop="Ent" label="结束区间($)" align="center"></el-table-column>
				<el-table-column prop="IServiceFee" label="增值服务费($)" align="center"></el-table-column>
				<el-table-column prop="Remarks" label="备注" align="center"></el-table-column>
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

			<!--新增/修改-->
			<el-dialog v-dialogDrag :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal">
				<el-form :model='editForm' ref='editForm' :rules='Rules' label-width='100px' status-icon>
					<el-form-item label='开始区间$' prop='Start'>
						<el-input v-model='editForm.Start'></el-input>
					</el-form-item>
					<el-form-item label='结束区间$' prop='Ent'>
						<el-input v-model='editForm.Ent'></el-input>
					</el-form-item>
					<el-form-item label='增值服务费(￥)' prop='IServiceFee'>
						<el-input v-model='editForm.IServiceFee'></el-input>
					</el-form-item>
					<el-form-item label='备注' prop="Remarks">
						<el-input type="textarea" :rows="3" v-model='editForm.Remarks'></el-input>
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
		addedServiceList,
		addedServiceAdd,
		addedServiceEdit,
		addedServiceState
	} from '@/api/api'
	export default {
		name: 'addedFee',
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
					start: '',
					end: ''
				},
				editForm: {
					Start: '',
					Ent: '',
					IServiceFee: '',
					Remarks: ''
				},
				Rules: {
					Start: {
						required: true,
						message: '请输入开始区间',
						trigger: 'blur'
					},
					Ent: {
						required: true,
						message: '请输入结束区间',
						trigger: 'blur'
					},
					IServiceFee: [{
							required: true,
							message: '请输入增值服务费',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
							message: '增值服务费格式不正确',
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
			// 获取列表数据
			getAllData() {
				let _this = this
				_this.listLoading = true
				let start = _this.searchForm.start
				let end = _this.searchForm.end
				if (start != '' && end == '') {
					end = 100000000
				}
				if (start == '' && end != '') {
					start = 0
				}
				if (Number(start) > Number(end)) {
					_this.$message.error('开始区间不能大于结束区间')
				} else {
					let params = {
						start: start,
						ent: end,
						pageIndex: _this.pageIndex,
						pageSize: _this.pageSize,
					}
					addedServiceList(params).then(res => {
						_this.listLoading = false
						_this.tableData = res.list
						_this.total = Number(res.total)
					}).catch((e) => {})
				}
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
				_this.title = '增值服务费新增'
				_this.doType = 'add'
			},

			// 新增
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = Object.assign({}, this.editForm)
						addedServiceAdd(params).then(res => {
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
			handleEdit() {
				let _this = this
				_this.editModal = true
				_this.title = '增值服务费修改'
				_this.doType = 'edit'
				_this.editForm = {
					Start: row.Start,
					Ent: row.Ent,
					IServiceFee: row.IServiceFee,
					Remarks: row.Remarks
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
						addedServiceEdit(params).then(res => {
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
				addedServiceState(params).then((res) => {
					_this.getAllData()
				}).catch(() => {})
			},

			// 重置
			resetSearch() {
				let _this = this
				_this.searchForm = {
					start: '',
					end: ''
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
					Start: '',
					Ent: '',
					IServiceFee: '',
					Remarks: ''
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
