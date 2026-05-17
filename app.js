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

    const locais = rotaAtual.filter(local =>
        local.lat &&
        local.lng
    );

    if(locais.length < 2){

        alert("Rota insuficiente.");

        return;
    }

    const pontos = locais.map(local =>
        `${local.lat},${local.lng}`
    );

    const url = `https://www.google.com/maps/dir/${pontos.join('/')}`;

    window.open(url, '_blank');
}

function abrirTudoNoMaps(){

    alert("teste");

}