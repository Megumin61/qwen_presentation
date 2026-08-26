const slides=[...document.querySelectorAll('.slide-stop')];
const rail=document.getElementById('slideRail');
const current=document.getElementById('currentSlide');
const total=document.getElementById('totalSlides');
const title=document.getElementById('currentTitle');
const progress=document.getElementById('progressFill');
const chapterButtons=[...document.querySelectorAll('.chapters button')];
const notesToggle=document.getElementById('notesToggle');
const modeToggle=document.getElementById('modeToggle');
const fullscreenToggle=document.getElementById('fullscreenToggle');
let activeIndex=0;
let wheelSum=0;
let wheelTimer=0;
let locked=false;

total.textContent=String(slides.length).padStart(2,'0');

function goTo(index,behavior='smooth'){
  const next=Math.max(0,Math.min(slides.length-1,index));
  slides[next].scrollIntoView({behavior,block:'start'});
  setActive(next);
  locked=true;
  window.setTimeout(()=>locked=false,900);
}

slides.forEach((slide,index)=>{
  const button=document.createElement('button');
  button.type='button';
  button.setAttribute('aria-label',`${String(index+1).padStart(2,'0')} ${slide.dataset.title}`);
  button.addEventListener('click',()=>goTo(index));
  rail.appendChild(button);
});

function setActive(index){
  if(index<0)return;
  activeIndex=index;
  const slide=slides[index];
  current.textContent=String(index+1).padStart(2,'0');
  title.textContent=slide.dataset.title||'实习转正答辩';
  progress.style.width=`${(index+1)/slides.length*100}%`;
  [...rail.children].forEach((button,i)=>button.classList.toggle('active',i===index));
  chapterButtons.forEach(button=>button.classList.toggle('active',button.dataset.chapter===slide.dataset.chapter));
  history.replaceState(null,'',`#${slide.id}`);
}

const observer=new IntersectionObserver(entries=>{
  if(locked)return;
  const visible=entries.filter(item=>item.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if(visible&&visible.intersectionRatio>=.5)setActive(slides.indexOf(visible.target));
},{threshold:[.25,.5,.75]});
slides.forEach(slide=>observer.observe(slide));

chapterButtons.forEach(button=>button.addEventListener('click',()=>{
  const index=slides.findIndex(slide=>slide.id===button.dataset.target);
  if(index>=0)goTo(index);
}));

notesToggle.addEventListener('click',()=>{
  document.body.classList.toggle('notes-visible');
  notesToggle.textContent=document.body.classList.contains('notes-visible')?'隐藏讲稿':'讲稿';
});

modeToggle.addEventListener('click',()=>{
  document.body.classList.toggle('presentation-mode');
  document.body.classList.toggle('browse-mode');
  modeToggle.textContent=document.body.classList.contains('browse-mode')?'演示模式':'浏览模式';
});

fullscreenToggle.addEventListener('click',async()=>{
  if(!document.fullscreenElement)await document.documentElement.requestFullscreen?.();
  else await document.exitFullscreen?.();
});
document.addEventListener('fullscreenchange',()=>fullscreenToggle.textContent=document.fullscreenElement?'退出全屏':'全屏');

document.addEventListener('keydown',event=>{
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  const forward=['ArrowDown','ArrowRight','PageDown',' '];
  const backward=['ArrowUp','ArrowLeft','PageUp'];
  if(forward.includes(event.key)){event.preventDefault();goTo(activeIndex+1)}
  else if(backward.includes(event.key)){event.preventDefault();goTo(activeIndex-1)}
  else if(event.key==='Home'){event.preventDefault();goTo(0)}
  else if(event.key==='End'){event.preventDefault();goTo(slides.length-1)}
  else if(event.key.toLowerCase()==='n'){notesToggle.click()}
  else if(event.key.toLowerCase()==='f'){fullscreenToggle.click()}
});

window.addEventListener('wheel',event=>{
  if(document.body.classList.contains('browse-mode')||innerWidth<980||event.ctrlKey)return;
  if(locked){event.preventDefault();return}
  wheelSum+=event.deltaY;
  clearTimeout(wheelTimer);
  wheelTimer=window.setTimeout(()=>wheelSum=0,160);
  if(Math.abs(wheelSum)>70){event.preventDefault();goTo(activeIndex+(wheelSum>0?1:-1));wheelSum=0}
},{passive:false});

window.addEventListener('hashchange',()=>{
  const index=slides.findIndex(slide=>`#${slide.id}`===location.hash);
  if(index>=0&&index!==activeIndex)goTo(index,'auto');
});

const initial=Math.max(0,slides.findIndex(slide=>`#${slide.id}`===location.hash));
setActive(initial);
if(initial)requestAnimationFrame(()=>goTo(initial,'auto'));
