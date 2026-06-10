// ui/mode.js

import {
  inicializarMapa,
  updateMap,
  mapas,
  adicionarMarcadoresHoteis
} from '../services/map.js';

import { configurarListenersCamera } from '../services/map-camera.js';

import { HOTELS } from '../data/dados.js';
import { state }  from '../core/state.js';

import {
  telaNavegacao,
  hotelAtual,
  proximosHoteis,
  toggleVoz,
  checkEntrega,
  checkColeta,
  btnProximo,
  previewEntrega,
  previewColeta
} from './elements.js';

import {
  renderizarRelatorioModo,
  abrirTelaRelatorio
} from './report.js';

import {
  startGpsTracking,
  stopGpsTracking
} from '../services/gps.js';

import { falar }         from '../services/voice.js';
import { salvarEstadoApp } from '../storage/storage.js';

// ─── marcadores de hotel acumulados no mapa de navegação ─────────────────────
// BUG 5 CORRIGIDO: atualizarModoUI() chamava adicionarMarcadoresHoteis() sem nunca
// limpar os anteriores — a cada "próximo hotel" empilhava um marcador novo
// sem remover o do hotel anterior, lotando o mapa.
let _marcadoresNav = [];

function limparMarcadoresNav() {
  _marcadoresNav.forEach(m => { try { m.remove(); } catch(e) {} });
  _marcadoresNav = [];
}

function adicionarMarcadorHotelNav(hotel) {
  const map = mapas['mapa'];
  if (!map) return;

  // Cria marcador vermelho padrão
  const marker = new maplibregl.Marker({ color: '#e53935' })
    .setLngLat([Number(hotel.lng), Number(hotel.lat)])
    .addTo(map);

  _marcadoresNav.push(marker);
}

// ======================
// INICIAR MODO ROTA
// ======================
export function iniciarModoRota() {

  if (toggleVoz) {
    toggleVoz.checked    = false;
    state.voiceNavigation = false;
  }

  if (state.routeOrder.length === 0) {
    alert('Gere a rota primeiro.');
    return;
  }

  state.currentIndex      = 0;
  state.arrivalConfirmed  = false;
  state.cameraFollowing   = true;
  state.mapInitialized    = false;

  state.routeReport = state.routeOrder.map(id => ({
    id,
    arrival:  null,
    departure: null,
    entrega:  false,
    coleta:   false,
    deliveryPhotos: [],
    pickupPhotos:   []
  }));

  // Inicializa / redimensiona o mapa de navegação
  // BUG 6 CORRIGIDO: setTimeout de 300ms era insuficiente em alguns devices;
  // usar dois rAFs garante que o display:none foi removido e o layout recalculado
  const mapa = inicializarMapa('mapa');
  if (mapa) {
    const doResize = () => requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mapa.resize();
        configurarListenersCamera(mapa);
      });
    });
    mapa.loaded() ? doResize() : mapa.once('load', doResize);
  }

  if (
    state.userPosition &&
    typeof state.userPosition.lat === 'number' &&
    !isNaN(state.userPosition.lat)
  ) {
    updateMap(
      state.userPosition.lat,
      state.userPosition.lng,
      state.userPosition.heading || 0,
      state.userPosition.speed   || 0
    );
  }

  startGpsTracking();
  atualizarModoUI();
  renderizarRelatorioModo();
  renderizarPreviewsFotos();
  salvarEstadoApp();
}

