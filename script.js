const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const filterInput = document.querySelector(".task-filter");
const taskList = document.querySelector(".task-list");
const taskListItems = document.querySelectorAll(".task-item");
const addTaskButton = document.getElementById("add-button");
const clearTaskButton = document.getElementById("clear-task-button");
const taskCompletedChk = document.getElementById("task-completed-chk");

initialize();

function initialize() {
    // Load the task list from Local Storage
    loadfromLocalStorage();
    // Add Event listeners
    initAddEventListeners();
}

function loadfromLocalStorage() {
    const taskData = JSON.parse(localStorage.getItem("task-data")); // return array of objects
    if (taskData) {
        if (taskData.length === 0) {
            taskInput.focus();
        }
        taskData.forEach((item) => {
            createTaskItemElement(item.text, item.completed);
        });
    } else {
        taskInput.focus();
    }
}

function initAddEventListeners() {
    // New Task Submit Input Event
    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        addTaskItem();
    });
    // Add task & Clear task button
    addTaskButton.addEventListener("click", addTaskItem);
    clearTaskButton.addEventListener("click", clearTaskItems);
    // Filter keyboard event
    filterInput.addEventListener('keyup', filterTaskList);
    taskCompletedChk.addEventListener('click', filterCompletedTaskList);
}

function addTaskItem() {
    let taskText = taskInput.value;
    if (taskText.trim().length > 0) {
        createTaskItemElement(taskText.trim());
    }
    taskInput.value = '';
}

function createTaskItemElement(taskText, completed = false) {
    const divEl = document.createElement("div");
    divEl.classList.add("task-item");
    if (completed) divEl.classList.add("completed");
    divEl.innerText = taskText;
    
    //add delete <a> button
    const aLinkEl = document.createElement("a");
    aLinkEl.classList.add("delete-btn");
    aLinkEl.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    divEl.appendChild(aLinkEl);
    
    taskList.appendChild(divEl);
    taskAddEventListeners(divEl);
    updateLocalStorage();
}

function taskAddEventListeners(taskItem) {
    //toggle completed
    taskItem.addEventListener("click", () => {
        toggleComplete(taskItem);
    });

    //delete task item
    if(taskItem.children) {
        taskItem.firstElementChild.addEventListener("click", (e) => {
            e.stopPropagation();
            //console.log(e.target);
            deleteTaskItem(e.target.parentElement.parentElement);
        });
    } 
}

function toggleComplete(taskItem) {
    taskItem.classList.toggle("completed");
    updateLocalStorage();
}

function deleteTaskItem(taskItem) {
    taskItem.remove();
    updateLocalStorage();
}

// Clear all tasks or filtered tasks
function clearTaskItems() {
    const tasks = document.querySelectorAll(".task-item");
    if (tasks.length > 0 && confirm("Are you sure you want to delete all tasks?")) {
        tasks.forEach(task => {
            if (task.style.display !== "none") {
                task.remove()
            }
        });
        updateLocalStorage();
        filterTextAndCompleted();
    }
    filterInput.value = '';
    taskCompletedChk.checked = false;
}

// Save to local storage with object array[{text:value, completed}, ...]
function updateLocalStorage() {
    const divEls = document.querySelectorAll(".task-item");
    const storageObjects = [];

    divEls.forEach(divEl => {
        storageObjects.push( {
                text: divEl.innerText, 
                completed: divEl.classList.contains("completed")   
        })
    });
    localStorage.setItem('task-data', JSON.stringify(storageObjects));
}

// Filter tasks whenever keyup event fires
function filterTaskList(e) {
    //const filterText = e.target.value.toLowerCase();
    filterTextAndCompleted(e.target.value.toLowerCase())
}

function filterCompletedTaskList(e) {
    filterTextAndCompleted(filterInput.value);

}

function filterTextAndCompleted(filterText = '') {
    document.querySelectorAll(".task-item").forEach(taskItem => {
        if (taskCompletedChk.checked) {
           if (taskItem.classList.contains("completed") &&
               taskItem.textContent.toLowerCase().includes(filterText)) {
                taskItem.style.display = "block";
            } else {
                    taskItem.style.display = "none";
            } 
        } else {
            if (taskItem.textContent.toLowerCase().includes(filterText)) {
                taskItem.style.display = "block";
            } else {
                taskItem.style.display = "none";
            }
        }
    })
}