function toggleCadastro(){  
    const p = document.getElementById('painel-cadastro');  
    p.style.display = p.style.display === 'block' ? 'none' : 'block';  
}

function salvarNovoLocal(){  
    const nome = document.getElementById('novo-nome').value;  
    const end = document.getElementById('novo-end').value;  
    const coords = document.getElementById('novo-coords').value.split(',');  
    if(!nome || !end || coords.length < 2){  
        alert("Preencha tudo corretamente. Ex: -22.7490005, -41.9561384");  
        return;  
    }  
    const novo = {  
        id:Date.now(),  
        nome,  
        regiao:"Extra",  
        endereco:end,  
        lat:parseFloat(coords[0].trim()),  
        lon:parseFloat(coords[1].trim()),  
        custom:true,  
        prioridade: 99  
    };  
    let extras = JSON.parse(localStorage.getItem('locais_extras') || '[]');  
    extras.push(novo);  
    localStorage.setItem('locais_extras', JSON.stringify(extras));  
    document.getElementById('novo-nome').value = '';  
    document.getElementById('novo-end').value = '';  
    document.getElementById('novo-coords').value = '';  
    toggleCadastro();  
    carregarSelecao();  
}


function carregarSelecao(){  
    const container = document.getElementById('lista-selecao');  
    container.innerHTML = '';  
    const todos = [...locaisBase, ...JSON.parse(localStorage.getItem('locais_extras') || '[]')];  
    const selecionadosIds = JSON.parse(localStorage.getItem('rota_salva') || '[]');  
    todos.forEach(l => {  
        const isChecked = selecionadosIds.includes(l.id) ? 'checked' : '';  
        const card = document.createElement('div');  
        card.className = `card ${l.custom ? 'custom' : ''}`;  
        card.innerHTML = `  
            <h3 style="margin:0">${l.nome}</h3>  
            <span class="info-endereco">📍 ${l.endereco}</span>  
            <label class="switch">  
                <input type="checkbox" class="toggle-rota" value="${l.id}" ${isChecked}>  
                <span class="slider"></span>  
            </label>  
        `;  
        card.onclick = (e) => {  
            if(!e.target.closest('.switch')){  
                const checkbox = card.querySelector('input');  
                checkbox.checked = !checkbox.checked;  
            }  
        };  
        container.appendChild(card);  
    });  
}  
  
function gerarRota(){

    const ids = Array.from(
        document.querySelectorAll('.toggle-rota:checked')
    ).map(c => parseInt(c.value));

    if(ids.length === 0){

        alert("Selecione os locais para gerar a rota.");

        return;
    }

    const todos = [
        ...locaisBase,
        ...JSON.parse(localStorage.getItem('locais_extras') || '[]')
    ];

    rotaAtual = todos.filter(l => ids.includes(l.id));

    localStorage.setItem(
        'rota_salva',
        JSON.stringify(ids)
    );

    document.getElementById('view-selecao')
        .style.display = 'none';

    document.getElementById('view-rota-ativa')
        .style.display = 'block';

    renderizarRotaAtiva(rotaAtual);

    iniciarGPS();
}
  
