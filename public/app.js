/* Brota · landing. La configuración vive en Vercel (variables de entorno); ver README.md. */
(function(){
 var R=document.documentElement, LANGS=['es','en','pt','fr'];
 var CFG={checkout:{},forms:false,appUrl:'',contactEmail:'manyosa@limly.io'};
 fetch('/api/config').then(function(r){return r.ok?r.json():null}).then(function(c){if(c)for(var k in c)CFG[k]=c[k]}).catch(function(){});
 /* idioma */
 var lb=document.querySelectorAll('[data-set]');
 function setLang(l){R.setAttribute('data-lang',l);R.lang=l==='pt'?'pt-BR':l;lb.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.set===l)});try{localStorage.setItem('lang',l)}catch(e){};fmt()}
 /* tema */
 function curTheme(){return R.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
 try{var st=localStorage.getItem('theme');if(st)R.setAttribute('data-theme',st)}catch(e){}
 document.getElementById('theme').addEventListener('click',function(){var n=curTheme()==='dark'?'light':'dark';R.setAttribute('data-theme',n);try{localStorage.setItem('theme',n)}catch(e){}});
 /* contadores */
 var counted=false,nums=document.querySelectorAll('.count');
 function loc(){return {pt:'pt-BR',en:'en-US',fr:'fr-FR'}[R.getAttribute('data-lang')]||'es-PE'}
 function fmt(){nums.forEach(function(n){n.textContent=(+n.dataset.to).toLocaleString(loc())})}
 var red=matchMedia('(prefers-reduced-motion: reduce)').matches;
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!counted){counted=true;io.disconnect();
  if(red){fmt();return}var t0=performance.now();(function step(t){var k=Math.min(1,(t-t0)/1400),ease=1-Math.pow(1-k,3);nums.forEach(function(n){n.textContent=Math.round(+n.dataset.to*ease).toLocaleString(loc())});if(k<1)requestAnimationFrame(step)})(t0)}})},{threshold:.3});
 io.observe(document.querySelector('.bento'));
 var sv=null;try{sv=localStorage.getItem('lang')}catch(e){};var nl=(navigator.language||'es').slice(0,2);setLang(sv||(LANGS.indexOf(nl)>-1?nl:'es'));
 lb.forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.set)})});
 /* antes / después */
 var ba=document.getElementById('ba');ba.querySelector('input').addEventListener('input',function(e){ba.style.setProperty('--cut',e.target.value+'%')});
 /* mapa */
 var cts=document.querySelectorAll('.ct'),cards=document.querySelectorAll('.cc');
 function pick(id){cts.forEach(function(c){c.classList.toggle('sel',c.dataset.c===id)});cards.forEach(function(c){c.hidden=c.dataset.cc!==id})}
 cts.forEach(function(c){c.addEventListener('click',function(){pick(c.dataset.c)});c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(c.dataset.c)}})});pick('pe');
 /* paneles */
 var dr=document.getElementById('drawer'),sc=document.getElementById('scrim'),ml=document.getElementById('m-login'),mg=document.getElementById('m-legal'),panes=dr.querySelectorAll('.pane'),last=null;
 function closeAll(){[dr,sc,ml,mg].forEach(function(x){x.classList.remove('on')});if(last&&last.focus)last.focus()}
 function open(w,plan){last=document.activeElement;
  if(w==='login'||w==='registro'){
   if(CFG.appUrl){location.href=CFG.appUrl+(w==='login'?'/ingresar':'/registro'+(plan?'?plan='+plan:''));return}
   plan=plan==='gratis'?'gratis':'acceso';w='contacto'}
  closeAll();panes.forEach(function(p){p.hidden=p.dataset.pane!==w});dr.classList.add('on');sc.classList.add('on');
  if(w==='contacto'){var s=document.getElementById('f-plan');if(plan&&s.querySelector('option[value="'+plan+'"]'))s.value=plan;document.getElementById('f-name').focus()}}
 function legal(k){last=document.activeElement;closeAll();mg.querySelectorAll('.lgl').forEach(function(x){x.hidden=x.dataset.lg!==k});mg.classList.add('on');sc.classList.add('on')}
 document.addEventListener('click',function(e){var o=e.target.closest('[data-open]');if(o){e.preventDefault();open(o.dataset.open,o.dataset.plan);return}
  var l=e.target.closest('[data-legal]');if(l){e.preventDefault();legal(l.dataset.legal);return}
  if(e.target.closest('[data-close]')||e.target===sc||e.target===ml||e.target===mg){closeAll();return}
  var bb=e.target.closest('[data-buy]');if(bb){var k=bb.dataset.buy;
   if(CFG.checkout&&CFG.checkout[k]){location.href='/api/checkout?plan='+encodeURIComponent(k)+'&lang='+R.getAttribute('data-lang');return}
   open('contacto',k)}});
 document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll()});
 if(['terminos','privacidad','ia','regulacion'].indexOf(location.hash.slice(1))>-1)legal(location.hash.slice(1));
 var qp=new URLSearchParams(location.search);if(qp.get('plan'))open('contacto',qp.get('plan'));
 /* formulario */
 var f=document.getElementById('lead');
 function show(id){['ok','okm','err','nc'].forEach(function(i){var x=document.getElementById(i);if(x)x.hidden=i!==id})}
 function mailto(d){location.href='mailto:'+CFG.contactEmail+'?subject='+encodeURIComponent('Brota: '+(d.plan||'')+' / '+(d.company||d.name))+'&body='+encodeURIComponent(['name','email','company','country','plan','message'].map(function(k){return k+': '+(d[k]||'')}).join('\n'));show('okm')}
 f.addEventListener('submit',function(e){e.preventDefault();show(null);
  var d=Object.fromEntries(new FormData(f));if(!d.name||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email||'')||!f.consent.checked){show('err');return}
  delete d.consent;d.consent_at=new Date().toISOString();d.lang=R.getAttribute('data-lang');d.source='brota-landing';
  var btn=f.querySelector('button[type=submit]');btn.disabled=true;
  fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})
   .then(function(r){return r.json().catch(function(){return {}})}).then(function(j){if(j&&j.ok){show('ok');f.reset()}else mailto(d)})
   .catch(function(){mailto(d)}).then(function(){btn.disabled=false});
 });
})();
