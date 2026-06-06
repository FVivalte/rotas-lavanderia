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
let listaRota = null;
let _rafId    = null;   // controle de rAF — escopo do módulo, não da função

export function initRouteUI() {
  listaRota = document.getElementById('lista-rota');
}

// ======================
// ATUALIZAR APENAS O MAPA
// Chamado após remover/reordenar sem re-renderizar a lista
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

  // Cancela rAF anterior pendente
  if (_rafId) {
    cancelAnimationFrame(_rafId);
    _rafId = null;
  }

  if (hoteisRota.length === 0) {
    if (typeof limparMapaRota === 'function') limparMapaRota();
    return;
  }

  // Snapshot imutável para este ciclo de render
  const snapshot = [...hoteisRota];

  _rafId = requestAnimationFrame(() => {
    _rafId = null;

    // Pequeno delay para garantir que display:none foi removido
    // e o browser recalculou o layout antes do resize()
    setTimeout(() => {
      const mapa = typeof inicializarMapaRota === 'function' ? inicializarMapaRota() : null;
      if (!mapa) return;

      mapa.resize();

      const desenharNoMapa = async () => {

        // Limpa marcadores e linha da rota
        if (typeof limparMapaRota === 'function') limparMapaRota();

        // 1. Marcadores: síncronos, visíveis imediatamente
        if (typeof adicionarMarcadoresSequencia === 'function') {
          adicionarMarcadoresSequencia(snapshot);
        }
        if (typeof ajustarMapaRota === 'function') {
          ajustarMapaRota(snapshot);
        }

        // 2. Linha de rota OSRM: async — marcadores já estão no mapa se falhar
        try {
          const rota = typeof obterRotaCompleta === 'function'
            ? await obterRotaCompleta(snapshot)
            : null;

          if (rota && typeof desenharRotaPlanejada === 'function') {
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
        mapa.once('load', () => desenharNoMapa());
      }
    }, 50); // 50ms garante que o layout foi recalculado após remover hidden
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

    // REMOVER — atualiza state, re-renderiza lista
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
        const rect = other.getBoundingClientRect();;
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

  // Mapa sempre atualizado no fim — um único ponto de controle
  atualizarMapaRota();
}
