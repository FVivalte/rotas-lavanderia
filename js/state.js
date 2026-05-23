// ======================
// ESTADO GLOBAL DO APP
// ======================

// Navegação / voz
let routingControl = null;

let speechEnabled = false;

let lastInstruction = '';


// ======================
// HOTÉIS / ROTA
// ======================

let activeSet = new Set();

let routeOrder = [];

let routeReport = [];

let currentIndex = 0;


// ======================
// GPS
// ======================

let userPosition = null;

let watchId = null;

let arrivalConfirmed = false;

let lastHeading = 0;


// ======================
// MAPA
// ======================

let map = null;

let userMarker = null;

let hotelMarker = null;

let mapInitialized = false;


// ======================
// DATABASE
// ======================

let db = null;


// ======================
// STORAGE KEYS
// ======================

const CUSTOM_HOTELS_KEY =
  'rotaBuziosCustomHotels';

const APP_STATE_KEY =
  'rotaBuziosState';
