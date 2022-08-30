const taskPriority = {
    1: 'high',
    2: 'normal',
    3: 'low'
}

// first tab page
class Task {
  constructor({name, dueDate, priority, completed, completeDate}) {
    this.name = name;
    this.dueDate = dueDate;
    this.priority = priority;
    this.completed = completed;  // true/false
    this.completedDate = completeDate;
  }
}

// second tab page
class WeeklyTask {
  constructor({name, priority, completed, days}) {
    this.name = name;
    this.priority = priority;
    this.completed = completed;  // [0 - 6] array value
    this.days = days;            // [0 - 6] array value
  }
}

class LocalStore {
  constructor(key) {
    this.key = key;
    this.tasks = []; // array of objects
  }

  getTasks() {
    let tasks = JSON.parse(localStorage.getItem(this.key));
    tasks?.forEach(task => this.tasks.push(task));
    return this.tasks;
  }

  getTask(name) {
    let taskObj, index;
    this.tasks.filter((task, i) => {
      if (task.name.toLowerCase() === name.trim().toLowerCase()) {
        [taskObj, index] = [task, i];
      }
    });
    return [taskObj, index];
  }

  addTask(task) {
    this.tasks.push(task);
    this.save();
  }

  updateTaskItem(name, property, value) {
    let [task, index] = this.getTask(name);
    if (task) {
      task[property] = value;
      this.save();
    }
  }

  updateTask(task, index) {
    this.tasks[index] = task;
    this.save();
  }

  removeTask(name) {
    let [task, index] = this.getTask(name);
    if (task) {
      this.tasks.splice(index, 1);
      this.save();
    }
  }

  removeArrayTask(name, property, value) {
    debugger;
    let [task, index] = this.getTask(name);
    if (task) {
      let isDeleteWholeTask = this.deleteArrayValue(task, property, value);
      if (isDeleteWholeTask) {
        this.tasks.splice(index, 1);
      }
      this.save();
    }
  }

  addArrayValue(task, property, value) { // for completed and days
     task[property].push(value);
  }

  updateArray(name, property, value, add = 1) { // 1: add, 0: remove
    debugger;
    let [task, index] = this.getTask(name);
    if (task) {
      (add) ? this.addArrayValue(task, property, value) 
            : this.deleteArrayValue(task, property, value)
      this.save();
    }
  }

  deleteArrayValue(obj, property, value) { // for completed and days
    let result = false;
    obj[property].forEach ((v, i) => {
      if (v == value) { 
        obj[property].splice(i, 1);
        result = (obj[property].length === 0) ? true : false; // nothing left mean delete whole
      }
    }); 
    return result;
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.tasks));
  }

}

// home tab page:  Collapsed UI for Adding new task
class AddNewTaskUI {}

// Second tab page:  Collapsed UI for Adding new weekly task
class AddWeeklyUI {
  
  static addWeeklyTask() {
    // validation of task name and week day
    if (AddWeeklyUI.validateAddWeeklyTask()) {
      let name = document.getElementById('weekly-task-input')?.value.trim();
      let [existTask, index] = weeklyData.getTask(name);
      if (existTask) {
        const collapseEl = document.getElementById('weekly_collapse');
        const refNode = document.querySelector('.new-weekly-body');
        Message.showMessage('Existing task. Please enter a different task', collapseEl, refNode);
        AddWeeklyUI.clearUI();
        return;
      }
      const task = {
          name: name,
          priority: document.getElementById('weeklyTask-priority')?.value,
          completed: [],
          days: AddWeeklyUI.getWeekDays()
      }
      weekDayUI.addWeeklyTask(task);
      weeklyData?.addTask(task);
      AddWeeklyUI.clearUI();
    }
  }

  static validateAddWeeklyTask() {
    let result = true;
    if (!document.getElementById('weekly-task-input')?.value.trim()) {
      // show alert
      document.getElementById('weekly-task-input')?.focus();
      document.getElementById('weekly-input-alert')?.classList.remove('visually-hidden');
      result = false;
    } else {
      document.getElementById('weekly-input-alert')?.classList.add('visually-hidden');
      document.getElementById('weekly-day-alert')?.classList.add('visually-hidden');
    }
    if (AddWeeklyUI.getWeekDays().length == 0) {
      document.getElementById('weekly-day-alert')?.classList.remove('visually-hidden');
      result = false;
    } 
    return result;
  }

  static getWeekDays() {
    let result = [];
    // Monday(check-weekly-0) to Sunday(check-weekly-6)
    for (let i = 0; i < 7; i++ ) {
        if (document.getElementById(`check-weekly-${i}`)?.checked) {
            result.push(document.getElementById(`check-weekly-${i}`)?.value);
        }
    }
    return result;
  }

