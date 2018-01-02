;(function () {
	var task_list=[];
	var flag=0;
	init();//1.初始化
	add_task();//2.回车添加任务
	click_selected();//9.显示事件，存储flag的数值到本地
	toggle_all();//11.点击选中所有任务
	clear_completed();//12.点击清除所有完成任务
	//1.初始化
	function init() {
		//只要是绑定初始化出来的标签都需要放到初始化函数中再次绑定
		task_list=store.get("tasks") || [];
		flag=store.get("flag")|| 0;
		add_task_list();//5.添加任务列表html
		edit_task();//6.双击任务进行编辑
		destroy_task();//7.删除单个任务
		toggle_checkbox();//8.选中单个任务
		judge_task();//10.统计未完成任务的数目,判断是否显示清空按钮
	}
	//2.回车添加任务
	function add_task() {
		$(".new-todo").on("keydown",function (ev) {
			var key = ev.which;//获取按下去的键值
			if(key==13){//回车键为13
				var obj={};
				obj.content= $(this).val();
				if(!obj.content) return; //没输入值，就返回
				up_data(obj);//3.更新数据
				$(this).val(null);
				init();
			}
		})
	}
	//3.添加单条任务进数组跟本地
	function up_data(obj) {
		task_list.push(obj);//将对象存入数组中
		store.set("tasks",task_list);//将数组存入本地
	}
	//4.添加单条任务的html
	function task_list_html(index,data) {
		if (!data) return;
		var str='<li data-index="'+index+'" class=' + (data.completed ? "completed" : "") + '>'+
			'<div class="view">'+
			'<input class="toggle" type="checkbox"'+(data.completed ? "checked" : "")+'>'+
			'<label class="label-content">'+data.content+'</label>'+
			'<button class="destroy"></button>'+
			'</div>'+
			'<input class="edit" value="'+data.content+'">'+
			'</li>';
		return $(str);
	}
	//5.添加任务列表html
	function add_task_list() {
		var $todo_list=$(".todo-list");
		var $filtersA=$(".filters a");
		var todo_str=[];
		$todo_list.html(null);
		$filtersA.removeClass("selected");
		if(task_list.length==0){//没有任务则隐藏下面的状态栏
			$(".main").hide();
			$(".footer").hide();
		}
		else{//有任务就显示
			$(".main").show();
			$(".footer").show();
		}
		$(task_list).each(function (index,data) {
			switch (flag){
				case 0:
					$filtersA.eq(0).addClass("selected");
					todo_str=task_list_html(index,data);
					$todo_list.prepend(todo_str);
					break;
				case 1:
					$filtersA.eq(1).addClass("selected");//9.
					if(!data.completed){
						todo_str=task_list_html(index,data);
						$todo_list.prepend(todo_str);
					}
					break;
				case 2:
					$filtersA.eq(2).addClass("selected");//9.
					if(data.completed){
						todo_str=task_list_html(index,data);
						$todo_list.prepend(todo_str);
					}
					break;
			}
		})
	}
	//6.双击任务进行编辑
	function edit_task() {
		$(".todo-list>li").on("dblclick",function () {
			$(this).addClass("editing");
			var $edit=$(this).find(".edit");
			$edit.focus().val($edit.val());//获取焦点
			$edit.on("blur",function () {//失去焦点
				$(this).parent().removeClass("editing");
				var index=$(this).parent().data("index");
				if($(this).val()){
					task_list[index].content=$(this).val();
				}
				store.set("tasks",task_list);
				init();
			});
			$edit.on("keydown",function (ev) {//按回车
				var key=ev.which;
				if(key==13){
					$(this).parent().removeClass("editing");
					var index=$(this).parent().data("index");
					if($(this).val()){
						task_list[index].content=$(this).val();
					}
					store.set("tasks",task_list);
					init();
				}
			});
		})
	}
	//7.删除单个任务
	function destroy_task() {
		$(".destroy").on("click",function () {
			var index=$(this).parent().parent().data("index");
			task_list.splice(index,1);
			store.set("tasks",task_list);
			init();
		})
	}
	//8.点击选中单个任务
	function toggle_checkbox() {
		$(".toggle").on("click",function () {
			var index=$(this).parent().parent().data("index");
			if(task_list[index].completed){
				task_list[index].completed=false;
			}
			else {
				task_list[index].completed = true;
			}
			store.set("tasks",task_list);
			init();
		})
	}
	//9.显示事件，存储flag的数值到本地
	function click_selected() {
		$(".filters a").on("click",function () {
			var index=$(this).parent().index();
			store.set("flag",index);
			init();
		})
	}
	//10.统计未完成任务的数目,判断是否显示清空按钮,判断是否全选
	function judge_task() {
		var count = 0;
		//统计未完成任务的数目
		for(var i=0;i<task_list.length;i++){
			if(task_list[i].completed){
				count++;
			}
		}
		var sum=task_list.length-count;
		$(".todo-count strong").html(sum);
		//判断是否显示清空按钮
		if(count!=0){
			$(".clear-completed").show();
		}
		else {
			$(".clear-completed").hide();
		}
		//判断是否全选
		if(count==task_list.length){
			$(".toggle-all").prop("checked","true");
		}
		else{
			$(".toggle-all").prop("checked",null);
		}
	}
	//11.点击选中所有任务
	function toggle_all() {
		$(".toggle-all").bind("click",function () {
			for(var i=0;i<task_list.length;i++){
				if($(this).prop("checked")){
					task_list[i].completed=true;
				}
				else {
					task_list[i].completed=false;
				}
			}
			store.set("tasks",task_list);
			init();
		})
	}
	//12.点击清除所有完成任务
	function clear_completed() {
		$(".clear-completed").on("click",function () {
			for(var i=0;i<task_list.length;i++){
				if(task_list[i].completed){
					task_list.splice(i,1);
					i=i-1;
				}
			}
			store.set("tasks",task_list);
			init();
		})
	}
}());
