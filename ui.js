const hotelContainer = document.querySelector('.hotels');
const searchInput = document.querySelector('.search');
const actionButtons = document.querySelectorAll('.action-btn');
const finishBtn = document.querySelector('.finish-btn');

function renderizarHoteis(){

    const listaAtual = document.querySelectorAll('.hotel-item');

    listaAtual.forEach(item => item.remove());

    app.hoteis.forEach((hotel,index)=>{

        const tipoClasse =
            hotel.tipo === 'Entrega'
            ? 'delivery'
            : 'collect';

        const html = `
        <div class="hotel-item">

            <div class="hotel-left">

                <div class="drag">☰</div>

                <div class="hotel-number">
                    ${index + 1}
                </div>

                <div class="hotel-info">
                    <h3>${hotel.nome}</h3>
                    <p>${hotel.bairro}</p>
                </div>

            </div>

            <div class="hotel-actions">
                <div class="tag ${tipoClasse}">
                    ${hotel.tipo}
                </div>
            </div>

        </div>
        `;

        hotelContainer.insertAdjacentHTML(
            'beforeend',
            html
        );
    });
}

function atualizarResumo(){

    const total = app.hoteis.length;

    const entregas =
        app.hoteis.filter(
            h => h.tipo === 'Entrega'
        ).length;

    const coletas =
        app.hoteis.filter(
            h => h.tipo === 'Coleta'
        ).length;

    document.querySelectorAll(
        '.summary-card h2'
    )[0].textContent = total;

    document.querySelectorAll(
        '.summary-card h2'
    )[1].textContent = entregas;

    document.querySelectorAll(
        '.summary-card h2'
    )[2].textContent = coletas;
}

function filtrarHoteis(e){

    const termo =
        e.target.value.toLowerCase();

    const itens =
        document.querySelectorAll('.hotel-item');

    itens.forEach(item=>{

        const nome =
            item.querySelector('h3')
            .textContent
            .toLowerCase();

        item.style.display =
            nome.includes(termo)
            ? 'flex'
            : 'none';
    });
}

function mostrarToast(texto){

    const toast =
        document.createElement('div');

    toast.className = 'toast';
    toast.innerText = texto;

    document.body.appendChild(toast);

    setTimeout(()=>{
        toast.classList.add('show');
    },100);

    setTimeout(()=>{

        toast.classList.remove('show');

        setTimeout(()=>{
            toast.remove();
        },300);

    },2500);
}