  static setWeekDays(arr) {
    for (let i = 0; i < 7; i++ ) {
        document.getElementById(`check-weekly-${i}`).checked = false;
    }  

    if (arr) {
      arr.forEach(day => {
        document.getElementById(`check-weekly-${day}`).value = true;
      });
    } 
  }

  static clearUI () {
    document.getElementById('weekly-task-input').value = '';
    document.getElementById('weeklyTask-priority').value = 2;
    PriorityUI.setClassList('weekly-priority-color', 2); // span color
    AddWeeklyUI.setWeekDays(null);
  }

}

class Message {
  static showMessage(message, parentElement, referenceNode) {
    const div = document.createElement('div');
    div.classList.add('alert');
    div.appendChild(document.createTextNode(message));
    parentElement.insertBefore(div, referenceNode);

    // Timeout after 3 sec
    setTimeout(() => document.querySelector('.alert').remove(), 3000);   
  }
}

class WeekDayUI {

  loadWeekdays(tasks) {
    this.setHighlightTodaysCard();
    tasks.forEach((task) => this.addWeeklyTask(task));
  }

  setHighlightTodaysCard() {
      document.getElementById(`card${new Date().getDay()}`)?.classList.add('bg-warning');
  }

  addWeeklyTask(task) {
    if (!task) return;
    task.days?.forEach((day) => 
        document.getElementById(`task-list-${day}`)?.appendChild(
          this.createWeeklyTask(task, day)
        )
    )
  }

  createWeeklyTask(task, day) {
    const divEl = document.createElement("div");
    divEl.classList.add("weekly-task-item");
    // completed
    if (task.completed.includes(day)) {
      divEl.classList.add("completed");
    }

    const subDivEl = document.createElement("div");
    // priority
    const spanEl = document.createElement("span");
    spanEl.classList.add("priority-color");
    spanEl.classList.add(taskPriority[task.priority]);
    spanEl.dataset.priorityValue = task.priority;
    spanEl.innerHTML = '<i class="fa-solid fa-flag"></i> ';
    subDivEl.appendChild(spanEl);
    
    // task name
    subDivEl.appendChild(document.createTextNode(task.name));
    divEl.appendChild(subDivEl);
    
    // delete links
    const aLinkEl = document.createElement("a");
    aLinkEl.classList.add("weekly-del-btn");
    aLinkEl.innerHTML = '<i class="fa-solid fa-xmark"></i>';

    divEl.appendChild(aLinkEl);
    return divEl;
  }

  updateCompletedTask(divTaskItemEl) {
    //debugger;  
    let day = this.getDay(divTaskItemEl.parentElement);
    if (day >= 0) {
      let taskName = divTaskItemEl.firstElementChild.textContent.trim();
      divTaskItemEl.classList.toggle('completed')
      if (divTaskItemEl.classList.contains('completed')) {
        weeklyData.updateArray(taskName, 'completed', day, 1); // 1: add
      } else {
        weeklyData.updateArray(taskName, 'completed', day, 0); // 0: remove     
      }
    }
  }

  deleteTask(divTaskItemEl) {
    let day = this.getDay(divTaskItemEl.parentElement);
    if (day >= 0) {
      let taskName = divTaskItemEl.firstElementChild.textContent.trim();
      weeklyData.removeArrayTask(taskName, 'days', day);
      divTaskItemEl.remove();
    }
  }

  // 0:Sun - 6:Sat
  getDay(divTaskListEl) {
    if (divTaskListEl.classList.contains('task-list')) {
      if (divTaskListEl.id && divTaskListEl.id.length > 0) {
        return divTaskListEl.id.at(-1); 
      }
    }
    return -1;
  }

  // clear all day tasks
  clearTask(divTaskListEl) {
    let day = this.getDay(divTaskListEl);
    if (day >= 0) {
      if (divTaskListEl.childElementCount >= 0) {
        for(let taskItem of divTaskListEl.children) {
          let taskName = taskItem.firstElementChild.textContent.trim();
          weeklyData.removeArrayTask(taskName, 'days', day);
        }
        while (divTaskListEl.firstChild) {
          divTaskListEl.removeChild(divTaskListEl.firstChild);
        }
      }
    }
  }
}

class PriorityUI {
  setPriority(e) {
    PriorityUI.setClassList('priority-color', e.target.value);
  }

  setEditPriority(e) {
    PriorityUI.setClassList('edit-priority-color', e.target.value);
  }

