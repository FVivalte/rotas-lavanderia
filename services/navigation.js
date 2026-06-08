export function obterInstrucoes(
  rota
){

  if(
    !rota ||
    !rota.routes?.[0]
  ){
    return [];
  }

  return rota
    .routes[0]
    .legs[0]
    .steps;

}

export function traduzirInstrucao(
  step
){

  const type =
    step.maneuver.type;

  const modifier =
    step.maneuver.modifier;

  if(
    type === 'turn'
  ){

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