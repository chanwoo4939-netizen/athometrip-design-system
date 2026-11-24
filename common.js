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

// 문서 끝: 이전·다음 컴포넌트(컴포넌트 하나를 열었을 때만). 마지막 수정 날짜는 푸터에 표시. set(prev,next,date)로 내용을 바꿈
window.dsDocEnd=(function(){
  const host=document.querySelector('.comp-list'); // 컴포넌트 문서 안에서만 씀
  if(!host)return null;
  const ARROW='<svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.5 4.5 6 9l4.5 4.5"/></svg>';
  const el=document.createElement('div');el.className='doc-end';el.setAttribute('role','navigation');el.setAttribute('aria-label','문서 이동');host.appendChild(el);
  const link=(o,cls,label)=>o?'<a class="'+cls+'" href="'+o.href+'">'+(cls==='de-next'?ARROW.replace('M10.5 4.5 6 9l4.5 4.5','M7.5 4.5 12 9l-4.5 4.5'):ARROW)+'<span><small>'+label+'</small><b>'+o.name+'</b></span></a>':'';
  function set(prev,next,date){
    el.innerHTML=link(prev,'de-prev','이전')+link(next,'de-next','다음');el.hidden=!prev&&!next;
    const by=document.querySelector('.ft-by');if(by&&date)by.innerHTML='Last updated <time datetime="'+date.replace(/\./g,'-')+'">'+date+'</time>';
  }
  const links=[...document.querySelectorAll('.nav-links a')],i=links.findIndex(a=>a.classList.contains('on'));
  const at=k=>links[k]?{href:links[k].getAttribute('href'),name:links[k].textContent.trim()}:null;
  const page={prev:i>0?at(i-1):null,next:i>=0?at(i+1):null,date:document.querySelector('meta[name="ds-updated"]')?.content||''};
  set(null,null,page.date);
  return {set,page};
})();

// 왼쪽 목록(PC): 더 내려갈 내용이 있는 쪽을 흐리게 표시하고, 지금 문서가 목록 안에 보이게 맞춤
(function(){
  const sb=document.querySelector('.comp-sidebar');if(!sb)return;
  const wide=matchMedia('(min-width:901px)');
  // 페이지 맨 위에서는 목록이 화면 아래로 넘어가 끝까지 못 내리던 것을 막음: 보이는 높이에 맞춤
  function fit(){
    if(!wide.matches){sb.style.maxHeight='';return}
    sb.style.maxHeight=Math.max(200,innerHeight-Math.max(sb.getBoundingClientRect().top,68)-16)+'px';
  }
  function edges(){
    fit();
    sb.classList.toggle('more-up',wide.matches&&sb.scrollTop>4);
    sb.classList.toggle('more-down',wide.matches&&sb.scrollTop+sb.clientHeight<sb.scrollHeight-4);
    // 모바일 가로 탭: 넘친 쪽만 흐리게
    sb.classList.toggle('more-left',!wide.matches&&sb.scrollLeft>4);
    sb.classList.toggle('more-right',!wide.matches&&sb.scrollLeft+sb.clientWidth<sb.scrollWidth-4);
  }
  function reveal(){
    const a=sb.querySelector('a.on');if(!a||!wide.matches){edges();return}
    const top=a.getBoundingClientRect().top-sb.getBoundingClientRect().top+sb.scrollTop,pad=72;
    if(top<sb.scrollTop+pad)sb.scrollTop=Math.max(0,top-pad);
    else if(top+a.offsetHeight>sb.scrollTop+sb.clientHeight-pad)sb.scrollTop=top+a.offsetHeight-sb.clientHeight+pad;
    edges();
  }
  sb.addEventListener('scroll',edges,{passive:true});
  addEventListener('resize',edges);
  addEventListener('scroll',edges,{passive:true});
  addEventListener('hashchange',()=>requestAnimationFrame(reveal));
  requestAnimationFrame(reveal);addEventListener('load',reveal);
  window.dsSidebarReveal=reveal;
})();
