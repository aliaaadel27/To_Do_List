// Select DOM elements for the task management interface
const taskInput = document.getElementById('taskInput'); // Input field for new tasks
const addTaskBtn = document.getElementById('addTaskBtn'); // Button to add a new task
const taskList = document.getElementById('taskList'); // UL element to display pending tasks
const completedTaskList = document.getElementById('completedTaskList'); // UL for completed tasks
const notification = document.getElementById('notification'); // Element for displaying notifications

// Load tasks from localStorage or initialize an empty array if no tasks exist
let tasks = JSON.parse(localStorage.getItem('tasks')) || []; 
let editingTaskId = null; // To track the ID of the task currently being edited

// Load tasks from localStorage when the page is fully loaded
document.addEventListener('DOMContentLoaded', loadTasks);

// Event listener for adding tasks when the button is clicked
addTaskBtn.addEventListener('click', addTask);

// Function to load tasks from localStorage and populate the UI
function loadTasks() {
    tasks.forEach((task) => {
        // Check if the task is marked as completed and create the appropriate UI element
        if (task.completed) {
            createCompletedTaskElement(task); // Create element for completed tasks
        } else {
            createTaskElement(task); // Create element for pending tasks
        }
    });
}

// Function to add a new task or update an existing one based on the editing state
function addTask() {
    const taskText = taskInput.value.trim(); 
    if (taskText === '') { 
        showNotification(`Please enter a task.`); 
        return; 
    }

    // Check if an existing task is being edited
    if (editingTaskId !== null) {
        //spread operator which creates a new task object by copying all the properties from the original task,
        //and updates the text property of the task with the new value 
        tasks = tasks.map(task => 
            task.id === editingTaskId ? { ...task, text: taskText } : task
        );
        updateTaskInLocalStorage(); 
        // Update the displayed task text
        const taskItem = document.querySelector(`[id="${editingTaskId}"]`);
        taskItem.firstChild.nextSibling.nodeValue = taskText; 
        showNotification(`Task updated successfully.`); 
        editingTaskId = null; // Reset the editing task ID
        addTaskBtn.textContent = 'Add Task'; // Restore button text to "Add Task"
    } else {
        // If adding a new task, create a task object and add it to the tasks array
        const newTask = { id: Date.now(), text: taskText, completed: false }; 
        tasks.push(newTask); 
        createTaskElement(newTask); // Create UI element for the new task
        saveTasksToLocalStorage(); // Save the updated tasks to localStorage
        showNotification(`Task "${taskText}" added successfully.`); 
    }

    taskInput.value = ''; // Clear the input field after adding or editing a task
}

// Function to create a UI element for a pending task
function createTaskElement(task) {
    const li = document.createElement('li'); // Create a list item for the task
    li.classList.add('d-flex', 'align-items-center'); // Add CSS classes for styling
    li.setAttribute('id', task.id); // Set unique task ID

    // Create a checkbox for marking the task as completed
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'; 
    checkbox.classList.add('mr-2'); 
    // Add an event listener to mark the task as completed when the checkbox is toggled
    checkbox.addEventListener('change', () => {
        markTaskAsCompleted(task.id, li); 
    });

    li.appendChild(checkbox); 
    li.appendChild(document.createTextNode(task.text));

    // Create an edit button for the task
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit'; 
    editBtn.classList.add('btn', 'btn-primary', 'btn-sm', 'ml-2'); 
    // Add an event listener to initiate editing of the task
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the checkbox change event
        editingTaskId = task.id; 
        taskInput.value = task.text; // Populate the input field with the current task text
        addTaskBtn.textContent = 'Edit Task'; // Change button text to indicate editing mode
    });

    // Create a delete button for the task
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete'; 
    deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'ml-2'); 
    // Add an event listener to delete the task from the UI and tasks array (local storage).
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        li.classList.add('removing'); // Add a class for the removal animation
        setTimeout(() => {
            li.remove(); // Remove from UI
            tasks = tasks.filter(t => t.id !== task.id); // Remove from tasks array
            saveTasksToLocalStorage();
            showNotification(`Task "${task.text}" deleted successfully.`); 
        }, 300); // Match this timeout with the CSS transition duration for animation
    });

    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}

// Function to mark a task as completed
function markTaskAsCompleted(taskId, li) {
    const taskText = li.textContent.replace('EditDelete', '').trim(); // Extract task text, removing button texts
    li.classList.add('removing'); 

    // Set a timeout to delay the removal of the task element
    setTimeout(() => {
        li.remove(); // Remove from pending tasks list
        // Update the completion status of the task in the tasks array
        tasks = tasks.map(task => 
            task.id === taskId ? { ...task, completed: true } : task
        ); 
        createCompletedTaskElement({ id: taskId, text: taskText }); // Create a UI element for the completed task
        saveTasksToLocalStorage(); 
        showNotification(`Task marked as completed.`); 
    }, 300); 
}

// Function to create a UI element for completed tasks
function createCompletedTaskElement(task) {
    const li = document.createElement('li'); 
    li.classList.add('d-flex', 'align-items-center', 'completed'); 
    li.setAttribute('id', task.id); 

    li.appendChild(document.createTextNode(task.text)); 

    // Create a delete button for completed tasks
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete'; 
    deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'ml-2'); 
    // Add an event listener to delete the completed task from the UI and tasks array (local Storage)
    deleteBtn.addEventListener('click', () => {
        li.classList.add('removing'); 
        setTimeout(() => {
            li.remove(); // Remove from UI
            tasks = tasks.filter(t => t.id !== task.id); // Remove from tasks array
            saveTasksToLocalStorage(); 
            showNotification(`Completed task "${task.text}" deleted successfully.`); 
        }, 300); 
    });

    li.appendChild(deleteBtn); 
    completedTaskList.appendChild(li); 
}

// Function to show notifications to the user
function showNotification(message) {
    notification.textContent = message; 
    notification.classList.add('show', 'slide-in'); 
    notification.style.display = 'block'; // Ensure the notification is visible

    // Set a timeout to remove the slide-in animation class
    setTimeout(() => {
        notification.classList.remove('slide-in'); 
    }, 500); 

    // Set a timeout to hide the notification after a specific duration
    setTimeout(() => {
        notification.classList.remove('show'); 
        setTimeout(() => {
            notification.style.display = 'none'; // Hide the notification element
        }, 500); 
    }, 3000); 
}

// Function to save the tasks array to localStorage
function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Convert tasks array to JSON and store it
}

// Function to update localStorage when a task is edited
function updateTaskInLocalStorage() {
    saveTasksToLocalStorage(); // Call function to save tasks to localStorage
}