  setWeeklyPriority(e) {
    PriorityUI.setClassList('weekly-priority-color', e.target.value);
  }

  static setClassList(spanId, value) {
    let prioritySpanEl = document.getElementById(spanId);
    prioritySpanEl?.classList.forEach((classItem) => {
        if (classItem != 'priority-color') {
            prioritySpanEl?.classList.remove(classItem);
        }
    });
    prioritySpanEl.dataset.priorityValue = value;
    prioritySpanEl?.classList.add(taskPriority[value]);
  }

  static setSpanClassList(prioritySpanEl, value) {
    //let prioritySpanEl = document.getElementById(spanId);
    prioritySpanEl?.classList.forEach((classItem) => {
        if (classItem != 'priority-color') {
            prioritySpanEl?.classList.remove(classItem);
        }
    });
    prioritySpanEl.dataset.priorityValue = value;
    prioritySpanEl?.classList.add(taskPriority[value]);
  }
}

////////////////////////////////////////////////////////
class TaskListUI {
  loadTaskItems(tasks) {
    tasks.forEach((task) => this.addTask(task));
  }
  
  addTask(task) {
    if (!task) return;
    this.createTaskItem(task);
  }

  createTaskItem(task) {
    // create row
    const taskTable = document.getElementById('task-table');
    let row = document.createElement('div');
    row.classList.add('row');
    row.classList.add('p-2');
    row.classList.add('border-bottom');
    if (task.completed) row.classList.add('completed');
    row.classList.add('task-row');
    taskTable?.appendChild(row);

    // create columns
    this.createColumn(row, ['col-1'], `<a href="#" class="task-completed-check ${task.completed ? "completed" : ""}"><i class="fa-regular fa-circle"></i><i class="fa-solid fa-check"></i></a>`);
    this.createColumn(row, ['col', 'text-start', 'task'], task.name.trim());
    this.createColumn(row, ['col-sm-2', 'd-none', 'd-sm-block', 'due-date'], task.dueDate);
    this.createColumn(row, ['col-1', 'priority'], `<span class="priority-color ${taskPriority[task.priority]}" data-priority-value="${task.priority}"><i class="fa-solid fa-flag"></i></span>`);
    this.createColumn(row, ['d-none', 'd-lg-block', 'col-lg-2', 'completed-date'], task.completeDate);
    this.createColumn(row, ['col-2', 'col-md-1'], '<a href="#" class="task-edit"><i class="fa-solid fa-pencil"></i></a> <a href="#" class="task-delete"><i class="fa-solid fa-xmark"></i></a>');

    //row.addEventListener('click', taskItemEventHandler);
  }

  createColumn(parentRow, classList, innerHtml, defaultEl = null) {
    let el = (defaultEl) ? document.createElement(defaultEl) : document.createElement('div');

    for (let classItem of classList) {
        el.classList.add(classItem);
    }
    el.innerHTML = innerHtml;
    parentRow.appendChild(el);
  }

  toggleCompleted(taskRowEl) {
    let name = taskRowEl.firstElementChild.nextElementSibling.textContent?.trim();
    let [task, taskIndex] = taskData.getTask(name);
    taskRowEl.classList.toggle('completed');
    if (task) {
      task.completed =  taskRowEl.classList.contains('completed');
      let column = this.getCompleteDateColumn(taskRowEl);
      if(taskRowEl.classList.contains('completed')) {
        task.completeDate = UtilLib.getToday();
        column.textContent = task.completeDate;
      } else {
        task.completeDate = '';
        column.textContent = '';
      }
      taskData.updateTask(task, taskIndex);
    }
  }

  getCompleteDateColumn(taskRowEl) {
    if (taskRowEl.childElementCount === 6) {
      if (taskRowEl.children[4].classList.contains('completed-date'))
        return taskRowEl.children[4];
    }
  }

  updateTask(taskRowEl, task) {
    if (task.completed) {
      taskRowEl.classList.add('completed');
    } else {
      taskRowEl.classList.remove('completed');
    }
    //task name
    let firstChildren = taskRowEl.firstElementChild;
    firstChildren.nextElementSibling.textContent = task.name;
    //task due date
    firstChildren.nextElementSibling.nextElementSibling.textContent = task.dueDate;
    //task priority
    let priorityColumn = firstChildren.nextElementSibling.nextElementSibling.nextElementSibling;
    PriorityUI.setSpanClassList(priorityColumn.firstElementChild, task.priority);
    priorityColumn.nextElementSibling.textContent = task.completeDate;
  }

  deleteTask(taskRowEl) {
    let name = taskRowEl.firstElementChild.nextElementSibling.textContent;
    if (name && name.trim().length > 0) {
      taskData.removeTask(name.trim());
      taskRowEl.remove();
    }
  }

