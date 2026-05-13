let userLat = null;
let userLng = null;
let rotaGerada = [];

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