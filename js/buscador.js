document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    protegerRuta();
    
    // Mostrar información del usuario
    const sessionData = JSON.parse(sessionStorage.getItem('authSession'));
    document.getElementById('usernameDisplay').textContent = `Usuario: ${sessionData.username}`;
    
    // Configurar botón de cerrar sesión
    document.getElementById('logoutButton').addEventListener('click', function() {
        sessionStorage.removeItem('authSession');
        window.location.href = 'index.html';
    });
    
    // Resto del código del buscador (tu código existente)
    const searchInput = document.getElementById('searchInput');
    const searchType = document.getElementById('searchType');
    const searchButton = document.getElementById('searchButton');
    const loadingElement = document.querySelector('.loading');
    const resultsContainer = document.getElementById('resultsContainer');
    
    // URL de tu hoja de cálculo pública
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4oFHibBlfrbFDUF-06LUToJ8SWSe0d-eAs8HYHj4K-cvFWQMZVtQGNQgjqU__04wFSsPs0SitBonN/pub?gid=1830275885&single=true&output=csv';
    
    // Variable para almacenar los datos
    let sheetData = [];
    
    // Cargar datos al iniciar la página
    loadData();
    
    // Función para cargar datos desde Google Sheets
    function loadData() {
        loadingElement.style.display = 'block';
        
        fetch(SHEET_URL)
            .then(response => response.text())
            .then(data => {
                // Parsear el CSV
                sheetData = parseCSV(data);
                loadingElement.style.display = 'none';
            })
            .catch(error => {
                loadingElement.style.display = 'none';
                showMessage(`Error al cargar los datos: ${error.message}`, 'error');
                console.error('Error:', error);
            });
    }
    
    // Función para parsear CSV
    function parseCSV(csvText) {
        const lines = csvText.split('\n');
        const result = [];
        
        // Empezar desde 1 para saltar los encabezados
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                // Manejar comas dentro de campos entre comillas
                const fields = line.split(',').reduce((acc, field) => {
                    if (field.startsWith('"') && !field.endsWith('"')) {
                        acc.inQuote = true;
                        acc.temp = field;
                        return acc;
                    }
                    
                    if (acc.inQuote) {
                        if (field.endsWith('"')) {
                            acc.inQuote = false;
                            acc.result.push(acc.temp + ',' + field);
                            acc.temp = '';
                        } else {
                            acc.temp += ',' + field;
                        }
                        return acc;
                    }
                    
                    acc.result.push(field.replace(/^"|"$/g, ''));
                    return acc;
                }, {result: [], inQuote: false, temp: ''}).result;
                
                if (fields.length >= 7) { // Asegurarse de que hay suficientes columnas
                    result.push({
                        fecha: fields[1] || '', // Columna B
                        nombre: fields[2] || '', // Columna C
                        dni: fields[3] || '', // Columna D
                        localidad: fields[5] || '', // Columna F
                        recurso: fields[6] || '' // Columna G
                    });
                }
            }
        }
        
        return result;
    }
    
    // Función para realizar la búsqueda
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        const type = searchType.value;
        
        if (!searchTerm) {
            showMessage('Por favor, ingrese un término de búsqueda', 'error');
            return;
        }
        
        if (sheetData.length === 0) {
            showMessage('Los datos aún se están cargando. Por favor, espere.', 'error');
            return;
        }
        
        // Filtrar según el tipo de búsqueda
        let results = [];
        if (type === 'nombre') {
            // Búsqueda que ignora tildes
            const terminoNormalizado = normalizarTexto(searchTerm);
            results = sheetData.filter(item => 
                item.nombre && normalizarTexto(item.nombre).includes(terminoNormalizado)
            );
        } else if (type === 'dni') {
            results = sheetData.filter(item => 
                item.dni && item.dni.includes(searchTerm)
            );
        }
        
        if (results.length === 0) {
            showMessage('No se encontraron resultados para su búsqueda', 'no-results');
            return;
        }
        
        displayResults(results);
    }
    
    // Resto de las funciones (showMessage, displayResults, etc.)
    // ... (tu código existente para mostrar resultados)
    
    // Event listeners
    searchButton.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});