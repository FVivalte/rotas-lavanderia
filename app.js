lucide.createIcons();

const HOTELS = [
      {id:1,name:"Hotel Aretê",region:"Baía Formosa / Rasa",address:"Alameda Andorinhas – Loteamento Praia Baía Formosa, Armação dos Búzios - RJ",coords:"-22.7490005,-41.9561384"},
      {id:2,name:"Pousada Manaaki",region:"Praia Rasa",address:"Av. Greta Blanck do Rio, 82 – Praia Rasa, Armação dos Búzios - RJ",coords:"-22.7632675,-41.9422559"},
      {id:3,name:"Pousada Maré Búzios",region:"Vila Luiza",address:"Rua do Começo, 162 – Vila Luiza, Armação dos Búzios - RJ",coords:"-22.7597922,-41.9441392"},
      {id:4,name:"Casa da Ruth Pousada",region:"Geribá",address:"Rua Gerbert Périssé, 10 – Geribá, Armação dos Búzios - RJ",coords:"-22.7798199,-41.9146731"},
      {id:5,name:"Maravista Hotel e Spa",region:"Geribá",address:"Rua Gerbert Périssé, 276 – Praia de Geribá, Armação dos Búzios - RJ",coords:"-22.7796447,-41.9143854"},
      {id:6,name:"Le Relais La Borie",region:"Geribá",address:"Rua Gerbert Périssé, 554 – Geribá Beach, Armação dos Búzios - RJ",coords:"-22.7783015,-41.9118299"},
      {id:7,name:"Carmel",region:"Ferradura",address:"Rua Parque, 17 – Praia da Ferradura, Armação dos Búzios - RJ",coords:"-22.7709027,-41.8910921"},
      {id:8,name:"Lavanderia LAVILAGOS",region:"Ferradura",address:"Av. José Bento Ribeiro Dantas, 1195 – Ferradura, Armação dos Búzios - RJ",coords:"-22.7625969,-41.8964253"},
      {id:9,name:"Aroma",region:"Village",address:"Rua Quinze, 379-221 – Village de Búzios, Armação dos Búzios - RJ",coords:"-22.7533440,-41.8780750"},
      {id:10,name:"Hibiscus Beach",region:"Village",address:"Rua 01, 22 – Village de Búzios, Armação dos Búzios - RJ",coords:"-22.7442026,-41.8758089"},
      {id:11,name:"Condomínio Praia Brava",region:"Village",address:"Rua Dezessete, 2-60 – Village de Búzios - RJ",coords:"-22.7570727,-41.8766645"},
      {id:12,name:"Vale das Emas",region:"Village",address:"Rua Miguelote Viana – Village de Búzios, Armação dos Búzios - RJ",coords:"-22.7485933,-41.8805990"},
      {id:13,name:"Mainá",region:"Village",address:"Travessa Vilage, 36 – Village de Búzios - RJ",coords:"-22.7474848,-41.8793541"},
      {id:14,name:"Azeda",region:"Azeda / Ossos",address:"Código Plus: 743C+MM6 – Armação dos Búzios - RJ",coords:"-22.7458674,-41.8783928"}
    ];

let activeSet =
  new Set(JSON.parse(localStorage.getItem('rota_ativos')) || []);

let routeOrder =
  JSON.parse(localStorage.getItem('rota_ordem')) || [];

let routeReport =
  JSON.parse(localStorage.getItem('rota_relatorio')) || [];

let currentIndex =
  parseInt(localStorage.getItem('rota_index')) || 0;

let sortableInstance = null;

const saveState = () => {

  localStorage.setItem(
    'rota_ativos',
    JSON.stringify([...activeSet])
  );

  localStorage.setItem(
    'rota_ordem',
    JSON.stringify(routeOrder)
  );

  localStorage.setItem(
    'rota_relatorio',
    JSON.stringify(routeReport)
  );

  localStorage.setItem(
    'rota_index',
    currentIndex.toString()
  );
};

const showScreen = (id) => {

  [
    screenSelect,
    screenRoute,
    screenMode
  ].forEach(el => el.classList.add('hidden'));

  document
    .getElementById(id)
    .classList
    .remove('hidden');
};

const screenSelect =
  document.getElementById('screen-select');

const screenRoute =
  document.getElementById('screen-route');

