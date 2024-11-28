document.addEventListener('DOMContentLoaded', () => {
    const codigoInput = document.getElementById('codigo');
    const nombreInput = document.getElementById('nombre');
    const kgInput = document.getElementById('kg');
    const formulario = document.querySelector('.formulario');
    let especies = [];
    let datosParaTabla = [];
    let url = 'https://1ea0-190-120-250-84.ngrok-free.app/API/pescados';

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
                    id : item.id,
                    codigo_pescado: item.codigo_pescado,
                    pescado: item.pescado,
                    cantidad_pescado: item.cantidad_pescado,
                    fecha_entrada: item.fecha_entrada,
                    fecha_caducidad: item.fecha_caducidad
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
    const enviarDatos = async (id, codigo_pescado, pescado, cantidad_pescado, fecha_entrada, fecha_caducidad) => {
        const options = {
            method: 'POST',
            headers: {
                "ngrok-skip-browser-warning": "69420",
            },
            body: JSON.stringify({
                id: id,
                codigo_pescado: codigo_pescado,
                pescado : pescado,
                cantidad_pescado: cantidad_pescado,
                fecha_entrada: fecha_entrada,
                fecha_caducidad: fecha_caducidad
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


    const editarPesoPescado = async (id, codigo_pescado, pescado, cantidad_pescado, fecha_entrada, fecha_caducidad) => {   
        const nuevoElemento = {
            "codigo_pescado": codigo_pescado,
            "pescado": pescado,
            "cantidad_pescado": cantidad_pescado.toString()
        };
        
        datosParaTabla.push(nuevoElemento);
        
        // Compartir los datos con script2.js
        window.localStorage.setItem('nuevoElementoJSON', JSON.stringify(datosParaTabla));
        
        console.log('Datos guardados para la tabla:', datosParaTabla);
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
