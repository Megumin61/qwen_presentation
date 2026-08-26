const slides=[...document.querySelectorAll('.slide')];
const rail=document.getElementById('slideRail');
const currentSlide=document.getElementById('currentSlide');
const totalSlides=document.getElementById('totalSlides');
const progressFill=document.getElementById('progressFill');
const barTitle=document.getElementById('barTitle');
const notesPanel=document.getElementById('notesPanel');
const notesText=notesPanel.querySelector('p');
let activeIndex=0;

totalSlides.textContent=String(slides.length).padStart(2,'0');

slides.forEach((slide,index)=>{
  const button=document.createElement('button');
  button.type='button';
  button.title=`${String(index+1).padStart(2,'0')} ${slide.dataset.title||''}`;
  button.addEventListener('click',()=>goTo(index));
  rail.appendChild(button);
});

function goTo(index,behavior='smooth'){
  const next=Math.max(0,Math.min(slides.length-1,index));
  slides[next].scrollIntoView({behavior,block:'start'});
}

function setActive(index){
  if(index<0||index>=slides.length)return;
  activeIndex=index;
  slides.forEach((slide,i)=>slide.classList.toggle('is-visible',i===index));
  [...rail.children].forEach((dot,i)=>dot.classList.toggle('active',i===index));
  currentSlide.textContent=String(index+1).padStart(2,'0');
  barTitle.textContent=slides[index].dataset.title||'实习转正答辩';
  progressFill.style.width=`${((index+1)/slides.length)*100}%`;
  document.querySelectorAll('.chapters button').forEach(button=>button.classList.toggle('active',button.dataset.chapter===slides[index].dataset.chapter));
  document.title=`${String(index+1).padStart(2,'0')}｜${slides[index].dataset.title||'实习转正答辩'}｜千问开放平台`;
  if(history.replaceState)history.replaceState(null,'',`#${slides[index].id}`);
  if(notesPanel.classList.contains('open'))showNotes();
}

function showNotes(){
  notesText.textContent=slides[activeIndex].querySelector('.speaker-note')?.textContent.trim()||'本页暂无讲稿。';
  notesPanel.classList.add('open');
}

document.querySelectorAll('.chapters button').forEach(button=>button.addEventListener('click',()=>{
  const index=slides.findIndex(slide=>slide.id===button.dataset.target);
  if(index>=0)goTo(index);
}));

document.getElementById('notesToggle').addEventListener('click',()=>notesPanel.classList.contains('open')?notesPanel.classList.remove('open'):showNotes());
notesPanel.querySelector('button').addEventListener('click',()=>notesPanel.classList.remove('open'));
document.getElementById('fullscreenToggle').addEventListener('click',async()=>{
  if(!document.fullscreenElement)await document.documentElement.requestFullscreen?.();
  else await document.exitFullscreen?.();
});

const observer=new IntersectionObserver(entries=>{
  const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if(visible&&visible.intersectionRatio>.34)setActive(slides.indexOf(visible.target));
},{threshold:[.18,.34,.55,.75]});
slides.forEach(slide=>observer.observe(slide));

document.addEventListener('keydown',event=>{
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  if(event.key==='Escape')closeVersionPanel();
  if(['ArrowDown','ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();goTo(activeIndex+1)}
  else if(['ArrowUp','ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();goTo(activeIndex-1)}
  else if(event.key==='Home'){event.preventDefault();goTo(0)}
  else if(event.key==='End'){event.preventDefault();goTo(slides.length-1)}
  else if(event.key.toLowerCase()==='n'){notesPanel.classList.contains('open')?notesPanel.classList.remove('open'):showNotes()}
  else if(event.key.toLowerCase()==='f')document.getElementById('fullscreenToggle').click();
});

const hashIndex=slides.findIndex(slide=>`#${slide.id}`===location.hash);
const initial=hashIndex>=0?hashIndex:0;
setActive(initial);
if(initial>0)requestAnimationFrame(()=>goTo(initial,'auto'));