const screenMode =
  document.getElementById('screen-mode');

function renderSelection(){

  const list =
    document.getElementById('hotelList');

  list.innerHTML = '';

  HOTELS.forEach(h => {

    const div =
      document.createElement('div');

    div.className = 'item';

    div.innerHTML = `

      <div class="info">

        <div class="name">
          ${h.name}
        </div>

        <div class="addr">
          ${h.address}
        </div>

      </div>

      <label class="switch">

        <input
          type="checkbox"
          data-id="${h.id}"
          ${activeSet.has(h.id) ? 'checked' : ''}
        >

        <span class="slider"></span>

      </label>
    `;

    list.appendChild(div);
  });

  list.querySelectorAll('input').forEach(cb => {

    cb.addEventListener('change', e => {

      const id =
        Number(e.target.dataset.id);

      if(e.target.checked){
        activeSet.add(id);
      }else{
        activeSet.delete(id);
      }

      saveState();
    });
  });
}

document
  .getElementById('btn-generate')
  .addEventListener('click', () => {

    if(activeSet.size === 0){
      alert('Selecione ao menos um hotel.');
      return;
    }

    if(routeOrder.length === 0){

      routeOrder = [...activeSet];

    }else{

      const existing =
        routeOrder.filter(id => activeSet.has(id));

      const newOnes =
        [...activeSet].filter(id => !existing.includes(id));

      routeOrder = [...existing, ...newOnes];
    }

    saveState();

    renderRoute();

    showScreen('screen-route');
});

