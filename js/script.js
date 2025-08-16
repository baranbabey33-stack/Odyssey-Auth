document.addEventListener('DOMContentLoaded', () => {

    // --- BÖLÜM 1: İNTERAKTİF PARÇACIK AĞI ARKA PLANI ---
    const canvas = document.getElementById('interactive-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles;
        let mouse = { x: null, y: null, radius: 150 };
        window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
        class Particle {
            constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.size = Math.random() * 2 + 1; this.baseX = this.x; this.baseY = this.y; this.density = (Math.random() * 40) + 5; this.color = `rgba(168, 85, 247, ${Math.random() * 0.5 + 0.2})`; }
            draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.closePath(); ctx.fill(); }
            update() {
                let dx = mouse.x - this.x; let dy = mouse.y - this.y; let distance = Math.hypot(dx, dy);
                if (distance < mouse.radius) {
                    let force = (mouse.radius - distance) / mouse.radius;
                    this.x -= (dx / distance) * force * this.density; this.y -= (dy / distance) * force * this.density;
                } else {
                    if (this.x !== this.baseX) { this.x -= (this.x - this.baseX) / 10; }
                    if (this.y !== this.baseY) { this.y -= (this.y - this.baseY) / 10; }
                }
            }
        }
        const init = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; particles = Array.from({ length: Math.floor((width * height) / 9000) }, () => new Particle()); };
        const connect = () => { for (let a = 0; a < particles.length; a++) { for (let b = a; b < particles.length; b++) { let distance = Math.hypot(particles[a].x - particles[b].x, particles[a].y - particles[b].y); if (distance < 40) { let opacity = 1 - (distance / 40); ctx.strokeStyle = `rgba(122, 110, 255, ${opacity})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(particles[a].x, particles[a].y); ctx.lineTo(particles[b].x, particles[b].y); ctx.stroke(); } } } };
        const animate = () => { ctx.clearRect(0, 0, width, height); particles.forEach(p => { p.update(); p.draw(); }); connect(); requestAnimationFrame(animate); };
        window.addEventListener('resize', init);
        init(); animate();
    }
    
    // --- BÖLÜM 2: İNTERAKTİF PARLAYAN ÇERÇEVE ---
    document.querySelectorAll('.form-wrapper').forEach(wrapper => {
        wrapper.addEventListener('mousemove', e => {
            const rect = wrapper.getBoundingClientRect();
            wrapper.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            wrapper.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });
   
    // --- BÖLÜM 3: NİHAİ FORM GEÇİŞ MANTIĞI ---
    const formContainers = document.querySelectorAll('.form-container');
    const formLinks = document.querySelectorAll('.form-link');
    function showForm(targetFormId) {
        formContainers.forEach(container => { container.classList.toggle('active', container.dataset.form === targetFormId); });
    }
    formLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.closest('[data-target]').dataset.target;
            showForm(target);
        });
    });

    // --- BÖLÜM 4: ANLIK FORM DOĞRULAMA ---
    const inputsWithValidation = document.querySelectorAll('input[required], input[minlength]');
    const validateInput = (input) => {
        const group = input.closest('.input-group'); if(!group) return true;
        let isValid = input.checkValidity(); if(input.type === 'email') isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        group.classList.toggle('invalid', !isValid); return isValid;
    };
    inputsWithValidation.forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => { if (input.closest('.input-group.invalid')) validateInput(input); });
    });
    const validateForm = (form) => { let isFormValid = true; form.querySelectorAll('input[required], input[minlength]').forEach(input => { if (!validateInput(input)) isFormValid = false; }); return isFormValid; };

    // --- BÖLÜM 5: ŞİFRE GÜCÜ HESAPLAMA (DÜZELTİLMİŞ) ---
    const passwordInput = document.getElementById('register-password');
    if (passwordInput) {
        const strengthBar = document.querySelector('[data-form="register"] .strength-bar'); const strengthText = document.querySelector('[data-form="register"] .strength-text');
        const checkPasswordStrength = (password) => {
            let score = 0;
            const validations = {
                length: password.length >= 8, uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password), number: /[0-9]/.test(password),
                special: /[^A-Za-z0-9]/.test(password), length_strong: password.length >= 12
            };
            score = Object.values(validations).filter(Boolean).length;
            if (password.length === 0) return { text: '', color: 'transparent', width: '0%' };
            if (score <= 2) return { text: 'Zayıf', color: '#e74c3c', width: '20%' };
            if (score <= 4) return { text: 'Orta', color: '#f39c12', width: '60%' };
            return { text: 'Güçlü', color: '#2ecc71', width: '100%' };
        };
        passwordInput.addEventListener('input', () => { const { text, color, width } = checkPasswordStrength(passwordInput.value); strengthBar.style.width = width; strengthBar.style.backgroundColor = color; strengthText.textContent = text; });
    }
    
    // --- BÖLÜM 6: AJAX FORM GÖNDERİMİ ---
    const handleFormSubmit = (form, url, messageElement, successCallback) => {
        if (!validateForm(form)) return;
        const submitButton = form.querySelector('button[type="submit"]'); submitButton.classList.add('loading'); submitButton.disabled = true;
        messageElement.style.display = 'none'; messageElement.className = 'message';
        fetch(url, { method: 'POST', body: new FormData(form) }).then(response => { if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); } return response.json(); }).then(data => {
            messageElement.textContent = data.message; messageElement.classList.add(data.status === 'success' ? 'success' : 'error');
            if (data.status === 'success' && successCallback) successCallback(data);
        }).catch(error => { console.error('Fetch Error:', error); messageElement.textContent = 'Sunucuyla iletişimde bir hata oluştu. Lütfen tekrar deneyin.'; messageElement.classList.add('error');
        }).finally(() => { messageElement.style.display = 'block'; submitButton.classList.remove('loading'); submitButton.disabled = false; });
    };

    document.getElementById('login-form')?.addEventListener('submit', e => { e.preventDefault();
        handleFormSubmit(e.target, 'php/login.php', document.getElementById('login-message'), () => setTimeout(() => window.location.href = 'php/dashboard.php', 1000));
    });
    document.getElementById('register-form')?.addEventListener('submit', e => { e.preventDefault();
        handleFormSubmit(e.target, 'php/register.php', document.getElementById('register-message'), (data) => {
            e.target.reset(); 
            const strengthBar = e.target.querySelector('.strength-bar'); const strengthText = e.target.querySelector('.strength-text');
            if(strengthBar) strengthBar.style.width = '0%'; if(strengthText) strengthText.textContent = '';
            setTimeout(() => showForm('login'), 2000); 
        });
    });
    document.getElementById('forgot-form')?.addEventListener('submit', e => { e.preventDefault();
        handleFormSubmit(e.target, 'php/forgot_password.php', document.getElementById('forgot-message'), () => setTimeout(() => showForm('success'), 1000));
    });

    // --- BÖLÜM 7: 2FA GİRDİ YÖNETİMİ ---
    const pincodeInputs = document.querySelectorAll('.pincode-input');
    if (pincodeInputs.length > 0) {
        pincodeInputs.forEach((input, index) => {
            input.addEventListener('keydown', (e) => {
                if (e.key >= 0 && e.key <= 9 && e.key !== ' ') { if (input.value.length === 0) { setTimeout(() => pincodeInputs[index + 1]?.focus(), 10); } } 
                else if (e.key === 'Backspace') { if (input.value.length === 0) { setTimeout(() => pincodeInputs[index - 1]?.focus(), 10); } }
            });
            input.addEventListener('input', () => { input.value = input.value.replace(/[^0-9]/g, ''); });
        });
        pincodeInputs[0].addEventListener('paste', e => { e.preventDefault(); const pasteData = e.clipboardData.getData('text').trim(); if (/^\d{6}$/.test(pasteData)) { pincodeInputs.forEach((input, i) => input.value = pasteData[i]); pincodeInputs[5].focus(); } });
        document.getElementById('2fa-form')?.addEventListener('submit', (e) => { e.preventDefault(); alert(`Kod Gönderildi: ${Array.from(pincodeInputs).map(i => i.value).join('')}`); });
    }

    // --- BÖLÜM 8: DİĞER KÜÇÜK İŞLEVLER ---
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', e => { const input = e.target.closest('.input-group').querySelector('input'); input.type = input.type === 'password' ? 'text' : 'password'; e.target.classList.toggle('fa-eye'); e.target.classList.toggle('fa-eye-slash'); });
    });
});
