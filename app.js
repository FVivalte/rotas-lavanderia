// =========================
// ELEMENTOS
// =========================

const btnGenerate =
  document.getElementById(
    'btn-generate'
  );

const btnReset =
  document.getElementById(
    'btn-reset'
  );

const hotelList =
  document.getElementById(
    'hotelList'
  );

const photoInput =
  document.getElementById(
    'photoInput'
  );

const photoPreview =
  document.getElementById(
    'photoPreview'
  );

// =========================
// HOTEL ATUAL
// =========================

let currentRouteIndex = 0;

// =========================
// BASE64
// =========================

function fileToBase64(file){

  return new Promise((resolve, reject) => {

    const reader =
      new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {

      resolve(reader.result);
    };

    reader.onerror = reject;
  });
}

// =========================
// HOTÉIS LISTA
// =========================

function renderHotelList(){

  console.log(HOTELS);
  hotelList.innerHTML = '';

  HOTELS.forEach(h => {

    const item =
      document.createElement('div');

    item.className =
      'item';

    item.innerHTML = `

      <strong>

        ${h.name}

      </strong>

      <div>

        ${h.region}

      </div>
    `;

    hotelList.appendChild(item);
  });
}

// =========================
// FOTOS
// =========================

async function handlePhotos(){

  if(

    !routeReport[
      currentRouteIndex
    ]

  ){

    return;
  }

  const files =
    [...photoInput.files];

  photoPreview.innerHTML = '';

  const imagens = [];

  for(const file of files){

    const base64 =
      await fileToBase64(file);

    imagens.push(base64);

    const img =
      document.createElement('img');

    img.src = base64;

    img.className =
      'preview-image';

    photoPreview.appendChild(img);
  }

  routeReport[
    currentRouteIndex
  ].fotos = imagens;

  renderReportMode();
}

// =========================
// EVENTOS
// =========================

btnGenerate?.addEventListener(

  'click',

  () => {

    currentRouteIndex = 0;

    createRoute();
  }
);

btnReset?.addEventListener(

  'click',

  () => {

    clearRoute();

    routeReport = [];

    reportMode.innerHTML = '';

    photoPreview.innerHTML = '';
  }
);

photoInput?.addEventListener(

  'change',

  handlePhotos
);

// =========================
// INIT
// =========================

window.addEventListener(

  'load',

  () => {

    initMap();

    renderHotelList();

    lucide.createIcons();
  }
);