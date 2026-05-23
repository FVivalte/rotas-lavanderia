// ======================
// ELEMENTOS GLOBAIS UI
// ======================

const screenSelect =
  document.getElementById('screen-select');

const screenRoute =
  document.getElementById('screen-route');

const screenMode =
  document.getElementById('screen-mode');

const screenReport =
  document.getElementById('screen-report');

const hotelListEl =
  document.getElementById('hotelList');

const routeListEl =
  document.getElementById('routeList');

const reportEl =
  document.getElementById('report')
  || document.createElement('div');

const reportModeEl =
  document.getElementById('reportMode');

const currentHotelEl =
  document.getElementById('currentHotel');

const nextTwoEl =
  document.getElementById('nextTwo');

const activeCountSelectEl =
  document.getElementById('activeCountSelect');

const activeCountRouteEl =
  document.getElementById('activeCountRoute');

const reportRouteList =
  document.getElementById('reportRouteList');

const reportTitle =
  document.getElementById('reportTitle');

const modal =
  document.getElementById('hotelModal');


// ======================
// BOTÕES GLOBAIS
// ======================

const btnGenerate =
  document.getElementById('btn-generate');

const btnBack =
  document.getElementById('btn-back');

const btnStartRoute =
  document.getElementById('btn-start-route');

const btnReset =
  document.getElementById('btn-reset');

const btnFinish =
  document.getElementById('btn-finish');

const btnNext =
  document.getElementById('btn-next');

const btnExport =
  document.getElementById('btn-export');

const btnExportPdf =
  document.getElementById('btnExportPdf');

const btnOpenMaps =
  document.getElementById('btn-open-maps');

const btnNewRoute =
  document.getElementById('btnNewRoute');

const btnAddHotel =
  document.getElementById('btn-add-hotel');

const btnSaveHotel =
  document.getElementById('saveHotel');

const btnCloseModal =
  document.getElementById('closeModal');


// ======================
// INPUTS
// ======================

const chkEntrega =
  document.getElementById('chk-entrega');

const chkColeta =
  document.getElementById('chk-coleta');

const deliveryPhotosInput =
  document.getElementById(
    'deliveryPhotosInput'
  );

const pickupPhotosInput =
  document.getElementById(
    'pickupPhotosInput'
  );

const deliveryPreview =
  document.getElementById(
    'deliveryPreview'
  );

const pickupPreview =
  document.getElementById(
    'pickupPreview'
  );

const voiceToggle =
  document.getElementById(
    'voiceToggle'
  );


// ======================
// HELPERS UI
// ======================

function hideAllScreens(){

  screenSelect.style.display = 'none';

  screenRoute.style.display = 'none';

  screenMode.style.display = 'none';

  screenReport.style.display = 'none';

}


function showScreen(screen){

  hideAllScreens();

  screen.style.display = 'block';

}


function updateActiveCounters(){

  const text =
    `${activeSet.size} hotéis ativos`;

  activeCountSelectEl.textContent =
    text;

  activeCountRouteEl.textContent =
    text;

}


// ======================
// MODAL
// ======================

function openHotelModal(){

  modal.classList.add('active');

}


function closeHotelModal(){

  modal.classList.remove('active');

}