  searchTask() {
    const taskTable = document.getElementById("task-table");
    let searchText = document.getElementById('search-input').value.trim(); // search input value
    for (let i = 1; i < taskTable?.childElementCount; i++) {
      let task = taskTable?.children[i].children[1].textContent.trim(); // task name
      if (task?.toLowerCase().includes(searchText.toLowerCase())) {
        taskTable.children[i].hidden = false;
      } else {
        taskTable.children[i].hidden = true;
      }
    }
  }
}

class UtilLib {
  static getToday() {
    let today = new Date();
    const year = today.getFullYear();
    return today.getFullYear() 
            + '-' + (today.getMonth() + 1).toString().padStart(2, '0') 
            + '-' + (today.getDate()).toString().padStart(2, '0');
  }
}

class AddTaskUI {

  static addTaskItem() {
    if (AddTaskUI.validateAddTask()) {
        let name = document.getElementById('task-input')?.value.trim();
        let [existTask, index] = taskData.getTask(name);
        if (existTask) {
          const collapseEl = document.getElementById('task-collapse');
          const refNode = document.querySelector('.new-task-group');
          Message.showMessage('Existing task. Please enter a different task', collapseEl, refNode);
          this.clearUI();
          return;
        }
        const task = {
          name: name,
          dueDate: document.getElementById('task-dueDate')?.value,
          priority: document.getElementById('task-priority')?.value,
          completed: false,
          completeDate: ''
        }
        taskListUI.addTask(task);
        taskData?.addTask(task);
        AddTaskUI.clearUI();
    }
  }

  static validateAddTask() {
    let result = true;
    let taskInput = document.getElementById('task-input');
    if (!taskInput?.value.trim()) {
      taskInput?.focus();
      document.getElementById('task-input-alert')?.classList.remove('visually-hidden');
      result = false;
    } else {
      document.getElementById('task-input-alert')?.classList.add('visually-hidden');
    }
    // due date
    let taskDueDate = document.getElementById('task-dueDate');
    if (taskDueDate?.value) {
        document.getElementById('task-dueDate-alert')?.classList.add('visually-hidden');
    } else {
      document.getElementById('task-dueDate-alert')?.classList.remove('visually-hidden');
      result =  false;
    }
    return result;
  }

  static clearUI() {
        // initialize the Modal dialog after adding
        document.getElementById('task-input').value = "";
        document.getElementById('task-dueDate').value = "";
        
        //init priority to normal -> span & select
        //setPrioritySpanClassList(document.getElementById('priority-color'), 2);
        //document.getElementById('task-priority').value = 2;
        PriorityUI.setClassList('priority-color', 2);
  }
  
}

class EditTaskUI {

  constructor(taskRowEl) {
    this.row = taskRowEl;
    this.name = this.row?.firstElementChild.nextElementSibling.textContent?.trim();
    [this.task, this.taskIndex] = taskData.getTask(this.name);
  }

  show() {
    if (this.task) {
      const editModal = new bootstrap.Modal('#editTaskModal');
      document.getElementById('task-edit-input').value = this.task.name;
      document.getElementById('edit-dueDate').value = this.task.dueDate;
      document.getElementById('edit-priority').value = this.task.priority;
      PriorityUI.setClassList('edit-priority-color', this.task.priority); 
      document.getElementById('edit-compDate').value = this.task.completeDate;
      editModal.show();
    }
  }

  updateTask() {
    if (this.validateUpdateTask()) {
      let updateName = document.getElementById('task-edit-input')?.value.trim();
      // if task name has changed, then check existing task name
      if (this.name !== updateName) {
        let [existTask, index] = taskData.getTask(updateName);
        if (existTask) {
          const collapseEl = document.getElementById('modal-body');
          const refNode = document.querySelector('.new-task-group');
          Message.showMessage('Existing task. Please enter a different task', collapseEl, refNode);
          document.getElementById('task-edit-input').value = this.name;
          return;
        }
      }
      this.update();
      this.clearProperties();
    }
  }

  validateUpdateTask() {
    let result = true;
    let taskInput = document.getElementById('task-edit-input');
    if (!taskInput?.value.trim()) {
      taskInput?.focus();
      document.getElementById('edit-input-alert')?.classList.remove('visually-hidden');
      result = false;
    } else {
      document.getElementById('edit-input-alert')?.classList.add('visually-hidden');
    }
    // due date
    let taskDueDate = document.getElementById('edit-dueDate');
    if (taskDueDate?.value) {
        document.getElementById('edit-dueDate-alert')?.classList.add('visually-hidden');
    } else {
      document.getElementById('edit-dueDate-alert')?.classList.remove('visually-hidden');
      result =  false;
    }
    return result;
  }

