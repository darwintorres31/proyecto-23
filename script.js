// Busco los elementos de la página para poder usarlos
let entradaUbicacion = document.getElementById("ubicacion");
let botonBuscar = document.getElementById("botonBuscar");
let climaActual = document.getElementById("climaActual");
let listaHoras = document.getElementById("listaHoras");

//  Función principal que se ejecuta al buscar
function buscarClima() {
    let ciudad = entradaUbicacion.value;

    climaActual.innerHTML = "<p>Buscando...</p>";
    listaHoras.innerHTML = "";

    // Primero busco las coordenadas (latitud y longitud) de la ciudad
    let urlGeo = "https://geocoding-api.open-meteo.com/v1/search?name=" 
        + encodeURIComponent(ciudad) + "&count=1&language=es&format=json";

    fetch(urlGeo)
    .then(function(respuesta) {
        return respuesta.json();
    })
    .then(function(datosGeo) {
        // Si no encuentra la ciudad, lanzo un error
        if (!datosGeo.results) {
            throw new Error("Ciudad no encontrada");
        }

        // Guardo la latitud y longitud que encontró
        let latitud = datosGeo.results[0].latitude;
        let longitud = datosGeo.results[0].longitude;
        let nombreCompleto = datosGeo.results[0].name + ", " + datosGeo.results[0].country;

        //  Con las coordenadas, busco el clima real
        let urlClima = "https://api.open-meteo.com/v1/forecast?latitude=" + latitud 
            + "&longitude=" + longitud 
            + "&current_weather=true&hourly=temperature_2m,precipitation_probability,windspeed_10m,weathercode" 
            + "&past_days=1&forecast_days=1&timezone=auto";

        return fetch(urlClima)
            .then(function(respuesta) { return respuesta.json(); })
            .then(function(datosClima) {
                return { datosClima: datosClima, nombre: nombreCompleto };
            });
    })
    .then(function(resultado) {
        let datos = resultado.datosClima;
        let nombre = resultado.nombre;

        //  Muestro el clima actual en la tarjeta
        let actual = datos.current_weather;
        climaActual.innerHTML = `
            <h2>${nombre}</h2>
            <p><strong>Temperatura:</strong> ${actual.temperature} °C</p>
            <p><strong>Viento:</strong> ${actual.windspeed} km/h</p>
            <p><strong>Condición:</strong> Código ${actual.weathercode}</p>
        `;

        //  Recorro las horas y las muestro en la lista
        listaHoras.innerHTML = "";
        let horas = datos.hourly.time;
        let temps = datos.hourly.temperature_2m;
        let lluvias = datos.hourly.precipitation_probability;
        let vientos = datos.hourly.windspeed_10m;

        for (let i = 0; i < horas.length; i++) {
            let horaCorta = horas[i].slice(11, 16);
            listaHoras.innerHTML += `
                <div class="hora">
                    <span>${horaCorta}</span>
                    <span>${temps[i]}°C | 💨 ${vientos[i]} km/h | 🌧️ ${lluvias[i]}%</span>
                </div>
            `;
        }
    })
    .catch(function(error) {
        //  Si algo falla, muestro el mensaje de error
        climaActual.innerHTML = "<p style='color: red;'>Error: No se encontró la ciudad o hubo un problema de conexión.</p>";
        console.log(error);
    });
}

//  Al hacer clic en el botón, busco el clima
botonBuscar.onclick = buscarClima;

// Al abrir la página, busco el clima por defecto (Sogamoso)
buscarClima();