renderizarRotaAtiva(rotaAtual);{  
    const container = document.getElementById('lista-rota-ativa');  
    container.innerHTML = '';  
    const todos = [...locaisBase, ...JSON.parse(localStorage.getItem('locais_extras') || '[]')];  
    const ordemRegioes = ["Praia Rasa", "Baía Formosa / Rasa", "Vila Luiza", "Geribá", "Ferradura", "Village", "Azeda / Ossos"];  
      
    const ativos = todos.filter(l => ids.includes(l.id)).sort((a,b)=>{  
        if(a.prioridade !== b.prioridade) return a.prioridade - b.prioridade;  
        return ordemRegioes.indexOf(a.regiao) - ordemRegioes.indexOf(b.regiao);  
    });  
  
    let stopsGoogle = "";  
    ativos.forEach((l,index)=>{  
        stopsGoogle += `${l.lat},${l.lon}/`;  
        const card = document.createElement('div');  
        card.className = 'card';  
        card.dataset.id = l.id;  
        card.innerHTML = `  
            <div class="drag-handle">☰</div>  
            <div class="titulo-rota" data-nome="${l.nome}" style="font-weight:bold;color:var(--primary);">${index + 1}. ${l.nome}</div>  
            <div class="info-endereco">📍 ${l.endereco}</div>  
            <div class="btn-gps-group">  
                <a href="https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lon}" target="_blank" class="btn-gps btn-google">Maps</a>  
                <a href="https://waze.com/ul?ll=${l.lat},${l.lon}&navigate=yes" target="_blank" class="btn-gps btn-waze">Waze</a>  
            </div>  
            <div class="extra-checks">  
                <label class="mini-check"><input type="checkbox" class="check-coleta"> Coleta</label>  
                <label class="mini-check"><input type="checkbox" class="check-entrega"> Entrega</label>  
                <label class="mini-check"><input type="checkbox" class="check-retorno"> Retornar</label>  
                <button class="btn-finalizar" onclick="validarPendencia(this)">Finalizar Hotel</button>  
            </div>  
        `;  
        container.appendChild(card);  
    });  
  
    document.getElementById('btn-full-google').href = `https://www.google.com/maps/dir/${stopsGoogle}`;  
    if(ativos.length > 0){  
        const last = ativos[ativos.length - 1];  
        document.getElementById('btn-full-waze').href = `https://waze.com/ul?ll=${last.lat},${last.lon}&navigate=yes`;  
    }  
  
    new Sortable(container,{  
        animation:150,  
        handle:'.drag-handle',  
        onEnd:()=>{  
            const novosIds = Array.from(container.querySelectorAll('.card')).map(c => parseInt(c.dataset.id));  
            localStorage.setItem('rota_salva', JSON.stringify(novosIds));  
            atualizarNumeracao();  
        }  
    });  
}  
  
function validarPendencia(btn){  
    const card = btn.closest('.card');  
    const coleta = card.querySelector('.check-coleta').checked;  
    const entrega = card.querySelector('.check-entrega').checked;  
    const retorno = card.querySelector('.check-retorno').checked;  
    const container = document.getElementById('lista-rota-ativa');  
  
    if((coleta && entrega) || retorno){  
        card.classList.remove('pendente');  
        toggleConcluido(btn);  
    } else {  
        card.classList.remove('concluido');  
        card.classList.add('pendente');  
        container.appendChild(card);  
    }  
    atualizarNumeracao();  
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
  
function inicializarDadosSalvos() {  
    const idsSalvos = JSON.parse(localStorage.getItem('rota_salva') || '[]');  
    if (idsSalvos.length > 0) {  
        const todos = [...locaisBase, ...JSON.parse(localStorage.getItem('locais_extras') || '[]')];  
        rotaGerada = todos.filter(l => idsSalvos.includes(l.id));  
    }  
}  
  
function iniciarGPS() {  
    if (!("geolocation" in navigator)) return;  
    navigator.geolocation.watchPosition(  
        (position) => {  
            userLat = position.coords.latitude;  
            userLng = position.coords.longitude;  
            const gpsInfo = document.getElementById("gps-info");  
            if (gpsInfo) {  
                gpsInfo.innerHTML = `
<span style="color:#4caf50">●</span> GPS Ativo
`;  
            }  
            detectarHotelMaisProximo();  
        },  
        (error) => console.error(error),  
        { enableHighAccuracy: true }  
    );  
}  
  
function calcularDistancia(lat1, lon1, lat2, lon2) {  
    const R = 6371;  
    const dLat = (lat2 - lat1) * Math.PI / 180;  
    const dLon = (lon2 - lon1) * Math.PI / 180;  
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);  
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));  
}  
  
function detectarHotelMaisProximo() {  
    if (rotaGerada.length === 0 || !userLat) return;  
    let menorDistancia = Infinity;  
    let hotelMaisProximo = null;  
    rotaGerada.forEach(hotel => {  
        const card = document.querySelector(`.card[data-id="${hotel.id}"]`);  
        if (card && card.classList.contains('concluido')) return;  
        const dist = calcularDistancia(userLat, userLng, hotel.lat, hotel.lon);  
        if (dist < menorDistancia) {  
            menorDistancia = dist;  
            hotelMaisProximo = hotel;  
        }  
    });  
    const box = document.getElementById("hotel-proximo");  
    if (hotelMaisProximo && box) {  
        box.style.display = "block";  
        const tempoMin = Math.round((menorDistancia / 35) * 60);  
        box.innerHTML = `<div style="border-left: 4px solid #33ccff; padding-left: 10px;"><b style="color:#33ccff">📍 Próximo:</b><br>${hotelMaisProximo.nome}<br><small>${menorDistancia.toFixed(2)} km | ~${tempoMin} min</small></div>`;  
    }  
}

