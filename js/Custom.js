// Custom.js
// Main JavaScript for To-Do List Application
// Author: KAPAKA
// Date: 2025-01-01
// Description: This script handles task management, UI interactions, and data persistence for the to-do list application.
// Dependencies: None
// Version: 2.0.0
// GitHub: https://github.com/kapaka-m

document.addEventListener('DOMContentLoaded', function () {

    const taskInput = document.querySelector('[data-task-input]');
    const timeInput = document.querySelector('[data-time-input]');
    const addTaskBtn = document.querySelector('[data-add-task]');
    const taskList = document.querySelector('[data-task-list]');
    const completedList = document.querySelector('[data-completed-list]');
    const deletedList = document.querySelector('[data-deleted-list]');
    const completedEmpty = document.querySelector('[data-completed-empty]');
    const taskEmpty = document.querySelector('[data-tasks-empty]');
    const deletedEmpty = document.querySelector('[data-deleted-empty]');
    const menuToggler = document.querySelector('[data-menu-toggler]');
    const menu = document.querySelector('[data-menu]');
    const modalToggler = document.querySelector('[data-modal-toggler]');
    const modalClose = document.querySelector('[data-modal-close]');
    const modal = document.querySelector('[data-info-modal]');
    const themeButtons = document.querySelectorAll('[data-theme-btn]');
    const tabButtons = document.querySelectorAll('[data-tab]');
    const sections = document.querySelectorAll('[data-section]');
    const completeSound = document.getElementById('complete-sound');
    const deleteSound = document.getElementById('delete-sound');
    const alertSound = document.getElementById('alert-sound');

    const motivationalQuotes = [
        "ابدأ يومك بطاقة إيجابية",
        "رحلة الألف ميل تبدأ بخطوة ",
        "إنجاز صغير اليوم يقربك من هدفك الكبير ",
        "لا تؤجل عمل اليوم إلى الغد ",
        "قليل دائم خير من كثير منقطع "
    ];

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
    let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];
    let alertInterval;

    function updateDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString('ar-EG', options);
        document.querySelector('[data-header-time]').textContent = dateString;
    }

    function saveData() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
        localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
    }

    function checkTaskTime() {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        tasks.forEach((task, index) => {
            if (task.time && task.time === currentTime) {
                alertSound.play();

                const taskItems = document.querySelectorAll('[data-section="tasks"] .task-item');
                if (taskItems[index]) {
                    taskItems[index].classList.add('time-alert');
                    setTimeout(() => taskItems[index].classList.remove('time-alert'), 3000);
                }

                if (Notification.permission === 'granted') {
                    new Notification('وقت المهمة انتهاء!   ', {
                        body: task.text,
                        icon: '/img/done.png'
                    });
                }
            }
        });
    }

    function requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';

        const welcomeNote = document.querySelector('[data-welcome-note]');
        const welcomeTitle = welcomeNote.querySelector('.h2');

        if (tasks.length === 0) {
            taskEmpty.style.display = 'flex';
            welcomeTitle.textContent = "ما هي مهامك اليوم؟";
            return;
        }

        taskEmpty.style.display = 'none';

        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        welcomeTitle.textContent = `${randomQuote}\n`;

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
            <input type="checkbox" class="task-checkbox">
            <div class="task-content">
                <input type="text" class="task-text" value="${task.text}" readonly>
                ${task.time ? `<div class="task-time"><ion-icon name="time-outline"></ion-icon> ${task.time}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="task-btn task-delete">
                <ion-icon name="trash-outline"></ion-icon>
                </button>
            </div>
            `;

            const checkbox = li.querySelector('.task-checkbox');
            const deleteBtn = li.querySelector('.task-delete');

            checkbox.addEventListener('change', () => completeTask(index));
            deleteBtn.addEventListener('click', () => deleteTask(index));

            taskList.appendChild(li);
        });
    }

    function renderCompletedTasks() {
        completedList.innerHTML = '';

        if (completedTasks.length === 0) {
            completedEmpty.style.display = 'flex';
            return;
        }

        completedEmpty.style.display = 'none';

        completedTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" checked>
                <div class="task-content">
                <input type="text" class="task-text completed" value="${task.text}" readonly>
                ${task.time ? `<div class="task-time"><ion-icon name="time-outline"></ion-icon> ${task.time}</div>` : ''}
                </div>
                <div class="task-actions">
                <button class="task-btn task-delete">
                    <ion-icon name="trash-outline"></ion-icon>
                </button>
                </div>
            `;

            const checkbox = li.querySelector('.task-checkbox');
            const deleteBtn = li.querySelector('.task-delete');

            checkbox.addEventListener('change', () => restoreCompletedTask(index));
            deleteBtn.addEventListener('click', () => deleteCompletedTask(index));

            completedList.appendChild(li);
        });
    }

    function renderDeletedTasks() {
        deletedList.innerHTML = '';

        if (deletedTasks.length === 0) {
            deletedEmpty.style.display = 'flex';
            return;
        }

        deletedEmpty.style.display = 'none';

        deletedTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
            <div class="task-content">
                <input type="text" class="task-text" value="${task.text}" readonly style="color: #999;">
                ${task.time ? `<div class="task-time"><ion-icon name="time-outline"></ion-icon> ${task.time}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="task-btn task-delete">
                <ion-icon name="refresh-outline"></ion-icon>
                </button>
            </div>
            `;

            const restoreBtn = li.querySelector('.task-delete');

            restoreBtn.addEventListener('click', () => restoreDeletedTask(index));

            deletedList.appendChild(li);
        });
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;

        const time = timeInput.value;
        tasks.push({ text, time });
        saveData();
        renderTasks();
        taskInput.value = '';
        timeInput.value = '';
    }

    function completeTask(index) {
        const completedTask = tasks.splice(index, 1)[0];
        completedTasks.push(completedTask);
        saveData();
        renderTasks();
        renderCompletedTasks();

        completeSound.play();
    }

    function deleteTask(index) {
        const deletedTask = tasks.splice(index, 1)[0];
        deletedTasks.push(deletedTask);
        saveData();
        renderTasks();
        renderDeletedTasks();

        deleteSound.play();
    }

    function restoreCompletedTask(index) {
        const restoredTask = completedTasks.splice(index, 1)[0];
        tasks.push(restoredTask);
        saveData();
        renderTasks();
        renderCompletedTasks();
    }

    function deleteCompletedTask(index) {
        const deletedTask = completedTasks.splice(index, 1)[0];
        deletedTasks.push(deletedTask);
        saveData();
        renderCompletedTasks();
        renderDeletedTasks();

        deleteSound.play();
    }

    function restoreDeletedTask(index) {
        const restoredTask = deletedTasks.splice(index, 1)[0];
        tasks.push(restoredTask);
        saveData();
        renderTasks();
        renderDeletedTasks();
    }

    function switchTab(tabName) {

        tabButtons.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        sections.forEach(section => {
            if (section.dataset.section === tabName) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    }

    function changeTheme(hue) {
        document.documentElement.style.setProperty('--hue', hue);

        document.documentElement.style.setProperty('--primary-color', `hsl(${hue}, 80%, 60%)`);
        document.documentElement.style.setProperty('--primary-light', `hsl(${hue}, 80%, 95%)`);
        document.documentElement.style.setProperty('--body-bg-color', `hsl(${hue}, 60%, 98%)`);
        document.documentElement.style.setProperty('--title-color', `hsl(${hue}, 30%, 25%)`);
        document.documentElement.style.setProperty('--text-color', `hsl(${hue}, 20%, 35%)`);
        document.documentElement.style.setProperty('--border-color', `hsl(${hue}, 60%, 90%)`);
        document.documentElement.style.setProperty('--input-bg-color', `hsl(${hue}, 60%, 97%)`);
        document.documentElement.style.setProperty('--time-color', `hsl(${hue}, 40%, 50%)`);
    }

    function initEvents() {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });

        addTaskBtn.addEventListener('click', addTask);

        menuToggler.addEventListener('click', () => {
            menu.classList.toggle('active');
        });

        modalToggler.addEventListener('click', () => {
            modal.classList.add('active');
        });

        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const hue = btn.dataset.hue;
                changeTheme(hue);

                themeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                switchTab(btn.dataset.tab);
            });
        });
    }

    function init() {
        updateDate();
        renderTasks();
        renderCompletedTasks();
        renderDeletedTasks();
        initEvents();
        requestNotificationPermission();

        alertInterval = setInterval(checkTaskTime, 60000);

        switchTab('tasks');
    }

    init();
});