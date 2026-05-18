function configurarEventos(){

    searchInput.addEventListener(
        'input',
        filtrarHoteis
    );

    actionButtons[0].addEventListener(
        'click',
        gerarRota
    );

    actionButtons[1].addEventListener(
        'click',
        mostrarTudoMapa
    );

    actionButtons[2].addEventListener(
        'click',
        ativarModoRota
    );

    actionButtons[3].addEventListener(
        'click',
        gerarRelatorio
    );

    finishBtn.addEventListener(
        'click',
        finalizarRota
    );
}

function iniciarApp(){

    carregarStorage();

    renderizarHoteis();

    atualizarResumo();

    configurarEventos();

    iniciarMapa();

    console.log(
        'Rota Pro Búzios iniciado'
    );
}

iniciarApp();