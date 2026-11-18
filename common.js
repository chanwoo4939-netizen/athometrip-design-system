// reveal
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('[data-r]').forEach(el=>io.observe(el));

// top button on scroll
window.addEventListener('scroll',()=>{
  document.getElementById('topBtn')?.classList.toggle('show',scrollY>400);
},{passive:true});
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');

// top button
document.getElementById('topBtn').addEventListener('click',()=>window.scrollTo({top:0,behavior:reduceMotion.matches?'auto':'smooth'}));

// copy helper
const toast=document.getElementById('copyToast');
toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
// 복사 가능한 요소를 키보드로도 쓸 수 있게: 포커스 + Enter/Space
function makeCopyable(el,label,role){
  el.tabIndex=0;el.dataset.copy='';
  if(role!==false)el.setAttribute('role','button');
  el.setAttribute('aria-label',label+' 복사');
  el.addEventListener('keydown',e=>{
    if(e.target!==el)return;
    if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}
  });
}
const txt=(el,sel)=>el.querySelector(sel)?.textContent?.trim()||'';
document.querySelectorAll('.sw[data-hex]').forEach(el=>makeCopyable(el,(txt(el,'b')+' '+el.dataset.hex).trim()));
document.querySelectorAll('.sem[data-hex]').forEach(el=>makeCopyable(el,txt(el,'b')+' '+el.dataset.hex));
document.querySelectorAll('.tt tbody tr').forEach(el=>makeCopyable(el,txt(el,'td')+' '+txt(el,'.spec'),false));
document.querySelectorAll('.sp-item').forEach(el=>makeCopyable(el,'간격 '+txt(el,'.sp-label')+'px'));
document.querySelectorAll('.r-card').forEach(el=>makeCopyable(el,'radius '+txt(el,'span')+' '+txt(el,'code')));
document.querySelectorAll('.ic[data-icon]').forEach(el=>makeCopyable(el,el.dataset.icon+' 아이콘 SVG'));
// 모바일 nav: 현재 페이지 링크가 보이도록
document.querySelector('.nav-links a.on')?.scrollIntoView({block:'nearest',inline:'center'});
let toastTimer;
function showCopyToast(hex){
  toast.textContent=hex+' 복사됨';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove('show'),1500);
}
// swatch click → copy
document.querySelectorAll('.sw[data-hex]').forEach(sw=>{
  sw.addEventListener('click',()=>{
    navigator.clipboard.writeText(sw.dataset.hex).then(()=>showCopyToast(sw.dataset.hex));
  });
});
// semantic card click → copy
document.querySelectorAll('.sem[data-hex]').forEach(sem=>{
  sem.addEventListener('click',()=>{
    navigator.clipboard.writeText(sem.dataset.hex).then(()=>showCopyToast(sem.dataset.hex));
  });
});

// type row click → copy CSS shorthand
document.querySelectorAll('.tt tbody tr').forEach(tr=>{
  tr.addEventListener('click',()=>{
    const spec=tr.querySelector('.spec')?.textContent?.trim();
    if(spec){navigator.clipboard.writeText(spec).then(()=>showCopyToast(spec))}
  });
});

// spacing click → copy px value
document.querySelectorAll('.sp-item').forEach(sp=>{
  sp.style.cursor='pointer';
  sp.addEventListener('click',()=>{
    const v=sp.querySelector('.sp-label')?.textContent?.trim()+'px';
    navigator.clipboard.writeText(v).then(()=>showCopyToast(v));
  });
});

// radius click → copy
document.querySelectorAll('.r-card').forEach(r=>{
  r.style.cursor='pointer';
  r.addEventListener('click',()=>{
    const v=r.querySelector('code')?.textContent?.trim();
    if(v){navigator.clipboard.writeText(v).then(()=>showCopyToast(v))}
  });
});

// icon: add copy icon to each card
const copySvg='<svg aria-hidden="true" class="ic-copy" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="8" height="8" rx="1.5"/><path d="M3 11V3h8"/></svg>';
document.querySelectorAll('.ic[data-icon]').forEach(ic=>{ic.insertAdjacentHTML('beforeend',copySvg)});

// icon click → copy SVG code
document.querySelectorAll('.ic[data-icon]').forEach(ic=>{
  ic.addEventListener('click',()=>{
    const name=ic.dataset.icon;
    const svg=ic.querySelector('svg');
    if(svg){
      const out=svg.cloneNode(true);out.removeAttribute('aria-hidden');
      navigator.clipboard.writeText(out.outerHTML).then(()=>showCopyToast(name+' SVG 복사됨'));
    }
  });
});
// 접힌 섹션으로 가는 링크를 누르면 펼침
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{
  const d=document.querySelector(a.getAttribute('href')+' details.doc-fold');if(d)d.open=true;
}));

// 문서 글 줄바꿈: 문장이 여럿인 글은 문장 단위로 묶어, 줄이 넘칠 때 문장 중간이 아니라 문장 사이에서 끊기게 함
(function sentenceWrap(){
  const skip='.cc-preview,.cc-stage,.cd-fig,.ov-thumb,.ov-text,.anno-layer,pre,code,table,nav,footer,.hero-card';
  document.querySelectorAll('p,li,dd').forEach(el=>{
    if(el.closest(skip)||el.querySelector('p,li,ul,ol,div,br,table,.sn'))return;
    if(!/[.?!]\s+\S/.test(el.textContent.trim()))return;
    const parts=[[]];
    [...el.childNodes].forEach(n=>{
      if(n.nodeType!==3){parts[parts.length-1].push(n);return}
      const segs=n.textContent.split(/(?<=[.?!])\s+/); // 글자 노드가 '. '로 끝나도 다음 노드부터 새 문장
      segs.forEach((s,i)=>{if(i>0)parts.push([]);if(s)parts[parts.length-1].push(document.createTextNode(s))});
    });
    while(parts.length&&!parts[parts.length-1].length)parts.pop();
    if(parts.length<2)return;
    el.textContent='';
    parts.forEach((nodes,i)=>{if(!nodes.length)return;const sp=document.createElement('span');sp.className='sn';nodes.forEach(n=>sp.appendChild(n));if(i>0)el.appendChild(document.createTextNode(' '));el.appendChild(sp)});
  });
})();
