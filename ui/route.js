// ui/route.js

// ======================
// IMPORTS NECESSÁRIOS
// ======================
import { HOTELS } from '../data/dados.js';
import { state } from '../core/state.js';

import {
  contadorSelecao,
  contadorRota
} from './elements.js';

import {
  inicializarMapaRota,
  desenharRotaPlanejada,
  ajustarMapaRota,
  adicionarMarcadoresSequencia,
  atualizarMarcadoresStatus,
  limparMapaRota
} from '../services/map.js';

import { obterRotaCompleta } from '../services/osrm.js';

import { renderizarRelatorio } from './report.js';
import {
  atualizarContadores,
  renderizarSelecao
} from './selection.js';

import { salvarEstadoApp } from '../storage/storage.js';

// ======================
// VARIÁVEIS LOCAIS
// ======================
let listaRota    = null;
let _rafId       = null;  // cancela requestAnimationFrame pendente
let _timeoutId   = null;  // cancela setTimeout pendente
let _renderToken = 0;     // incrementa a cada render; invalida renders antigos

export function initRouteUI() {
  listaRota = document.getElementById('lista-rota');
}

// ======================
// ATUALIZAR APENAS O MAPA
// ======================
export function atualizarMapaRota() {

  const hoteisRota = state.routeOrder
    .map(id => HOTELS.find(h => h.id === id))
    .filter(Boolean);

  const elResumoHoteis    = document.getElementById('resumo-hoteis');
  const elResumoDistancia = document.getElementById('resumo-distancia');
  const elResumoTempo     = document.getElementById('resumo-tempo');
  if (elResumoHoteis)    elResumoHoteis.textContent    = hoteisRota.length;
  if (elResumoDistancia) elResumoDistancia.textContent = '--';
  if (elResumoTempo)     elResumoTempo.textContent     = '--';

  // Cancela qualquer render anterior que ainda não executou
  if (_rafId)     { cancelAnimationFrame(_rafId); _rafId = null; }
  if (_timeoutId) { clearTimeout(_timeoutId);     _timeoutId = null; }

  // Incrementa o token — renders iniciados antes deste ponto são inválidos
  const meuToken = ++_renderToken;

  if (hoteisRota.length === 0) {
    limparMapaRota();
    return;
  }

  // Snapshot imutável para este ciclo
  const snapshot = [...hoteisRota];

  _rafId = requestAnimationFrame(() => {
    _rafId = null;

    // 50ms: garante que o browser recalculou o layout após remover .hidden
    _timeoutId = setTimeout(() => {
      _timeoutId = null;

      // Se uma chamada mais nova chegou enquanto esperávamos, descarta este render
      if (meuToken !== _renderToken) return;

      const mapa = inicializarMapaRota();
      if (!mapa) return;

      mapa.resize();

      const desenharNoMapa = async () => {
        // Verifica token novamente antes de tocar no DOM do mapa
        if (meuToken !== _renderToken) return;

        // Limpa marcadores e linha antiga
        limparMapaRota();

        // 1. Marcadores numerados — síncronos, visíveis imediatamente
        adicionarMarcadoresSequencia(snapshot);
        ajustarMapaRota(snapshot);

        // 2. Linha OSRM — assíncrona
        try {
          const rota = await obterRotaCompleta(snapshot);

          // Verifica token após await — pode ter chegado nova rota durante a requisição
          if (meuToken !== _renderToken) return;

          if (rota) {
            desenharRotaPlanejada(rota.coordinates);
            if (elResumoDistancia) elResumoDistancia.textContent = `${(rota.distance / 1000).toFixed(1)} km`;
            if (elResumoTempo)     elResumoTempo.textContent     = `${Math.round(rota.duration / 60)} min`;
          }
        } catch (err) {
          console.error('Erro ao obter rota OSRM:', err);
        }
      };

      if (mapa.loaded()) {
        desenharNoMapa();
      } else {
        mapa.once('load', () => {
          if (meuToken !== _renderToken) return;
          desenharNoMapa();
        });
      }
    }, 50);
  });
}

// ======================
// RENDERIZAR LISTA + MAPA
// ======================
export function renderizarRota() {
  if (!listaRota) {
    listaRota = document.getElementById('lista-rota');
    if (!listaRota) return;
  }

  listaRota.innerHTML = '';

  state.routeOrder.forEach((id, idx) => {
    const hotel = HOTELS.find(h => h.id === id);
    if (!hotel) return;

    const item = document.createElement('div');
    item.className = 'route-item';
    item.dataset.id = id;
    item.innerHTML = `
      <div>
        <strong>${idx + 1}. ${hotel.name}</strong>
        <div class="muted" style="font-size:0.85rem">${hotel.address}</div>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <span class="drag">⋮⋮</span>
        <button class="ghost" data-id="${id}">Remover</button>
      </div>
    `;

    // REMOVER
    item.querySelector('button').addEventListener('click', () => {
      state.activeSet?.delete(id);
      state.routeOrder = state.routeOrder.filter(x => x !== id);
      if (typeof renderizarSelecao === 'function') renderizarSelecao();
      renderizarRota();
      salvarEstadoApp?.();
    });

    // ======================
    // DRAG AND DROP
    // ======================
    const dragHandle = item.querySelector('.drag');
    let itemArrastando = null;

    dragHandle.addEventListener('touchstart', () => {
      itemArrastando = item;
      item.classList.add('dragging-mobile');
    }, { passive: true });

    dragHandle.addEventListener('touchmove', e => {
      if (!itemArrastando) return;
      const posicaoY = e.touches[0].clientY;
      const items = [...listaRota.querySelectorAll('.route-item')];
      items.forEach(other => {
        other.classList.remove('over');
        if (other === itemArrastando) return;
        const rect = other.getBoundingClientRect();
        if (posicaoY < rect.top + rect.height / 2) other.classList.add('over');
      });
    }, { passive: true });

    dragHandle.addEventListener('touchend', e => {
      if (!itemArrastando) return;

      const posicaoY = e.changedTouches[0].clientY;
      const items = [...listaRota.querySelectorAll('.route-item')];
      let indiceDestino = null;

      items.forEach((other, index) => {
        other.classList.remove('over');
        if (other === itemArrastando) return;
        const rect = other.getBoundingClientRect();
        if (posicaoY < rect.top + rect.height / 2 && indiceDestino === null) {
          indiceDestino = index;
        }
      });

      if (indiceDestino === null) {
        indiceDestino = state.routeOrder.length - 1;
      }

      const indiceOrigem = state.routeOrder.indexOf(id);

      if (indiceDestino !== indiceOrigem) {
        const hotelMovido = state.routeOrder.splice(indiceOrigem, 1)[0];
        if (indiceDestino > indiceOrigem) indiceDestino--;
        state.routeOrder.splice(indiceDestino, 0, hotelMovido);
      }

      itemArrastando.classList.remove('dragging-mobile');
      itemArrastando = null;
      renderizarRota();
      salvarEstadoApp?.();
    }, { passive: true });

    listaRota.appendChild(item);
  });

  // Sincroniza relatório
  if (state.routeReport) {
    state.routeReport = state.routeOrder.map(id => {
      const existente = state.routeReport.find(r => r.id === id);
      return existente || {
        id, arrival: null, departure: null,
        entrega: false, coleta: false,
        deliveryPhotos: [], pickupPhotos: []
      };
    });
  }

  if (typeof atualizarContadores === 'function') atualizarContadores();
  if (typeof renderizarRelatorio === 'function') renderizarRelatorio();
  salvarEstadoApp?.();

  // Mapa — único ponto de controle
  atualizarMapaRota();
}
