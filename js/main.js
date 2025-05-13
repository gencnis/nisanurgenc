/* MAIN.JS */

/* --------------------------------------DESKTOP ICON SELECTION & DRAGGING---------------------------------------------------------- */

function enableIconSelectionAndDragging() {
    const icons = document.querySelectorAll('.icon');
    const desktop = document.querySelector('.desktop');

    icons.forEach((icon) => {
        let isDragging = false;
        let shiftX, shiftY;

        // SINGLE CLICK = SELECT
        icon.addEventListener('click', (e) => {
            icons.forEach(i => i.classList.remove('selected')); // Clear others
            icon.classList.add('selected');
        });

	icon.addEventListener('mousedown', function (e) {
	    const isImage = e.target.tagName === 'IMG';
	    const isLabel = e.target.tagName === 'DIV' && e.target.parentElement.classList.contains('icon');
	    if (!isImage && !isLabel) return;

	    e.preventDefault();

	    const rect = icon.getBoundingClientRect();
	    const dRect = desktop.getBoundingClientRect();
	    shiftX = e.clientX - rect.left;
	    shiftY = e.clientY - rect.top;
	    let initialX = e.clientX;
	    let initialY = e.clientY;

	    function moveAt(pageX, pageY) {
		if (!isDragging) {
		    if (Math.abs(pageX - initialX) < 3 && Math.abs(pageY - initialY) < 3) return;
		    icon.style.position = 'absolute';
		    icon.style.left = rect.left - dRect.left + 'px';
		    icon.style.top = rect.top - dRect.top + 'px';
		    icon.style.zIndex = getMaxZIndex() + 1;
		    isDragging = true;
		}
		icon.style.left = pageX - dRect.left - shiftX + 'px';
		icon.style.top = pageY - dRect.top - shiftY + 'px';
	    }

	    function onMouseMove(e) {
		moveAt(e.pageX, e.pageY);
	    }

	    document.addEventListener('mousemove', onMouseMove);

	    document.onmouseup = function () {
		document.removeEventListener('mousemove', onMouseMove);
		document.onmouseup = null;
		icon.style.zIndex = '';
	    };
	});

        icon.ondragstart = () => false;
    });
    
    // Deselect icons when clicking anywhere outside of them
    document.addEventListener('click', (e) => {
    	const clickedIcon = e.target.closest('.icon');
	    if (!clickedIcon) {
	        document.querySelectorAll('.icon.selected').forEach(icon => {
                icon.classList.remove('selected');
	        });
	    }
	});


    desktop.style.position = 'relative';
}

window.onload = () => {
    enableIconSelectionAndDragging();
};
/* ------------------------------------------------------------------------------------------------ */

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


// START MENU RELATED

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

function openHelpWindow() {
    openWindow('help-window');
}

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
        location.reload();
    } else if (selected === 'msdos') {
        alert('C:\\WINDOWS>run msdos.bat\nError: Brain not found. Press any key to panic.');
    }
}

function openHelpDialog() {
    document.getElementById('help-dialog').style.display = 'block';
}

function closeHelpDialog() {
    document.getElementById('help-dialog').style.display = 'none';
}

function triggerShutdown() {
     // Clear the page content
    document.body.innerHTML = '';
    document.documentElement.style.backgroundColor = 'black'; // Set <html> background

    // Create splash image
    const splash = document.createElement('img');
    splash.src = 'images/splash.webp'; // Or your shutdown image path
    splash.alt = 'Shutting down...';
    splash.style.position = 'fixed';
    splash.style.top = '0';
    splash.style.left = '0';
    splash.style.width = '100vw';
    splash.style.height = '100vh';
    splash.style.zIndex = '9999';
    document.body.appendChild(splash);

    // Redirect after 3 seconds
    setTimeout(() => {
        window.location.href = 'https://www.google.com/';
    }, 2500);
}

// DESKTOP RELATED

function openPingMeWindow() {
    openWindow('pingme-window'); // Show window
    // window.location.href = "mailto:nisagenc.dev@gmail.com?subject=Hey%20Nisa!&body=Just%20dropping%20a%20line..."; // Trigger mail client
}
