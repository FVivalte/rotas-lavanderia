// =========================
// ELEMENTOS
// =========================

const btnCreate =
  document.getElementById(
    'btn-create'
  );

const btnClear =
  document.getElementById(
    'btn-clear'
  );

const btnFocus =
  document.getElementById(
    'btn-focus'
  );

// =========================
// EVENTOS
// =========================

// CRIAR ROTA
btnCreate?.addEventListener(

  'click',

  () => {

    createRoute();
  }
);

// LIMPAR ROTA
btnClear?.addEventListener(

  'click',

  () => {

    clearRoute();

    if(

      typeof renderReportMode
      === 'function'

    ){

      reportMode.innerHTML = '';
    }
  }
);

// CENTRALIZAR MAPA
btnFocus?.addEventListener(

  'click',

  () => {

    focusMap();
  }
);

// =========================
// INICIAR APP
// =========================

window.addEventListener(

  'load',

  () => {

    initMap();

    if(

      typeof lucide !==
      'undefined'

    ){

      lucide.createIcons();
    }
  }
);