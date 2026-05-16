
let userLat = null;
let userLng = null;
let rotaAtual = [];
let modoRotaAtivo = false;
let hotelAtualIndex = 0;
let hotelAtualId = null;
let inicioHotel = null;
let timerHotel = null;

function obterTodosLocais(){
    return [
        ...locaisBase,
        ...JSON.parse(localStorage.getItem('locais_extras') || '[]')
    ];
}

function obterLocalPorId(id){
    return obterTodosLocais().find(l => parseInt(l.id) === parseInt(id));
}

window.addEventListener("load", () => {

    inicializarDadosSalvos();
    carregarSelecao();

    const rotaSalva =
        JSON.parse(localStorage.getItem('rota_salva') || '[]');

    if(rotaSalva.length > 0){

        const viewSelecao = document.getElementById('view-selecao');
        const viewRota = document.getElementById('view-rota-ativa');

        if(viewSelecao) viewSelecao.style.display = 'none';
        if(viewRota) viewRota.style.display = 'block';

        renderizarRotaAtiva(rotaSalva);

        iniciarGPS();
    }
});

function finalizarHotel(id){

    let rota =
        JSON.parse(localStorage.getItem('rota_salva') || '[]');

    rota = rota.filter(item => parseInt(item) !== parseInt(id));

    rotaAtual = rota;

    localStorage.setItem(
        'rota_salva',
        JSON.stringify(rota)
    );

    renderizarRotaAtiva(rota);

    if(rota.length === 0){

        const modoRota = document.getElementById('modo-rota');
        const btnAddHotel = document.getElementById('btn-add-hotel');

        if(modoRota){
            modoRota.style.display = 'none';
        }

        if(btnAddHotel){
            btnAddHotel.style.display = 'block';
        }
    }
}

function mostrarHotelAtual() {

    const hotelId = rotaAtual[hotelAtualIndex];
    const hotel = obterLocalPorId(hotelId);

    if (!hotel) return;

    const nome = document.getElementById("hotel-atual-nome");
    const regiao = document.getElementById("hotel-atual-regiao");

    if(nome){
        nome.innerText = hotel.nome || "Hotel";
    }

    if(regiao){
        regiao.innerText = hotel.regiao || "";
    }

    hotelAtualId = hotel.id;

    iniciarTimerHotel();
}

function iniciarTimerHotel() {

    inicioHotel = Date.now();

    clearInterval(timerHotel);

    timerHotel = setInterval(() => {

        const agora = Date.now();
        const diff = agora - inicioHotel;

        const minutos = Math.floor(diff / 60000);
        const segundos = Math.floor((diff % 60000) / 1000);

        const tempoHotel =
            document.getElementById("tempo-hotel");

        if(tempoHotel){
            tempoHotel.innerText =
                `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        }

    }, 1000);
}

function navegarHotelAtual() {

    const hotelId = rotaAtual[hotelAtualIndex];
    const hotel = obterLocalPorId(hotelId);

    if (!hotel) return;

    if (hotel.lat == null || hotel.lng == null) {

        alert("Coordenadas não encontradas.");

        return;
    }

    window.open(
        `https://www.google.com/maps?q=${hotel.lat},${hotel.lng}`,
        "_blank"
    );
}

function marcarEntregue() {

    const hotelId = rotaAtual[hotelAtualIndex];
    const hotel = obterLocalPorId(hotelId);

    if (!hotel) return;

    localStorage.setItem(`entrega_${hotel.id}`, 'true');

    alert(`Entrega marcada em ${hotel.nome}`);
}

function marcarColetado() {

    const hotelId = rotaAtual[hotelAtualIndex];
    const hotel = obterLocalPorId(hotelId);

    if (!hotel) return;

    localStorage.setItem(`coleta_${hotel.id}`, 'true');

    alert(`Coleta marcada em ${hotel.nome}`);
}

function proximoHotel() {

    hotelAtualIndex++;

    if (hotelAtualIndex >= rotaAtual.length) {

        clearInterval(timerHotel);

        alert("✅ Rota finalizada!");

        const modoRota = document.getElementById("modo-rota");

        if(modoRota){
            modoRota.style.display = "none";
        }

        modoRotaAtivo = false;

        return;
    }

    mostrarHotelAtual();
}
