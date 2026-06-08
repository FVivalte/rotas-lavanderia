import { state } from '../core/state.js';

export function obterPrimeiraInstrucao(
  rota
){

  if(
    !rota ||
    !rota.legs?.length
  ){
    return null;
  }

  const step =
    rota.legs[0]
    ?.steps?.[0];

  if(!step){
    return null;
  }

  return traduzirInstrucao(
    step
  );

}

export function traduzirInstrucao(
  step
){

  const type =
    step.maneuver?.type;

  const modifier =
    step.maneuver?.modifier;

  if(type === 'turn'){

    if(
      modifier === 'right'
    ){
      return 'Vire à direita';
    }

    if(
      modifier === 'left'
    ){
      return 'Vire à esquerda';
    }

  }

  if(
    type === 'roundabout'
  ){
    return 'Entre na rotatória';
  }

  if(
    type === 'arrive'
  ){
    return 'Destino à frente';
  }

  return 'Continue em frente';

}