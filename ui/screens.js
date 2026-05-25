import {

  telaSelecao,
  telaRota,
  telaNavegacao,
  telaRelatorio

}
from './elements.js';

const screens = [

  telaSelecao,
  telaRota,
  telaNavegacao,
  telaRelatorio

];

export function showScreen(screen){

  screens.forEach(el=>{
    el.classList.add('hidden');
  });

  screen.classList.remove('hidden');

  window.scrollTo(0,0);

}
