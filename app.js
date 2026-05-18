// =========================
// INICIALIZAÇÃO
// =========================

lucide.createIcons();

// =========================
// HOTÉIS
// =========================

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

// =========================
// ESTADO
// =========================

let activeSet =
  new Set(
    JSON.parse(
      localStorage.getItem('rota_ativos')
    ) || []
  );

let routeOrder =
  JSON.parse(
    localStorage.getItem('rota_ordem')
  ) || [];

let routeReport =
  JSON.parse(
    localStorage.getItem('rota_relatorio')
  ) || [];

let currentIndex =
  parseInt(
    localStorage.getItem('rota_index')
  ) || 0;

let sortableInstance = null;

let currentPhotos = [];

let gpsWatchId = null;

// =========================
// TELAS
// =========================

const screenSelect =
  document.getElementById('screen-select');

const screenRoute =
  document.getElementById('screen-route');

const screenMode =
  document.getElementById('screen-mode');

// =========================
// ELEMENTOS
// =========================

const photoInput =
  document.getElementById('photoInput');

// =========================
// SAVE
// =========================

function saveState(){

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
}

// =========================
// TROCAR TELA
// =========================

function showScreen(id){

  [
    screenSelect,
    screenRoute,
    screenMode
  ].forEach(el => {
    el.classList.add('hidden');
  });

  document
    .getElementById(id)
    .classList
    .remove('hidden');
}

// =========================
// TELA SELEÇÃO
// =========================

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
          ${h.region} • ${h.address}
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

  list
    .querySelectorAll('input')
    .forEach(cb => {

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

// =========================
// RENDER ROTA
// =========================

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
            .map(el =>
              Number(el.dataset.id)
            );

        saveState();

        renderRoute();
      }
    });

  document
    .querySelectorAll('.remove-btn')
    .forEach(btn => {

      btn.addEventListener('click', e => {

        const id =
          Number(
            e.currentTarget.dataset.id
          );

        activeSet.delete(id);

        routeOrder =
          routeOrder.filter(x => x !== id);

        saveState();

        renderSelection();

        renderRoute();
      });
    });

  document.getElementById(
    'activeCount'
  ).innerText =
    `${routeOrder.length} paradas`;
}

// =========================
// GPS
// =========================

function iniciarGPS(){

  if(!navigator.geolocation){
    return;
  }

  if(gpsWatchId){

    navigator
      .geolocation
      .clearWatch(gpsWatchId);
  }

  gpsWatchId =
    navigator.geolocation.watchPosition(

      pos => {

        const currentEntry =
          routeReport[currentIndex];

        if(!currentEntry) return;

        if(!currentEntry.chegada){

          currentEntry.chegada =
            new Date().toISOString();

          currentEntry.gps = {

            latitude:
              pos.coords.latitude,

            longitude:
              pos.coords.longitude
          };

          saveState();

          renderReportMode();
        }
      },

      err => {
        console.log(err);
      },

      {
        enableHighAccuracy:true,
        maximumAge:1000,
        timeout:10000
      }
    );
}

// =========================
// MODO VIAGEM
// =========================

