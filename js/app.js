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
