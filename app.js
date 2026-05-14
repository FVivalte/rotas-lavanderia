let userLat = null;
let userLng = null;
let rotaGerada = [];
let modoRotaAtivo = false;
let hotelAtualIndex = 0;
let inicioHotel = null;
let timerHotel = null;

carregarSelecao();
inicializarDadosSalvos();

window.addEventListener("load", () => {

    const rotaSalva =
        JSON.parse(localStorage.getItem('rota_salva') || '[]');

    if(rotaSalva.length > 0){

        document.getElementById('view-selecao').style.display = 'none';

        document.getElementById('view-rota-ativa').style.display = 'block';

        renderizarRotaAtiva(rotaSalva);

        iniciarGPS();

    }

});
// ==========================
// MODO EM ROTA
// ==========================

let modoRotaAtivo = false;
let hotelAtualIndex = 0;
let inicioHotel = null;
let timerHotel = null;


// INICIAR MODO ROTA
function iniciarModoRota() {

    if (!rotaAtual || rotaAtual.length === 0) {

        alert("Nenhuma rota ativa.");

        return;
    }

    modoRotaAtivo = true;

    hotelAtualIndex = 0;

    document.getElementById("modo-rota")
        .style.display = "block";

    mostrarHotelAtual();
}


// MOSTRAR HOTEL ATUAL
function mostrarHotelAtual() {

    const hotel = rotaAtual[hotelAtualIndex];

    if (!hotel) return;

    document.getElementById("hotel-atual-nome")
        .innerText = hotel.nome || "Hotel";

    document.getElementById("hotel-atual-regiao")
        .innerText = hotel.regiao || "";

    iniciarTimerHotel();
}


// TIMER
function iniciarTimerHotel() {

    inicioHotel = Date.now();

    clearInterval(timerHotel);

    timerHotel = setInterval(() => {

        const agora = Date.now();

        const diff = agora - inicioHotel;

        const minutos = Math.floor(diff / 60000);

        const segundos = Math.floor((diff % 60000) / 1000);

        document.getElementById("tempo-hotel")
            .innerText =
            `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

    }, 1000);
}


// NAVEGAR
function navegarHotelAtual() {

    const hotel = rotaAtual[hotelAtualIndex];

    if (!hotel) return;

    const lat =
        hotel.lat ||
        hotel.latitude;

    const lng =
        hotel.lng ||
        hotel.lon ||
        hotel.longitude;

    if (!lat || !lng) {

        alert("Coordenadas não encontradas.");

        return;
    }

    window.open(
        `https://www.google.com/maps?q=${lat},${lng}`,
        "_blank"
    );
}


// ENTREGUE
function marcarEntregue() {

    const hotel = rotaAtual[hotelAtualIndex];

    if (!hotel) return;

    hotel.entregue = true;

    salvarRotaLocal();

    alert(`Entrega marcada em ${hotel.nome}`);
}


// COLETADO
function marcarColetado() {

    const hotel = rotaAtual[hotelAtualIndex];

    if (!hotel) return;

    hotel.coletado = true;

    salvarRotaLocal();

    alert(`Coleta marcada em ${hotel.nome}`);
}


// PRÓXIMO HOTEL
function proximoHotel() {

    const hotel = rotaAtual[hotelAtualIndex];

    if (hotel && inicioHotel) {

        const tempoGasto = Date.now() - inicioHotel;

        hotel.tempoGasto = tempoGasto;
    }

    hotelAtualIndex++;

    // FIM DA ROTA
    if (hotelAtualIndex >= rotaAtual.length) {

        clearInterval(timerHotel);

        alert("✅ Rota finalizada!");

        document.getElementById("modo-rota")
            .style.display = "none";

        modoRotaAtivo = false;

        salvarRotaLocal();

        return;
    }

    mostrarHotelAtual();

    salvarRotaLocal();
}


// SALVAR ROTA
function salvarRotaLocal() {

    localStorage.setItem(
        "rotaAtual",
        JSON.stringify(rotaAtual)
    );
}