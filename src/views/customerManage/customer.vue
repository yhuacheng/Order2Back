<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm" size="small">
				<el-form-item label="搜索">
					<el-input v-model="searchForm.searchWords" placeholder="请输入客户编码/手机"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button @click="searchData">查询</el-button>
					<el-button @click="resetSearch">重置</el-button>
					<el-button v-if="btnShow1" type="success" :disabled="disabled" @click="changeState(1)">有效
					</el-button>
					<el-button v-if="btnShow1" type="danger" :disabled="disabled" @click="changeState(0)">无效</el-button>
					<el-button v-if="btnShow3" type="primary" :disabled="disabled" @click="userModalShow">重新分配所属用户
					</el-button>
					<el-button v-if="btnShow2" type="success" :disabled="disabled" @click="rechargeModalShow">充值
					</el-button>
					<el-button v-if="btnShow2" type="danger" :disabled="disabled" @click="deductionModalShow">扣款
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
			<el-table-column prop="Id" label="客户编码" align="center">
				<template slot-scope="scope">
					<div v-if="scope.row.WeCate || scope.row.QQ">
						<el-popover trigger="hover" placement="right">
							<p>微信：{{ scope.row.WeCate }}</p>
							<p>扣扣：{{ scope.row.QQ }}</p>
							<div slot="reference" class="name-wrapper">
								<span>{{ scope.row.Id }} </span>
								<span><i class="el-icon-postcard primary"></i></span>
							</div>
						</el-popover>
					</div>
					<div v-else>
						<span>{{ scope.row.Id }}</span>
					</div>
				</template>
			</el-table-column>
			<el-table-column prop="Name" label="客户名称" align="center"></el-table-column>
			<el-table-column prop="Phone" label="手机" align="center"></el-table-column>
			<el-table-column prop="PassWord" label="密码" align="center">
				<template slot-scope="scope">
					<span v-if="showPswd">{{scope.row.PassWord}}</span>
					<span v-else>******</span>
				</template>
			</el-table-column>
			<el-table-column prop="BackName" label="所属用户" align="center"></el-table-column>
			<el-table-column prop="AccountBalance" label="余额" align="center" width="130">
				<template slot-scope="scope">
					<el-tag style="width: 100px;" type="danger" @click.stop='balanceModalShow(scope.$index,scope.row)'>
						{{Number(scope.row.AccountBalance)}}
					</el-tag>
				</template>
			</el-table-column>
			<el-table-column prop="LoginIp" label="最后登录IP" align="center"></el-table-column>
			<el-table-column prop="LoginTime" label="最后登录时间" align="center" width="180"></el-table-column>
			<el-table-column prop="Enabled" label="状态" align="center">
				<template slot-scope="scope">
					<span v-if="scope.row.Enabled==1" class="success">有效</span>
					<span v-if="scope.row.Enabled==0" class="danger">无效</span>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination style="float: right;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
				:current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="10"
				layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</el-col>

		<!--充值/扣款-->
		<el-dialog :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeEditModal"
			width="30%">
			<el-form :model="editForm" ref="editForm" :rules='Rules' label-width='100px' status-icon>
				<el-form-item label="编码：" prop="code">
					<span>{{editForm.code}}</span>
				</el-form-item>
				<el-form-item label="名称：" prop="name">
					<span>{{editForm.name}}</span>
				</el-form-item>
				<el-form-item label="手机：" prop="phone">
					<span>{{editForm.phone}}</span>
				</el-form-item>
				<el-form-item :label="labelText" prop="money">
					<el-input v-model="editForm.money"></el-input>
				</el-form-item>
				<el-form-item label="备注：">
					<el-input v-model="editForm.remark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeEditModal">取 消</el-button>
				<el-button type="primary" @click="editSubmit(1)" v-show="doType=='add'" :loading="btnLoading">提 交
				</el-button>
				<el-button type="primary" @click="editSubmit(0)" v-show="doType=='edit'" :loading="btnLoading">提 交
				</el-button>
			</div>
		</el-dialog>

		<!-- 余额信息 -->
		<el-dialog v-dialogDrag :title="title" width="80%" :visible.sync="balanceModal" :close-on-click-modal="false"
			:before-close="closeBalanceModal">
			<!--工具条-->
			<el-col :span="24" class="toolbar" style="padding-bottom: 0;">
				<el-form :inline="true" :model="searchForm2" size="small">
					<el-form-item label="搜索内容">
						<el-input v-model="searchForm2.searchWords" placeholder="请输入流水号/备注信息"></el-input>
					</el-form-item>
					<el-form-item label="交易类型">
						<el-select v-model="searchForm2.state" placeholder="请选择类型">
							<el-option :value="0" label="全部"></el-option>
							<el-option :value="1" label="收入"></el-option>
							<el-option :value="2" label="支出"></el-option>
							<el-option :value="3" label="退单返本"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="searchBalanceData">查询</el-button>
						<el-button @click="resetSearch2">重置</el-button>
					</el-form-item>
				</el-form>
			</el-col>

			<el-table border :data="tableData2" id="exportTable2" style="width: 100%"
				:header-cell-style="{background:'#fafafa'}" ref="table2">
				<el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
				<el-table-column prop="BusinessNumber" label="流水号" align="center" width="200"></el-table-column>
				<el-table-column prop="PaymentState" label="交易类型" align="center" width="250">
					<template slot-scope="scope">
						<span v-if="scope.row.PaymentState==1" class="success">收入</span>
						<span v-if="scope.row.PaymentState==2" class="danger">支出</span>
						<span v-if="scope.row.PaymentState==3" class="warning">退单返本</span>
					</template>
				</el-table-column>
				<el-table-column prop="TransactionAmount" class="danger" label="金额" align="center" width="250">
					<template slot-scope="scope">
						<span v-if="scope.row.PaymentState==1" class="success">{{scope.row.TransactionAmount}}</span>
						<span v-if="scope.row.PaymentState==2" class="danger">{{scope.row.TransactionAmount}}</span>
						<span v-if="scope.row.PaymentState==3" class="warning">{{scope.row.TransactionAmount}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="TransactionTime" label="交易时间" align="center" width="300"></el-table-column>
				<el-table-column prop="Remarks" label="备注">
					<template slot-scope="scope">
						<span>{{scope.row.Remarks}}</span>
						<div v-if="scope.row.CbrRemarks" class="danger fz12">{{scope.row.CbrRemarks}}</div>
					</template>
				</el-table-column>
			</el-table>

			<!--工具条-->
			<el-col :span="24" class="toolbar">
				<div style="float: left;margin-top: 5px;">
					<span>余额：<span class="primary">{{allNow}}</span></span>
					<span class="ml30">总收入：<span class="success">{{allIn}}</span></span>
					<span class="ml30">总支出：<span class="danger">{{allOut}}</span></span>
				</div>
				<el-pagination style="float: right;" @size-change="handleSizeChange2"
					@current-change="handleCurrentChange2" :current-page="pageIndex2" :page-sizes="[10, 20, 50, 100]"
					:page-size="pageSize2" layout="total, sizes, prev, pager, next, jumper" :total="total2">
				</el-pagination>
			</el-col>

			<div slot="footer" class="dialog-footer">
				<el-button @click="closeBalanceModal">关 闭</el-button>
			</div>
		</el-dialog>

		<!-- 重新分配所属用户（用户列表） -->
		<el-dialog v-dialogDrag title="用户列表" :visible.sync="userModal" :close-on-click-modal="false">
			<el-table border :data="tableData3" id="exportTable3" style="width: 100%"
				:header-cell-style="{background:'#fafafa'}" @row-click="rowClick3" ref="table3">
				<el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
				<el-table-column prop="Name" label="姓名" align="center"></el-table-column>
				<el-table-column prop="LoginName" label="账号" align="center"></el-table-column>
				<el-table-column prop="RoleName" label="角色" align="center"></el-table-column>
				<el-table-column prop="Code" label="推荐码" align="center"></el-table-column>
			</el-table>
			<div slot="footer" class="dialog-footer">
				<el-button @click="userModal=false">关 闭</el-button>
			</div>
		</el-dialog>
		</div>
	</section>
</template>

<script>
	import FileSaver from 'file-saver'
	import XLSX from 'xlsx'

	import {
		customerList,
		customerState,
		customerRecharge,
		customerBalance,
		phoneCode,
		phoneCodeCheck,
		userList,
		roleList,
		customerBindUser
	} from '@/api/api'
	export default {
		name: 'customer',
		data() {
			return {
				title: '',
				pageIndex: 1,
				pageSize: 10,
				total: 0,
				doType: '',
				disabled: true, //单项禁用
				disabledMore: true, //多项禁用
				editModal: false, //充值扣款弹窗
				listLoading: false,
				btnLoading: false,
				tableData: [],
				checkBoxData: [], //选中数据
				searchForm: {
					searchWords: ''
				},
				editForm: {
					code: '',
					name: '',
					phone: '',
					money: '',
					remark: ''
				},
				labelText: '', //充值||提现文字
				balanceModal: false, //余额信息弹窗
				tableData2: [],
				customerId: '', //记录进入余额信息时的客户id
				searchForm2: {
					searchWords: '',
					state: 0
				},
				pageIndex2: 1,
				pageSize2: 10,
				total2: 0,
				allNow: 0, //现余额
				allIn: 0, //总收入
				allOut: 0, //总支出
				searchRules: {
					searchWords: [{
						pattern: /^[0-9]*$/,
						message: '只能输入数字',
						trigger: 'blur'
					}]
				},
				Rules: {
					money: [{
							required: true,
							message: '请输入金额',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
							message: '金额格式不正确',
							trigger: ['blur']
						}
					]
				},
				btnShow1: false, //有效失效按钮是否显示
				btnShow2: false, //充值扣款按钮是否显示
				btnShow3: false, //重新分配所属用户按钮是否显示
				userModal: false, //用户信息弹窗
				tableData3: [],
				showPswd: false //列表显示客户密码
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

				// 根据角色判断客户列表上显示哪些按钮
				let roleId = sessionStorage.getItem('roleId')
				let x = roleId.indexOf(1) //管理员
				let y = roleId.indexOf(2) //子管理员
				let z = roleId.indexOf(3) //财务
				//判断如果有管理员权限则显示有效无效和重新分配所属用户按钮
				if (x >= 0) {
					_this.btnShow1 = true
					_this.btnShow3 = true
					_this.showPswd = true
				}
				//判断如果有子管理员权限则显示有效无效按钮
				if (y >= 0) {
					_this.btnShow1 = true
				}
				//判断如果有财务权限则显示充值扣款按钮
				if (z >= 0) {
					_this.btnShow2 = true
				}

				let params = {
					keyWord: _this.searchForm.searchWords,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize,
				}
				customerList(params).then(res => {
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

			// 充值弹框
			rechargeModalShow() {
				let _this = this
				//判断是否通过过手机验证
				let code = sessionStorage.getItem('code')
				if (code == 'pass') {
					_this.editModal = true
					_this.title = '客户充值'
					_this.labelText = '充值金额：'
					_this.doType = 'add'
					let data = _this.checkBoxData[0]
					_this.editForm = {
						name: data.Name,
						code: data.Id,
						phone: data.Phone
					}
				} else {
					_this.getPhoneCode()
				}
			},

			// 扣款弹框
			deductionModalShow() {
				let _this = this
				//判断是否通过过手机验证
				let code = sessionStorage.getItem('code')
				if (code == 'pass') {
					_this.editModal = true
					_this.title = '客户扣款'
					_this.labelText = '扣款金额：'
					_this.doType = 'edit'
					let data = _this.checkBoxData[0]
					_this.editForm = {
						code: data.Id,
						name: data.Name,
						phone: data.Phone
					}
				} else {
					_this.getPhoneCode()
				}
			},

			// 充值||扣款
			editSubmit(val) {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let type = ''
						if (val == 1) {
							type = 1
						}
						if (val == 0) {
							type = 0
						}
						let params = {
							Id: _this.checkBoxData[0].Id,
							Accountbalance: _this.editForm.money,
							State: type,
							CbrRemarks: _this.editForm.remark ? _this.editForm.remark : ''
						}
						customerRecharge(params).then(res => {
							_this.btnLoading = false
							_this.closeEditModal()
							_this.getAllData()
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
			},

			//更改状态
			changeState(val) {
				let _this = this
				let params = {
					Id: _this.checkBoxData[0].Id,
					State: val
				}
				customerState(params).then((res) => {
					_this.getAllData()
				}).catch(() => {})
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
					_this.disabled = false
					_this.disabledMore = false
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
					searchWords: ''
				}
				_this.pageIndex = 1
				_this.getAllData()
			},

			//关闭充值扣款弹窗
			closeEditModal() {
				let _this = this
				_this.editModal = false
				_this.$refs['editForm'].resetFields()
				_this.editForm = {
					code: '',
					name: '',
					phone: '',
					money: '',
					remark: ''
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
			},

			// 余额信息弹框
			balanceModalShow(index, row) {
				let _this = this
				_this.title = '客户【' + row.Id + '】余额信息'
				_this.customerId = row.Id
				_this.getBalanceData()
			},

			// 获取余额信息列表数据
			getBalanceData() {
				let _this = this
				let params = {
					userId: _this.customerId,
					keyWord: _this.searchForm2.searchWords,
					state: _this.searchForm2.state,
					pageIndex: _this.pageIndex2,
					pageSize: _this.pageSize2,
				}
				customerBalance(params).then(res => {
					_this.balanceModal = true //打开模态框
					_this.tableData2 = res.Entity
					_this.total2 = Number(res.TotalCount)
					_this.allNow = res.Entity[0].AccountBalance
					_this.allIn = res.Entity[0].AccumulatedIncone
					_this.allOut = res.Entity[0].AccumulatedExpenditure
				}).catch((e) => {})
			},

			//余额信息查询
			searchBalanceData() {
				let _this = this
				_this.pageIndex2 = 1 //页码归1
				_this.getBalanceData()
			},

			// 余额信息查询重置
			resetSearch2() {
				let _this = this
				_this.searchForm2 = {
					searchWords: '',
					state: 0
				}
				_this.pageIndex2 = 1
				_this.getBalanceData()
			},

			//余额信息弹窗关闭
			closeBalanceModal() {
				let _this = this
				_this.balanceModal = false
				_this.searchForm2 = {
					searchWords: '',
					state: 0
				}
				_this.tableData2 = []
				_this.pageIndex2 = 1
				_this.pageSize2 = 10
				_this.allNow = 0
				_this.allIn = 0
				_this.allOut = 0
			},

			//余额信息翻页
			handleSizeChange2(val) {
				let _this = this
				_this.pageSize2 = val
				_this.getBalanceData()
			},
			handleCurrentChange2(val) {
				let _this = this
				_this.pageIndex2 = val
				_this.getBalanceData()
			},

			//打开分配人员弹窗
			userModalShow() {
				let _this = this
				_this.getUserData()
			},

			//获取操作员列表
			getUserData() {
				let _this = this
				let params = {
					name: '',
					pageIndex: 1,
					pageSize: 100000000,
				}
				userList(params).then(res => {
					let arr = []
					for (let x in res.Entity) {
						let state = res.Entity[x].State
						//如果用户状态为有效
						if (state == 1) {
							arr.push(res.Entity[x])
						}
					}
					_this.tableData3 = arr
					_this.userModal = true //获取数据后显示模态框
				}).catch((e) => {})
			},

			//人员选中行绑定人员
			rowClick3(val) {
				let _this = this
				_this.$refs.table3.clearSelection()
				_this.$refs.table3.toggleRowSelection(val, true)
				let customerId = _this.checkBoxData[0].Id //客户列表选中的客户id
				let userId = val.Id //人员表选中的人员id
				_this.$confirm('确认要将客户 ' + customerId + ' 分配给【' + val.Name + '】吗？', '信息提示', {
					type: 'warning'
				}).then(() => {
					let params = {
						customerId: customerId,
						userId: userId
					}
					customerBindUser(params).then((res) => {
						_this.userModal = false
						_this.getAllData()
					})
				}).catch(() => {})
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
					}), '客户信息.xlsx')
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
