window.addEventListener("load", () => {

    if(typeof renderizarLocais === "function"){
        renderizarLocais();
    }

    carregarRota();

    iniciarMonitoramentoGPS();

    renderizarModoRota();

});
