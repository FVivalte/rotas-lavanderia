function toggleCadastro(){  
    const p = document.getElementById('painel-cadastro');  
    p.style.display = p.style.display === 'block' ? 'none' : 'block';  
}

function salvarNovoLocal() {

    const nome = document.getElementById('novo-nome').value;

    const endereco = document.getElementById('novo-end').value;

    const coords = document
        .getElementById('novo-coords')
        .value
        .split(',');

    if (!nome || !endereco || coords.length < 2) {

        alert(
            "Preencha tudo corretamente. Ex: -22.7490005, -41.9561384"
        );

        return;
    }

    const lat = parseFloat(coords[0].trim());

    const lng = parseFloat(coords[1].trim());

    const novoLocal = criarNovoLocal(
        nome,
        endereco,
        lat,
        lng
    );

    salvarLocalExtra(novoLocal);

    limparFormularioCadastro();

    toggleCadastro();

    carregarSelecao();
}

function carregarSelecao(){

    const container =
        document.getElementById('lista-selecao');

    container.innerHTML = '';

    const todos = [
        ...locaisBase,
        ...JSON.parse(
            localStorage.getItem('locais_extras') || '[]'
        )
    ];

    const selecionadosIds =
        JSON.parse(
            localStorage.getItem('rota_salva') || '[]'
        );

    todos.forEach(l => {

        const isChecked =
            selecionadosIds.includes(l.id)
            ? 'checked'
            : '';

        const card = document.createElement('div');

        card.className =
            `card ${l.custom ? 'custom' : ''}`;

        card.innerHTML = `

            <label class="switch">

                <input
                    type="checkbox"
                    class="toggle-rota"
                    value="${l.id}"
                    ${isChecked}>

                <span class="slider"></span>

            </label>

            <div class="titulo-rota">

                ${l.nome}

            </div>

            <div class="info-endereco">

                📍 ${l.endereco}

            </div>

        `;

        card.onclick = (e) => {

            if(!e.target.closest('.switch')){

                const checkbox =
                    card.querySelector('.toggle-rota');

                checkbox.checked =
                    !checkbox.checked;
            }
        };

        container.appendChild(card);
    });
}

function validarPendencia(btn){

    const card = btn.closest('.card');

    const id = parseInt(card.dataset.id);

    let rota =
        JSON.parse(localStorage.getItem('rota_salva') || '[]');

    rota = rota.filter(item => item !== id);

    localStorage.setItem(
        'rota_salva',
        JSON.stringify(rota)
    );

    card.remove();

    atualizarNumeracao();

    // MOSTRA BOTÃO + SE ACABAR ROTA
    if(rota.length === 0){

        document.getElementById('btn-add-hotel')
            .style.display = 'block';

        document.getElementById('view-rota-ativa')
            .style.display = 'none';

        document.getElementById('view-selecao')
            .style.display = 'block';

        carregarSelecao();
    }
}

function toggleConcluido(btn){  
    const card = btn.closest('.card');  
    card.classList.add('concluido');  
    btn.innerHTML = '✅ Concluído';  
    const prox = card.nextElementSibling;  
    if(prox){  
        const todos = [...locaisBase, ...JSON.parse(localStorage.getItem('locais_extras') || '[]')];  
        const d = todos.find(l => l.id === parseInt(prox.dataset.id));  
        if(d) {  
            document.getElementById('next-stop-name').innerText = d.nome;  
            document.getElementById('modal-google').href = `https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lon}`;  
            document.getElementById('modal-waze').href = `https://waze.com/ul?ll=${d.lat},${d.lon}&navigate=yes`;  
            document.getElementById('overlay').style.display = 'block';  
            document.getElementById('modal-next').style.display = 'block';  
        }  
    }  
}

function atualizarNumeracao(){  
    const cards = document.querySelectorAll('#lista-rota-ativa .card');  
    cards.forEach((card,index)=>{  
        const titulo = card.querySelector('.titulo-rota');  
        if(titulo) titulo.innerHTML = `${index + 1}. ${titulo.dataset.nome}`;  
    });  
}

function fecharModal(){  
    document.getElementById('overlay').style.display = 'none';  
    document.getElementById('modal-next').style.display = 'none';  
}

function limparSelecao(){  
    if(confirm("Deseja realmente limpar a lista de paradas?")){  
        document.querySelectorAll('.toggle-rota').forEach(c => c.checked = false);  
        localStorage.removeItem('rota_salva');  
    }  
}

function voltarSelecao(){  
    document.getElementById('view-rota-ativa').style.display = 'none';  
    document.getElementById('view-selecao').style.display = 'block';  
    carregarSelecao();  
}

function limparFormularioCadastro() {
    document.getElementById('novo-nome').value = '';
    document.getElementById('novo-end').value = '';
    document.getElementById('novo-coords').value = '';
}

function salvarNovaOrdemRota(){

    const novaOrdem = Array.from(
        document.querySelectorAll('#lista-rota-ativa .card')
    ).map(card => parseInt(card.dataset.id));

    rotaAtual = novaOrdem;

    localStorage.setItem(
        'rota_salva',
        JSON.stringify(novaOrdem)
    );
}