// ======================
// UPDATE UI
// ======================
export function atualizarModoUI() {

  if (state.currentIndex >= state.routeOrder.length) {
    if (hotelAtual) {
      hotelAtual.innerHTML = '<div><strong>Rota finalizada</strong></div>';
    }
    if (proximosHoteis) proximosHoteis.innerHTML = '';
    return;
  }

  const id    = state.routeOrder[state.currentIndex];
  const hotel = HOTELS.find(h => h.id === id);

  // Centraliza no hotel se o GPS ainda não deu posição
  if (hotel && mapas['mapa'] && !state.userPosition) {
    const lat = Number(hotel.lat);
    const lng = Number(hotel.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      mapas['mapa'].flyTo({ center: [lng, lat], zoom: 16, duration: 1500 });
    }
  }

  if (!hotel) return;

  // Troca o marcador — limpa o anterior antes de adicionar o novo
  limparMarcadoresNav();
  adicionarMarcadorHotelNav(hotel);

  if (hotelAtual) {
    hotelAtual.innerHTML = `
      <div style="font-weight:700">${hotel.name}</div>
      <div class="muted">${hotel.address}</div>
    `;
  }

  renderizarProximosHoteis();

  const entry = state.routeReport[state.currentIndex];
  if (checkEntrega) checkEntrega.checked = entry?.entrega ?? false;
  if (checkColeta)  checkColeta.checked  = entry?.coleta  ?? false;

  atualizarTextoBotao();
}

// ======================
// PRÓXIMOS HOTÉIS
// ======================
function renderizarProximosHoteis() {
  if (!proximosHoteis) return;
  proximosHoteis.innerHTML = '';

  for (let i = 1; i <= 2; i++) {
    const idx = state.currentIndex + i;
    if (idx >= state.routeOrder.length) continue;

    const hotel = HOTELS.find(h => h.id === state.routeOrder[idx]);
    if (!hotel) continue;

    const div = document.createElement('div');
    div.className = 'next-card';
    div.innerHTML = `
      <strong>${hotel.name}</strong>
      <div class="muted" style="font-size:0.85rem">${hotel.address}</div>
    `;
    proximosHoteis.appendChild(div);
  }
}

// ======================
// TEXTO BOTÃO
// ======================
function atualizarTextoBotao() {
  if (!btnProximo) return;
  btnProximo.textContent =
    state.currentIndex === state.routeOrder.length - 1 ? 'Finalizar' : 'Próximo hotel';
}

// ======================
// PRÓXIMO HOTEL
// ======================
export async function proximoHotel() {

  if (state.currentIndex >= state.routeOrder.length) {
    await finalizarModoRota();
    return;
  }

  const entry = state.routeReport[state.currentIndex];
  const agora = new Date().toISOString();

  if (!entry.arrival)  entry.arrival  = agora;
  entry.departure = agora;
  entry.entrega   = checkEntrega?.checked ?? false;
  entry.coleta    = checkColeta?.checked  ?? false;

  state.arrivalConfirmed    = false;
  state.currentIndex++;
  state.currentSteps        = [];
  state.currentStepIndex    = 0;
  state.announcedStepIndex  = -1;
  state.lastInstruction     = '';

  const proximo = HOTELS.find(h => h.id === state.routeOrder[state.currentIndex]);
  if (proximo && state.voiceNavigation) {
    falar(`Próximo hotel ${proximo.name}`);
  }

  if (state.currentIndex >= state.routeOrder.length) {
    finalizarModoRota();
    return;
  }

  atualizarModoUI();
  renderizarRelatorioModo();

  if (mapas['mapa']) mapas['mapa'].resize();

  // BUG 7 CORRIGIDO: updateMap() era chamado sem argumentos — usava undefined,
  // o que movia o marcador para [0,0] (Oceano Atlântico)
  if (state.userPosition) {
    updateMap(
      state.userPosition.lat,
      state.userPosition.lng,
      state.userPosition.heading || 0,
      state.userPosition.speed   || 0
    );
  }

  renderizarPreviewsFotos();
  salvarEstadoApp();
}

// ======================
// FINALIZAR
// ======================
export async function finalizarModoRota() {
  console.log('FINALIZAR MODO ROTA');
  stopGpsTracking();
  limparMarcadoresNav();
  atualizarModoUI();
  renderizarRelatorioModo();
  salvarEstadoApp();
  await abrirTelaRelatorio(state.routeReport);
}

// ======================
// FOTO PREVIEW
// ======================
function renderizarPreviewsFotos() {
  if (previewEntrega) previewEntrega.innerHTML = '';
  if (previewColeta)  previewColeta.innerHTML  = '';
}
