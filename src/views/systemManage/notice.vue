<template>
	<section>
		<quill-editor v-model="content" ref="myQuillEditor" class="editor-box mt15" :options="editorOption"></quill-editor>
		<div class="mt50 txt-c">
			<el-button type="primary" @click='submit'>提 交</el-button>
		</div>
	</section>
</template>

<script>
	import {
		noticeAdd,
		noticeGet
	} from '@/api/api'

	import {
		quillEditor
	} from 'vue-quill-editor'
	import 'quill/dist/quill.core.css'
	import 'quill/dist/quill.snow.css'
	import 'quill/dist/quill.bubble.css'

	export default {
		components: {
			quillEditor
		},
		data() {
			return {
				content: '',
				editorOption: {
					placeholder: '',
					theme: 'snow'
				}
			}
		},
		created() {
			this.getData()
		},
		methods: {
			//获取公告内容
			getData() {
				let _this = this
				let params = {}
				noticeGet(params).then(res => {
					_this.content = res.Notice
				}).catch((e) => {})
			},

			//提交公告
			submit() {
				let _this = this
				let params = {
					Notice: _this.content
				}
				noticeAdd(params).then(res => {}).catch((e) => {})
			}
		}
	}
</script>
