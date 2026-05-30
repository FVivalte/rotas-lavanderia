export function falar(texto){

  if(!window.speechSynthesis){
    return;
  }

  speechSynthesis.cancel();

  const msg =
    new SpeechSynthesisUtterance(
      texto
    );

  msg.lang = 'pt-BR';

  speechSynthesis.speak(msg);

}
