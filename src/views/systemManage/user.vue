<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm" size="mini">
				<el-form-item label="用户姓名">
					<el-input v-model="searchForm.searchWords" placeholder="请输入姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button @click="searchData">查询</el-button>
					<el-button @click="resetSearch">重置</el-button>
					<el-button type="primary" @click="addModalShow">新增</el-button>
					<el-button type="warning" @click="exportExcel">导出</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table border :data="tableData" id="exportTable" v-loading="listLoading" style="width: 100%" :header-cell-style="{background:'#fafafa'}"
		 ref="table">
			<el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
			<el-table-column prop="Name" label="姓名" align="center"></el-table-column>
			<el-table-column prop="LoginName" label="账号" align="center"></el-table-column>
			<el-table-column prop="RoleName" label="角色" align="center"></el-table-column>
			<el-table-column prop="Code" label="推荐码" align="center"></el-table-column>
			<el-table-column prop="Phone" label="手机" align="center"></el-table-column>
			<el-table-column prop="Email" label="邮箱" align="center"></el-table-column>
			<el-table-column prop="State" label="状态" align="center">
				<template slot-scope="scope">
					<span v-if="scope.row.State==1" class="success">有效</span>
					<span v-if="scope.row.State==0" class="danger">无效</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" width="250">
				<template v-slot="scope">
					<el-button size="mini" type="primary" @click.stop="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button size="mini" type="danger" @click.stop="delData(scope.$index, scope.row)">删除</el-button>
					<el-button size="mini" type="warning" @click.stop="handleBind(scope.$index, scope.row)">绑定角色</el-button>
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
			<el-form :model="editForm" ref="editForm" :rules='Rules' label-width='70px' status-icon>
				<el-form-item label="姓名" prop="name">
					<el-input v-model="editForm.name"></el-input>
				</el-form-item>
				<el-form-item label="账号" prop="loginname">
					<el-input v-model="editForm.loginname"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input v-model="editForm.password"></el-input>
				</el-form-item>
				<el-form-item label="推荐码" prop="code">
					<el-select style="width: 100%;" v-model="editForm.code" filterable placeholder="请选择推荐码" :disabled="doType=='edit'">
						<el-option v-for="item in codeData" :key="item.Id" :label="item.RecommentNumber" :value="item.Id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="状态" prop="state">
					<el-radio-group v-model="editForm.state">
						<el-radio :label="1">有效</el-radio>
						<el-radio :label="0">无效</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="手机" prop="phone">
					<el-input v-model="editForm.phone"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editForm.email"></el-input>
				</el-form-item>
				<el-form-item label="备注" prop="resmks">
					<el-input type="textarea" :rows="3" v-model='editForm.resmks'></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeModal">取消</el-button>
				<el-button type="primary" v-if="doType==='add'" @click="addSubmit" :loading="btnLoading">提交</el-button>
				<el-button type="primary" v-if="doType==='edit'" @click="editSubmit" :loading="btnLoading">提交</el-button>
			</div>
		</el-dialog>

		<!-- 用户绑定角色 -->
		<el-drawer :title="title" :visible.sync="drawer" :before-close="closeDrawer" custom-class='drawer-Box'>
			<div class="drawer-content">
				<el-checkbox-group v-model="role">
					<el-checkbox style="display:block;padding: 15px" v-for="item in roleData" :label="item.Id" :key="item.Id">{{item.RoleName}}</el-checkbox>
				</el-checkbox-group>
				<div class="drawer-footer">
					<el-button @click="closeDrawer">取 消</el-button>
					<el-button type="primary" @click="bindSubmit" :loading="btnLoading">提交</el-button>
				</div>
			</div>
		</el-drawer>
	</section>
</template>

