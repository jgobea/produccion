document.addEventListener('DOMContentLoaded', () => {
    const codigoInput = document.getElementById('codigo');
    const nombreInput = document.getElementById('nombre');
    const kgInput = document.getElementById('kg');
    const formulario = document.querySelector('.formulario');
    let especies = [];
    let url = 'https://fd66-168-194-111-17.ngrok-free.app/API/ingreso/pescado';

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
                    codigo_pescado: item.codigo_pescado,
                    pescado: item.pescado,
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
                <td>${especie.codigo_pescado}</td>
                <td>${especie.pescado}</td>
            `;
            tbody.appendChild(tr);
        });
    };


    const editarPesoPescado = async (id, codigo_pescado, pescado, cantidad_pescado, fecha_entrada, fecha_caducidad) => {   
        const nuevoElemento = {
            "codigo_pescado": codigo_pescado,
            "pescado": pescado,
            "cantidad_pescado": cantidad_pescado.toString(),
            "fecha_entrada": fecha_entrada,
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

    codigoInput.addEventListener('input', () => {
        const codigo_pescado = codigoInput.value;
        const especie = especies.find(e => e.codigo_pescado === codigo_pescado);
        if (especie) {
            nombreInput.value = especie.pescado;
        } else {
            nombreInput.value = '';
        }
    });

    formulario.addEventListener('submit', (event) => {
        event.preventDefault();
        const pescado = nombreInput.value;
        const codigo = codigoInput.value;
        const kg = parseFloat(kgInput.value);
        const codigo_pescadoExistente = especies.find(e => e.codigo_pescado === codigo);

        if (kg < 0) {
            alert('El valor de kg no puede ser negativo');
            return;
        }

        if (!codigo_pescadoExistente) {
            alert(`No existe el codigo_pescado: ${codigo_pescado}`);
        } else {
            id = codigo_pescadoExistente.id;
            console.log(id);
            alert('Formulario enviado correctamente');
            editarPesoPescado(id,codigo,pescado,kg,"2024-12-21T04:00:00.000Z","2025-01-23T04:00:00.000Z");
        }
    });
});
