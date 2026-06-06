// ui/route.js

// ======================
// IMPORTS NECESSÁRIOS
// ======================
import { HOTELS } from '../data/dados.js';
import { state } from '../core/state.js';

// ❌ CORREÇÃO 1: Removido o 'listaRota' daqui
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
// ✅ CORREÇÃO 1: Agora esta é a única declaração de listaRota
let listaRota = null;

export function initRouteUI() {
  listaRota = document.getElementById('lista-rota');
}

export function renderizarRota() {
  if (!listaRota) {
    listaRota = document.getElementById('lista-rota');
    if (!listaRota) {
      console.error('❌ Elemento #lista-rota não encontrado!');
      return;
    }
  }

  if (typeof HOTELS === 'undefined' || typeof state === 'undefined') {
    console.error('❌ HOTELS ou state não estão definidos!');
    return;
  }

  listaRota.innerHTML = '';

  const hoteisDaRota = HOTELS.filter(h => state.routeOrder.includes(h.id));

  state.routeOrder.forEach((id, idx) => {
    const hotel = HOTELS.find(h => h.id === id);
    if (!hotel) return;

    const item = document.createElement('div');
    item.className = 'route-item';
    item.dataset.id = id;
    item.innerHTML = `
      <div>
        <strong>${idx + 1}. ${hotel.name}</strong>
        <div class="muted" style="font-size:0.85rem">
          ${hotel.address}
        </div>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <span class="drag">⋮⋮</span>
        <button class="ghost" data-id="${id}">Remover</button>
      </div>
    `;

    // REMOVER HOTEL
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
        const meio = rect.top + rect.height / 2;
        if (posicaoY < meio) other.classList.add('over');
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
        const meio = rect.top + rect.height / 2;
        if (posicaoY < meio && indiceDestino === null) {
          indiceDestino = index;
        }
      });

      if (indiceDestino === null) {
        indiceDestino = state.routeOrder.length - 1;
      }

      const indiceOrigem = state.routeOrder.indexOf(id);

      // ✅ CORREÇÃO 2: Lógica segura de índices para o splice
      if (indiceDestino !== indiceOrigem && indiceDestino !== null) {
        const hotelMovido = state.routeOrder.splice(indiceOrigem, 1)[0];
        
        // Se o item foi movido de cima para baixo, o array encolheu. Precisamos ajustar o destino.
        if (indiceDestino > indiceOrigem) {
          indiceDestino--; 
        }
        
        state.routeOrder.splice(indiceDestino, 0, hotelMovido);
      }

      itemArrastando.classList.remove('dragging-mobile');
      itemArrastando = null;
      renderizarRota();
      salvarEstadoApp?.();
    }, { passive: true });

    listaRota.appendChild(item);
  });

  // SINCRONIZAR RELATÓRIO
  if (state.routeReport) {
    state.routeReport = state.routeOrder.map(id => {
      const relatorioExistente = state.routeReport.find(r => r.id === id);
      return relatorioExistente || {
        id,
        arrival: null,
        departure: null,
        entrega: false,
        coleta: false,
        deliveryPhotos: [],
        pickupPhotos: []
      };
    });
  }

  if (typeof atualizarContadores === 'function') atualizarContadores();
  if (typeof renderizarRelatorio === 'function') renderizarRelatorio();
  salvarEstadoApp?.();

  // ======================
  // MAPA
  // ======================

  const hoteisRota = state.routeOrder
    .map(id => HOTELS.find(h => h.id === id))
    .filter(Boolean);

  // Atualiza o resumo imediatamente com o que já sabemos
  const elResumoHoteis    = document.getElementById('resumo-hoteis');
  const elResumoDistancia = document.getElementById('resumo-distancia');
  const elResumoTempo     = document.getElementById('resumo-tempo');
  if (elResumoHoteis)    elResumoHoteis.textContent    = hoteisRota.length;
  if (elResumoDistancia) elResumoDistancia.textContent = '--';
  if (elResumoTempo)     elResumoTempo.textContent     = '--';

  if (hoteisRota.length > 0) {

    // Cancela qualquer render anterior ainda pendente
    if (renderizarRota._rafId) {
      cancelAnimationFrame(renderizarRota._rafId);
    }

    // Snapshot dos hotéis neste momento — evita que um render
    // posterior sobrescreva a lista enquanto awaita o OSRM
    const snapshot = [...hoteisRota];

    renderizarRota._rafId = requestAnimationFrame(() => {
      renderizarRota._rafId = null;

      const mapa = typeof inicializarMapaRota === 'function' ? inicializarMapaRota() : null;
      if (!mapa) return;

      mapa.resize();

      const desenharNoMapa = async () => {

        // Limpa AQUI — dentro do rAF, após resize, antes de redesenhar
        // Garante que não há janela entre limpar e adicionar marcadores
        if (typeof limparMapaRota === 'function') limparMapaRota();

        // 1. Marcadores: síncronos, aparecem imediatamente
        if (typeof adicionarMarcadoresSequencia === 'function') {
          adicionarMarcadoresSequencia(snapshot);
        }
        if (typeof ajustarMapaRota === 'function') {
          ajustarMapaRota(snapshot);
        }

        // 2. Rota OSRM: async — marcadores já estão visíveis se isso falhar
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
    });
  } else {
    // Lista vazia — só limpa o mapa
    if (typeof limparMapaRota === 'function') limparMapaRota();
  }
}
