// ui/route.js

import { HOTELS }        from '../data/dados.js';
import { state }         from '../core/state.js';
import { salvarEstadoApp }    from '../storage/storage.js';
import { renderizarSelecao, atualizarContadores } from './selection.js';
import { renderizarRelatorio } from './report.js';
import { mostrarTela }   from './screens.js';
import { telaNavegacao } from './elements.js';
import {
  inicializarMapaRota,
  adicionarMarcadoresSequencia,
  desenharRotaPlanejada,
  ajustarMapaRota,
  limparMapaRota
} from '../services/map.js';
import { obterRotaCompleta } from '../services/osrm.js';

// ─── token anti-concorrência ──────────────────────────────────────────────────
// Cada vez que atualizarMapa() é chamada, incrementa.
// O await do OSRM checa se ainda é o token mais recente antes de desenhar.
let _token = 0;

// ─── MAPA ─────────────────────────────────────────────────────────────────────
function atualizarResumo(n, dist, tempo) {
  const eh = document.getElementById('resumo-hoteis');
  const ed = document.getElementById('resumo-distancia');
  const et = document.getElementById('resumo-tempo');
  if (eh) eh.textContent = n;
  if (ed) ed.textContent = dist;
  if (et) et.textContent = tempo;
}

export async function atualizarMapa() {
  const meuToken = ++_token;

  const hoteis = state.routeOrder
    .map(id => HOTELS.find(h => h.id === id))
    .filter(Boolean);

  // Resumo imediato
  atualizarResumo(hoteis.length, '--', '--');

  const mapa = inicializarMapaRota();
  if (!mapa) return;

  // Garante que o container tem dimensões (pode estar recém-visível)
  mapa.resize();

  const desenhar = async () => {
    if (meuToken !== _token) return;   // chegou chamada mais nova, descarta

    // 1. limpa marcadores antigos e linha
    limparMapaRota();

    // 2. marcadores novos — síncronos, aparecem imediatamente
    if (hoteis.length > 0) {
      adicionarMarcadoresSequencia(hoteis);
      ajustarMapaRota(hoteis);
    }

    // 3. linha OSRM — assíncrona
    if (hoteis.length < 2) return;
    try {
      const rota = await obterRotaCompleta(hoteis);
      if (meuToken !== _token) return;   // outra chamada chegou durante o await
      if (rota) {
        desenharRotaPlanejada(rota.coordinates);
        atualizarResumo(
          hoteis.length,
          `${(rota.distance / 1000).toFixed(1)} km`,
          `${Math.round(rota.duration / 60)} min`
        );
      }
    } catch (e) {
      console.error('OSRM:', e);
    }
  };

  if (mapa.loaded()) {
    desenhar();
  } else {
    mapa.once('load', desenhar);
  }
}

// ─── ORDEM AUTO (TSP nearest-neighbor) ───────────────────────────────────────
function dist(a, b) {
  const dx = a.lat - b.lat, dy = a.lng - b.lng;
  return dx * dx + dy * dy;
}

export function ordenarAuto() {
  const hoteis = state.routeOrder
    .map(id => HOTELS.find(h => h.id === id))
    .filter(Boolean);
  if (hoteis.length < 3) return;

  const visitado = new Array(hoteis.length).fill(false);
  const ordem = [];
  let atual = 0;
  visitado[0] = true;
  ordem.push(hoteis[0]);

  for (let i = 1; i < hoteis.length; i++) {
    let melhor = -1, menorDist = Infinity;
    for (let j = 0; j < hoteis.length; j++) {
      if (visitado[j]) continue;
      const d = dist(hoteis[atual], hoteis[j]);
      if (d < menorDist) { menorDist = d; melhor = j; }
    }
    visitado[melhor] = true;
    ordem.push(hoteis[melhor]);
    atual = melhor;
  }

  state.routeOrder = ordem.map(h => h.id);
  renderizarRota();
  salvarEstadoApp();
}

// ─── LISTA ────────────────────────────────────────────────────────────────────
export function renderizarRota() {
  const lista = document.getElementById('lista-rota');
  if (!lista) return;

  lista.innerHTML = '';

  state.routeOrder.forEach((id, idx) => {
    const hotel = HOTELS.find(h => h.id === id);
    if (!hotel) return;

    const item = document.createElement('div');
    item.className = 'r2-item';
    item.dataset.id = id;
    item.innerHTML = `
      <div class="r2-item-info">
        <div class="r2-item-nome">${idx + 1}. ${hotel.name}</div>
        <div class="r2-item-end">${hotel.address}</div>
      </div>
      <div class="r2-item-acoes">
        <span class="r2-drag" title="Mover">⋮⋮⋮</span>
        <button class="ghost r2-btn-nav" data-nav="${id}">Navegar</button>
        <button class="ghost r2-btn-rem" data-rem="${id}">Remover</button>
      </div>
    `;

    // Navegar — abre Google Maps
    item.querySelector('[data-nav]').addEventListener('click', () => {
      window.open(
        `https://www.google.com/maps?q=${hotel.lat},${hotel.lng}`,
        '_blank'
      );
    });

    // Remover
    item.querySelector('[data-rem]').addEventListener('click', () => {
      state.activeSet?.delete(id);
      state.routeOrder = state.routeOrder.filter(x => x !== id);
      renderizarSelecao();
      renderizarRota();          // reconstrói lista
      atualizarMapa();           // atualiza mapa com novo estado
      salvarEstadoApp();
    });

    // ── Drag & Drop touch ──────────────────────────────────────────────
    const handle = item.querySelector('.r2-drag');
    let arrastando = null;

    handle.addEventListener('touchstart', e => {
      e.stopPropagation();
      arrastando = item;
      item.classList.add('arrastando');
    }, { passive: true });

    handle.addEventListener('touchmove', e => {
      if (!arrastando) return;
      const y = e.touches[0].clientY;
      lista.querySelectorAll('.r2-item').forEach(el => {
        el.classList.remove('sobre');
        if (el === arrastando) return;
        const r = el.getBoundingClientRect();
        if (y > r.top && y < r.bottom) el.classList.add('sobre');
      });
    }, { passive: true });

    handle.addEventListener('touchend', e => {
      if (!arrastando) return;
      const y = e.changedTouches[0].clientY;
      const itens = [...lista.querySelectorAll('.r2-item')];
      itens.forEach(el => el.classList.remove('sobre'));

      // Determina posição de destino
      let destino = itens.length - 1;
      for (let i = 0; i < itens.length; i++) {
        const r = itens[i].getBoundingClientRect();
        if (y < r.top + r.height / 2) { destino = i; break; }
      }

      const origem = state.routeOrder.indexOf(id);
      if (destino !== origem) {
        const [movido] = state.routeOrder.splice(origem, 1);
        const idx2 = destino > origem ? destino - 1 : destino;
        state.routeOrder.splice(idx2, 0, movido);
      }

      arrastando.classList.remove('arrastando');
      arrastando = null;
      renderizarRota();          // reconstrói lista com nova ordem
      atualizarMapa();           // atualiza mapa com nova ordem
      salvarEstadoApp();
    }, { passive: true });

    lista.appendChild(item);
  });

  // Sincroniza routeReport
  state.routeReport = state.routeOrder.map(id => {
    const ex = (state.routeReport || []).find(r => r.id === id);
    return ex || {
      id, arrival: null, departure: null,
      entrega: false, coleta: false,
      deliveryPhotos: [], pickupPhotos: []
    };
  });

  atualizarContadores();
  renderizarRelatorio?.();
}
