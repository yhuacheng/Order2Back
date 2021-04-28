<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm" size="small">
				<el-form-item label="推荐码">
					<el-input v-model="searchForm.searchWords" placeholder="请输入推荐码"></el-input>
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="searchForm.state" placeholder="请选择状态">
						<el-option value="-1" label="全部"></el-option>
						<el-option value="1" label="有效"></el-option>
						<el-option value="0" label="无效"></el-option>
					</el-select>
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
			<el-table-column prop="RecommentNumber" label="推荐码" align="center"></el-table-column>
			<el-table-column prop="Name" label="姓名" align="center"></el-table-column>
			<el-table-column prop="State" label="状态" align="center">
				<template slot-scope="scope">
					<span v-if="scope.row.State==1" class="success">有效</span>
					<span v-if="scope.row.State==0" class="danger">无效</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" width="200">
				<template v-slot="scope">
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

	</section>
</template>

<script>
	import {
		codeList,
		codeAdd,
		codeState
	} from '@/api/api';
	export default {
		name: 'codes',
		data() {
			return {
				title: '',
				pageIndex: 1,
				pageSize: 10,
				total: 0,
				doType: '',
				editModal: false,
				tableData: [],
				listLoading: false,
				btnLoading: false,
				searchForm: {
					searchWords: '',
					state: '-1'
				},
				editForm: {
					count: ''
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
					state: _this.searchForm.state,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize,
				}
				codeList(params).then(res => {
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

			//新增推荐码弹窗
			handleAdd() {
				let _this = this
				_this.$prompt('请输入要生成的推荐码个数', '信息提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputPattern: /^([1-9]|10)$/,
					inputErrorMessage: '数量必须为大于0且小于等于10的整数'
				}).then(({
					value
				}) => {
					_this.addSubmit(value)
				}).catch(() => {})
			},

			//新增推荐码
			addSubmit(val) {
				let _this = this
				let params = {
					Number: val,
					Id: 1
				}
				codeAdd(params).then((res) => {
					_this.getAllData()
				}).catch((e) => {})
			},

			//更改状态
			changeState(index, row, val) {
				let _this = this
				let params = {
					Id: row.Id,
					State: val
				}
				codeState(params).then((res) => {
					_this.getAllData()
				}).catch(() => {})
			},

			// 重置
			resetSearch() {
				let _this = this
				_this.searchForm = {
					searchWords: '',
					state: '-1'
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