  update() {
    // update memory
    this.task.name = document.getElementById('task-edit-input').value.trim();
    this.task.dueDate = document.getElementById('edit-dueDate').value;
    this.task.priority = document.getElementById('edit-priority').value;
    this.task.completeDate = document.getElementById('edit-compDate').value;
    if (this.task.completeDate) {
      this.task.completed = true;
    } else {
      this.task.completed = false;
    }
    
    // save to memory & localStorage
    taskData.updateTask(this.task, this.taskIndex);

    // update task list table
    debugger;
    taskListUI.updateTask(this.row, this.task);
  }

  clearProperties() {
    this.row = null;
    this.task = null;
    this.name = '';
  }
}

const taskData = new LocalStore('taskMan');;
const weeklyData = new LocalStore('weeklyMan');

const taskListUI = new TaskListUI();
const priorityUI = new PriorityUI();
const weekDayUI = new WeekDayUI();

loadTaskHomeTab();
loadWeeklyTaskTab();
addTaskEventListeners();

//localStorage.clear('taskMan'); // for clear memory 
//localStorage.clear('weeklyMan'); // for clear memory 
function loadTaskHomeTab() {
  taskListUI.loadTaskItems(taskData.getTasks());
}

function loadWeeklyTaskTab() {
  weekDayUI.loadWeekdays(weeklyData.getTasks());
}

function addTaskEventListeners() {
  addTaskEventListeners();
  addPriorityEventListeners();
}

function addTaskEventListeners() {
  // add new task button event
  document.getElementById('add-task-btn')?.addEventListener("click", AddTaskUI.addTaskItem);
  // Task List event delegation
  document.getElementById('task-table')?.addEventListener("click", taskListEventDelegation);
    
  // Search form submit button
  document.getElementById('search-form')?.addEventListener("submit", (e) => {
      e.preventDefault();
      taskListUI.searchTask();
  });
  // Search input event
  document.getElementById('search-input')?.addEventListener("input", taskListUI.searchTask);
  // search delete input
  document.getElementById('search-btn-close')?.addEventListener("click", (e) => {
      document.getElementById('search-input').value = '';
      taskListUI.searchTask();
  });

  // weekly
  document.getElementById('add-weekly-btn')?.addEventListener("click", AddWeeklyUI.addWeeklyTask);
  document.getElementById('weekDayCard')?.addEventListener("click", weekTaskEventDelegatation);
}

function taskListEventDelegation(e) {
  // edit event
  if (e.target.parentElement.classList.contains('task-edit')) {
    editTaskUI = new EditTaskUI(e.target.parentElement.parentElement.parentElement);
    // edit task button event
    document.getElementById('edit-task-btn')?.addEventListener("click", () => {
          editTaskUI.updateTask();
    });
    editTaskUI.show();
    return;
  }
  // delete event
  if (e.target.parentElement.classList.contains('task-delete')) {
    taskListUI.deleteTask(e.target.parentElement.parentElement.parentElement);
    return;
  }
  // completed 
  if (e.target.parentElement.classList.contains('task-completed-check')) {
    taskListUI.toggleCompleted(e.target.parentElement.parentElement.parentElement);
    return;
  }
  if (e.target.classList.contains('task')) {
    taskListUI.toggleCompleted(e.target.parentElement);
    return;
  }
}

function addPriorityEventListeners() {
  document.getElementById('task-priority')?.addEventListener("change", priorityUI.setPriority);
  document.getElementById('edit-priority')?.addEventListener("change", priorityUI.setEditPriority);
  document.getElementById('weeklyTask-priority')?.addEventListener("change", priorityUI.setWeeklyPriority);
}

function weekTaskEventDelegatation(e) {
    // Delete
    if (e.target.parentElement.classList.contains('weekly-del-btn')) {
      e.stopPropagation();
      if (e.target.parentElement.parentElement.classList.contains('weekly-task-item')) {
        weekDayUI.deleteTask(e.target.parentElement.parentElement);
      }
      return;
    }
    // change Completed
    if (e.target.parentElement.classList.contains('weekly-task-item')){  
      //console.log("completed" + e.target.parentElement);
      e.stopPropagation();
       weekDayUI.updateCompletedTask(e.target.parentElement);
    }
    // clear button
    if (e.target.classList.contains('btn-day-clear')) {
      weekDayUI.clearTask(e.target.parentElement.firstElementChild); //"task-list-0"
    }
  }


