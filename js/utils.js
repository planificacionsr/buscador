// Función para quitar tildes y caracteres especiales
function normalizarTexto(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

// Función para verificar si la sesión es válida
function verificarSesion() {
    const sessionData = sessionStorage.getItem('authSession');
    
    if (!sessionData) {
        return false;
    }
    
    try {
        const session = JSON.parse(sessionData);
        const ahora = Date.now();
        
        // Verificar si la sesión ha expirado
        if (ahora > session.expires) {
            sessionStorage.removeItem('authSession');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error verificando sesión:', error);
        return false;
    }
}

// Redirigir al login si no hay sesión válida
function protegerRuta() {
    if (!verificarSesion()) {
        window.location.href = 'index.html';
    }
}