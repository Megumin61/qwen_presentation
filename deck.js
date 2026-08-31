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

let mediaLightbox=null;

function ensureLightbox(){
  if(mediaLightbox)return mediaLightbox;
  mediaLightbox=document.createElement('div');
  mediaLightbox.className='media-lightbox';
  mediaLightbox.setAttribute('role','dialog');
  mediaLightbox.setAttribute('aria-modal','true');
  mediaLightbox.innerHTML='<button type="button" class="media-lightbox-close" aria-label="关闭">×</button><figure><img alt="" /><figcaption></figcaption></figure>';
  document.body.appendChild(mediaLightbox);
  mediaLightbox.addEventListener('click',event=>{
    if(event.target===mediaLightbox||event.target.closest('.media-lightbox-close'))closeLightbox();
  });
  return mediaLightbox;
}

function openLightbox(trigger){
  const source=trigger.querySelector('img')||trigger;
  const modal=ensureLightbox();
  modal.querySelector('img').src=source.currentSrc||source.src;
  modal.querySelector('img').alt=source.alt||'';
  modal.querySelector('figcaption').textContent=trigger.dataset.caption||source.alt||'';
  modal.classList.add('open');
  document.body.style.overflow='hidden';
}

function closeLightbox(){
  if(!mediaLightbox?.classList.contains('open'))return false;
  mediaLightbox.classList.remove('open');
  document.body.style.overflow='';
  return true;
}

document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-lightbox]');
  if(trigger)openLightbox(trigger);
});

document.querySelectorAll('[data-carousel]').forEach(carousel=>{
  const items=[...carousel.querySelectorAll('.pet-carousel-stage figure')];
  const dots=[...carousel.querySelectorAll('[data-carousel-dot]')];
  const counter=carousel.querySelector('[data-carousel-current]');
  let index=0;
  const render=next=>{
    index=(next+items.length)%items.length;
    items.forEach((item,i)=>{
      const distance=(i-index+items.length)%items.length;
      item.classList.toggle('is-active',distance===0);
      item.classList.toggle('is-next',distance===1);
      item.classList.toggle('is-prev',distance===items.length-1);
    });
    dots.forEach((dot,i)=>dot.classList.toggle('active',i===index));
    if(counter)counter.textContent=String(index+1).padStart(2,'0');
  };
  carousel.querySelector('[data-carousel-prev]')?.addEventListener('click',()=>render(index-1));
  carousel.querySelector('[data-carousel-next]')?.addEventListener('click',()=>render(index+1));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>render(i)));
  items.forEach((item,i)=>item.addEventListener('click',event=>{
    if(i===index)return;
    event.preventDefault();
    event.stopPropagation();
    render(i);
  },true));
  render(0);
});

document.querySelectorAll('[data-strip-carousel]').forEach(carousel=>{
  const viewport=carousel.querySelector('.v19-strip-viewport');
  const track=carousel.querySelector('.v19-strip-track');
  const items=[...track.querySelectorAll('figure')];
  const counter=carousel.querySelector('[data-strip-current]');
  let index=0;
  const visibleCount=()=>window.innerWidth<=860?1:4;
  const render=next=>{
    const visible=visibleCount();
    const max=Math.max(0,items.length-visible);
    index=Math.max(0,Math.min(next,max));
    const itemWidth=items[0]?.getBoundingClientRect().width||0;
    const gap=parseFloat(getComputedStyle(track).columnGap||getComputedStyle(track).gap)||0;
    track.style.transform=`translateX(-${index*(itemWidth+gap)}px)`;
    items.forEach((item,i)=>item.classList.toggle('is-visible',i>=index&&i<index+visible));
    if(counter)counter.textContent=`${String(index+1).padStart(2,'0')}–${String(Math.min(items.length,index+visible)).padStart(2,'0')}`;
    carousel.querySelector('[data-strip-prev]')?.toggleAttribute('disabled',index===0);
    carousel.querySelector('[data-strip-next]')?.toggleAttribute('disabled',index===max);
  };
  carousel.querySelector('[data-strip-prev]')?.addEventListener('click',()=>render(index-1));
  carousel.querySelector('[data-strip-next]')?.addEventListener('click',()=>render(index+1));
  window.addEventListener('resize',()=>render(index));
  render(0);
});

document.addEventListener('keydown',event=>{
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  if(event.key==='Escape'&&closeLightbox())return;
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
