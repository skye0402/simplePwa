/**
 * Sample OpenUI5 Progressive Web Application
 * Simple TODO list
 */
sap.ui.getCore().attachInit(function todoApp() {
	//
	// Model
	//
	var aTasks = {};

	function loadTasks() {
		var json = localStorage.getItem("tasks");
		try {
			aTasks = JSON.parse(json) || {};
		} catch (e) {
			jQuery.sap.log.error(e.message);
		}
	}

	function saveTasks() {
		localStorage.setItem("tasks", JSON.stringify(aTasks));
	}

	function addTask(description) {
		var id = Date.now();
		aTasks[id] = {id: id, t: description};
		saveTasks();
		return aTasks[id];
	}

	function deleteTask(id) {
		delete aTasks[id];
		saveTasks();
	}

	//
	// Controller
	//
	var oListTodo;
	var oInputAddTask;

	function createListItem(mTask) {
		var listItem = new sap.m.DisplayListItem({label: mTask.t}).data("id", mTask.id);
		oListTodo.addAggregation("items", listItem);
		if (oListTodo.getItems().length > 0){ // We enable the send button now
			sendTaskButton.setEnabled(true)
		}
	}

	function deleteListItem(oListItem) {
		var id = oListItem.data("id");
		oListTodo.removeAggregation("items", oListItem);
		deleteTask(id);
	}

	function populateList() {
		for (var id in aTasks) {
			createListItem(aTasks[id]);
		}
	}

	function addNewTask() {
		var description = oInputAddTask.getValue();
		if (description) {
			var task = addTask(description);
			createListItem(task);
			oInputAddTask.setValue("");
			addTaskButton.setEnabled(false);
		}
	}

	function sendTasks() { // We submit the data from here
		var body = oListTodo.getItems(); 
		var url = "https://gunter.free.beeceptor.com/savepwadata";
		var xhr = new XMLHttpRequest();
		xhr.open("POST", url);
		xhr.setRequestHeader("Accept", "application/json");
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				console.log(xhr.status);
				console.log(xhr.responseText);
			}};

		xhr.send(body);
	}

	function onSwipeDelete() {
		deleteListItem(oListTodo.getSwipedItem());
		oListTodo.swipeOut();
		if (oListTodo.getItems().length==0){ // Check for empty list
			sendTaskButton.setEnabled(false);
		}
	}

	function onDeleteItem(oEvent) {
		deleteListItem(oEvent.getParameter("listItem"));
		if (oListTodo.getItems().length==0){ // Check for empty list
			sendTaskButton.setEnabled(false);
		}
	}


	//
	// View
	//
	var app = new sap.m.App("myApp");

	oListTodo = new sap.m.List({
		inset: true,
		mode: "Delete",
		noDataText: "Relax, you have no tasks for today :)",
		delete: onDeleteItem,
		swipeContent: new sap.m.Button({
			text: "Delete",
			type: "Reject",
			press: onSwipeDelete
		}),
		items: []
	});

	oInputAddTask = new sap.m.Input("addTaskInput", {
		placeholder: "New task..",
		value: "",
		width: "100%",
		submit: addNewTask,
		liveChange: function (oEvent) {
			addTaskButton.setEnabled(!!oEvent.getParameter("value"));
		}
	});

	var addTaskButton = new sap.m.Button("addTaskButton", {
		text: "Add",
		enabled: false,
		press: addNewTask
	});

	var sendTaskButton = new sap.m.Button("sendTaskButton", {
		text: "Send",
		enabled: false,
		press: sendTasks
	});
	
	var footer = new sap.m.Toolbar("footer", {
		content: [oInputAddTask, addTaskButton, sendTaskButton]
	});

	var todoPage = new sap.m.Page("todoPage", {
		title: "UI5 TODO Sample",
		showNavButton: false,
		showFooter: true,
		floatingFooter: true,
		footer: footer,
		content: [oListTodo]
	});

	// Start application
	loadTasks();
	populateList();

	app.addPage(todoPage);
	app.setInitialPage("todoPage");

	document.getElementById("splash-screen").remove(); // delete the splash screen
	app.placeAt("body", "only");
});
