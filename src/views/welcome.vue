<template>
	<section>
		<div class="wel-box">
			<i class="icon el-icon-s-custom"></i>
			<div class="mt15 fz16">{{name}}</div>
			<div class="mt30">欢迎来到下单后台管理系统</div>
		</div>
	</section>
</template>

<script>
	export default {
		name: 'welcome',
		data() {
			return {
				name: sessionStorage.getItem('userName')
			}
		},
	}
</script>