function renderRoute(){

  const list =
    document.getElementById('routeList');

  list.innerHTML = '';

  routeOrder.forEach((id, idx) => {

    const h =
      HOTELS.find(x => x.id === id);

    if(!h) return;

    const div =
      document.createElement('div');

    div.className = 'route-item';

    div.dataset.id = id;

    div.innerHTML = `

      <div style="display:flex;align-items:center;">

        <div class="drag-handle">
          <i data-lucide="grip-vertical"></i>
        </div>

        <div>

          <strong>
            ${idx + 1}. ${h.name}
          </strong>

          <div class="muted">
            ${h.address}
          </div>

        </div>

      </div>

      <button
        class="icon-btn remove-btn"
        data-id="${id}"
      >
        <i data-lucide="x"></i>
      </button>
    `;

    list.appendChild(div);
  });

  lucide.createIcons();

  if(sortableInstance){
    sortableInstance.destroy();
  }

  sortableInstance =
    new Sortable(list, {

      handle:'.drag-handle',

      animation:150,

      onEnd:() => {

        routeOrder =
          Array
            .from(list.children)
            .map(el => Number(el.dataset.id));

        saveState();

        renderRoute();
      }
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {

    btn.addEventListener('click', e => {

      const id =
        Number(e.currentTarget.dataset.id);

      activeSet.delete(id);

      routeOrder =
        routeOrder.filter(x => x !== id);

      saveState();

      renderSelection();

      renderRoute();
    });
  });

  document
    .getElementById('activeCount')
    .innerText = `${routeOrder.length} paradas`;
}

document
  .getElementById('btn-google')
  .addEventListener('click', () => {

    const validHotels = routeOrder
      .map(id => HOTELS.find(h => h.id === id))
      .filter(h => h && h.coords);

    if(validHotels.length === 0){
      alert('Nenhuma coordenada válida.');
      return;
    }

    const coords =
      validHotels.map(h => h.coords);

    const origin = coords[0];

    const destination =
      coords[coords.length - 1];

    const waypoints =
      coords.slice(1, coords.length - 1).join('|');

    const url =
      `https://www.google.com/maps/dir/?api=1`
      + `&origin=${origin}`
      + `&destination=${destination}`
      + `${waypoints ? '&waypoints=' + waypoints : ''}`
      + `&travelmode=driving`;

    window.open(url, '_blank');
});

document
  .getElementById('btn-start-route')
  .addEventListener('click', () => {

    if(routeReport.length !== routeOrder.length){

      routeReport =
        routeOrder.map(id => ({
          id,
          time:null,
          entrega:false,
          coleta:false
        }));

      currentIndex = 0;

      saveState();
    }

    updateModeUI();

    showScreen('screen-mode');
});

function updateModeUI(){

  const currentEl =
    document.getElementById('currentHotel');

  if(currentIndex >= routeOrder.length){

    currentEl.innerHTML = `

      <div style="text-align:center;">

        <i
          data-lucide="flag"
          style="width:48px;height:48px;"
        ></i>

        <h2>Viagem Finalizada!</h2>

      </div>
    `;

    document
      .getElementById('btn-next')
      .disabled = true;

  }else{

    const h =
      HOTELS.find(x => x.id === routeOrder[currentIndex]);

    currentEl.innerHTML = `

      <div style="opacity:.8;margin-bottom:4px;">
        Parada ${currentIndex + 1}
      </div>

      <h2 style="margin:0;">
        ${h.name}
      </h2>

      <div style="margin-top:4px;">
        ${h.address}
      </div>
    `;

    document.getElementById('chk-entrega').checked = false;

    document.getElementById('chk-coleta').checked = false;
  }

  lucide.createIcons();

  renderReportMode();
}

document
  .getElementById('btn-next')
  .addEventListener('click', () => {

    const entry =
      routeReport[currentIndex];

    entry.time =
      new Date().toISOString();

    entry.entrega =
      document.getElementById('chk-entrega').checked;

    entry.coleta =
      document.getElementById('chk-coleta').checked;

    currentIndex++;

    saveState();

    updateModeUI();
});

function renderReportMode(){

  const reportDiv =
    document.getElementById('reportMode');

  reportDiv.innerHTML = '';

  routeReport.forEach((r, idx) => {

    if(!r.time) return;

    const h =
      HOTELS.find(x => x.id === r.id);

    if(!h) return;

    const timeStr =
      new Date(r.time).toLocaleTimeString([],{
        hour:'2-digit',
        minute:'2-digit'
      });

    let tags = [];

    if(r.entrega) tags.push('Entrega');

    if(r.coleta) tags.push('Coleta');

    reportDiv.innerHTML += `

      <div class="report-row">

        <div>

          <strong>
            ${idx + 1}. ${h.name}
          </strong>

          <div class="muted">
            ${tags.join(' • ') || 'Sem serviço'}
          </div>

        </div>

        <div class="report-time">
          ${timeStr}
        </div>

      </div>
    `;
  });
}

document
  .getElementById('btn-pdf')
  .addEventListener('click', () => {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text('Relatório de Rota', 14, 20);

    let y = 35;

    routeReport.forEach((r, idx) => {

      if(!r.time) return;

      const h =
        HOTELS.find(x => x.id === r.id);

      if(!h) return;

      const hora =
        new Date(r.time).toLocaleTimeString([],{
          hour:'2-digit',
          minute:'2-digit'
        });

      let servicos = [];

      if(r.entrega) servicos.push('Entrega');

      if(r.coleta) servicos.push('Coleta');

      if(servicos.length === 0){
        servicos.push('Sem serviço');
      }

      doc.text(
        `${idx + 1}. ${h.name}`,
        14,
        y
      );

      y += 6;

      doc.text(
        `Horário: ${hora}`,
        20,
        y
      );

      y += 6;

      doc.text(
        `Serviços: ${servicos.join(', ')}`,
        20,
        y
      );

      y += 12;

      if(y > 270){
        doc.addPage();
        y = 20;
      }
    });

    doc.save('rota-buzios.pdf');
});

document
  .getElementById('btn-back')
  .addEventListener('click', () => {
    showScreen('screen-select');
});

document
  .getElementById('btn-reset')
  .addEventListener('click', () => {

    if(confirm('Apagar tudo?')){

      [
        'rota_ativos',
        'rota_ordem',
        'rota_relatorio',
        'rota_index'
      ].forEach(k => localStorage.removeItem(k));

      activeSet.clear();

      routeOrder = [];

      routeReport = [];

      currentIndex = 0;

      renderSelection();
    }
});

document
  .getElementById('btn-finish')
  .addEventListener('click', () => {

    alert('Rota finalizada.');

    showScreen('screen-select');
});

renderSelection();

if(
  routeOrder.length > 0 &&
  currentIndex < routeOrder.length
){
  showScreen('screen-mode');
  updateModeUI();
}

if('serviceWorker' in navigator){

  navigator
    .serviceWorker
    .register('sw.js')
    .catch(() => {});
}
