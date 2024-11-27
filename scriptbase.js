document.addEventListener('DOMContentLoaded', () => {
    const codigoInput = document.getElementById('codigo');
    const nombreInput = document.getElementById('nombre');
    const kgInput = document.getElementById('kg');
    const formulario = document.querySelector('.formulario');
    let especies = [];

    // Función para cargar los datos de la API
    const cargarEspecies = async () => {
        console.log('Cargando datos de la API');
        try {
            const response = await fetch('https://6a75-168-194-111-17.ngrok-free.app/API/pescados');
            if (!response.ok) { throw new Error('Error al obtener productos'); }
            const datos = await response.json();
            console.log(datos);
            if (data.status === 200) {
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

    // Llamar a la función para cargar los datos
    cargarEspecies(); 

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

var modal = document.getElementById("enviado"); 

var btn = document.getElementById("confirmar-lote"); 

var span = document.getElementsByClassName("close")[0]; 

btn.onclick = function() { 
    modal.style.display = "block"; 
    setTimeout(function() { 
        modal.querySelector('.modal-content').classList.add('show'); 
    }, 10); // Breve retraso para permitir la transición 
} 

span.onclick = function() { 
    modal.style.display = "none"; 
    setTimeout(function() { 
        modal.style.display = "none"; 
    }, 500); // Coincide con la duración de la transición 
} 

window.onclick = function(event) { 
    if (event.target == modal) { 
        modal.querySelector('.modal-content').classList.remove('show'); 
        setTimeout(function() { modal.style.display = "none"; 
        }, 500); // Coincide con la duración de la transición 
        } 
    }