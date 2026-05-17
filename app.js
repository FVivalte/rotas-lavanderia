window.addEventListener("load", () => {

    if(typeof carregarSelecao === "function"){
        carregarSelecao();
    }

    if(typeof carregarRota === "function"){
        carregarRota();
    }

    if(rotaAtual && rotaAtual.ativa){

        document.getElementById('view-selecao').style.display = 'none';

        document.getElementById('view-rota-ativa').style.display = 'block';
    }

    if(typeof iniciarMonitoramentoGPS === "function"){
        iniciarMonitoramentoGPS();
    }

    if(typeof renderizarModoRota === "function"){
        renderizarModoRota();
    }

});

function abrirTudoNoMaps(){

    if(!rotaAtual || rotaAtual.length === 0){
        alert("Nenhuma rota ativa.");
        return;
    }

    const locais = rotaAtual
        .filter(l => l.lat && l.lng);

    if(locais.length === 0){
        alert("Locais sem coordenadas.");
        return;
    }

    const origem = `${locais[0].lat},${locais[0].lng}`;
    const destino = `${locais[locais.length - 1].lat},${locais[locais.length - 1].lng}`;

    const waypoints = locais
        .slice(1, -1)
        .map(l => `${l.lat},${l.lng}`)
        .join('|');

    let url = `https://www.google.com/maps/dir/?api=1`
        + `&origin=${origem}`
        + `&destination=${destino}`
        + `&travelmode=driving`;

    if(waypoints){
        url += `&waypoints=${waypoints}`;
    }

    window.open(url, '_blank');
}