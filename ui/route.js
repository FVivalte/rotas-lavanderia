// ui/route.js

import { HOTELS }             from '../data/dados.js';
import { state }              from '../core/state.js';
import { salvarEstadoApp }    from '../storage/storage.js';
import { renderizarSelecao, atualizarContadores } from './selection.js';
import { renderizarRelatorio } from './report.js';
import {
  adicionarMarcadoresSequencia,
  desenharRotaPlanejada,
  ajustarMapaRota,
  limparMapaRota,
  inicializarMapaRota
} from '../services/map.js';
import { obterRotaCompleta }  from '../services/osrm.js';

// ─── token anti-concorrência ─────────────────────────────────────────────────
let _token = 0;

// ─── helpers de resumo ───────────────────────────────────────────────────────
function setResumo(n, dist, tempo) {
  const eh = document.getElementById('resumo-hoteis');
  const ed = document.getElementById('resumo-distancia');
  const et = document.getElementById('resumo-tempo');
  if (eh) eh.textContent = n    ?? '--';
  if (ed) ed.textContent = dist ?? '--';
  if (et) et.textContent = tempo ?? '--';
}

// ─── MAPA ────────────────────────────────────────────────────────────────────
// Regra única: espera o mapa estar loaded, depois faz resize num rAF
// para garantir dimensões reais do container antes de adicionar markers.
function mapaPromise() {
  return new Promise((resolve, reject) => {
    const mapa = inicializarMapaRota();
    if (!mapa) { reject(new Error('sem container #mapa-rota')); return; }

    const onReady = () => {
      requestAnimationFrame(() => {
        mapa.resize();
        resolve(mapa);
      });
    };

    mapa.loaded() ? onReady() : mapa.once('load', onReady);
  });
}

export async function atualizarMapa() {
  const token = ++_token;

  const hoteis = state.routeOrder
    .map(id => HOTELS.find(h => h.id === id))
    .filter(Boolean);

  setResumo(hoteis.length, '--', '--');
  if (hoteis.length === 0) { limparMapaRota(); return; }

  let mapa;
  try   { mapa = await mapaPromise(); }
  catch (e) { console.error(e); return; }
  if (token !== _token) return;

  // --- passo 1: limpa tudo de forma síncrona ---
  limparMapaRota();

  // --- passo 2: marcadores (síncronos — aparecem antes do OSRM) ---
  adicionarMarcadoresSequencia(hoteis);
  ajustarMapaRota(hoteis);

  // --- passo 3: linha OSRM (assíncrona) ---
  if (hoteis.length < 2) return;
  try {
    const rota = await obterRotaCompleta(hoteis);
    if (token !== _token) return;          // render mais novo chegou durante await
    if (!rota) return;
    desenharRotaPlanejada(rota.coordinates);
    setResumo(
      hoteis.length,
      `${(rota.distance / 1000).toFixed(1)} km`,
      `${Math.round(rota.duration / 60)} min`
    );
  } catch (e) { console.error('OSRM:', e); }
}

// ─── ORDEM AUTO ──────────────────────────────────────────────────────────────
export function ordenarAuto() {
  const hoteis = state.routeOrder
    .map(id => HOTELS.find(h => h.id === id))
    .filter(Boolean);
  if (hoteis.length < 3) return;

  const visitado = new Array(hoteis.length).fill(false);
  const ordem = [];
  let cur = 0;
  visitado[0] = true;
  ordem.push(hoteis[0]);

  for (let i = 1; i < hoteis.length; i++) {
    let best = -1, bestD = Infinity;
    for (let j = 0; j < hoteis.length; j++) {
      if (visitado[j]) continue;
      const dx = hoteis[cur].lat - hoteis[j].lat;
      const dy = hoteis[cur].lng - hoteis[j].lng;
      const d  = dx*dx + dy*dy;
      if (d < bestD) { bestD = d; best = j; }
    }
    visitado[best] = true;
    ordem.push(hoteis[best]);
    cur = best;
  }

  state.routeOrder = ordem.map(h => h.id);
  // reconstrói lista + mapa
  renderizarRota();
  atualizarMapa();
  salvarEstadoApp();
}

// ─── LISTA ───────────────────────────────────────────────────────────────────
// renderizarRota() NUNCA chama atualizarMapa() internamente.
// Quem chama renderizarRota() é responsável por chamar atualizarMapa() depois.
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

    // Navegar
    item.querySelector('[data-nav]').addEventListener('click', () => {
      window.open(`https://www.google.com/maps?q=${hotel.lat},${hotel.lng}`, '_blank');
    });

    // Remover — atualiza state e re-renderiza; NÃO chama atualizarMapa aqui
    item.querySelector('[data-rem]').addEventListener('click', () => {
      state.activeSet?.delete(id);
      state.routeOrder = state.routeOrder.filter(x => x !== id);
      renderizarSelecao();
      renderizarRota();
      atualizarMapa();     // única chamada ao mapa, fora do loop de render
      salvarEstadoApp();
    });

    // ── Drag & Drop touch ────────────────────────────────────────────────
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
      const y        = e.changedTouches[0].clientY;
      const itens    = [...lista.querySelectorAll('.r2-item')];
      itens.forEach(el => el.classList.remove('sobre'));

      let destino = itens.length - 1;
      for (let i = 0; i < itens.length; i++) {
        const r = itens[i].getBoundingClientRect();
        if (y < r.top + r.height / 2) { destino = i; break; }
      }

      const origem = state.routeOrder.indexOf(id);
      if (destino !== origem) {
        const [movido] = state.routeOrder.splice(origem, 1);
        state.routeOrder.splice(destino > origem ? destino - 1 : destino, 0, movido);
      }

      arrastando.classList.remove('arrastando');
      arrastando = null;
      renderizarRota();
      atualizarMapa();     // única chamada ao mapa, fora do loop de render
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
  // ← SEM atualizarMapa() aqui. Quem chama renderizarRota() decide.
}
