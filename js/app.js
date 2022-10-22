((Vue) => {
	var app = new Vue({
		el: '#todoapp',
		data: {
			list_data: [],
			is_click: 0,
			base_url: 'http://127.0.0.1:8082/',
		},
		mounted: function () {
			axios.get(this.base_url + 'ListData')
				.then((backdata) => {
					if (backdata.data.error) {
						alert(backdata.data.error);
					} else {
						this.list_data = backdata.data.result;
					}
				});
		},
		methods: {
			AddTask(ev) {
				// id是当前id的最大值加1(数组为空则初始为1)
				var title = ev.target.value.trim();
				if (!title) {
					ev.target.value = '';
					return;
				}
				var stat = false;
				var show = false;
				axios.post(this.base_url + 'ListData', {
					title,
					stat,
					show
				})
				.then((backdata) => {
					if (backdata.data.error) {
						alert(backdata.data.error);
					} else {
						this.list_data.push({
							id: backdata.data.result,
							title,
							stat,
							show,
						});
					}
					ev.target.value = '';
				}, (err) => {
					alert('发生未知错误，请重试');
				})
			},
			ToggleAll(ev) {
				this.list_data.map((v) => {
					(() => {
						axios.put(this.base_url + 'ListData', {
							id: v.id,
							title: v.title,
							stat: ev.target.checked,
							show: v.show
						})
						.then((backdata) => {
							if (backdata.data.error) {
								alert(backdata.data.error);
							} else {
								v.stat = ev.target.checked;
							}
						}, () => {
							alert('更新失败');
						})
					})(v);
				});
			},
			ToggleOne(k) {
				axios.put(this.base_url + 'ListData', {
					id: this.list_data[k].id,
					title: this.list_data[k].title,
					stat: !this.list_data[k].stat,
					show: this.list_data[k].show
				})
				.then((backdata) => {
					if (backdata.data.error) {
						alert(backdata.data.error);
					} else {
						this.list_data[k].stat = !this.list_data[k].stat;
					}
				}, () => {
					alert('更新失败');
				})
			},
			DestroyThis(key) {
				// 这里的key并不是id值, 而是list_data的索引值
				axios.delete(this.base_url + 'ListData', {
					data: {
						id: this.list_data[key].id
					}
				})
				.then((backdata) => {
					if (backdata.data.error) {
						alert(backdata.data.error);
					} else {
						this.list_data.splice(key, 1);
					}
				}, () => {
					alert('删除任务失败，请重试');
				});
			},
			ShowClearCompleted() {
				// return eval(this.list_data.map((v)=>{return v.stat == true? 1: 0;}).join("+"));
				// 这种方法简单，但是耗时
				// https://www.cnblogs.com/faithZZZ/p/7063952.html
				var sum = 0;
				for (let v of this.list_data) {
					if (v.stat == true) {
						sum++;
					}
				}
				return sum;
			},
			ClearCompleted() {
				var delCount = 0;
				var curCount = 0;
				for (let i = this.list_data.length - 1; i >= 0; i--) { // 倒序删除, 避免splice方法导致索引错乱
					if (this.list_data[i].stat) { // 需要删除的节点
						(() => { // 闭包，保存变量i
							axios.delete(this.base_url + 'ListData', {
								data: {
									id: this.list_data[i].id
								}
							})
							.then((backdata) => {
								if (backdata.data.error) {
									alert(backdata.data.error);
								} else {
									this.list_data.splice(i, 1);
								}
							}, () => {
								alert('删除失败');
							});
						})(i);
					}
				}
				// this.list_data = this.list_data.filter((v)=>{
				// 	return !v.stat;
				// })

				// 这里要更新数据库, 因此不采用这种方法
				// this.list_data = this.list_data.filter((v) => !v.stat);
			},
			ShowAll() { // 没必要改数据库, 下同
				this.list_data.map((v) => {
					v.show = false;
				});
				this.is_click = 0;
			},
			ShowActive() {
				this.list_data.map((v) => {
					if (v.stat == true) {
						v.show = true;
					} else {
						v.show = false;
					}
				});
				this.is_click = 1;
			},
			ShowCompleted() {
				this.list_data.map((v) => {
					if (v.stat == false) {
						v.show = true;
					} else {
						v.show = false;
					}
				});
				this.is_click = 2;
			},
		},
		directives: { //私有自定义指令
			focus: { //自动获取光标
				inserted(element) {
					element.focus();
				},
			},
		},
	});
})(Vue);
