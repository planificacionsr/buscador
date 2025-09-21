document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Cargar credenciales desde el archivo config.json
    async function loadCredentials() {
        try {
            const response = await fetch('data/config.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de configuración');
            }
            const config = await response.json();
            return config.users;
        } catch (error) {
            console.error('Error cargando configuración:', error);
            // Credenciales por defecto en caso de error
            return {
                "admin": "admin123",
                "analista": "analista2023",
                "consultor": "consultor456"
            };
        }
    }
    
    // Función para manejar el login
    async function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            showError('Por favor, complete todos los campos');
            return;
        }
        
        try {
            const credentials = await loadCredentials();
            
            if (credentials[username] === password) {
                showSuccess('¡Credenciales correctas! Redirigiendo...');
                
                // Guardar sesión con expiración (2 horas)
                const sessionData = {
                    username: username,
                    timestamp: Date.now(),
                    expires: Date.now() + (2 * 60 * 60 * 1000)
                };
                sessionStorage.setItem('authSession', JSON.stringify(sessionData));
                
                // Redirigir al buscador
                setTimeout(() => {
                    window.location.href = 'buscador.html';
                }, 1500);
            } else {
                showError('Usuario o contraseña incorrectos');
            }
        } catch (error) {
            showError('Error de conexión. Intente nuevamente.');
            console.error('Error:', error);
        }
    }
    
    // Función para mostrar errores
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
    
    // Función para mostrar éxito
    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
    }
    
    // Event listeners
    loginButton.addEventListener('click', handleLogin);
    
    // Permitir login con Enter
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
});