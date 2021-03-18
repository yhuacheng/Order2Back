<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm" size="mini">
				<el-form-item label="PP账号">
					<el-input v-model="searchForm.searchWords" placeholder="请输入PP账号"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button @click="searchData">查询</el-button>
					<el-button @click="resetSearch">重置</el-button>
					<el-button type="primary" @click="handleAdd">新增</el-button>
					<el-button type="warning" @click="drModal=true">导入黑名单</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<el-table border :data="tableData" v-loading="listLoading" id="exportTable" style="width: 100%"
			:header-cell-style="{background:'#fafafa'}" ref="table">
			<el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
			<el-table-column prop="Number" label="黑名单PP账号" align="center"></el-table-column>
			<el-table-column label="操作" align="center" width="200">
				<template v-slot="scope">
					<el-button size="mini" type="danger" @click.stop="delData(scope.$index, scope.row)">删除</el-button>
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

		<!-- 导入 -->
		<el-dialog title="【黑名单】文件导入" :visible.sync="drModal" :close-on-click-modal="false" :before-close="closeDrModal"
			width="30%">
			<el-form ref="drForm" class="txt-c">
				<el-link style="margin-bottom: 20px;" type="primary" :underline="false" href="/template/黑名单导入模板.xlsx">
					<el-button size="mini" type="primary">下载黑名单导入的Excel模板</el-button>
				</el-link>
				<el-upload ref="upload" :limit="1" drag action="/api/Order/ImportExcel" multiple
					:on-success="handleAvatarSuccess" :on-error="handleError" :before-upload="beforeAvatarUpload"
					accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
					<i class="el-icon-upload"></i>
					<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em>
						<p class="danger">只能上传规范的Excel文件</p><br>
					</div>
				</el-upload>
			</el-form>
		</el-dialog>

	</section>
</template>

<script>
	import {
		blackList,
		blackAdd,
		blackDelete
	} from '@/api/api';
	export default {
		name: 'black',
		data() {
			return {
				title: '',
				pageIndex: 1,
				pageSize: 10,
				total: 0,
				drModal: false,
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
			//获取数据
			getAllData() {
				let _this = this
				_this.listLoading = true
				let params = {
					number: _this.searchForm.searchWords,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize
				}

				_this.listLoading = false
				_this.tableData = [{
					"ID": 1,
					"Number": 456465465465
				}, {
					"ID": 2,
					"Number": 13246546548
				}]

				// blackList(params).then(res => {
				// 	_this.listLoading = false
				// 	_this.tableData = res.Entity
				// 	_this.total = Number(res.TotalCount)
				// }).catch((e) => {})
			},

			//新增黑名单弹窗
			handleAdd() {
				let _this = this
				_this.$prompt('请输入要拉黑的PP号', '信息提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputPattern: /^\S.*\S$|(^\S{0,1}\S$)/,
					inputErrorMessage: 'PP号不能为空且首尾不能有空格'
				}).then(({
					value
				}) => {
					_this.addSubmit(value)
				}).catch(() => {})
			},

			//新增黑名单
			addSubmit(val) {
				let _this = this
				let params = {
					Number: val,
				}
				blackAdd(params).then((res) => {
					_this.getAllData()
				}).catch((e) => {})
			},

			// 删除黑名单
			delData(index, row) {
				let _this = this
				var ids = row.Id
				_this.$confirm('确认删除黑名单【' + row.Name + '】吗？', '信息提示', {
					type: 'warning'
				}).then(() => {
					let params = {
						Id: ids
					}
					blackDelete(params).then((res) => {
						_this.getAllData()
					})
				}).catch(() => {})
			},

			// 文件上传
			handleAvatarSuccess(res, file) {
				if (res.IsSuccess) {
					this.$message.success('文件导入成功！')
					this.getData()
				} else {
					this.$message.error('文件导入失败！')
				}
			},
			handleError(res) {
				this.$message.error('文件导入失败！')
			},
			beforeAvatarUpload(file) {
				const isXLS = file.type === 'application/vnd.ms-excel';
				const isSLSX = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
				if (!isXLS && !isSLSX) {
					this.$message.error('上传的文件必须为Excel');
				}
				return (isXLS || isSLSX)
			},

			//关闭文件上传框
			closeDrModal() {
				let _this = this
				_this.drModal = false
				_this.$refs.upload.clearFiles()
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
			}

		}
	}
</script>
