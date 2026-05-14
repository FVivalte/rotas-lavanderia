function inicializarDadosSalvos() {

    const idsSalvos = JSON.parse(
        localStorage.getItem('rota_salva') || '[]'
    );

    if (idsSalvos.length > 0) {

        const todos = [
            ...locaisBase,
            ...JSON.parse(localStorage.getItem('locais_extras') || '[]')
        ];

        rotaAtual = todos.filter(
            l => idsSalvos.includes(l.id)
        );
    }
}

function salvarLocalExtra(local) {
    let extras = JSON.parse(
        localStorage.getItem('locais_extras') || '[]'
    );

    extras.push(local);

    localStorage.setItem(
        'locais_extras',
        JSON.stringify(extras)
    );
}

function obterLocaisExtras() {
    return JSON.parse(
        localStorage.getItem('locais_extras') || '[]'
    );
}