document.addEventListener('DOMContentLoaded', () => {
    const tabla = document.getElementById('miTabla').getElementsByTagName('tbody')[0];
    const data = [];
    let nextId = 1;
    const nuevoElementoJSON = localStorage.getItem('nuevoElementoJSON') || '[]';

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

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        celdaCheckbox.appendChild(checkbox);

        // Formatear la fecha actual con la parte horaria a las 00:00:00
        const fechaActual = new Date();
        fechaActual.setUTCHours(0, 0, 0, 0);
        const fechaLlegada = fechaActual.toISOString();
        
        // Calcular fecha de vencimiento según el estado
        const fechaVenc = new Date(fechaActual);
        if (elemento.estado === 'Congelado') {
            fechaVenc.setMonth(fechaVenc.getMonth() + 6); // 6 meses para congelado
        } else if (elemento.estado === 'Fresco') {
            fechaVenc.setDate(fechaVenc.getDate() + 2); // 2 días para fresco
        }
        const fechaVencimiento = fechaVenc.toISOString();

        celdaEmbarcacion.textContent = elemento.embarcacion || '';
        celdaProceso.textContent = elemento.proceso || '';
        celdaCodigo.textContent = elemento.codigo_pescado;
        celdaNombre.textContent = elemento.pescado;
        celdaPeso.textContent = elemento.cantidad_pescado;
        celdaEstado.textContent = elemento.estado || '';
        celdaFechaLlegada.textContent = new Date(fechaLlegada).toLocaleDateString();
        celdaFechaVencimiento.textContent = new Date(fechaVencimiento).toLocaleDateString();
        
        // Guardar las fechas completas como atributos de datos
        nuevaFila.dataset.fechaLlegada = fechaLlegada;
        nuevaFila.dataset.fechaVencimiento = fechaVencimiento;
    };
    const elementos = JSON.parse(nuevoElementoJSON);
    elementos.forEach(agregarFila);
  
        // Función para enviar los datos a la API
        const enviarDatos = async () => {
            const url = 'https://cd48-200-8-185-118.ngrok-free.app/API/pescados';
            
            try {
                // Primero obtener todos los pescados existentes
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        "ngrok-skip-browser-warning": "69420",
                    }
                });
                const respData = await response.json();
                const pescadosExistentes = respData.data;
                console.log(pescadosExistentes);
                // Procesar cada elemento en data
                for (const elemento of data) {
                    console.log("siguiente elemento", elemento);
                    console.log("codigo pescado", elemento.codigo_pescado);
                    console.log("pescado", elemento.pescado);
                    console.log("fecha entrada", elemento.fecha_entrada);
                    console.log("fecha caducidad", elemento.fecha_caducidad);
                    // Buscar si existe un pescado igual
                    const pescadoExistente = pescadosExistentes.find(p =>
                        
                        p.codigo_pescado == elemento.codigo_pescado &&
                        p.pescado == elemento.pescado &&
                        p.fecha_entrada == elemento.fecha_entrada &&
                        p.fecha_caducidad == elemento.fecha_caducidad
                    );

                    if (pescadoExistente) {
                        // Si existe, actualizar con PUT
                        console.log("si existe bro");
                        const nuevaCantidad = parseFloat(pescadoExistente.cantidad_pescado) + parseFloat(elemento.cantidad_pescado);
                        console.log("nueva cantidad pescado", nuevaCantidad);
                        const responsePut = await fetch(`${url}/${pescadoExistente.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                "ngrok-skip-browser-warning": "69420",
                            },
                            body: JSON.stringify({
                                id: pescadoExistente.id,
                                codigo_pescado: elemento.codigo_pescado,
                                pescado: elemento.pescado,
                                cantidad_pescado: nuevaCantidad.toString(),
                                fecha_entrada: elemento.fecha_entrada,
                                fecha_caducidad: elemento.fecha_caducidad
                            })
                        });
                        const dataPut = await responsePut.json();
                        console.log('Datos actualizados correctamente:', dataPut);
                    } else {
                        // Si no existe, obtener el máximo ID y crear nuevo
                        console.log("no existe bro");
                        const maxId = Math.max(...pescadosExistentes.map(p => p.id), 0);
                        const nuevoId = maxId + 1;
                        
                        const responsePost = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                "ngrok-skip-browser-warning": "69420",
                            },
                            body: JSON.stringify({
                                id: nuevoId,
                                codigo_pescado: elemento.codigo_pescado,
                                pescado: elemento.pescado,
                                cantidad_pescado: elemento.cantidad_pescado.toString(),
                                fecha_entrada: elemento.fecha_entrada,
                                fecha_caducidad: elemento.fecha_caducidad
                            })
                        });
                        const dataPost = await responsePost.json();
                        console.log('Nuevo registro creado:', dataPost);
                        
                        // Actualizar pescadosExistentes para el siguiente cálculo de ID
                        pescadosExistentes.push({ ...elemento, id: nuevoId });
                    }
                }
                
                // Limpiar data después de procesar todo
                data.length = 0;
                
            } catch (error) {
                console.error('Error al procesar los datos:', error);
                throw error;
            }
        };
    

    // Add event listeners for the buttons
    document.getElementById('btnEnviar').addEventListener('click', () => {
        const filas = tabla.getElementsByTagName('tr');
        const filasParaEliminar = [];

        // Collect checked rows data
        for (let i = filas.length - 1; i >= 0; i--) {
            const fila = filas[i];
            const checkbox = fila.querySelector('input[type="checkbox"]');
            
            if (checkbox && checkbox.checked) {
                const elemento = {
                    id: nextId,
                    codigo_pescado: fila.cells[1].textContent,
                    pescado: fila.cells[2].textContent,
                    cantidad_pescado: parseFloat(fila.cells[3].textContent),
                    fecha_entrada: fila.dataset.fechaLlegada,
                    fecha_caducidad: fila.dataset.fechaVencimiento
                };
                
                // Check if similar item exists and combine if found
                const existingItem = data.find(item => 
                    item.codigo_pescado === elemento.codigo_pescado && 
                    item.pescado === elemento.pescado &&
                    item.fecha_entrada === elemento.fecha_entrada &&
                    item.fecha_caducidad === elemento.fecha_caducidad
                );

                if (existingItem) {
                    existingItem.cantidad_pescado += elemento.cantidad_pescado;
                } else {
                    data.push(elemento);
                    nextId++; // Incrementamos el ID solo cuando se agrega un nuevo elemento
                    console.log(data);
                }
                
                filasParaEliminar.push(fila);
            }
        }

        // Remove checked rows
        filasParaEliminar.forEach(fila => fila.remove());
        
        // Limpiar localStorage después de procesar las filas
        localStorage.setItem('nuevoElementoJSON', '[]');
        
        console.log('Datos acumulados:', data);
        // Enviar datos a la API
        enviarDatos();
    });

    document.getElementById('btnRechazar').addEventListener('click', () => {
        const filas = tabla.getElementsByTagName('tr');
        for (let i = filas.length - 1; i >= 0; i--) {
            const fila = filas[i];
            const checkbox = fila.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                fila.remove();
            }
        }
    });


  
});
  