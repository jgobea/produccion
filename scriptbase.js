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
                    id : item.id,
                    sku: item.codigo_pescado,
                    nombre: item.pescado,
                    peso: item.peso_pescado
                }));
            } else {
                console.error('Error al cargar los datos de la API');
            }
        } catch (error) {
            console.error('Error al hacer la solicitud a la API:', error);
        }
    };
    cargarEspecies();

    // Función para enviar los datos a la API
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


    const editarPesoPescado = async (id, codigo_pescado, pescado, peso_pescado) => {
        const url = `http://localhost:5001/Api/pescados/${id}`;
        
        try {
            // Obtener el peso actual del pescado
            const responseGet = await fetch(url, { method: 'GET' });

            if (!responseGet.ok) { throw new Error('Error al obtener el peso actual del pescado'); }
            const dataGet = await responseGet.json();
            console.log('Datos obtenidos correctamente:', dataGet);
            const pesoActual = dataGet.data.peso_pescado;
            console.log('Peso actual:', pesoActual);

            // Sumar el nuevo peso al peso actual
            const nuevoPeso = pesoActual + peso_pescado;
            console.log('Nuevo peso:', nuevoPeso);

            // Enviar la solicitud PUT con el nuevo peso
            const optionsPut = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id,
                    codigo_pescado: codigo_pescado,
                    pescado: pescado,
                    peso_pescado: nuevoPeso
                })
            };
            const responsePut = await fetch(url, optionsPut);
            const dataPut = await responsePut.json();
            if (responsePut.ok) {
                console.log('Peso actualizado correctamente:', dataPut);
            } else {
                console.error('Error al actualizar el peso:', dataPut);
            }
        } catch (error) {
            console.error('Error al hacer la solicitud de PUT:', error);
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
            id = skuExistente.id;
            console.log(id);
            alert('Formulario enviado correctamente');
            editarPesoPescado(id,sku,nombre,kg);
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