<script>
	import FileSaver from 'file-saver'
	import XLSX from 'xlsx'

	import {
		userList,
		userAdd,
		userEdit,
		userDelete,
		codeNoUsed,
		roleList,
		userBindRole,
		userCheckedRole,
	} from '@/api/api'

	export default {
		name: 'user',
		data() {
			return {
				title: '',
				pageIndex: 1,
				pageSize: 10,
				total: 0,
				doType: '',
				editModal: false, //新增修改
				drawer: false,
				listLoading: false,
				btnLoading: false,
				tableData: [],
				selectId: '',
				roleData: [], //角色数据
				codeData: [], //推荐码数据
				role: [],
				searchForm: {
					searchWords: ''
				},
				editForm: {
					name: '',
					loginname: '',
					password: '',
					state: 1,
					code: '',
					phone: '',
					email: '',
					resmks: ''
				},
				Rules: {
					name: {
						required: true,
						message: '请输入姓名',
						trigger: 'blur'
					},
					loginname: {
						required: true,
						message: '请输入用户名',
						trigger: 'blur'
					},
					password: {
						required: true,
						message: '请输入密码',
						trigger: 'blur'
					},
					code: {
						required: true,
						message: '请选择推荐码',
						trigger: 'blur'
					},
					state: {
						required: true,
						message: '请选择状态',
						trigger: 'blur'
					},
					phone: [{
						pattern: /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
						message: '请输入正确的手机号',
						trigger: 'blur'
					}],
					email: [{
						pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
						message: '请输入正确的邮箱',
						trigger: 'blur'
					}]
				}
			}
		},
		created() {
			this.getAllData()
			this.getRoleData()
		},
		methods: {
			//获取未使用的推荐码
			getCodeData() {
				let _this = this
				let params = {}
				codeNoUsed(params).then(res => {
					_this.codeData = res
				}).catch((e) => {})
			},

			// 获取列表数据
			getAllData() {
				let _this = this
				_this.listLoading = true
				let params = {
					name: _this.searchForm.searchWords,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize,
				}
				userList(params).then(res => {
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
			addModalShow() {
				let _this = this
				_this.editModal = true
				_this.getCodeData() //获取推荐码数据
				_this.title = '新增用户'
				_this.doType = 'add'
			},

			// 新增
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = Object.assign({}, this.editForm)
						userAdd(params).then(res => {
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
				_this.getCodeData() //获取推荐码数据
				_this.title = '编辑用户'
				_this.doType = 'edit'
				_this.selectId = row.Id
				_this.editForm = {
					name: row.Name,
					loginname: row.LoginName,
					password: row.Password,
					state: row.State,
					code: row.Code,
					phone: row.Phone,
					email: row.Email,
					resmks: row.Remarks
				}
			},

			// 修改
			editSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = Object.assign({}, _this.editForm)
						params.id = _this.selectId
						userEdit(params).then(res => {
							_this.btnLoading = false
							_this.closeModal()
							_this.getAllData()
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
			},

			// 删除
			delData(index, row) {
				let _this = this
				var ids = row.Id
				_this.$confirm('确认删除用户【' + row.Name + '】吗？', '信息提示', {
					type: 'warning'
				}).then(() => {
					let params = {
						Id: ids
					}
					userDelete(params).then((res) => {
						_this.getAllData()
					})
				}).catch(() => {})
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
					name: '',
					loginname: '',
					password: '',
					roole: [],
					state: 1,
					code: '',
					phone: '',
					email: '',
					resmks: ''
				}
			},

			// 获取角色数据
			getRoleData() {
				let _this = this
				let params = {
					Name: '',
					pageIndex: 1,
					pageSize: 100000000
				}
				roleList(params).then(res => {
					_this.roleData = res.Entity
				}).catch((e) => {})
			},

			//获取用户已勾选角色
			getCheckedRole() {
				let _this = this
				let params = {
					Id: _this.selectId
				}
				userCheckedRole(params).then(res => {
					_this.role = res.list
					_this.drawer = true //获取到数据后再打开弹窗，避免请求缓慢时未回显数据
				}).catch((e) => {})
			},

			// 打开角色界面
			handleBind(index, row) {
				let _this = this
				_this.selectId = row.Id
				_this.title = '为用户【' + row.Name + '】绑定角色'
				_this.getCheckedRole()
			},

			// 绑定角色提交
			bindSubmit() {
				let _this = this
				_this.btnLoading = true
				let params = {
					Id: _this.selectId,
					RoolId: _this.role
				}
				userBindRole(params).then(res => {
					_this.btnLoading = false
					_this.closeDrawer()
					_this.getAllData()
				}).catch((e) => {
					_this.btnLoading = false
				})
			},

			//关闭用户绑定角色
			closeDrawer() {
				let _this = this
				_this.drawer = false
				_this.role = []
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
					}), '用户管理.xlsx')
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