function updateModeUI(){

  const currentEl =
    document.getElementById(
      'currentHotel'
    );

  if(currentIndex >= routeOrder.length){

    currentEl.innerHTML = `

      <div style="text-align:center;">

        <i
          data-lucide="flag"
          style="width:48px;height:48px;"
        ></i>

        <h2>
          Viagem Finalizada!
        </h2>

      </div>
    `;

    document
      .getElementById('btn-next')
      .disabled = true;

  }else{

    const h =
      HOTELS.find(
        x => x.id === routeOrder[currentIndex]
      );

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

      <div class="gps-badge">
        GPS ativo
      </div>
    `;

    document.getElementById(
      'chk-entrega'
    ).checked = false;

    document.getElementById(
      'chk-coleta'
    ).checked = false;
  }

  lucide.createIcons();

  renderReportMode();
}

// =========================
// RELATÓRIO
// =========================

function renderReportMode(){

  const reportDiv =
    document.getElementById('reportMode');

  reportDiv.innerHTML = '';

  routeReport.forEach((r, idx) => {

    if(!r.chegada) return;

    const h =
      HOTELS.find(x => x.id === r.id);

    if(!h) return;

    const chegada =
      new Date(r.chegada)
        .toLocaleTimeString([], {
          hour:'2-digit',
          minute:'2-digit'
        });

    const saida =
      r.saida
      ? new Date(r.saida)
          .toLocaleTimeString([], {
            hour:'2-digit',
            minute:'2-digit'
          })
      : '--:--';

    let tags = [];

    if(r.entrega){
      tags.push('Entrega');
    }

    if(r.coleta){
      tags.push('Coleta');
    }

    reportDiv.innerHTML += `

      <div class="report-row">

        <div>

          <strong>
            ${idx + 1}. ${h.name}
          </strong>

          <div class="muted">
            ${tags.join(' • ') || 'Sem serviço'}
          </div>

          <div
            class="muted"
            style="margin-top:4px;font-size:.75rem;"
          >
            Chegada: ${chegada}
            •
            Saída: ${saida}
          </div>

          <div
            class="muted"
            style="font-size:.75rem;"
          >
            ${r.fotos.length} foto(s)
          </div>

        </div>

      </div>
    `;
  });
}

// =========================
// FOTOS
// =========================

photoInput?.addEventListener(
  'change',
  async e => {

    const files =
      Array.from(e.target.files);

    currentPhotos = [];

    const preview =
      document.getElementById(
        'photoPreview'
      );

    preview.innerHTML = '';

    for(const file of files){

      const reader =
        new FileReader();

      reader.onload = ev => {

        currentPhotos.push(
          ev.target.result
        );

        const img =
          document.createElement('img');

        img.src =
          ev.target.result;

        preview.appendChild(img);
      };

      reader.readAsDataURL(file);
    }
  }
);

// =========================
// CRIAR ROTA
// =========================

document
  .getElementById('btn-generate')
  ?.addEventListener('click', () => {

    if(activeSet.size === 0){

      alert(
        'Selecione ao menos um hotel.'
      );

      return;
    }

    routeOrder = [...activeSet];

    saveState();

    renderRoute();

    showScreen('screen-route');
  });

// =========================
// INICIAR VIAGEM
// =========================

document
  .getElementById('btn-start-route')
  ?.addEventListener('click', () => {

    if(
      routeReport.length !==
      routeOrder.length
    ){

      routeReport =
        routeOrder.map(id => ({

          id,

          chegada:null,

          saida:null,

          entrega:false,

          coleta:false,

          fotos:[],

          gps:null
        }));

      currentIndex = 0;

      saveState();
    }

    iniciarGPS();

    updateModeUI();

    showScreen('screen-mode');
  });

// =========================
// PRÓXIMO
// =========================

document
  .getElementById('btn-next')
  ?.addEventListener('click', () => {

    const entry =
      routeReport[currentIndex];

    entry.saida =
      new Date().toISOString();

    entry.entrega =
      document.getElementById(
        'chk-entrega'
      ).checked;

    entry.coleta =
      document.getElementById(
        'chk-coleta'
      ).checked;

    entry.fotos = [...currentPhotos];

    currentIndex++;

    currentPhotos = [];

    if(photoInput){

      photoInput.value = '';
    }

    const preview =
      document.getElementById(
        'photoPreview'
      );

    if(preview){

      preview.innerHTML = '';
    }

    saveState();

    updateModeUI();
  });

// =========================
// GOOGLE MAPS
// =========================

document
  .getElementById('btn-google')
  ?.addEventListener('click', () => {

    if(routeOrder.length === 0){
      return;
    }

    const coords =
      routeOrder.map(id =>
        HOTELS
          .find(h => h.id === id)
          .coords
      );

    const origin = coords[0];

    const destination =
      coords[coords.length - 1];

    const waypoints =
      coords
        .slice(1, coords.length - 1)
        .join('|');

    const url =

      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? '&waypoints=' + waypoints : ''}&travelmode=driving`;

    window.open(url, '_blank');
  });

