import {

  screenSelect,
  screenRoute,
  screenMode,
  screenReport

}
from './elements.js';

const screens = [

  screenSelect,
  screenRoute,
  screenMode,
  screenReport

];

export function showScreen(screen){

  screens.forEach(el=>{
    el.classList.add('hidden');
  });

  screen.classList.remove('hidden');

  window.scrollTo(0,0);

}
