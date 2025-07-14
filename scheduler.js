// Platform tab switching
const platformTabs = document.querySelectorAll('.platform-tab');
const publishBtn = document.getElementById('publish-btn');
const publishOptions = document.querySelectorAll('input[name="publish-option"]');

platformTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        platformTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    });
});

// Connect button interactions
const connectBtns = document.querySelectorAll('.connect-btn');
connectBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const platform = e.target.closest('.connection-item').querySelector('h3').textContent;
        alert(`Connecting to ${platform}...`);
    });
});

// Publish button functionality
publishBtn.addEventListener('click', () => {
    const selectedOption = document.querySelector('input[name="publish-option"]:checked').value;
    const activePlatform = document.querySelector('.platform-tab.active').textContent;
    
    if (selectedOption === 'now') {
        alert(`Publishing to ${activePlatform} now!`);
    } else {
        alert(`Scheduling post for ${activePlatform}...`);
    }
});

// Radio button change handler
publishOptions.forEach(option => {
    option.addEventListener('change', (e) => {
        if (e.target.value === 'now') {
            publishBtn.textContent = 'Publish';
        } else {
            publishBtn.textContent = 'Schedule';
        }
    });
});

// Edit post button
document.querySelector('.btn-secondary').addEventListener('click', () => {
    alert('Opening post editor...');
});