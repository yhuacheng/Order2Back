<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;position: relative;">
			<el-form :inline="true" :model="searchForm" size="small">
				<el-form-item label="搜索内容">
					<el-input @keyup.native="searchToTrim" @keyup.enter.native="searchData"
						v-model="searchForm.searchWords" placeholder="任务号/Asin/店铺/操作员/外派员/客户号/购买单号/PP号"
						style="width: 350px;"></el-input>
				</el-form-item>
				<el-form-item label="填单时间">
					<el-date-picker v-model="searchForm.time" :unlink-panels='true' type="datetimerange"
						range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间"
						value-format="yyyy-MM-dd HH:mm:ss" style="width: 350px;"></el-date-picker>
				</el-form-item>
				<el-form-item label="上评时间">
					<el-date-picker v-model="searchForm.timeSP" :unlink-panels='true' type="datetimerange"
						range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间"
						value-format="yyyy-MM-dd HH:mm:ss" style="width: 350px;"></el-date-picker>
				</el-form-item>
				<el-form-item label="返款时间">
					<el-date-picker v-model="searchForm.timeFK" :unlink-panels='true' type="datetimerange"
						range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间"
						value-format="yyyy-MM-dd HH:mm:ss" style="width: 350px;"></el-date-picker>
				</el-form-item>
				<el-form-item label="任务类型">
					<el-select v-model="searchForm.serveType" placeholder="请选择" style="width: 150px;">
						<el-option value="0" label="全部"></el-option>
						<el-option value="1" label="评后返（代返）"></el-option>
						<el-option value="2" label="评后返（自返）"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="国家">
					<el-select v-model="searchForm.country" placeholder="请选择国家" style="width: 150px;">
						<el-option value="0" label="全部"></el-option>
						<el-option v-for="item in countryData" :key="item.Id" :label="item.CountryName"
							:value="item.Id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="内单外单">
					<el-select v-model="searchForm.types" placeholder="请选择" style="width: 136px;">
						<el-option value="0" label="全部"></el-option>
						<el-option value="1" label="内单"></el-option>
						<el-option value="2" label="外单"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="是否超时">
					<el-select v-model="searchForm.type" placeholder="请选择" style="width: 136px;">
						<el-option value="0" label="全部"></el-option>
						<el-option value="1" label="正常"></el-option>
						<el-option value="-1" label="超时"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="是否追加">
					<el-select v-model="searchForm.again" placeholder="请选择" style="width: 136px;">
						<el-option value="0" label="全部"></el-option>
						<el-option value="1" label="追加"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="是否重复">
					<el-select v-model="searchForm.repeat" placeholder="请选择" style="width: 136px;">
						<el-option value="0" label="全部"></el-option>
						<el-option value="-1" label="正常"></el-option>
						<el-option value="1" label="重复"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="评价类型">
					<el-select v-model="searchForm.commentType" placeholder="请选择" style="width: 136px;">
						<el-option value="-1" label="全部"></el-option>
						<el-option value="0" label="正常"></el-option>
						<el-option v-for="item in serviceOtherData" :key="item.Id" :label="item.ServiceName"
							:value="item.Id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="本佣付款" v-if="In">
					<el-select v-model="searchForm.payState" placeholder="请选择" style="width: 136px;">
						<el-option value="0" label="全部"></el-option>
						<el-option value="1" label="本佣均已付"></el-option>
						<el-option value="2" label="本佣均未付"></el-option>
						<el-option value="3" label="付本未付佣"></el-option>
						<el-option value="4" label="付佣未付本"></el-option>
					</el-select>
				</el-form-item>
				<div class="txt-c" style="width: 100px;position: absolute;right: 0;top: 10px;">
					<el-form-item>
						<el-button type="primary" @click="searchData(0)">查询</el-button>
					</el-form-item>
					<el-form-item>
						<el-button @click="resetSearch">重置</el-button>
					</el-form-item>
				</div>
			</el-form>
		</el-col>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="primary" size="mini" v-if="menuBtnShow" :disabled="disabledEditFee" @click="editModalShow">
				修改【服务商】服务费和汇率</el-button>
			<el-button type="danger" size="mini" v-if="menuBtnShow" :disabled="disabledOut" @click="userModalShow(1)">外派
			</el-button>
			<el-button type="success" size="mini" v-if="menuBtnShow" :disabled="disabled" @click="TaskAgainShow">追加任务
			</el-button>
			<el-button type="danger" size="mini" v-if="btnShow3" :disabled="disabledEditFee" @click="userModalShow(2)">
				转派</el-button>
			<el-button type="primary" size="mini" v-if="CWbtnShow" :disabled="disabled" @click="payModalShow">本佣付款
			</el-button>
			<el-button
				v-if="(btnShow && searchForm.state!=0 && searchForm.state!=6 && searchForm.state!=7) || (btnShow4 && searchForm.state==8)"
				type="danger" size="mini" @click="changeStateMore" :disabled="disabledMore">批量取消</el-button>
			<el-button type="warning" size="mini" v-if="menuBtnShow||CWbtnShow" @click="exportExcel">导出</el-button>
			<div class="tagMenu">
				<el-badge :value="all" type="success" class="item">
					<el-button size="mini" @click='searchStateData(0)' :class="{'active':searchForm.state==0}">全部
					</el-button>
				</el-badge>
				<el-badge :value="dfp" type="info" class="item">
					<el-button size="mini" @click='searchStateData(1)' :class="{'active':searchForm.state==1}">待分配
					</el-button>
				</el-badge>
				<el-badge :value="dgm" type="warning" class="item">
					<el-button size="mini" @click='searchStateData(2)' :class="{'active':searchForm.state==2}">待购买
					</el-button>
				</el-badge>
				<el-badge :value="dqrcd" type="primary" class="item">
					<el-button size="mini" @click='searchStateData(3)' :class="{'active':searchForm.state==3}">待确认出单
					</el-button>
				</el-badge>
				<el-badge :value="dpj" type="warning" class="item">
					<el-button size="mini" @click='searchStateData(4)' :class="{'active':searchForm.state==4}">待评价
					</el-button>
				</el-badge>
				<el-badge :value="dqrpj" type="primary" class="item">
					<el-button size="mini" @click='searchStateData(5)' :class="{'active':searchForm.state==5}">待确认评价
					</el-button>
				</el-badge>
				<el-badge :value="ywc" type="success" class="item">
					<el-button size="mini" @click='searchStateData(6)' :class="{'active':searchForm.state==6}">已完成
					</el-button>
				</el-badge>
				<el-badge :value="yqx" type="danger" class="item">
					<el-button size="mini" @click='searchStateData(7)' :class="{'active':searchForm.state==7}">已取消
					</el-button>
				</el-badge>
				<el-badge :value="error" type="warning">
					<el-button size="mini" @click='searchStateData(8)' :class="{'active':searchForm.state==8}">异常
					</el-button>
				</el-badge>
			</div>
		</el-col>

		<!-- 列表 -->
		<pl-table border :data="tableData" v-loading="listLoading" id="exportTable" style="width: 100%;"
			:header-cell-style="{background:'#fafafa'}" @selection-change="handleSelectionChange" @row-click="rowClick"
			ref="table" use-virtual height="854" :row-height="80">
			<pl-table-column type="selection" align="center"></pl-table-column>
			<pl-table-column type="index" label="序号" align="center" width="50"></pl-table-column>
			<!-- 展开栏开始 -->
			<pl-table-column type="expand" label="展开" width="50">
				<template slot-scope="props">
					<el-card class="box-card">
						<table class="view-more">
							<tr v-if="In">
								<td>服务费</td>
								<td>{{props.row.OrderUnitPriceSerCharge}}</td>
								<td>汇率</td>
								<td>{{props.row.OrderExchangeRate}}</td>
								<td>总额</td>
								<td>{{props.row.Total}}</td>
								<td>改后服务费</td>
								<td>{{props.row.TaskUnitPriceSerCharge}}</td>
								<td>改后汇率</td>
								<td>{{props.row.TaskExchangeRate}}</td>
								<td>改后总额</td>
								<td>{{props.row.NewTaskTotal}}</td>
								<td>差额</td>
								<td>{{props.row.DifferenceTotal}}</td>
							</tr>
							<tr v-if="!In">
								<td>服务费</td>
								<td colspan="5">{{props.row.TaskUnitPriceSerCharge}}</td>
								<td>汇率</td>
								<td colspan="3">{{props.row.TaskExchangeRate}}</td>
								<td>总额</td>
								<td colspan="3">{{props.row.NewTaskTotal}}</td>
							</tr>
							<tr>
								<td>增值费</td>
								<td>{{props.row.OrderAddedFee}}</td>
								<td>购买时间</td>
								<td>{{props.row.BuyTime}}</td>
								<td>购买价格</td>
								<td>{{props.row.AmazonProductPrice}}</td>
								<td>返款时间</td>
								<td>{{props.row.DealTime}}</td>
								<td>返款金额</td>
								<td>{{props.row.DealMoeny}}</td>
								<td>上评时间</td>
								<td>{{props.row.EvaluateTime}}</td>
								<td>PP账号</td>
								<td>{{props.row.PayAccount}}</td>
							</tr>
							<tr>
								<td>订单备注</td>
								<td colspan="7">{{props.row.OrderRemarks}}</td>
								<td>客户备注</td>
								<td colspan="5">{{props.row.Remarks}}</td>
							</tr>
						</table>
					</el-card>
				</template>
			</pl-table-column>
			<!-- 展开栏结束 -->
			<pl-table-column prop="OrderNumbers" sortable label="任务编号" align="center" width="160">
				<template slot-scope="scope">
					<i class="el-icon-document-copy" @click.stop="copy(scope.$index,scope.row)"></i>
					<el-link type="primary" :underline="false" @click.stop="viewModalShow(scope.$index,scope.row)">
						{{scope.row.OrderNumbers}}
					</el-link>
					<div>
						<span v-if="scope.row.AgainTaskState==1"><span class="danger fz10"> 追加 </span></span>
						<span v-if="scope.row.NoComment">
							<span class="danger fz10"> {{scope.row.ServiceName}}</span>
						</span>
						<span v-if="scope.row.Overtime<0"><span class="danger fz10"> 超时 </span></span>
						<span v-if="scope.row.Repeat==1"><span class="danger fz10"> 重复 </span></span>
					</div>
				</template>
			</pl-table-column>
			<pl-table-column prop="OrderProductPictures" label="产品图" align="center" width="70px">
				<template slot-scope="scope">
					<el-image style="width: 40px;height: 40px;" v-if="scope.row.OrderProductPictures"
						:src="$IMG_URL+scope.row.OrderProductPictures"
						@click.stop="showImage(scope.$index,scope.row,1)">
					</el-image>
				</template>
			</pl-table-column>
			<pl-table-column prop="ServiceType" label="任务类型" align="center" width="105">
				<template slot-scope="scope">
					<span v-if="scope.row.ServiceType==1">评后返(代返)</span>
					<span v-if="scope.row.ServiceType==2">评后返(自返)</span>
				</template>
			</pl-table-column>
			<pl-table-column prop="CountryName" label="国家" align="center"></pl-table-column>
			<pl-table-column prop="Asin" label="ASIN" align="center" width="120"></pl-table-column>
			<pl-table-column prop="ProductName" label="产品名称" align="center" :show-overflow-tooltip='true'>
			</pl-table-column>
			<pl-table-column prop="OrderShopName" label="店铺" align="center" :show-overflow-tooltip='true'>
			</pl-table-column>
			<pl-table-column prop="CustomerUserId" label="客户编码" align="center"></pl-table-column>
			<pl-table-column prop="PayPrincipal" label="付本" align="center">
				<template slot-scope="scope">
					<span class="danger">{{scope.row.PayPrincipal}}</span>
				</template>
			</pl-table-column>
			<pl-table-column prop="PayCommission" label="付佣" align="center">
				<template slot-scope="scope">
					<span class="danger">{{scope.row.PayCommission}}</span>
				</template>
			</pl-table-column>
			<pl-table-column prop="Name" label="操作员" align="center"></pl-table-column>
			<pl-table-column prop="Name1" label="外派员" align="center" :show-overflow-tooltip='true'>
				<template slot-scope="scope">
					<span>{{scope.row.Name1}}</span>
					<span v-if="scope.row.Name1 && scope.row.BuyRemarks"> / </span>
					<span>{{scope.row.BuyRemarks}}</span>
				</template>
			</pl-table-column>
			<pl-table-column prop="AmazonNumber" label="购买单号" align="center" width="140"></pl-table-column>
			<pl-table-column prop="AddTime" label="填单时间" align="center" width="145" :sortable="true"
				:sort-method="sortByAddTime"></pl-table-column>
			<pl-table-column prop="DealIamge" label="返款截图" align="center">
				<template slot-scope="scope">
					<el-image style="width: 40px;height: 40px;" v-if="scope.row.DealIamge"
						:src="$IMG_URL+scope.row.DealIamge" @click.stop="showImage(scope.$index,scope.row,2)">
					</el-image>
				</template>
			</pl-table-column>
			<pl-table-column prop="TaskState" label="状态" align="center" width="92">
				<template slot-scope="scope">
					<span v-if="scope.row.TaskState==1">待分配</span>
					<span v-if="scope.row.TaskState==2" class="warning">待购买</span>
					<span v-if="scope.row.TaskState==3" class="primary">待确认出单</span>
					<span v-if="scope.row.TaskState==4" class="warning">待评价</span>
					<span v-if="scope.row.TaskState==5" class="primary">待确认评价</span>
					<span v-if="scope.row.TaskState==6" class="success">已完成</span>
					<span v-if="scope.row.TaskState==7" class="danger">已取消</span>
					<span v-if="scope.row.TaskState==8" class="warning">异常</span>
				</template>
			</pl-table-column>
			<pl-table-column v-if="tableBtnShow" prop="TaskState" label="操作" align="center" width="100">
				<template slot-scope="scope">
					<el-button size="mini" type="primary"
						v-if="btnShow2 && (scope.row.TaskState==2 || scope.row.TaskState==8)"
						@click.stop="buyModalShow(scope.$index,scope.row)">购买</el-button>
					<el-button size="mini" type="warning"
						v-if="btnShow2 && (scope.row.TaskState==4 || scope.row.TaskState==5)"
						@click.stop="commentModalShow(scope.$index,scope.row)">评价</el-button>
					<el-button size="mini" type="danger"
						v-if="(btnShow && scope.row.TaskState!=6 && scope.row.TaskState!=7) || (btnShow4 && scope.row.TaskState==8)"
						@click.stop="changeState(scope.$index,scope.row)">取消</el-button>
				</template>
			</pl-table-column>
		</pl-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination style="float: right;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
				:current-page="pageIndex" :page-sizes="[10, 20, 50, 100, 1000, 10000]" :page-size="10"
				layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</el-col>

		<!-- 确认购买 -->
		<el-dialog v-dialogDrag :title="title" :visible.sync="buyModal" :close-on-click-modal="false"
			:before-close="closeBuyModal">
			<el-form :model='taskFormView' ref='taskFormView' label-width='120px'>
				<p class="info-title">任务信息</p>
				<el-row>
					<el-col :span="12">
						<el-form-item label='任务编号：' prop="OrderNumbers">
							<span>{{taskFormView.OrderNumbers}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='任务类型：' prop="ServiceType">
							<span v-show="taskFormView.ServiceType==1">评后返（代返）</span>
							<span v-show="taskFormView.ServiceType==2">评后返（自返）</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='国家：' prop="CountryName">
							<span>{{taskFormView.CountryName}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='产品价格：' prop="ProductPrice">
							<span>{{symbol}}</span><span>{{taskFormView.ProductPrice}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label='产品ASIN：' prop="Asin">
							<span>{{taskFormView.Asin}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label='产品名称：' prop="ProductName">
							<span>{{taskFormView.ProductName}}</span>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<el-form :model='buyForm' ref='buyForm' :rules='Rules' label-width='120px' status-icon>
				<p class="info-title">购买信息</p>
				<el-form-item label='返款账号' prop="PayAccount">
					<el-input @keyup.native="toTrim(1)" @blur="checkBlack(1)" v-model='buyForm.PayAccount'
						ref="PayAccount"></el-input>
				</el-form-item>
				<el-form-item label='购买时间' prop="BuyingTime">
					<el-date-picker v-model="buyForm.BuyingTime" type="datetime" style="width: 100%"></el-date-picker>
				</el-form-item>
				<el-form-item label='购买单号' prop="AmazonNumber">
					<el-input v-model='buyForm.AmazonNumber'></el-input>
				</el-form-item>
				<el-form-item label='购买截图' prop="image">
					<el-upload class="avatar-uploader" name="Image" action="/api/Payment/GetProductPictures"
						:headers="headers" :show-file-list="false" :on-success="handleAvatarSuccessBuy"
						:on-error="handleError" :before-upload="beforeAvatarUpload"
						accept="image/jpeg,image/png,image/gif,image/bmp">
						<img v-if="imageUrl" :src="imageUrl" class="avatar">
						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
					<el-input v-show="false" v-model='buyForm.Image'></el-input>
				</el-form-item>
				<el-form-item label='购买备注' prop="Remarks">
					<el-input v-model="buyForm.BuyRemarks"></el-input>
				</el-form-item>
				<el-form-item label='购买价格' prop="AmazonProductPrice">
					<el-input v-model='buyForm.AmazonProductPrice'>
						<template slot="prepend">{{symbol}}</template>
					</el-input>
				</el-form-item>
				<div v-if="taskFormView.ServiceType==1">
					<el-form-item label='运费' prop="Freight">
						<el-input v-model='buyForm.Freight'>
							<template slot="prepend">{{symbol}}</template>
						</el-input>
					</el-form-item>
					<el-form-item label='税费' prop="Taxation">
						<el-input v-model='buyForm.Taxation'>
							<template slot="prepend">{{symbol}}</template>
						</el-input>
					</el-form-item>
					<el-form-item label='其他' prop="Other">
						<el-input v-model='buyForm.Other'>
							<template slot="prepend">{{symbol}}</template>
						</el-input>
					</el-form-item>
					<el-form-item label='官方手续费率'>
						<el-input v-model='handFee' :disabled="true">
							<template slot="prepend">{{symbol}}</template>
						</el-input>
					</el-form-item>
					<el-form-item label='固定手续费用'>
						<el-input v-model='handMoney' :disabled="true">
							<template slot="prepend">{{symbol}}</template>
						</el-input>
					</el-form-item>
					<el-form-item label='汇率'>
						<el-input v-model='rate' :disabled="true">
							<template slot="prepend">{{symbol}}</template>
						</el-input>
					</el-form-item>
					<el-form-item label='总额' class="disabled-font-color">
						<el-input v-model='totalValue' :disabled="true">
							<template slot="prepend" class="danger">￥</template>
						</el-input>
					</el-form-item>
				</div>
				<el-form-item label='增值费' class="disabled-font-color">
					<el-input v-model='addFee' :disabled="true">
						<template slot="prepend" class="danger">￥</template>
					</el-input>
				</el-form-item>
				<el-form-item label='服务费' class="disabled-font-color">
					<el-input v-model='serviceFei' :disabled="true">
						<template slot="prepend" class="danger">￥</template>
					</el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeBuyModal">取 消</el-button>
				<el-button type="primary" :loading="btnLoading" @click="buyCheckRepeat">确 定</el-button>
			</div>
		</el-dialog>
		<!-- 评价 -->
		<el-dialog v-dialogDrag :title="title" :visible.sync="commentModal" :close-on-click-modal="false"
			:before-close="closeCommentModal">
			<el-form :model='taskFormView' ref='taskFormView' label-width='120px'>
				<p class="info-title">任务信息</p>
				<el-row>
					<el-col :span="12">
						<el-form-item label='任务编号：' prop="OrderNumbers">
							<span>{{taskFormView.OrderNumbers}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='任务类型：' prop="ServiceType">
							<span v-show="taskFormView.ServiceType==1">评后返（代返）</span>
							<span v-show="taskFormView.ServiceType==2">评后返（自返）</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='国家：' prop="CountryName">
							<span>{{taskFormView.CountryName}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='产品价格：' prop="ProductPrice">
							<span>{{symbol}}</span><span>{{taskFormView.ProductPrice}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label='产品ASIN：' prop="Asin">
							<span>{{taskFormView.Asin}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label='产品名称：' prop="ProductName">
							<span>{{taskFormView.ProductName}}</span>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<el-form :model='commentForm' ref='commentForm' label-width='120px' status-icon>
				<p class="info-title">评价信息</p>
				<el-form-item label='返款账号' prop="PPaccount">
					<el-input @keyup.native="toTrim(2)" @blur="checkBlack(2)" v-model='commentForm.PPaccount'
						ref="PPaccount">
					</el-input>
				</el-form-item>
				<el-form-item label='评价链接' prop="Link">
					<el-input v-model='commentForm.Link'></el-input>
				</el-form-item>
				<el-form-item label='评价截图' prop="image">
					<el-upload class="avatar-uploader" name="Image" action="/api/Payment/GetProductPictures"
						:headers="headers" list-type="picture-card" :on-success="handleAvatarSuccess"
						:on-error="handleError" :before-upload="beforeAvatarUpload"
						accept="image/jpeg,image/png,image/gif,image/bmp" :on-preview="handlePictureCardPreview"
						:on-remove="handleRemove" :file-list="fileListArr" :limit="3">
						<i class="el-icon-plus"></i>
					</el-upload>
					<el-dialog v-dialogDrag title="评价截图大图预览" :visible.sync="dialogImg" :modal-append-to-body="false"
						:append-to-body="true">
						<div class="txt-c">
							<el-image max-width="90%" :src="imageUrl"></el-image>
						</div>
					</el-dialog>
					<el-input v-show="false" v-model='commentForm.Image'></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<span v-for="(item,i) in serviceOtherData" :key="i" style="float: left;">
					<el-button type="danger" @click="commentSubmit(item.Id)" class="mr15">{{item.ServiceName}}
					</el-button>
				</span>
				<el-button @click="closeCommentModal">取 消</el-button>
				<el-button type="primary" @click="commentSubmit(0)">确 定</el-button>
			</div>
		</el-dialog>
		<!-- 任务查看 -->
		<el-dialog v-dialogDrag width="70%" :title="title" :visible.sync="viewModal" :close-on-click-modal="false">
			<el-form :model='view' ref='view' label-width='150px'>
				<p class="info-title">任务信息</p>
				<el-row>
					<el-col :span="24">
						<el-form-item label='产品图：'>
							<el-image style="width: 80px" class="pointer" v-if="view.OrderProductPictures"
								:src="$IMG_URL+view.OrderProductPictures"
								:preview-src-list="($IMG_URL+view.OrderProductPictures || '').split(',')"></el-image>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label='产品链接：'>
							<el-link :href="view.OrderProductLink" target="_blank" type="primary" :underline="false">
								{{view.OrderProductLink}}
							</el-link>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="12">
						<el-form-item label='任务编号：'>
							<span>{{view.OrderNumbers}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='任务状态：'>
							<span v-if="view.TaskState==1">待分配</span>
							<span v-if="view.TaskState==2" class="warning">待购买</span>
							<span v-if="view.TaskState==3" class="primary">待确认出单</span>
							<span v-if="view.TaskState==4" class="warning">待评价</span>
							<span v-if="view.TaskState==5" class="primary">待确认评价</span>
							<span v-if="view.TaskState==6" class="success">已完成</span>
							<span v-if="view.TaskState==7" class="danger">已取消</span>
							<span v-if="view.TaskState==8" class="warning">异常</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='任务类型：'>
							<span v-if="view.ServiceType==1">评后返（代返）</span>
							<span v-if="view.ServiceType==2">评后返（自返）</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='国家：'>
							<span>{{view.CountryName}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label='产品名称：'>
							<span>{{view.ProductName}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='产品评分：'>
							<span>{{view.OrderProductScore}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='店铺名：'>
							<span>{{view.OrderShopName}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='产品ASIN：'>
							<span>{{view.Asin}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='产品价格：'>
							<span>{{symbol}}</span><span>{{view.ProductPrice}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='关键词类型：'>
							<span v-if="view.OrderKeyWordType==1">产品关键词</span>
							<span v-if="view.OrderKeyWordType==2">CPC关键词</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='关键词：'>
							<span>{{view.KeyWord}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='订单开始时间：'>
							<span>{{view.OrderStartTime}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='客户编码：'>
							<span>{{view.CustomerUserId}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label='订单备注：'>
							<span>{{view.OrderRemarks}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='任务执行时间：'>
							<span>{{view.ExecutionTime}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='操作员：'>
							<span>{{view.Name}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label='客户备注：'>
							<span>{{view.Remarks}}</span>
						</el-form-item>
					</el-col>
				</el-row>
				<p class="info-title">购买信息</p>
				<el-row>
					<el-col :span="12">
						<el-form-item label='购买单号：'>
							<span>{{view.AmazonNumber}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='购买时间：'>
							<span>{{view.BuyTime}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label='购买备注：'>
							<span>{{view.BuyRemarks}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='购买价格：'>
							<span
								v-show="view.AmazonProductPrice">{{symbol}}</span><span>{{view.AmazonProductPrice}}</span>
						</el-form-item>
					</el-col>
					<div v-show="view.ServiceType==1">
						<el-col :span="12">
							<el-form-item label='运费：'>
								<span v-show="view.Freight">{{symbol}}</span><span>{{view.Freight}}</span>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label='税费：'>
								<span v-show="view.Taxation">{{symbol}}</span><span>{{view.Taxation}}</span>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label='其他：'>
								<span v-show="view.Other">{{symbol}}</span><span>{{view.Other}}</span>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label='总额：'>
								<span v-show="view.Total">￥</span><span>{{view.Total}}</span>
							</el-form-item>
						</el-col>
					</div>
					<el-col :span="12">
						<el-form-item label='汇率：'>
							<span>{{view.OrderExchangeRate}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label='服务费：'>
							<span>￥</span> <span>{{view.OrderUnitPriceSerCharge}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label='购买截图：'>
							<el-image style="width: 80px" class="pointer" v-if="view.BuyImage" :src="view.BuyImage"
								:preview-src-list="(view.BuyImage || '').split(',')"></el-image>
						</el-form-item>
					</el-col>
				</el-row>
				<p class="info-title">评价信息</p>
				<el-row>
					<el-col :span="24">
						<el-form-item label='返款账号：'>
							<span>{{view.PayAccount}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label='评价链接：'>
							<span>{{view.ProductLink}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label='评价截图：'>
							<span v-for="(item,i) in (view.ProductImage || '').split(',')" :key="i" class="mr15">
								<el-image style="width: 80px" class="pointer" v-if="view.ProductImage" :src="item"
									:preview-src-list="(view.ProductImage || '').split(',')">
								</el-image>
							</span>
						</el-form-item>
					</el-col>
				</el-row>
				<div v-show="view.ServiceType==2">
					<p class="info-title">返款信息</p>
					<el-row>
						<el-col :span="24">
							<el-form-item label='返款时间：'>
								<span>{{view.DealTime}}</span>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label='返款截图：'>
								<el-image style="width: 80px" class="pointer" v-if="view.DealIamge"
									:src="$IMG_URL+view.DealIamge"
									:preview-src-list="($IMG_URL+view.DealIamge || '').split(',')">
								</el-image>
							</el-form-item>
						</el-col>
					</el-row>
				</div>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="viewModal=false">关 闭</el-button>
			</div>
		</el-dialog>
		<!--查看产品图大图-->
		<el-dialog v-dialogDrag :title='title2' :visible.sync='imageModal' :close-on-click-modal='false'
			:before-close="closeImageModal">
			<div class="txtCenter">
				<el-image :src='taskProductImgUrl' style="max-width: 90%;"></el-image>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeImageModal">关 闭</el-button>
			</div>
		</el-dialog>
		<!--服务费和汇率修改-->
		<el-dialog v-dialogDrag :title="titleFee" width="30%" :visible.sync="editModal" :close-on-click-modal="false"
			:before-close="closeModal">
			<el-form :model="editForm" ref="editForm" :rules='RulesFee' label-width='100px' status-icon>
				<el-form-item label="服务费" prop="fee">
					<el-input v-model="editForm.fee"></el-input>
				</el-form-item>
				<el-form-item label="汇率" prop="rate">
					<el-input v-model="editForm.rate"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeModal">取 消</el-button>
				<el-button type="primary" @click="editSubmit">确 定</el-button>
			</div>
		</el-dialog>
		<!-- 外派(任务分配给外派员) -->
		<el-dialog v-dialogDrag :title="userListTitle" width="30%" :visible.sync="userModal"
			:close-on-click-modal="false">
			<el-table border :data="tableData2" id="exportTable2" style="width: 100%"
				:header-cell-style="{background:'#fafafa'}" @row-click="rowClick2" ref="table2">
				<el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
				<el-table-column prop="Name" label="姓名" align="center"></el-table-column>
				<el-table-column prop="LoginName" label="账号" align="center"></el-table-column>
			</el-table>
			<div slot="footer" class="dialog-footer">
				<el-button @click="userModal=false">关 闭</el-button>
			</div>
		</el-dialog>
		<!--本佣付款-->
		<el-dialog v-dialogDrag :title="titlePay" width="30%" :visible.sync="payModal" :close-on-click-modal="false"
			:before-close="closePayModal">
			<el-form :model="payForm" ref="payForm" :rules='RulesPay' label-width='60px' status-icon>
				<el-form-item label="本金" prop="principal">
					<el-input v-model="payForm.principal"></el-input>
				</el-form-item>
				<el-form-item label="佣金" prop="commission">
					<el-input v-model="payForm.commission"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closePayModal">取 消</el-button>
				<el-button type="primary" @click="paySubmit" :disabled="!payForm.principal&&!payForm.commission">确 定
				</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import table2excel from 'js-table2excel'

	import {
		taskList,
		taskStateNum,
		rateList,
		taskBuy,
		taskBuyCheck,
		taskState,
		taskStateMore,
		taskComment,
		taskFeeEdit,
		userList,
		orderTaskBind,
		taskBindOut,
		taskAgain,
		countryList,
		payBYmoney,
		serviceOtherList,
		blackCheck
	} from '@/api/api';
	export default {
		name: 'task',
		data() {
			return {
				title: '',
				pageIndex: 1,
				pageSize: 10,
				total: 0,
				disabled: true, //单项禁用
				disabledMore: true, //多项禁用
				disabledEditFee: true, //修改费率禁用
				disabledOut: true, //外派禁用
				listLoading: false,
				btnLoading: false,
				tableData: [],
				checkBoxData: [], //选中数据
				menuBtnShow: false, //是否显示列表上方菜单按钮
				tableBtnShow: false, //是否显示列表中的操作按钮
				CWbtnShow: false, //财务按钮
				headers: {
					auth: sessionStorage.getItem('token')
				},
				searchForm: {
					searchWords: '',
					state: 0,
					country: '0',
					type: '0',
					types: '0',
					time: [],
					timeSP: [],
					timeFK: [],
					serveType: '0',
					repeat: '0',
					payState: '0',
					again: '0',
					commentType: '-1'
				},
				all: 0, //全部
				dfp: 0, //待分配
				dgm: 0, //待购买
				dqrcd: 0, //待确认出单
				dpj: 0, //待评价
				dqrpj: 0, //待确认评价
				ywc: 0, //已完成
				yqx: 0, //已取消
				error: 0, //异常
				buyModal: false, //购买弹窗
				taskFormView: {
					OrderNumbers: '',
					ServiceType: '',
					CountryName: '',
					Asin: '',
					ProductName: '',
					ProductPrice: ''
				},
				buyForm: {
					PayAccount: '',
					BuyingTime: '',
					AmazonNumber: '',
					AmazonProductPrice: '',
					Freight: '',
					Taxation: '',
					Other: '',
					Total: '',
					Image: '',
					BuyRemarks: ''
				},
				//设置日期控件只可选择今天及以后的时间
				pickerOptions: {
					disabledDate(time) {
						return time.getTime() < Date.now() - 8.64e7;
					}
				},
				taskId: '', //选中的任务id
				countryId: '', //选中的国家id
				rateData: [], //汇率数据
				symbol: '', //货币符号
				rate: '', //货币汇率
				addFee: '', //增值费
				serviceFei: '', //服务费
				handFee: '', //官方手续费率
				handMoney: '', //官方固定费率
				btnShow: false, //判断是否显示取消按钮
				btnShow2: false, //判断是否显示购买与评价按钮
				btnShow3: false, //判断是否显示转派按钮
				btnShow4: false, //判断子管理员是否显示取消按钮
				Rules: {
					BuyingTime: [{
						required: true,
						message: '请输入购买时间',
						trigger: 'blur'
					}],
					AmazonNumber: [{
						required: true,
						message: '请输入购买单号',
						trigger: 'blur'
					}],
					AmazonProductPrice: [{
							required: true,
							message: '请输入产品金额',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
							message: '金额格式不正确',
							trigger: ['blur']
						}
					],
					Freight: [{
						pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
						message: '金额格式不正确',
						trigger: ['blur']
					}],
					Taxation: [{
						pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
						message: '金额格式不正确',
						trigger: ['blur']
					}],
					Other: [{
						pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
						message: '金额格式不正确',
						trigger: ['blur']
					}],
				},
				commentModal: false,
				imageUrl: '',
				dialogImg: false,
				fileListArr: [],
				commentForm: {
					Link: '',
					Image: '',
					PPaccount: ''
				},
				viewModal: false,
				view: {},
				imageModal: false,
				taskProductImgUrl: '',
				title2: '', //产品图大图弹窗标题
				editModal: false,
				titleFee: '',
				editForm: {
					fee: '',
					rate: ''
				},
				RulesFee: {
					fee: [{
							required: true,
							message: '请输入服务费',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
							message: '服务费格式不正确',
							trigger: ['blur']
						}
					],
					rate: [{
							required: true,
							message: '请输入汇率',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
							message: '汇率格式不正确',
							trigger: ['blur']
						}
					]
				},
				payModal: false,
				titlePay: '',
				payForm: {
					principal: '',
					commission: ''
				},
				RulesPay: {
					principal: [{
						pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
						message: '本金格式不正确',
						trigger: 'blur'
					}],
					commission: [{
						pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
						message: '佣金格式不正确',
						trigger: 'blur'
					}]
				},
				userListTitle: '',
				userModal: false,
				tableData2: [],
				countryData: [], //国家数据
				In: false, //公司内部人员true 外派false
				Ptype: '', //分派类型 1.外派处分派 2.管理员转派
				serviceOtherData: [] //特殊服务费数据
			}
		},
		created() {
			this.getAllData()
			this.getTaskStateNum()
			this.getRateData()
			this.getCountryData()
			this.getServiceOtherData()
		},
		computed: {
			//合计
			totalValue: function() {
				let all = (Number(this.buyForm.AmazonProductPrice) + Number(this.buyForm.Freight) + Number(this.buyForm
						.Taxation) +
					Number(this.buyForm.Other)) * (1 + Number(this.handFee)) + Number(this.handMoney)
				return (all * Number(this.rate)).toFixed(2)
			}
		},
		methods: {
			//获取特殊服务费数据
			getServiceOtherData() {
				let _this = this
				_this.listLoading = true
				let params = {
					keyWord: '',
					pageIndex: 1,
					pageSize: 100000000
				}
				serviceOtherList(params).then(res => {
					_this.serviceOtherData = res.Entity
				}).catch((e) => {})
			},

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

			//自定义的排序逻辑(因为时间格式问题 单位数未补0，所以需要自定义排序)
			sortByAddTime(a, b) {
				let num1 = new Date(a.AddTime).getTime();
				let num2 = new Date(b.AddTime).getTime();
				return num1 - num2;
			},

			//获取数据
			getAllData() {
				let _this = this
				_this.listLoading = true

				// 根据角色判断任务列表能看到哪些数据
				let show = ''
				let roleId = sessionStorage.getItem('roleId').trim()
				let x = roleId.indexOf(1) //总管理员
				let y = roleId.indexOf(2) //子管理员
				let c = roleId.indexOf(3) //财务
				let z = roleId.indexOf(4) //操作员
				let w = roleId.indexOf(5) //外派员
				let s = roleId.indexOf(6) //业务员
				if (x >= 0 || y >= 0) {
					show = 'Michale_009'
				} else if (z >= 0 || w >= 0) {
					show = 'Thomers_120146'
				} else {
					show = 'No'
				}
				//判断如果有管理员权限则显示取消按钮（另附加状态条件）
				if (x >= 0) {
					_this.btnShow = true
				}
				//判断如果有子管理员权限则显示取消按钮（另附加状态条件）
				if (y >= 0) {
					_this.btnShow4 = true
				}
				//判断如果是操作员或外派员则显示列表中的购买与评价按钮
				if (z >= 0 || w >= 0) {
					_this.btnShow2 = true
				}
				//判断如果有管理员权限或者子管理员权限则显示转派按钮
				if (x >= 0 || y >= 0) {
					_this.btnShow3 = true
				}
				//判断如不是外派员并且不是业务员则显示列表上方操作按钮
				if (x >= 0 || y >= 0 || z >= 0) {
					_this.menuBtnShow = true
				}
				//判断如果有财务权限则显示财务对应的按钮(本佣付款、导出)
				if (c >= 0) {
					_this.CWbtnShow = true
				}
				//判断如果不是业务员则显示列表中的操作按钮
				if (x >= 0 || y >= 0 || z >= 0 || w >= 0) {
					_this.tableBtnShow = true
				} else if (s >= 0) {
					_this.tableBtnShow = false
				} else {
					_this.tableBtnShow = false
				}
				//根据角色判断列表显示哪些列(管理员、子管理员、操作员、业务员、财务显示所有；外派员显示改后服务费、改后汇率、改后总额)
				if (x >= 0 || y >= 0 || z >= 0 || c >= 0 || s >= 0) {
					_this.In = true
				}
				if (w >= 0) {
					_this.In = false
				}
				let userId = sessionStorage.getItem('userId')
				let time = _this.searchForm.time
				let time1 = ''
				let time2 = ''
				if (time.length > 0) {
					time1 = time[0]
					time2 = time[1]
				}
				let timeSP = _this.searchForm.timeSP
				let timeSP1 = ''
				let timeSP2 = ''
				if (timeSP.length > 0) {
					timeSP1 = timeSP[0]
					timeSP2 = timeSP[1]
				}
				let timeFK = _this.searchForm.timeFK
				let timeFK1 = ''
				let timeFK2 = ''
				if (timeFK.length > 0) {
					timeFK1 = timeFK[0]
					timeFK2 = timeFK[1]
				}
				let params = {
					Id: userId,
					Key: show,
					keyWord: _this.searchForm.searchWords,
					State: _this.searchForm.state,
					countryId: _this.searchForm.country,
					type: _this.searchForm.type,
					Diff: _this.searchForm.types,
					startTime: time1,
					endTime: time2,
					startEvaluateTime: timeSP1,
					endEvaluateTime: timeSP2,
					startDealTime: timeFK1,
					endDealTime: timeFK2,
					ServerType: _this.searchForm.serveType,
					RepeatState: _this.searchForm.repeat,
					PayState: _this.searchForm.payState,
					againTaskState: _this.searchForm.again,
					NoComment: _this.searchForm.commentType,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize,
					RoolId: roleId
				}
				taskList(params).then(res => {
					_this.listLoading = false
					_this.tableData = res.Entity
					_this.total = Number(res.TotalCount)
				}).catch((e) => {})
			},

			//获取不同状态的订单数量
			getTaskStateNum() {
				let _this = this
				// 根据角色判断任务列表能看到哪些数据
				let show = ''
				let roleId = sessionStorage.getItem('roleId').trim()
				let x = roleId.indexOf(1) //总管理员
				let y = roleId.indexOf(2) //子管理员
				let c = roleId.indexOf(3) //财务
				let z = roleId.indexOf(4) //操作员
				let w = roleId.indexOf(5) //外派员
				let s = roleId.indexOf(6) //业务员
				if (x >= 0 || y >= 0) {
					show = 'Michale_009'
				} else if (z >= 0 || w >= 0) {
					show = 'Thomers_120146'
				} else {
					show = 'No'
				}
				let userId = sessionStorage.getItem('userId')
				let time = _this.searchForm.time
				let time1 = ''
				let time2 = ''
				if (time.length > 0) {
					time1 = time[0]
					time2 = time[1]
				}
				let timeSP = _this.searchForm.timeSP
				let timeSP1 = ''
				let timeSP2 = ''
				if (timeSP.length > 0) {
					timeSP1 = timeSP[0]
					timeSP2 = timeSP[1]
				}
				let timeFK = _this.searchForm.timeFK
				let timeFK1 = ''
				let timeFK2 = ''
				if (timeFK.length > 0) {
					timeFK1 = timeFK[0]
					timeFK2 = timeFK[1]
				}
				let params = {
					Id: userId,
					Key: show,
					keyWord: _this.searchForm.searchWords,
					countryId: _this.searchForm.country,
					type: _this.searchForm.type,
					Diff: _this.searchForm.types,
					startTime: time1,
					endTime: time2,
					startEvaluateTime: timeSP1,
					endEvaluateTime: timeSP2,
					startDealTime: timeFK1,
					endDealTime: timeFK2,
					ServerType: _this.searchForm.serveType,
					RepeatState: _this.searchForm.repeat,
					PayState: _this.searchForm.payState,
					againTaskState: _this.searchForm.again,
					NoComment: _this.searchForm.commentType,
					RoolId: roleId
				}
				taskStateNum(params).then(res => {
					_this.all = Number(res.TotalCount) //全部
					_this.dfp = Number(res.OrderStateInOne) //待分配
					_this.dgm = Number(res.OrderStateInTwo) //待购买
					_this.dqrcd = Number(res.OrderStateInThree) //待确认出单
					_this.dpj = Number(res.OrderStateInFour) //待评价
					_this.dqrpj = Number(res.OrderStateInFive) //待确认评价
					_this.ywc = Number(res.OrderStateInSix) //已完成
					_this.yqx = Number(res.OrderStateInSeven) //已取消
					_this.error = Number(res.OrderStateInEight) //异常
				}).catch((e) => {})
			},

			//查询
			searchData() {
				let _this = this
				_this.pageIndex = 1 //页码归1
				_this.getAllData()
				_this.getTaskStateNum()
			},

			//查询某订单状态下的数据
			searchStateData(val) {
				let _this = this
				_this.pageIndex = 1 //页码归1
				_this.searchForm.state = val
				_this.getAllData()
			},

			//任务取消
			changeState(index, row) {
				let _this = this
				_this.$confirm('确认取消任务【' + row.OrderNumbers + '】吗？', '信息提示', {
					type: 'warning'
				}).then(() => {
					let params = {
						Id: row.Id
					}
					taskState(params).then((res) => {
						_this.getAllData()
						_this.getTaskStateNum()
					})
				}).catch(() => {})
			},

			//批量任务取消
			changeStateMore() {
				let _this = this
				let ids = _this.checkBoxData.map(item => item.Id) //选中的数据
				let num = _this.checkBoxData.length //选中的数量
				_this.$confirm('确认取消选中的【' + num + '】条任务吗？', '信息提示', {
					type: 'warning'
				}).then(() => {
					let params = {
						Id: ids
					}
					taskStateMore(params).then((res) => {
						_this.getAllData()
						_this.getTaskStateNum()
					})
				}).catch(() => {})
			},

			// 获取汇率数据
			getRateData() {
				let _this = this
				let params = {
					CurrencyName: '',
					pageIndex: 1,
					pageSize: 100000000,
				}
				rateList(params).then(res => {
					_this.rateData = res.Entity
				}).catch((e) => {})
			},

			//传入国家id获取货币信息
			getRateInfo(countryId) {
				let _this = this
				for (let x in _this.rateData) {
					if (Number(_this.rateData[x].CountryId) == Number(countryId)) {
						_this.symbol = _this.rateData[x].CurrencySymbol //货币符号
						_this.handFee = _this.rateData[x].HandFee //官方手续费率
						_this.handMoney = _this.rateData[x].HandMoney //官方固定费用
					}
				}
			},

			// PP号黑名单检测(1为购买时检测；2为评价时检测)
			checkBlack(val) {
				let _this = this
				let pp = ''
				if (val == 1) {
					pp = _this.buyForm.PayAccount
				}
				if (val == 2) {
					pp = _this.commentForm.PPaccount
				}
				let params = {
					Account: pp.trim()
				}
				blackCheck(params).then(res => {
					let state = res.State
					if (state == 1) {
						this.$confirm('PP号【' + pp + '】是黑名单PP号', '信息警告', {
							confirmButtonText: '我不管，我就要填它',
							cancelButtonText: '重写填写',
							type: 'error',
							closeOnClickModal: false
						}).then(() => {}).catch(() => {
							if (val == 1) {
								_this.buyForm.PayAccount = ''
								this.$refs.PayAccount.focus()
							}
							if (val == 2) {
								_this.commentForm.PPaccount = ''
								this.$refs.PPaccount.focus()
							}
						})
					}
				}).catch((e) => {})
			},

			// 购买弹窗
			buyModalShow(index, row) {
				let _this = this
				_this.title = '填写购买信息'
				_this.buyModal = true
				_this.taskFormView.OrderNumbers = row.OrderNumbers
				_this.taskFormView.ServiceType = row.ServiceType
				_this.taskFormView.CountryName = row.CountryName
				_this.taskFormView.Asin = row.Asin
				_this.taskFormView.ProductName = row.ProductName
				_this.taskFormView.ProductPrice = row.ProductPrice
				_this.addFee = row.OrderAddedFee //增值费
				_this.serviceFei = row.OrderUnitPriceSerCharge //服务费
				_this.rate = row.OrderExchangeRate //汇率
				_this.taskId = row.Id
				_this.countryId = row.CountryId
				_this.getRateInfo(row.CountryId)
			},

			//购买前先查重
			buyCheckRepeat() {
				let _this = this
				_this.$refs.buyForm.validate((valid) => {
					if (valid) {
						let params = {
							AmazonNumber: _this.buyForm.AmazonNumber,
							Asin: _this.taskFormView.Asin,
							CountryId: _this.countryId
						}
						taskBuyCheck(params).then(res => {
							let repeatState = res.Repeat
							if (repeatState == '1') {
								_this.$confirm('系统检测到您所填写的为重复任务，是否执意要购买？', '信息提示', {
									type: 'warning'
								}).then(() => {
									_this.buySubmit(repeatState)
								}).catch(() => {})
							} else {
								_this.buySubmit(repeatState)
							}
						}).catch((e) => {})
					}
				})
			},

			// 购买
			buySubmit(repeatState) {
				let _this = this
				_this.btnLoading = true
				let userId = sessionStorage.getItem('userId')
				let ServiceType = _this.taskFormView.ServiceType
				let params = {}
				if (ServiceType == 1) {
					params = Object.assign({}, this.buyForm)
					if (params.Freight == '') {
						params.Freight = 0
					}
					if (params.Taxation == '') {
						params.Taxation = 0
					}
					if (params.Other == '') {
						params.Other = 0
					}
					params.Type = ServiceType
					params.TaskId = _this.taskId
					params.Id = userId
					params.RepeatState = repeatState
				} else {
					params = {
						PayAccount: _this.buyForm.PayAccount,
						BuyingTime: _this.buyForm.BuyingTime,
						AmazonNumber: _this.buyForm.AmazonNumber,
						AmazonProductPrice: _this.buyForm.AmazonProductPrice,
						Type: ServiceType,
						TaskId: _this.taskId,
						Id: userId,
						Image: _this.buyForm.Image,
						BuyRemarks: _this.buyForm.BuyRemarks,
						RepeatState: repeatState
					}
				}
				//核算总金额(总额+增值服+服务费)
				params.Total = (Number(_this.totalValue) + Number(_this.addFee) + Number(_this.serviceFei))
					.toFixed(2)
				taskBuy(params).then(res => {
					_this.btnLoading = false
					_this.closeBuyModal()
					_this.getAllData()
					_this.getTaskStateNum()
				}).catch((e) => {
					_this.btnLoading = false
				})
			},

			// 关闭购买弹窗
			closeBuyModal() {
				let _this = this
				_this.buyModal = false
				_this.$refs['buyForm'].resetFields()
				_this.buyForm = {
					PayAccount: '',
					BuyingTime: '',
					AmazonNumber: '',
					AmazonProductPrice: '',
					Freight: '',
					Taxation: '',
					Other: '',
					Total: '',
					Image: '',
					BuyRemarks: ''
				}
				_this.imageUrl = ''
			},

			// 评价弹窗
			commentModalShow(index, row) {
				let _this = this
				_this.title = '填写评价信息'
				_this.commentModal = true
				_this.taskFormView.OrderNumbers = row.OrderNumbers
				_this.taskFormView.ServiceType = row.ServiceType
				_this.taskFormView.CountryName = row.CountryName
				_this.taskFormView.Asin = row.Asin
				_this.taskFormView.ProductName = row.ProductName
				_this.taskFormView.ProductPrice = row.ProductPrice
				_this.taskId = row.Id
				_this.commentForm.Link = row.ProductLink
				_this.commentForm.Image = row.ProductImage
				//评价图片转换为 url:'xxx' 格式才能回显
				let img = row.ProductImage
				if (img) {
					let imgArr = img.split(',')
					let formatImgArr = []
					for (let x in imgArr) {
						let obj = new Object()
						obj.url = imgArr[x]
						formatImgArr.push(obj)
					}
					_this.fileListArr = formatImgArr //赋值给图片上传控件回显数据
				}
				_this.commentForm.PPaccount = row.PayAccount
				_this.getRateInfo(row.CountryId)
			},

			// 评价
			commentSubmit(val) {
				let _this = this
				let userId = sessionStorage.getItem('userId')
				let link = _this.commentForm.Link
				let image = _this.commentForm.Image
				let PPaccount = _this.commentForm.PPaccount
				let params = {
					Id: _this.taskId,
					BackUserId: userId,
					Link: link,
					Image: image,
					PayAccount: PPaccount,
					NoComment: val
				}
				_this.$refs.commentForm.validate((valid) => {
					if (valid) {
						// 如果是需要评论的单,评价链接和评论图片必须二选一填写;如果是免评单不要填写评价链接,评论图片可填可不填.(1为免评)
						if (val == 0) {
							if (!link && !image) {
								this.$message.error('评价链接和评价截图必须至少填写一项！')
							} else {
								taskComment(params).then(res => {
									_this.closeCommentModal()
									_this.getAllData()
									_this.getTaskStateNum()
								}).catch((e) => {})
							}
						} else {
							if (link) {
								this.$message.error('免评单请不要填写评价链接！')
							} else {
								this.noComment(val)
							}
						}
					}
				})
			},

			//免评情况
			noComment(val) {
				let _this = this
				let name = ''
				let money = ''
				let data = _this.serviceOtherData
				for (let x in data) {
					if (data[x].Id == val) {
						name = data[x].ServiceName
						money = data[x].ServiceMoney
					}
				}
				_this.$prompt('若确定该单为【' + name + '】单，请确认该' + name + '单的金额', '信息提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					closeOnClickModal: false,
					inputPattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
					inputErrorMessage: '金额格式不正确',
					inputValue: money
				}).then(({
					value
				}) => {
					let _this = this
					let userId = sessionStorage.getItem('userId')
					let link = _this.commentForm.Link
					let image = _this.commentForm.Image
					let PPaccount = _this.commentForm.PPaccount
					let params = {
						Id: _this.taskId,
						BackUserId: userId,
						Link: link,
						Image: image,
						PayAccount: PPaccount,
						NoComment: val,
						Money: value
					}
					taskComment(params).then(res => {
						_this.closeCommentModal()
						_this.getAllData()
						_this.getTaskStateNum()
					}).catch((e) => {})
				}).catch(() => {})
			},

			// 图片上传

			//购买图片上传成功
			handleAvatarSuccessBuy(res, file) {
				if (res.data) {
					this.buyForm.Image = res.data
				}
				this.imageUrl = URL.createObjectURL(file.raw);
				this.$message.success('图片上传成功！')
			},

			//评论图片上传成功
			handleAvatarSuccess(res, file, fileList) {
				if (res.data) {
					file.url = res.data
					let imgUrlStr = ''
					for (let x in fileList) {
						imgUrlStr += ',' + fileList[x].url
					}
					imgUrlStr = imgUrlStr.substring(1)
					this.commentForm.Image = imgUrlStr
				}
				this.$message.success('图片上传成功！')
			},

			handleError(res) {
				this.$message.error('图片上传失败！')
			},
			beforeAvatarUpload(file) {
				const isJPG = file.type === 'image/jpeg';
				const isPNG = file.type === 'image/png';
				const isGIF = file.type === 'image/gif';
				const isBMP = file.type === 'image/bmp';
				const isLt5M = file.size / 1024 / 1024 < 5;
				if (!isJPG && !isPNG && !isGIF && !isBMP) {
					this.$message.error('上传图片必须是JPG/PNG/GIF/BMP 格式!');
				} else if (!isLt5M) {
					this.$message.error('上传图片大小不能超过 5MB!');
				}
				return (isJPG || isPNG || isGIF || isBMP) && isLt5M;
			},

			handleRemove(file, fileList) {
				let imgUrlStr = ''
				for (let x in fileList) {
					imgUrlStr += ',' + fileList[x].url
				}
				imgUrlStr = imgUrlStr.substring(1)
				this.commentForm.Image = imgUrlStr
			},
			handlePictureCardPreview(file) {
				this.imageUrl = file.url
				this.dialogImg = true
			},

			// 关闭评价弹窗
			closeCommentModal() {
				let _this = this
				_this.commentModal = false
				_this.$refs['commentForm'].resetFields()
				_this.commentForm = {
					Link: '',
					Image: '',
					PPaccount: ''
				}
				_this.imageUrl = ''
				_this.fileList = []
			},

			//任务详情
			viewModalShow(index, row) {
				let _this = this
				_this.title = '任务【' + row.OrderNumbers + '】详情'
				_this.taskId = row.Id
				_this.getRateInfo(row.CountryId)
				_this.view = Object.assign({}, row)
				_this.viewModal = true
			},

			//查看产品图大图（列表点击图片查看）
			showImage(index, row, val) {
				let _this = this
				_this.imageModal = true
				if (val == '1') {
					_this.title2 = '任务【' + row.OrderNumbers + '】产品图'
					_this.taskProductImgUrl = this.$IMG_URL + row.OrderProductPictures
				}
				if (val == '2') {
					_this.title2 = '任务【' + row.OrderNumbers + '】返款截图'
					if (row.DealIamge) {
						_this.taskProductImgUrl = this.$IMG_URL + row.DealIamge
					}
				}
			},
			closeImageModal() {
				let _this = this
				_this.imageModal = false
				_this.taskProductImgUrl = ''
			},

			//选中行
			rowClick(row) {
				let _this = this
				let findResult = _this.checkBoxData.findIndex((value, index) => {
					return value == row
				})
				if (findResult != -1) {
					_this.$refs.table.toggleRowSelection([{
						row: row,
						selected: false
					}])
				} else {
					_this.$refs.table.toggleRowSelection([{
						row: row,
						selected: true
					}])
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
				//任务状态
				let state = val.map(item => item.TaskState)
				let dis = false
				for (let x in state) {
					//如果状态不是待购买
					if (state[x] != 2) {
						dis = true
					}
				}
				if (checkNum > 0) {
					if (dis == false) {
						_this.disabledEditFee = false
						_this.disabledOut = false
					} else {
						_this.disabledEditFee = true
						_this.disabledOut = true
					}
				} else {
					_this.disabledEditFee = true
					_this.disabledOut = true
				}
			},

			// 重置
			resetSearch() {
				let _this = this
				_this.searchForm.searchWords = ''
				_this.searchForm.country = '0'
				_this.searchForm.type = '0'
				_this.searchForm.types = '0'
				_this.searchForm.time = []
				_this.searchForm.timeSP = []
				_this.searchForm.timeFK = []
				_this.searchForm.serveType = '0'
				_this.searchForm.repeat = '0'
				_this.searchForm.payState = '0'
				_this.searchForm.again = '0'
				_this.searchForm.commentType = '-1'
				_this.pageIndex = 1
				_this.getAllData()
				_this.getTaskStateNum()
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

			//打开修改服务费和汇率弹窗
			editModalShow() {
				let _this = this
				let count = _this.checkBoxData.length
				_this.titleFee = '服务费和汇率修改 当前选中【' + count + '】条任务'
				_this.editModal = true
			},

			// 修改服务费和汇率
			editSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						let params = {
							tid: _this.checkBoxData.map(item => item.Id),
							servicecharge: _this.editForm.fee,
							exchangerate: _this.editForm.rate
						}
						taskFeeEdit(params).then(res => {
							_this.closeModal()
							_this.getAllData()
						}).catch((e) => {})
					}
				})
			},

			//关闭服务费汇率修改弹窗
			closeModal() {
				let _this = this
				_this.editModal = false
				_this.$refs['editForm'].resetFields()
				_this.editForm = {
					fee: '',
					rate: ''
				}
			},

			//打开分配人员弹窗
			userModalShow(val) {
				let _this = this
				_this.Ptype = val
				if (val == '1') {
					_this.userListTitle = '外派员列表'
				}
				if (val == '2') {
					_this.userListTitle = '操作员列表'
				}
				_this.getUserData()
			},

			//获取外派员列表
			getUserData() {
				let _this = this
				let params = {
					name: '',
					pageIndex: 1,
					pageSize: 100000000,
				}
				userList(params).then(res => {
					let data = res.Entity
					let arr = [] //外派员
					let arr2 = [] //操作员
					for (let x in data) {
						let roleId = data[x].RoolId
						if (roleId == null) {
							roleId = ''
						}
						let state = data[x].State
						//如果角色包含5(外派员)并且状态为有效
						if (roleId.indexOf(5) >= 0 && state == 1) {
							arr.push(data[x])
						}
						if (roleId.indexOf(4) >= 0 && state == 1) {
							arr2.push(data[x])
						}
					}
					if (_this.Ptype == '1') {
						_this.tableData2 = arr
					}
					if (_this.Ptype == '2') {
						_this.tableData2 = arr2
					}
					_this.userModal = true //获取数据后显示模态框
				}).catch((e) => {})
			},

			//人员选中行绑定外派员
			rowClick2(val) {
				let _this = this
				_this.$refs.table2.clearSelection()
				_this.$refs.table2.toggleRowSelection(val, true)
				let taskIds = _this.checkBoxData.map(item => item.Id) //任务表选中的数据
				let userId = val.Id //人员表选中的数据
				let taskNum = _this.checkBoxData.length //选中的任务数
				let txt = ''
				if (_this.Ptype == '1') {
					txt = '外派'
				}
				if (_this.Ptype == '2') {
					txt = '转派'
				}
				_this.$confirm('确认要将选中的 ' + taskNum + ' 条任务 ' + txt + ' 给【' + val.Name + '】吗？', '信息提示', {
					type: 'warning'
				}).then(() => {
					let params = {
						Tid: taskIds,
						userId: userId,
						Type: _this.Ptype
					}
					taskBindOut(params).then((res) => {
						_this.userModal = false
						_this.getAllData()
						_this.getTaskStateNum()
					})
				}).catch(() => {})
			},

			//追加任务弹窗
			TaskAgainShow() {
				let _this = this
				_this.$prompt('请输入要追加的任务数', '信息提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputPattern: /^[1-9]\d*$/,
					inputErrorMessage: '任务数必须为正整数'
				}).then(({
					value
				}) => {
					_this.taskAgainAdd(value)
				}).catch(() => {})
			},

			//追加任务
			taskAgainAdd(val) {
				let _this = this
				let params = {
					TaskId: _this.checkBoxData[0].Id,
					Number: val,
					OrderId: _this.checkBoxData[0].OrderId
				}
				taskAgain(params).then(res => {
					_this.getAllData()
				}).catch((e) => {})
			},

			//打开本佣付款弹窗
			payModalShow() {
				let _this = this
				let TaskNum = _this.checkBoxData[0].OrderNumbers
				_this.payForm.principal = _this.checkBoxData[0].PayPrincipal
				_this.payForm.commission = _this.checkBoxData[0].PayCommission
				_this.titlePay = '任务【' + TaskNum + '】本佣付款'
				_this.payModal = true
			},

			// 录入修改本佣付款
			paySubmit() {
				let _this = this
				_this.$refs.payForm.validate((valid) => {
					if (valid) {
						let params = {
							Tid: _this.checkBoxData[0].Id,
							PayPrincipal: _this.payForm.principal,
							PayCommission: _this.payForm.commission
						}
						payBYmoney(params).then(res => {
							_this.closePayModal()
							_this.getAllData()
						}).catch((e) => {})
					}
				})
			},

			//关闭本佣付款弹窗
			closePayModal() {
				let _this = this
				_this.payModal = false
				_this.$refs['payForm'].resetFields()
				_this.payForm = {
					principal: '',
					commission: ''
				}
			},

			//复制任务编号
			copy(index, row) {
				let oInput = document.createElement('input');
				oInput.value = row.OrderNumbers;
				document.body.appendChild(oInput);
				oInput.select(); // 选择对象;
				document.execCommand("Copy"); // 执行浏览器复制命令
				this.$message({
					message: '任务编号复制成功',
					type: 'success'
				});
				oInput.remove()
			},

			//查询条件去空格
			searchToTrim() {
				let _this = this
				_this.searchForm.searchWords = _this.searchForm.searchWords.trim()
			},

			//返款账号去空格（购买时和确认评价时）
			toTrim(val) {
				let _this = this
				if (val == '1') {
					_this.buyForm.PayAccount = _this.buyForm.PayAccount.trim()
				}
				if (val == '2') {
					_this.commentForm.PPaccount = _this.commentForm.PPaccount.trim()
				}
			},

			//导出
			exportExcel() {
				const column = [{
						title: '任务编号',
						key: 'OrderNumbers',
						type: 'text'
					},
					{
						title: '产品图',
						key: 'ExpProductImg',
						type: 'image',
						width: 100,
						height: 100
					},
					{
						title: '任务类型',
						key: 'ExpServiceType',
						type: 'text'
					},
					{
						title: '国家',
						key: 'CountryName',
						type: 'text'
					},
					{
						title: 'ASIN',
						key: 'Asin',
						type: 'text'
					},
					{
						title: '产品名称',
						key: 'ProductName',
						type: 'text'
					},
					{
						title: '增值费',
						key: 'OrderAddedFee',
						type: 'text'
					},
					{
						title: '服务费',
						key: 'OrderUnitPriceSerCharge',
						type: 'text'
					},
					{
						title: '汇率',
						key: 'OrderExchangeRate',
						type: 'text'
					},
					{
						title: '总额',
						key: 'Total',
						type: 'text'
					},
					{
						title: '改后服务费',
						key: 'TaskUnitPriceSerCharge',
						type: 'text'
					},
					{
						title: '改后汇率',
						key: 'TaskExchangeRate',
						type: 'text'
					},
					{
						title: '改后总额',
						key: 'NewTaskTotal',
						type: 'text'
					},
					{
						title: '差额',
						key: 'DifferenceTotal',
						type: 'text'
					},
					{
						title: '客户编码',
						key: 'CustomerUserId',
						type: 'text'
					},
					{
						title: '付本',
						key: 'PayPrincipal',
						type: 'text'
					},
					{
						title: '付佣',
						key: 'PayCommission',
						type: 'text'
					},
					{
						title: '订单备注',
						key: 'OrderRemarks',
						type: 'text'
					},
					{
						title: '执行时间',
						key: 'ExecutionTime',
						type: 'text'
					},
					{
						title: '操作员',
						key: 'Name',
						type: 'text'
					},
					{
						title: '外派员',
						key: 'ExpName1',
						type: 'text'
					},
					{
						title: '购买单号',
						key: 'AmazonNumber',
						type: 'text'
					},
					{
						title: '购买时间',
						key: 'BuyTime',
						type: 'text'
					},
					{
						title: '购买价格',
						key: 'AmazonProductPrice',
						type: 'text'
					},
					{
						title: '客户备注',
						key: 'Remarks',
						type: 'text'
					},
					{
						title: 'PP账号',
						key: 'PayAccount',
						type: 'text'
					},
					{
						title: '评价链接',
						Key: 'ProductLink',
						type: 'text'
					},
					{
						title: '上评时间',
						key: 'EvaluateTime',
						type: 'text'
					},
					{
						title: '返款时间',
						key: 'DealTime',
						type: 'text'
					},
					{
						title: '返款金额',
						key: 'DealMoeny',
						type: 'text'
					},
					{
						title: '返款截图',
						key: 'ExpDealIamge',
						type: 'image',
						width: 100,
						height: 100
					},
					{
						title: '状态',
						key: 'ExpTaskState',
						type: 'text'
					}
				]

				// 1.title为列名
				// 2.key为data数据每个对象对应的key
				// 3.若为图片格式, 需要加type为image的说明,并且可以设置图片的宽高
				const data = this.tableData
				// data数据一些特殊处理
				for (const t in data) {
					data[t].ExpProductImg = this.$IMG_URL + data[t].OrderProductPictures

					if (data[t].DealIamge) {
						data[t].ExpDealIamge = this.$IMG_URL + data[t].DealIamge
					} else {
						data[t].ExpDealIamge = ''
					}

					let TxtServiceType = ''
					if (data[t].ServiceType == 1) {
						TxtServiceType = '评后返（代返）'
					}
					if (data[t].ServiceType == 2) {
						TxtServiceType = '评后返（自返）'
					}
					data[t].ExpServiceType = TxtServiceType

					let TxtName1 = ''
					if (data[t].Name1) {
						TxtName1 = data[t].Name1
					}
					if (data[t].BuyRemarks) {
						TxtName1 = data[t].BuyRemarks
					}
					if (data[t].Name1 && data[t].BuyRemarks) {
						TxtName1 = data[t].Name1 + ' / ' + data[t].BuyRemarks
					}
					data[t].ExpName1 = TxtName1

					let TxtTaskState = ''
					if (data[t].TaskState == 1) {
						TxtTaskState = '待分配'
					}
					if (data[t].TaskState == 2) {
						TxtTaskState = '待购买'
					}
					if (data[t].TaskState == 3) {
						TxtTaskState = '待确认出单'
					}
					if (data[t].TaskState == 4) {
						TxtTaskState = '待评价'
					}
					if (data[t].TaskState == 5) {
						TxtTaskState = '待确认评价'
					}
					if (data[t].TaskState == 6) {
						TxtTaskState = '已完成'
					}
					if (data[t].TaskState == 7) {
						TxtTaskState = '已取消'
					}
					if (data[t].TaskState == 8) {
						TxtTaskState = '异常'
					}
					data[t].ExpTaskState = TxtTaskState
				}
				let date = new Date()
				let year = date.getFullYear()
				let month = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
				let day = date.getDate() <= 9 ? "0" + date.getDate() : date.getDate()
				let time = year + '-' + month + '-' + day

				const excelName = '任务数据' + '_' + time + '.xls'
				table2excel(column, data, excelName)
			}
		}
	}
</script>
