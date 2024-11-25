// Solicita permissão de notificações ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    requestNotificationPermission();
    setInterval(checkTaskDeadlines, 10000); // Verifica as tarefas a cada 10 segundos
});

// Função para adicionar uma nova tarefa
function addTask() {
    const taskInput = document.getElementById('task').value.trim();
    const dateInput = document.getElementById('date').value;
    const timeInput = document.getElementById('time').value;

    if (taskInput !== '' && dateInput !== '' && timeInput !== '') {
        const task = {
            text: taskInput,
            date: dateInput,
            time: timeInput,
            datetime: new Date(dateInput + 'T' + timeInput).getTime() // Converte para timestamp para facilitar a ordenação
        };

        let tasks = getTasks();
        tasks.push(task);
        tasks.sort((a, b) => a.datetime - b.datetime); // Ordena as tarefas pela data e hora
        saveTasks(tasks);
        renderTasks();

        // Verifica imediatamente se a tarefa recém-adicionada está dentro do intervalo de 15 minutos
        checkTaskDeadlines();
    }
}

// Função para carregar as tarefas do Local Storage
function loadTasks() {
    let tasks = getTasks();
    const now = Date.now();
    
    // Verifica as tarefas ao carregar a página
    tasks.forEach(task => {
        const timeDifference = task.datetime - now;
        if (timeDifference > 0 && timeDifference <= 15 * 60 * 1000) {
            triggerNotification(task.text, task.datetime);
        }
    });

    renderTasks();
}

// Função para renderizar as tarefas no DOM
function renderTasks() {
    let tasks = getTasks();
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Limpa a lista de tarefas

    tasks.forEach(task => {
        appendTaskToDOM(task);
    });
}

// Função para salvar as tarefas no Local Storage
function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Função para obter as tarefas do Local Storage
function getTasks() {
    let tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
}

// Função para adicionar uma tarefa ao DOM
function appendTaskToDOM(task) {
    const taskList = document.getElementById('task-list');
    const li = document.createElement('li');

    // Formatar data e hora para exibição
    const formattedDate = new Date(task.datetime).toLocaleDateString();
    const formattedTime = new Date(task.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    li.innerHTML = `
        <span>${task.text}</span>
        <span>${formattedDate} - ${formattedTime}</span>
        <button onclick="removeTask(${task.datetime})">Remover</button>
    `;

    taskList.appendChild(li);
}

// Função para remover uma tarefa
function removeTask(datetime) {
    let tasks = getTasks();
    tasks = tasks.filter(task => task.datetime !== datetime);
    saveTasks(tasks);
    renderTasks();
}

// Função para pedir permissão para enviar notificações
function requestNotificationPermission() {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
            if (permission !== 'granted') {
                document.getElementById('notification-permission').classList.remove('hidden');
                console.log('Notificações não permitidas pelo usuário.');
            }
        });
    }
}

// Função que verifica prazos das tarefas
function checkTaskDeadlines() {
    const now = Date.now();
    let tasks = getTasks();

    tasks.forEach(task => {
        const taskTime = task.datetime;
        const timeDifference = taskTime - now;

        // Verifica se a tarefa está a menos de 15 minutos de vencer (15 * 60 * 1000 = 900000 milissegundos)
        if (timeDifference > 0 && timeDifference <= 15 * 60 * 1000) {
            triggerNotification(task.text, task.datetime);
        }
    });
}

// Função para disparar a notificação de lembrete
function triggerNotification(taskText, taskDatetime) {
    const formattedDate = new Date(taskDatetime).toLocaleDateString();
    const formattedTime = new Date(taskDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (Notification.permission === 'granted') {
        new Notification('Tarefa Pendente!', {
            body: `A tarefa "${taskText}" está prevista para ${formattedDate} às ${formattedTime}.`,
            icon: 'https://via.placeholder.com/50' // Você pode usar um ícone personalizado aqui
        });
    }
}
