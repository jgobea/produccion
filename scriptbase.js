document.addEventListener('DOMContentLoaded', () => {
    const idInput = document.getElementById('id');
    const nombreInput = document.getElementById('nombre');
    const kgInput = document.getElementById('kg');
    const formulario = document.querySelector('.formulario');
    let especies = [];

    let urlEspecies = 'https://8b95-190-120-250-84.ngrok-free.app/API/pescados';
    let urlInventario = 'https://8b95-190-120-250-84.ngrok-free.app/API/inventario/pescado';

    // URL para obtener las embarcaciones (ajusta según tu API)
    const urlEmbarcaciones = 'https://8b95-190-120-250-84.ngrok-free.app/API/Embarcacion';

    // Agregar variable para almacenar las embarcaciones y sus capacidades
    let embarcaciones = [];

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
            const response = await fetch(urlEspecies, options);
            if (!response.ok) { throw new Error('Error al obtener productos'); }
            const datos = await response.json();
            console.log(datos);
            if (datos.status === 200) {
                especies = datos.data.map(item => ({
                    id_pescado: item.id_pescado,
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
                <td>${especie.id_pescado}</td>
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
            console.log(datos);
            if (datos.status === 200) {
                // Filtrar solo las embarcaciones activas y guardar datos
                embarcaciones = datos.data.filter(embarcacion => 
                    embarcacion.estado === "Inactivo"
                );

                embarcaciones.forEach(embarcacion => {
                    const option = document.createElement('option');
                    option.value = embarcacion.id_embarcacion;
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

    const subirInventario = async (id_pescado, nombre, peso, fecha_ingreso, embarcacionId, clasificacion) => {   
        // Primero obtener todos los IDs del inventario
        const getResponse = await fetch(urlInventario, {
            method: 'GET',
            headers: {
                "ngrok-skip-browser-warning": "69420",
            }
        });
        
        const inventario = await getResponse.json();
        console.log(inventario);
        
        // Encontrar el ID más alto y sumarle 1
        const nuevoId = inventario.data.reduce((maxId, item) => 
            Math.max(maxId, parseInt(item.id_lote)), 0) + 1;
        console.log(nuevoId);

        const fechaVenc = new Date(fecha_ingreso);
        fechaVenc.setDate(fechaVenc.getDate() + 2); // 2 días para fresco
        const fechaVencimiento = fechaVenc.toISOString();

        const responsePost = await fetch(urlInventario, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "69420",
            },
            body: JSON.stringify({
             
                id_pescado: id_pescado,
                id_lote: nuevoId,
                clasificacion: clasificacion,
                nombre: nombre,
                peso: peso.toString(),
                fecha_ingreso: fecha_ingreso,
                fecha_caducidad: fechaVencimiento,
                estado: "nuevo",
                proceso: "completo",
                id_embarcacion: embarcacionId,         
            })
        });

        console.log('Respuesta del servidor:', await responsePost.json());
    };

    idInput.addEventListener('input', () => {
        const id = idInput.value;
        const especie = especies.find(e => e.id_pescado === id);
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
        const clasificacion = document.getElementById('clasificacion').value;
        const embarcacionId = document.getElementById('embarcacion').value;
        const id_pescadoExistente = especies.find(e => e.id_pescado === id);
        const fecha_ingreso = new Date().toISOString();
        // Verificar si se seleccionó una embarcación
        if (!embarcacionId) {
            alert('Por favor seleccione una embarcación');
            return;
        }

        // Encontrar la embarcación seleccionada
        const embarcacionSeleccionada = embarcaciones.find(e => e.id_embarcacion === embarcacionId);

        if (peso < 0) {
            alert('El valor de kg no puede ser negativo');
            return;
        }

        // Verificar la capacidad de la embarcación
        if (peso > embarcacionSeleccionada.capacidad) {
            alert(`El peso excede la capacidad de la embarcación (${embarcacionSeleccionada.capacidad} kg)`);
            return;
        }

        if (!id_pescadoExistente) {
            alert(`No existe el codigo_pescado: ${id}`);
        } else {

            id_pescado = id_pescadoExistente.id_pescado;
            console.log(id_pescado);
            alert('Formulario enviado correctamente');
            subirInventario(id_pescado, nombre, peso, fecha_ingreso, embarcacionId, clasificacion);
        }
    });
});
