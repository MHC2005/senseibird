export function speak(text:string, lang='ja-JP'){
  try{
    const synth = window.speechSynthesis;
    if(!synth) return false;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const vs = synth.getVoices();
    const jp = vs.find(v => (v.lang || '').toLowerCase().startsWith('ja'));
    if(jp) u.voice = jp;
    synth.speak(u);
    return true;
  }catch(e){ return false; }
}
