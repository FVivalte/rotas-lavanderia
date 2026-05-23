// ======================
// INIT APP
// ======================

initDatabase()
.then(()=>{

  loadCustomHotels();

  restoreAppState();

  renderSelection();

})
.catch(err=>{

  console.error(
    'Erro iniciando banco',
    err
  );

});

// ======================
// SERVICE WORKER
// ======================

if('serviceWorker' in navigator){

  navigator.serviceWorker
    .register('sw.js')
    .catch(err=>{

      console.log(
        'Erro SW',
        err
      );

    });

}

// ======================
// BOTÕES TELA 1
// ======================

document
.getElementById('btn-generate')
.addEventListener(
  'click',
  generateRoute
);

document
.getElementById('btn-reset')
.addEventListener('click', ()=>{

  if(confirm('Limpar seleção?')){

    stopGpsTracking();

    activeSet.clear();

    routeOrder = [];

    routeReport = [];

    currentIndex = 0;

    renderSelection();

    renderRoute();

    reportEl.innerHTML = '';

    reportModeEl.innerHTML = '';

    saveAppState();

  }

});

// ======================
// MODAL HOTEL
// ======================

document
.getElementById('btn-add-hotel')
.addEventListener('click', ()=>{

  modal.classList.add('active');

});

document
.getElementById('closeModal')
.addEventListener('click', ()=>{

  modal.classList.remove('active');

});

document
.getElementById('saveHotel')
.addEventListener('click', ()=>{

  const name =
    document.getElementById('newName').value;

  const region =
    document.getElementById('newRegion').value;

  const address =
    document.getElementById('newAddress').value;

  const coords =
    document.getElementById('newCoords').value;

  const parsedCoords =
    parseCoords(coords);

  if(
    !name ||
    !address ||
    !parsedCoords
  ){

    alert(
      'Preencha nome, endereço e coordenadas válidas.'
    );

    return;

  }

  HOTELS.push({

    id: Date.now(),

    name,

    region,

    address,

    coords,

    custom: true

  });

  saveCustomHotels();

  renderSelection();

  modal.classList.remove('active');

});

// ======================
// TELA 2
// ======================

document
.getElementById('btn-back')
.addEventListener('click', ()=>{

  stopGpsTracking();

  screenSelect.style.display = 'block';

  screenRoute.style.display = 'none';

  screenMode.style.display = 'none';

});

document
.getElementById('btn-start-route')
.addEventListener(
  'click',
  startModeRoute
);

document
.getElementById('btn-export')
.addEventListener('click', ()=>{

  const data = {

    generatedAt:
      new Date().toISOString(),

    route: routeOrder,

    report: routeReport

  };

  const blob = new Blob(
    [JSON.stringify(data,null,2)],
    {
      type:'application/json'
    }
  );

  const a =
    document.createElement('a');

  a.href =
    URL.createObjectURL(blob);

  a.download =
    'relatorio_rota.json';

  a.click();

  URL.revokeObjectURL(a.href);

});

// ======================
// MODO NAVEGAÇÃO
// ======================

document
.getElementById('btn-next')
.addEventListener('click', ()=>{

  if(currentIndex >= routeOrder.length)
    return;

  const entrega =
    document
    .getElementById('chk-entrega')
    .checked;

  const coleta =
    document
    .getElementById('chk-coleta')
    .checked;

  const now = new Date();

  const entry =
    routeReport[currentIndex];

  if(!entry.arrival){

    entry.arrival =
      now.toISOString();

  }

  entry.entrega = entrega;

  entry.coleta = coleta;

  entry.departure =
    new Date().toISOString();

  arrivalConfirmed = false;

  currentIndex++;

  if(currentIndex >= routeOrder.length){

    document
      .getElementById('btn-finish')
      .click();

    return;

  }

  updateModeUI();

  renderPhotoPreviews();

  updateMap();

  renderReportMode();

  saveAppState();

});

document
.getElementById('btn-finish')
.addEventListener('click', ()=>{

  stopGpsTracking();

  const finalData =
    routeReport.map(r=>{

      const hotel =
        HOTELS.find(
          h => h.id === r.id
        );

      return {

        name: hotel.name,

        arrival: r.arrival
          ? new Date(r.arrival)
            .toLocaleTimeString(
              'pt-BR',
              {
                hour:'2-digit',
                minute:'2-digit'
              }
            )
          : '--:--',

        departure: r.departure
          ? new Date(r.departure)
            .toLocaleTimeString(
              'pt-BR',
              {
                hour:'2-digit',
                minute:'2-digit'
              }
            )
          : '--:--',

        deliveryPhotos:
          r.deliveryPhotos || [],

        pickupPhotos:
          r.pickupPhotos || []

      };

    });

  openReportScreen(finalData);

});

document
.getElementById('btn-open-maps')
.addEventListener('click', ()=>{

  if(currentIndex >= routeOrder.length)
    return;

  const id =
    routeOrder[currentIndex];

  const hotel =
    HOTELS.find(h => h.id === id);

  window.open(
    `https://www.google.com/maps?q=${hotel.coords}`,
    '_blank'
  );

});

// ======================
// VOZ
// ======================

const voiceToggle =
  document.getElementById(
    'voiceToggle'
  );

voiceToggle.addEventListener(
  'click',
  ()=>{

    speechEnabled =
      !speechEnabled;

    if(speechEnabled){

      voiceToggle.classList.remove(
        'off'
      );

      voiceToggle.classList.add(
        'on'
      );

      voiceToggle.textContent =
        '🔊 Voz ligada';

    }else{

      voiceToggle.classList.remove(
        'on'
      );

      voiceToggle.classList.add(
        'off'
      );

      voiceToggle.textContent =
        '🔇 Voz desligada';

      speechSynthesis.cancel();

    }

  }
);

// ======================
// RELATÓRIO FINAL
// ======================

document
.getElementById('btnExportPdf')
.addEventListener(
  'click',
  exportPdfReport
);

document
.getElementById('btnNewRoute')
.addEventListener('click', ()=>{

  stopGpsTracking();

  activeSet.clear();

  routeOrder = [];

  routeReport = [];

  currentIndex = 0;

  hideAllScreens();

  screenSelect.style.display =
    'block';

  renderSelection();

});
