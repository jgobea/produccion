document.addEventListener('DOMContentLoaded', () => {
    const idInput = document.getElementById('id');
    const nombreInput = document.getElementById('nombre');
    const kgInput = document.getElementById('kg');
    const formulario = document.querySelector('.formulario');
    let especies = [];
    let url = 'https://cd48-200-8-185-118.ngrok-free.app/API/pescados';

    // URL para obtener las embarcaciones (ajusta según tu API)
    const urlEmbarcaciones = 'https://cd48-200-8-185-118.ngrok-free.app/API/Embarcacion';

    // Función para cargar los datos de la API
    const cargarEspecies = async () => {
        console.log('Cargando datos de la API');
        const options = {
            method: 'GET',
            headers: {
                "ngrok-skip-browser-warning": "69420",
            },
        };
        try {
            const response = await fetch(url, options);
            if (!response.ok) { throw new Error('Error al obtener productos'); }
            const datos = await response.json();
            console.log(datos);
            if (datos.status === 200) {
                especies = datos.data.map(item => ({
                    id: item.id,
                    nombre: item.nombre,
                }));
                llenarTablaReferencia();
            } else {
                console.error('Error al cargar los datos de la API');
            }
        } catch (error) {
            console.error('Error al hacer la solicitud a la API:', error);
        }
    };
    cargarEspecies();
    // Función para llenar la tabla de referencia
    const llenarTablaReferencia = () => {
        const tbody = document.getElementById('tabla-especies');
        especies.forEach(especie => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${especie.id}</td>
                <td>${especie.nombre}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Función para cargar las embarcaciones
    const cargarEmbarcaciones = async () => {
        const selectEmbarcacion = document.getElementById('embarcacion');
        
        const options = {
            method: 'GET',
            headers: {
                "ngrok-skip-browser-warning": "69420",
            },
        };

        try {
            const response = await fetch(urlEmbarcaciones, options);
            if (!response.ok) throw new Error('Error al obtener embarcaciones');
            
            const datos = await response.json();
            if (datos.status === 200) {
                // Filtrar solo las embarcaciones activas
                const embarcacionesActivas = datos.data.filter(embarcacion => 
                    embarcacion.estado === "activo"
                );

                embarcacionesActivas.forEach(embarcacion => {
                    const option = document.createElement('option');
                    option.value = embarcacion.id;
                    option.textContent = embarcacion.nombre;
                    selectEmbarcacion.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar embarcaciones:', error);
        }
    };

    // Llamar a las funciones para cargar los datos
    cargarEmbarcaciones();

    const editarPesoPescado = async (id_pescado, nombre, peso, fecha_ingreso, fecha_caducidad) => {   
        const nuevoElemento = {
            "id_pescado": id_pescado,
            "nombre": nombre,
            "peso": peso.toString(),
            "fecha_ingreso": fecha_ingreso,
            "fecha_caducidad": fecha_caducidad
        };
        
        // Obtener elementos existentes del localStorage
        const elementosExistentes = JSON.parse(localStorage.getItem('nuevoElementoJSON') || '[]');
        
        // Agregar el nuevo elemento
        elementosExistentes.push(nuevoElemento);
        
        // Guardar el array actualizado en localStorage
        localStorage.setItem('nuevoElementoJSON', JSON.stringify(elementosExistentes));
        
        console.log('Datos guardados para la tabla:', elementosExistentes);
    };

    idInput.addEventListener('input', () => {
        const id = idInput.value;
        const especie = especies.find(e => e.id === id);
        if (especie) {
            nombreInput.value = especie.nombre;
        } else {
            nombreInput.value = '';
        }
    });

    formulario.addEventListener('submit', (event) => {
        event.preventDefault();
        const nombre = nombreInput.value;
        const id = idInput.value;
        const peso = parseFloat(kgInput.value);
        const id_pescadoExistente = especies.find(e => e.id === id);

        if (peso < 0) {
            alert('El valor de kg no puede ser negativo');
            return;
        }

        if (!id_pescadoExistente) {
            alert(`No existe el codigo_pescado: ${id}`);
        } else {
            id = id_pescadoExistente.id;
            console.log(id);
            alert('Formulario enviado correctamente');
            editarPesoPescado(id,nombre,peso,"2024-12-21T04:00:00.000Z","2025-01-23T04:00:00.000Z");
        }
    });
});
