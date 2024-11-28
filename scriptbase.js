document.addEventListener('DOMContentLoaded', () => {
    const codigoInput = document.getElementById('codigo');
    const nombreInput = document.getElementById('nombre');
    const kgInput = document.getElementById('kg');
    const formulario = document.querySelector('.formulario');
    let especies = [];

    // Función para cargar los datos de la API
    const cargarEspecies = async () => {
        console.log('Cargando datos de la API');
        const url = 'http://localhost:5001/Api/pescados';
        const options = {
            method: 'GET',
        };
        try {
            const response = await fetch(url, options);
            if (!response.ok) { throw new Error('Error al obtener productos'); }
            const datos = await response.json();
            console.log(datos);
            if (datos.status === 200) {
                especies = datos.data.map(item => ({
                    sku: item.codigo_pescado,
                    nombre: item.pescado
                }));
            } else {
                console.error('Error al cargar los datos de la API');
            }
        } catch (error) {
            console.error('Error al hacer la solicitud a la API:', error);
        }
    };
    cargarEspecies();

    const enviarDatos = async (id, codigo_pescado, pescado, peso_pescado) => {
        const url = 'http://localhost:5001/Api/pescados';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                codigo_pescado: codigo_pescado,
                pescado : pescado,
                peso_pescado: peso_pescado
            })
        };
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (response.ok) {
                console.log('Datos enviados correctamente:', data);
            } else {
                console.error('Error al enviar los datos:', data);
            }
        } catch (error) {
            console.error('Error al hacer la solicitud de POST:', error);
        }
    };


    codigoInput.addEventListener('input', () => {
        const sku = codigoInput.value;
        const especie = especies.find(e => e.sku === sku);
        if (especie) {
            nombreInput.value = especie.nombre;
        } else {
            nombreInput.value = '';
        }
    });

    formulario.addEventListener('submit', (event) => {
        event.preventDefault();
        const nombre = nombreInput.value;
        const sku = codigoInput.value;
        const kg = parseFloat(kgInput.value);
        const skuExistente = especies.find(e => e.sku === sku);

        if (kg < 0) {
            alert('El valor de kg no puede ser negativo');
            return;
        }

        if (!skuExistente) {
            alert(`No existe el SKU: ${sku}`);
        } else {
            alert('Formulario enviado correctamente');
            // Aquí puedes agregar la lógica para guardar el formulario
        }
    });
});

// Obtener el checkbox principal 
const mainCheckbox = document.getElementById('seleccionar-todo'); 

// Obtener todos los checkboxes secundarios 
const subCheckboxes = document.querySelectorAll('.mandar'); 

// Agregar un evento al checkbox principal 
mainCheckbox.addEventListener('change', function() { 
    // Cambiar el estado de todos los checkboxes secundarios 
    subCheckboxes.forEach(function(checkbox) { 
        checkbox.checked = mainCheckbox.checked; 
    });
});