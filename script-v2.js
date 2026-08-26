/* =========================================================
   V2 presentation controller
   Natural document scrolling + CSS snap. No wheel hijacking and no
   scrollIntoView, so the browser keeps a continuous, predictable rhythm.
   ========================================================= */

const slides=[...document.querySelectorAll('.slide-stop')];
const rail=document.getElementById('slideRail');
let activeIndex=0;
let pendingIndex=null;
let pendingTimer=null;

const chapters=[
  {label:'个人背景',target:'profile',chapters:['intro']},
  {label:'工作全景',target:'overview',chapters:['overview']},
  {label:'卡片项目',target:'card-context',chapters:['cards']},
  {label:'分身广场',target:'plaza-data',chapters:['plaza']},
  {label:'其他工作',target:'other-work',chapters:['close'],onlyBefore:'growth'},
  {label:'成长',target:'growth',chapters:['close'],only:'growth'}
];

function chapterIsActive(item,slide){
  if(item.only)return slide.id===item.only;
  if(item.onlyBefore)return item.chapters.includes(slide.dataset.chapter)&&slide.id!==item.onlyBefore;
  return item.chapters.includes(slide.dataset.chapter);
}

function buildChrome(){
  const total=String(slides.length).padStart(2,'0');
  slides.forEach((stop,index)=>{
    const slide=stop.querySelector('.slide');
    const nav=chapters.map(item=>`<button type="button" data-target="${item.target}">${item.label}</button>`).join('');
    slide.insertAdjacentHTML('afterbegin',`
      <header class="slide-chrome" aria-label="本页导航">
        <div class="slide-chrome-brand">
          <img src="assets/logos/qwen.svg" alt="千问">
          <strong><b>QWEN</b> / REVIEW</strong>
          <span class="slide-chrome-title">${stop.dataset.title||'实习转正答辩'}</span>
        </div>
        <nav class="slide-chrome-nav" aria-label="章节导航">${nav}</nav>
        <span class="slide-chrome-page">${String(index+1).padStart(2,'0')} <i>/ ${total}</i></span>
      </header>`);
  });
}

function goTo(index,behavior='smooth'){
  const next=Math.max(0,Math.min(slides.length-1,index));
  pendingIndex=next;
  clearTimeout(pendingTimer);
  pendingTimer=setTimeout(()=>{pendingIndex=null},1400);
  window.scrollTo({top:slides[next].offsetTop,left:0,behavior});
  setActive(next);
}

function setActive(index){
  if(index<0||index>=slides.length)return;
  activeIndex=index;
  const slide=slides[index];
  document.querySelectorAll('.slide-chrome-nav button').forEach(button=>{
    const item=chapters.find(chapter=>chapter.target===button.dataset.target);
    button.classList.toggle('active',Boolean(item&&chapterIsActive(item,slide)));
  });
  [...rail.children].forEach((button,i)=>button.classList.toggle('active',i===index));
  document.title=`${String(index+1).padStart(2,'0')}｜${slide.dataset.title||'实习转正答辩'}｜千问开放平台`;
  history.replaceState(null,'',`#${slide.id}`);
}

buildChrome();

slides.forEach((slide,index)=>{
  const button=document.createElement('button');
  button.type='button';
  button.setAttribute('aria-label',`${String(index+1).padStart(2,'0')} ${slide.dataset.title||''}`);
  button.addEventListener('click',()=>goTo(index));
  rail.appendChild(button);
});

document.addEventListener('click',event=>{
  const button=event.target.closest('.slide-chrome-nav button');
  if(!button)return;
  const index=slides.findIndex(slide=>slide.id===button.dataset.target);
  if(index>=0)goTo(index);
});

const observer=new IntersectionObserver(entries=>{
  if(pendingIndex!==null){
    const targetEntry=entries.find(entry=>entry.target===slides[pendingIndex]);
    if(targetEntry?.isIntersecting&&targetEntry.intersectionRatio>=.48){
      const arrived=pendingIndex;
      pendingIndex=null;
      clearTimeout(pendingTimer);
      setActive(arrived);
    }
    return;
  }
  const candidate=entries
    .filter(entry=>entry.isIntersecting)
    .sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if(candidate&&candidate.intersectionRatio>=.48)setActive(slides.indexOf(candidate.target));
},{threshold:[.25,.48,.7]});
slides.forEach(slide=>observer.observe(slide));

document.addEventListener('keydown',event=>{
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  const forward=['ArrowDown','ArrowRight','PageDown',' '];
  const backward=['ArrowUp','ArrowLeft','PageUp'];
  if(forward.includes(event.key)){event.preventDefault();goTo(activeIndex+1)}
  else if(backward.includes(event.key)){event.preventDefault();goTo(activeIndex-1)}
  else if(event.key==='Home'){event.preventDefault();goTo(0)}
  else if(event.key==='End'){event.preventDefault();goTo(slides.length-1)}
  else if(event.key.toLowerCase()==='n')document.body.classList.toggle('notes-visible');
  else if(event.key.toLowerCase()==='f'){
    if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }
});

window.addEventListener('hashchange',()=>{
  const index=slides.findIndex(slide=>`#${slide.id}`===location.hash);
  if(index>=0&&index!==activeIndex)goTo(index,'auto');
});

const initial=Math.max(0,slides.findIndex(slide=>`#${slide.id}`===location.hash));
setActive(initial);
if(initial)requestAnimationFrame(()=>goTo(initial,'auto'));
