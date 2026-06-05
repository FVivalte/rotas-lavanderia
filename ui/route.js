// ui/route.js

// ======================
// IMPORTS NECESSÁRIOS
// ======================
import {
  limparMapaRota,
  inicializarMapaRota,
  adicionarMarcadoresSequencia,
  desenharRotaPlanejada,
  ajustarMapaRota,
  obterRotaCompleta
} from '../services/map.js';

// Se atualizarContadores e renderizarRelatorio estiverem em outro arquivo:
import { atualizarContadores, renderizarRelatorio } from './report.js';   // ← Ajuste o caminho se necessário
// import { renderizarSelecao } from './selection.js'; // se precisar

export function renderizarRota() {
  if (!listaRota) {
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
      state.activeSet.delete(id);
      state.routeOrder = state.routeOrder.filter(x => x !== id);
      renderizarSelecao();        // se der erro, comente esta linha temporariamente
      renderizarRota();
      salvarEstadoApp();
    });

    // DRAG AND DROP MOBILE (mantido igual)
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

      if (indiceDestino === null) indiceDestino = state.routeOrder.length - 1;

      const indiceOrigem = state.routeOrder.indexOf(id);
      if (indiceDestino !== null && indiceDestino !== indiceOrigem) {
        state.routeOrder.splice(indiceDestino, 0, state.routeOrder.splice(indiceOrigem, 1)[0]);
      }

      itemArrastando.classList.remove('dragging-mobile');
      itemArrastando = null;
      renderizarRota();
      salvarEstadoApp();
    }, { passive: true });

    listaRota.appendChild(item);
  });

  // ======================
  // SINCRONIZAR RELATÓRIO
  // ======================
  state.routeReport = state.routeOrder.map(id => {
    const relatorioExistente = state.routeReport.find(r => r.id === id);
    if (relatorioExistente) {
      return relatorioExistente;
    } else {
      return {
        id,
        arrival: null,
        departure: null,
        entrega: false,
        coleta: false,
        deliveryPhotos: [],
        pickupPhotos: []
      };
    }
  });

  // ======================
  // CHAMADAS DE ATUALIZAÇÃO
  // ======================
  if (typeof atualizarContadores === 'function') atualizarContadores();
  if (typeof renderizarRelatorio === 'function') renderizarRelatorio();
  
  salvarEstadoApp();

  // ======================
  // ATUALIZAÇÃO DO MAPA
  // ======================
  limparMapaRota();

  const hoteisRota = state.routeOrder
    .map(id => HOTELS.find(h => h.id === id))
    .filter(Boolean);

  if (hoteisRota.length > 0) {
    setTimeout(() => {
      const mapa = inicializarMapaRota();
      if (!mapa) return;

      mapa.resize();

      const desenharMapa = async () => {
        console.log('🎯 HOTÉIS NA ROTA:', hoteisRota);

        const rota = await obterRotaCompleta(hoteisRota);

        if (rota) {
          desenharRotaPlanejada(rota.coordinates);

          const resumoHoteis = document.getElementById('resumo-hoteis');
          const resumoDistancia = document.getElementById('resumo-distancia');
          const resumoTempo = document.getElementById('resumo-tempo');

          if (resumoHoteis) resumoHoteis.textContent = hoteisRota.length;
          if (resumoDistancia) resumoDistancia.textContent = `${(rota.distance / 1000).toFixed(1)} km`;
          if (resumoTempo) resumoTempo.textContent = `${Math.round(rota.duration / 60)} min`;
        }

        adicionarMarcadoresSequencia(hoteisRota);
        ajustarMapaRota(hoteisRota);
      };

      if (mapa.loaded()) {
        desenharMapa();
      } else {
        mapa.once('load', desenharMapa);
      }
    }, 200);
  }
}
