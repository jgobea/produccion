document.addEventListener('DOMContentLoaded', () => {
    const tabla = document.getElementById('miTabla').getElementsByTagName('tbody')[0];
    const data = [];
    let nextId = 1;
    const nuevoElementoJSON = localStorage.getItem('nuevoElementoJSON') || '[]';
  
    const calcularFechaVencimiento = (fechaInicio, meses) => {
      const fecha = new Date(fechaInicio);
      fecha.setMonth(fecha.getMonth() + meses);
      return fecha.toLocaleDateString();
    };
  
    const agregarFila = (elemento) => {
      const nuevaFila = tabla.insertRow();
      const celdaCheckbox = nuevaFila.insertCell(0);
      const celdaCodigo = nuevaFila.insertCell(1);
      const celdaNombre = nuevaFila.insertCell(2);
      const celdaPeso = nuevaFila.insertCell(3);
      const celdaFechaLlegada = nuevaFila.insertCell(4);
      const celdaFechaVencimiento = nuevaFila.insertCell(5);
  
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      celdaCheckbox.appendChild(checkbox);
  
      const fechaLlegada = new Date().toLocaleDateString();
      const fechaVencimiento = calcularFechaVencimiento(new Date(), 6);
  
      celdaCodigo.textContent = elemento.codigo_pescado;
      celdaNombre.textContent = elemento.pescado;
      celdaPeso.textContent = elemento.cantidad_pescado;
      celdaFechaLlegada.textContent = fechaLlegada;
      celdaFechaVencimiento.textContent = fechaVencimiento;
    };
    const elementos = JSON.parse(nuevoElementoJSON);
    elementos.forEach(agregarFila);
  
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
                    fecha_entrada: fila.cells[4].textContent,
                    fecha_caducidad: fila.cells[5].textContent
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
  