// ui/screens.js

import {

  telaSelecao,
  telaRota,
  telaNavegacao,
  telaRelatorio

}
from './elements.js';

const telas = [

  telaSelecao,
  telaRota,
  telaNavegacao,
  telaRelatorio

];

import { state } from '../core/state.js';
import { salvarEstadoApp } from '../storage/storage.js';

export function mostrarTela(tela){
  if (!tela) return;

  telas.forEach(el => {
    if (el) el.classList.add('hidden');
  });

  tela.classList.remove('hidden');
  window.scrollTo(0,0);

  // Atualiza a memória com a tela atual (usando o id da div) e salva
  if (tela.id) {
    state.currentScreen = tela.id;
    salvarEstadoApp();
  }
}
