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

window.abrirTudoNoMaps = function(){

    if(!rotaAtual || rotaAtual.length === 0){

        alert("Nenhuma rota ativa.");

        return;
    }

    const pontos = rotaAtual
        .filter(local => local.lat && local.lng)
        .map(local => `${local.lat},${local.lng}`);

    if(pontos.length < 2){

        alert("Rota insuficiente.");

        return;
    }

    const url =
        "https://www.google.com/maps/dir/" +
        pontos.join("/");

    window.open(url, "_blank");

}
}