// =========================
// PDF
// =========================

document
  .getElementById('btn-pdf')
  ?.addEventListener('click', async () => {

    const { jsPDF } =
      window.jspdf;

    const doc =
      new jsPDF();

    doc.setFont('helvetica');

    doc.setFontSize(22);

    doc.text(
      'RELATÓRIO DE ROTA',
      105,
      20,
      { align:'center' }
    );

    doc.setFontSize(11);

    doc.text(
      `Data: ${new Date().toLocaleDateString('pt-BR')}`,
      14,
      30
    );

    let y = 45;

    for(let i = 0; i < routeReport.length; i++){

      const r = routeReport[i];

      if(!r.chegada) continue;

      const h =
        HOTELS.find(x => x.id === r.id);

      if(!h) continue;

      doc.roundedRect(
        10,
        y - 6,
        190,
        36,
        4,
        4
      );

      doc.setFontSize(13);

      doc.text(
        `${i + 1}. ${h.name}`,
        14,
        y
      );

      doc.setFontSize(10);

      y += 8;

      const chegada =
        new Date(r.chegada)
          .toLocaleTimeString([], {
            hour:'2-digit',
            minute:'2-digit'
          });

      const saida =
        r.saida
        ? new Date(r.saida)
            .toLocaleTimeString([], {
              hour:'2-digit',
              minute:'2-digit'
            })
        : '--:--';

      doc.text(
        `Chegada: ${chegada}`,
        16,
        y
      );

      y += 6;

      doc.text(
        `Saída: ${saida}`,
        16,
        y
      );

      y += 6;

      let servicos = [];

      if(r.entrega){
        servicos.push('Entrega');
      }

      if(r.coleta){
        servicos.push('Coleta');
      }

      if(servicos.length === 0){
        servicos.push('Sem serviço');
      }

      doc.text(
        `Serviços: ${servicos.join(', ')}`,
        16,
        y
      );

      y += 10;

      for(const foto of r.fotos.slice(0,2)){

        try{

          doc.addImage(
            foto,
            'JPEG',
            16,
            y,
            40,
            40
          );

          y += 45;

        }catch(err){

          console.log(err);
        }
      }

      y += 10;

      if(y > 240){

        doc.addPage();

        y = 20;
      }
    }

    doc.save('rota-buzios.pdf');
  });

// =========================
// BOTÃO VOLTAR
// =========================

document
  .getElementById('btn-back')
  ?.addEventListener('click', () => {

    showScreen('screen-select');
  });

// =========================
// RESET
// =========================

document
  .getElementById('btn-reset')
  ?.addEventListener('click', () => {

    const confirmar =
      confirm(
        'Apagar tudo e recomeçar?'
      );

    if(!confirmar){
      return;
    }

    localStorage.clear();

    activeSet.clear();

    routeOrder = [];

    routeReport = [];

    currentIndex = 0;

    renderSelection();

    showScreen('screen-select');
  });

// =========================
// FINALIZAR
// =========================

document
  .getElementById('btn-finish')
  ?.addEventListener('click', () => {

    alert(
      'Relatório salvo.'
    );

    showScreen('screen-select');
  });

// =========================
// BOOT
// =========================

renderSelection();

if(
  routeOrder.length > 0 &&
  currentIndex < routeOrder.length &&
  currentIndex > 0
){

  showScreen('screen-mode');

  updateModeUI();
}

// =========================
// SERVICE WORKER
// =========================

if('serviceWorker' in navigator){

  navigator
    .serviceWorker
    .register('sw.js')
    .catch(() => {});
}