document.addEventListener('DOMContentLoaded', () => {
    const tabla = document.getElementById('miTabla').getElementsByTagName('tbody')[0];

    // Función para crear un dropdown de estado
    const crearDropdownEstado = () => {
        const select = document.createElement('select');
        select.className = 'estado-dropdown';
        ['congelado', 'fresco'].forEach(estado => {
            const option = document.createElement('option');
            option.value = estado;
            option.textContent = estado;
            select.appendChild(option);
        });
        return select;
    };

    // Función para crear un dropdown de proceso basado en la clasificación
    const crearDropdownProceso = (clasificacion) => {
        const select = document.createElement('select');
        select.className = 'proceso-dropdown';
        
        const procesos = clasificacion === "peces" 
            ? ['fileteado', 'completo', 'eviscerado']
            : ['procesado'];
            
        procesos.forEach(proceso => {
            const option = document.createElement('option');
            option.value = proceso;
            option.textContent = proceso;
            select.appendChild(option);
        });
        return select;
    };

    const agregarFila = (elemento) => {
        const nuevaFila = tabla.insertRow();
        const celdaCheckbox = nuevaFila.insertCell(0);
        const celdaEmbarcacion = nuevaFila.insertCell(1);
        const celdaProceso = nuevaFila.insertCell(2);
        const celdaCodigo = nuevaFila.insertCell(3);
        const celdaNombre = nuevaFila.insertCell(4);
        const celdaPeso = nuevaFila.insertCell(5);
        const celdaEstado = nuevaFila.insertCell(6);
        const celdaFechaLlegada = nuevaFila.insertCell(7);
        const celdaFechaVencimiento = nuevaFila.insertCell(8);
        const celdaId = nuevaFila.insertCell(9);
        const celdaClasificacion = nuevaFila.insertCell(10);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        celdaCheckbox.appendChild(checkbox);

        celdaEmbarcacion.textContent = elemento.id_embarcacion;
        
        // Agregar dropdown de proceso según la clasificación
        const dropdownProceso = crearDropdownProceso(elemento.clasificacion);
        dropdownProceso.value = elemento.proceso || 
            (elemento.clasificacion === "peces" ? 'completo' : 'procesado');
        celdaProceso.appendChild(dropdownProceso);
        
        celdaId.textContent = elemento.id_lote;
        celdaCodigo.textContent = elemento.id_pescado;
        celdaNombre.textContent = elemento.nombre;
        celdaPeso.textContent = elemento.peso;
        
        // Agregar dropdown de estado
        const dropdownEstado = crearDropdownEstado();
        dropdownEstado.value = elemento.estado || 'fresco';
        celdaEstado.appendChild(dropdownEstado);

        celdaFechaLlegada.textContent = new Date(elemento.fecha_ingreso).toLocaleDateString();
        celdaFechaVencimiento.textContent = new Date(elemento.fecha_caducidad).toLocaleDateString();
        celdaClasificacion.textContent = elemento.clasificacion;
        
        // Guardar las fechas completas como atributos de datos
        nuevaFila.dataset.fechaLlegada = elemento.fecha_ingreso;
        nuevaFila.dataset.fechaVencimiento = elemento.fecha_caducidad;
    };

    // Función para cargar los pescados desde la API
    const cargarPescados = async () => {
        const url = 'https://8b95-190-120-250-84.ngrok-free.app/API/inventario/pescado';
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    "ngrok-skip-browser-warning": "69420",
                }
            });
            const data = await response.json();
            // Filtrar solo los pescados con estado "nuevo"
            const pescadosNuevos = data.data.filter(pescado => pescado.estado === "nuevo");
            pescadosNuevos.forEach(agregarFila);
        } catch (error) {
            console.error('Error al cargar los pescados:', error);
        }
    };

    // Cargar los pescados al iniciar
    cargarPescados();

    // Event listener para el botón Enviar
    document.getElementById('btnEnviar').addEventListener('click', async () => {
        const filas = tabla.getElementsByTagName('tr');
        const filasParaEliminar = [];
        const url = 'https://8b95-190-120-250-84.ngrok-free.app/API/inventario/pescado';

        // Collect checked rows data
        for (let i = filas.length - 1; i >= 0; i--) {
            const fila = filas[i];
            const checkbox = fila.querySelector('input[type="checkbox"]');
            
            if (checkbox && checkbox.checked) {
                const dropdownEstado = fila.querySelector('.estado-dropdown');
                const dropdownProceso = fila.querySelector('.proceso-dropdown');
                
                // Calcular fecha de caducidad según el estado
                const fechaIngreso = new Date(fila.dataset.fechaLlegada);
                let fechaCaducidad = new Date(fechaIngreso);
                
                if (dropdownEstado.value === 'congelado') {
                    fechaCaducidad.setMonth(fechaCaducidad.getMonth() + 4); // 4 meses después
                } else {
                    fechaCaducidad.setDate(fechaCaducidad.getDate() + 2); // 2 días después
                }
                
                const elemento = {
                    id_pescado: fila.cells[3].textContent,
                    id_lote: parseInt(fila.cells[9].textContent),
                    clasificacion: fila.cells[10].textContent,
                    nombre: fila.cells[4].textContent,
                    peso: fila.cells[5].textContent,
                    fecha_ingreso: fila.dataset.fechaLlegada,
                    fecha_caducidad: fechaCaducidad.toISOString(),
                    estado: dropdownEstado.value,
                    proceso: dropdownProceso.value,
                    id_embarcacion: fila.cells[1].textContent
                };

                try {
                    // Actualizar el estado y proceso en la API
                    const response = await fetch(`${url}/${elemento.id_lote}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            "ngrok-skip-browser-warning": "69420",
                        },
                        body: JSON.stringify(elemento)
                    });

                    if (response.ok) {
                        filasParaEliminar.push(fila);
                    } else {
                        throw new Error(`Error en la respuesta: ${response.status}`);
                    }
                } catch (error) {
                    console.error('Error al actualizar:', error);
                    alert(`Error al actualizar el pescado: ${error.message}`);
                }
            }
        }

        // Eliminar las filas procesadas
        filasParaEliminar.forEach(fila => fila.remove());
        
        // Mostrar modal de confirmación
        document.getElementById('enviado').style.display = "block";
    });

    // Event listener para el botón Rechazar
    document.getElementById('btnRechazar').addEventListener('click', async () => {
        const filas = tabla.getElementsByTagName('tr');
        const filasParaEliminar = [];
        const url = 'https://8b95-190-120-250-84.ngrok-free.app/API/inventario/pescado';

        for (let i = filas.length - 1; i >= 0; i--) {
            const fila = filas[i];
            const checkbox = fila.querySelector('input[type="checkbox"]');
            
            if (checkbox && checkbox.checked) {
                const id_lote = parseInt(fila.cells[9].textContent);
                console.log(id_lote);
                try {
                    const response = await fetch(`${url}/${id_lote}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            "ngrok-skip-browser-warning": "69420",
                        }
                    });
                    
                    if (response.ok) {
                        filasParaEliminar.push(fila);
                    } else {
                        throw new Error(`Error al eliminar el lote ${id_lote}: ${response.status}`);
                    }
                } catch (error) {
                    console.error('Error al eliminar:', error);
                    alert(`Error al eliminar el lote: ${error.message}`);
                }
            }
        }

        // Eliminar las filas procesadas solo si el DELETE fue exitoso
        filasParaEliminar.forEach(fila => fila.remove());
    });

    // Cerrar el modal
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('enviado').style.display = "none";
    });
});
  