// core/state.js

export const state = {

  // ======================
  // HOTÉIS
  // ======================

  activeSet: new Set(),

  routeOrder: [],

  routeReport: [],


  // ======================
  // CONTROLE ROTA
  // ======================

  currentIndex: 0,

  arrivalConfirmed: false,


  // ======================
  // GPS / MAPA
  // ======================

  userPosition: null,

  routingControl: null,

  watchId: null,

  map: null,

  mapInitialized: false,

  voiceNavigation: false,
 
  lastInstruction: '',

  lastHeading: 0,


  // ======================
  // VOZ
  // ======================

  speechEnabled: false,


  // ======================
  // DATABASE
  // ======================

  db: null,


  // ======================
  // TELA ATUAL
  // ======================

  currentScreen: 'selection'

};
