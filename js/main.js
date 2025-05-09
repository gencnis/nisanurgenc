const taskbar = document.querySelector('.taskbar');

function openWindow(id) {
    const win = document.getElementById(id);
    win.style.display = 'block';
    win.style.zIndex = getMaxZIndex() + 1;
    addToTaskbar(id);
}

function closeWindow(id) {
    document.getElementById(id).style.display = 'none';
    removeFromTaskbar(id);
}

function minimizeWindow(id) {
    document.getElementById(id).style.display = 'none';
    const btn = document.getElementById(`task-${id}`);
    if (btn) btn.classList.add('minimized');
}

function restoreWindow(id) {
    const win = document.getElementById(id);
    win.style.display = 'block';
    win.style.zIndex = getMaxZIndex() + 1;
    const btn = document.getElementById(`task-${id}`);
    if (btn) btn.classList.remove('minimized');
}

function startDrag(e, id) {
    const win = document.getElementById(id);
    win.style.zIndex = getMaxZIndex() + 1;
    let shiftX = e.clientX - win.getBoundingClientRect().left;
    let shiftY = e.clientY - win.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
        win.style.left = pageX - shiftX + 'px';
        win.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    document.addEventListener('mouseup', function() {
        document.removeEventListener('mousemove', onMouseMove);
    }, { once: true });
}

function getMaxZIndex() {
    let maxZ = 0;
    document.querySelectorAll('.window').forEach(win => {
        const z = parseInt(window.getComputedStyle(win).zIndex) || 0;
        if (z > maxZ) maxZ = z;
    });
    return maxZ;
}

function addToTaskbar(id) {
    if (document.getElementById(`task-${id}`)) return;
    const btn = document.createElement('button');
    btn.id = `task-${id}`;
    btn.className = 'taskbar-button';
    btn.textContent = document.querySelector(`#${id} .title-bar-text`).textContent;
    btn.onclick = () => {
        const win = document.getElementById(id);
        if (win.style.display === 'none') {
            restoreWindow(id);
        } else {
            minimizeWindow(id);
        }
    };
    taskbar.appendChild(btn);
}

function removeFromTaskbar(id) {
    const btn = document.getElementById(`task-${id}`);
    if (btn) taskbar.removeChild(btn);
}

// Ensure windows start hidden and layered
document.querySelectorAll('.window').forEach(win => {
    win.style.position = 'absolute';
    win.style.zIndex = 1;
});

// Block copy, paste, cut, right-click, F12, Ctrl+Shift+I, Ctrl+U
['copy', 'paste', 'cut', 'contextmenu'].forEach(event => {
    document.addEventListener(event, e => e.preventDefault());
});
document.addEventListener('keydown', function(e) {
    if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') ||
        (e.ctrlKey && e.key.toLowerCase() === 'u')
    ) {
        e.preventDefault();
    }
});

const startButton = document.querySelector('.start-button');
const startMenu = document.getElementById('start-menu');

startButton.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent closing immediately
    startMenu.style.display = (startMenu.style.display === 'block') ? 'none' : 'block';
});

// Close menu when clicking elsewhere
document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
        startMenu.style.display = 'none';
    }
});

function openShutdownDialog() {
    document.getElementById('shutdown-dialog').style.display = 'block';
}

function closeShutdownDialog() {
    document.getElementById('shutdown-dialog').style.display = 'none';
}

function confirmShutdown() {
    const selected = document.querySelector('#shutdown-options input[name="action"]:checked').value;
    if (selected === 'shutdown') {
        triggerShutdown();
    } else if (selected === 'restart') {
        alert('Simulated Restart (not implemented)');
    } else if (selected === 'msdos') {
        alert('Simulated MS-DOS Mode (not implemented)');
    }
}

