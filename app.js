// =========================
// INIT
// =========================

lucide.createIcons();

// =========================
// ELEMENTOS
// =========================

const screenSelect =
  document.getElementById('screen-select');

const screenRoute =
  document.getElementById('screen-route');

const screenMode =
  document.getElementById('screen-mode');

const hotelList =
  document.getElementById('hotelList');

const routeList =
  document.getElementById('routeList');

const reportMode =
  document.getElementById('reportMode');

const photoInput =
  document.getElementById('photoInput');

const photoPreview =
  document.getElementById('photoPreview');

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
// TROCA TELA
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
// RENDER HOTÉIS
// =========================

function renderSelection(filter = ''){

  hotelList.innerHTML = '';

  const termo =
    filter.toLowerCase();

  HOTELS
    .filter(h => {

      return (
        h.name
          .toLowerCase()
          .includes(termo)

        ||

        h.region
          .toLowerCase()
          .includes(termo)
      );
    })

    .forEach(h => {

      const div =
        document.createElement('div');

      div.className = 'item';

      div.innerHTML = `

        <div class="info">

          <div class="name">

            ${h.name}

          </div>

          <div class="addr">

            ${h.region}
            •
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

      hotelList.appendChild(div);
    });

  hotelList
    .querySelectorAll('input')
    .forEach(cb => {

      cb.addEventListener('change', e => {

        const id =
          Number(
            e.target.dataset.id
          );

        if(e.target.checked){

          activeSet.add(id);

        }else{

          activeSet.delete(id);
        }

        saveState();
      });
    });

  lucide.createIcons();
}

// =========================
// BUSCA
// =========================

document
  .getElementById('searchHotel')
  ?.addEventListener('input', e => {

    renderSelection(
      e.target.value
    );
  });

// =========================
// ADD HOTEL
// =========================

document
  .getElementById('btn-add-hotel')
  ?.addEventListener('click', () => {

    const name =
      prompt('Nome do hotel');

    if(!name) return;

    const region =
      prompt('Região');

    if(!region) return;

    const address =
      prompt('Endereço');

    if(!address) return;

    const coords =
      prompt(
        'Coordenadas GPS\nEx:\n-22.000,-41.000'
      );

    adicionarHotel({

      name,
      region,
      address,
      coords
    });

    renderSelection();
  });

// =========================
// EDIT HOTEL
// =========================

document
  .getElementById('btn-edit-hotel')
  ?.addEventListener('click', () => {

    const id =
      Number(
        prompt(
          'ID do hotel para editar'
        )
      );

    if(!id) return;

    const hotel =
      HOTELS.find(
        h => h.id === id
      );

    if(!hotel){

      alert('Hotel não encontrado');

      return;
    }

    const name =
      prompt(
        'Nome',
        hotel.name
      );

    const region =
      prompt(
        'Região',
        hotel.region
      );

    const address =
      prompt(
        'Endereço',
        hotel.address
      );

    const coords =
      prompt(
        'Coordenadas',
        hotel.coords
      );

    editarHotel(id, {

      name,
      region,
      address,
      coords
    });

    renderSelection();
  });

// =========================
// REMOVER HOTEL
// =========================

document
  .getElementById('btn-remove-hotel')
  ?.addEventListener('click', () => {

    const id =
      Number(
        prompt(
          'ID do hotel para remover'
        )
      );

    if(!id) return;

    const confirmar =
      confirm(
        'Remover hotel?'
      );

    if(!confirmar) return;

    removerHotel(id);

    activeSet.delete(id);

    renderSelection();

    saveState();
  });

// =========================
// GERAR ROTA
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
// RENDER ROTA
// =========================

function renderRoute(){

  routeList.innerHTML = '';

  routeOrder.forEach((id, idx) => {

    const h =
      HOTELS.find(
        x => x.id === id
      );

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

            ${idx + 1}.
            ${h.name}

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

    routeList.appendChild(div);
  });

  lucide.createIcons();

  if(sortableInstance){

    sortableInstance.destroy();
  }

  sortableInstance =
    new Sortable(routeList, {

      handle:'.drag-handle',

      animation:150,

      onEnd:() => {

        routeOrder =
          Array
            .from(routeList.children)
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

        routeOrder =
          routeOrder.filter(
            x => x !== id
          );

        activeSet.delete(id);

        saveState();

        renderRoute();

        renderSelection();
      });
    });

  document
    .getElementById('activeCount')
    .innerText =
      `${routeOrder.length} paradas`;
}

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
      routeOrder.map(id => {

        return HOTELS
          .find(h => h.id === id)
          .coords;
      });

    const origin =
      coords[0];

    const destination =
      coords[
        coords.length - 1
      ];

    const waypoints =
      coords
        .slice(1, coords.length - 1)
        .join('|');

    const url =

      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? '&waypoints=' + waypoints : ''}&travelmode=driving`;

    window.open(url, '_blank');
  });

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

        if(!currentEntry){

          return;
        }

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
// UI VIAGEM
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

      <div style="opacity:.8;">

        Parada
        ${currentIndex + 1}
        de
        ${routeOrder.length}

      </div>

      <h2 style="margin:8px 0;">

        ${h.name}

      </h2>

      <div>

        ${h.address}

      </div>

      <div class="gps-badge">

        GPS ativo

      </div>
    `;
  }

  lucide.createIcons();

  renderReportMode();
}

// =========================
// FOTO
// =========================

photoInput
  ?.addEventListener(
    'change',
    e => {

      const files =
        Array.from(
          e.target.files
        );

      currentPhotos = [];

      photoPreview.innerHTML = '';

      files.forEach(file => {

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

          photoPreview.appendChild(img);
        };

        reader.readAsDataURL(file);
      });
    }
  );

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

    entry.fotos =
      [...currentPhotos];

    currentIndex++;

    currentPhotos = [];

    photoPreview.innerHTML = '';

    photoInput.value = '';

    saveState();

    updateModeUI();
  });

// =========================
// RELATÓRIO
// =========================

function renderReportMode(){

  reportMode.innerHTML = '';

  routeReport.forEach((r, idx) => {

    if(!r.chegada){

      return;
    }

    const h =
      HOTELS.find(
        x => x.id === r.id
      );

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

    reportMode.innerHTML += `

      <div class="report-row">

        <strong>

          ${idx + 1}.
          ${h.name}

        </strong>

        <div class="muted">

          ${tags.join(' • ') || 'Sem serviço'}

        </div>

        <div
          class="muted"
          style="margin-top:4px;"
        >

          Chegada:
          ${chegada}

          •

          Saída:
          ${saida}

        </div>

        <div
          class="muted"
          style="margin-top:4px;"
        >

          Fotos:
          ${r.fotos.length}

        </div>

      </div>
    `;
  });
}

// =========================
// PDF
// =========================

document
  .getElementById('btn-pdf')
  ?.addEventListener('click', () => {

    const { jsPDF } =
      window.jspdf;

    const doc =
      new jsPDF();

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

    routeReport.forEach((r, idx) => {

      if(!r.chegada){

        return;
      }

      const h =
        HOTELS.find(
          x => x.id === r.id
        );

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

        `${idx + 1}. ${h.name}`,

        14,

        y
      );

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

      doc.setFontSize(10);

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

      doc.text(

        `Serviços: ${servicos.join(', ') || 'Sem serviço'}`,

        16,

        y
      );

      y += 14;

      if(y > 250){

        doc.addPage();

        y = 20;
      }
    });

    doc.save(
      'rota-buzios.pdf'
    );
  });

// =========================
// VOLTAR
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
        'Apagar tudo?'
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
      'Rota finalizada.'
    );

    showScreen('screen-select');
  });

// =========================
// BOOT
// =========================

renderSelection();

if(

  routeOrder.length > 0

  &&

  currentIndex < routeOrder.length

  &&

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

lucide.createIcons();