document.querySelectorAll('.connect-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.textContent === 'Connect') {
                    this.textContent = 'Connected';
                    this.style.background = '#00d4ff';
                    this.style.color = '#000';
                    this.previousElementSibling.querySelector('.platform-status').textContent = 'Connected';
                } else {
                    this.textContent = 'Connect';
                    this.style.background = 'transparent';
                    this.style.color = '#fff';
                    this.previousElementSibling.querySelector('.platform-status').textContent = 'Not connected';
                }
            });
        });