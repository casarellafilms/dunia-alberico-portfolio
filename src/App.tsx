import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { archive, portfolioUrl, projects, type Project } from './data';

gsap.registerPlugin(ScrollTrigger);
const Arrow = ({diagonal=false}:{diagonal?:boolean}) => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal?'M5 19 19 5M5 5h14v14':'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5"/></svg>;
const image = (name:string) => `/images/${name}.webp`;

function ProjectDialog({project,onClose,onNext}:{project:Project|null;onClose:()=>void;onNext:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null);
 const scroller=useRef<HTMLDivElement>(null);
 const [expanded,setExpanded]=useState<number|null>(null);
 useEffect(()=>{
  const el=dialog.current;
  if(!project||!el)return;
  const focused=document.activeElement as HTMLElement|null;
  el.showModal();
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  return()=>{el.close();document.body.style.overflow=previousOverflow;focused?.focus({preventScroll:true});};
 },[!!project]);
 useEffect(()=>{scroller.current?.scrollTo(0,0);setExpanded(null);},[project?.slug]);
 return <dialog ref={dialog} className="project-dialog" aria-labelledby="project-title" onCancel={e=>{e.preventDefault();expanded!==null?setExpanded(null):onClose();}}>
  {project && <>
   <div className="dialog-nav"><span className="eyebrow">D.A. / PROGETTO {project.number}</span><button className="close-button" onClick={onClose} aria-label="Chiudi progetto"><span>Chiudi</span><span aria-hidden="true">×</span></button></div>
   <div className="dialog-scroll" ref={scroller}>
    <div className="project-intro"><p className="eyebrow">{project.category} / {project.subtitle}</p><h2 id="project-title">{project.title}</h2><div className="project-description"><p className="lead">{project.description}</p><div>{project.details.map(p=><p key={p}>{p}</p>)}<div className="tags">{project.tags.map(t=><span key={t}>{t}</span>)}</div></div></div></div>
    <div className="project-pages">{project.pages.map((page,i)=><figure key={page}><button onClick={()=>setExpanded(page)} aria-label={`Ingrandisci tavola ${i+1} di ${project.title}`}><img src={image(`page-${String(page).padStart(2,'0')}`)} alt={`${project.title} — tavola originale ${i+1} del portfolio`} loading={i?'lazy':'eager'} width="2400" height="1697"/><span className="image-expand" aria-hidden="true">↗</span></button><figcaption><span>{project.title}</span><span>TAVOLA {String(i+1).padStart(2,'0')} / {String(project.pages.length).padStart(2,'0')}</span></figcaption></figure>)}</div>
    <button className="next-project" onClick={onNext}><span className="eyebrow">PROSSIMO PROGETTO</span><span>{projects[(projects.indexOf(project)+1)%projects.length].title}<Arrow/></span></button>
   </div>
   {expanded!==null&&<div className="lightbox" role="region" aria-label="Tavola ingrandita" onKeyDown={e=>{if(e.key==='Tab'){e.preventDefault();e.currentTarget.querySelector('button')?.focus();}}}><button autoFocus className="close-button" onClick={()=>setExpanded(null)} aria-label="Chiudi tavola ingrandita">Torna al progetto <span aria-hidden="true">×</span></button><img src={image(`page-${String(expanded).padStart(2,'0')}`)} alt={`Tavola ingrandita di ${project.title}`}/></div>}
  </>}
 </dialog>;
}

export default function App() {
 const root=useRef<HTMLDivElement>(null);
 const rail=useRef<HTMLDivElement>(null);
 const [project,setProject]=useState<Project|null>(null);
 const [filter,setFilter]=useState('Tutti');
 const [menuOpen,setMenuOpen]=useState(false);
 const [paused,setPaused]=useState(false);
 const [activeArchive,setActiveArchive]=useState(0);
 const [archiveAtEnd,setArchiveAtEnd]=useState(false);
 const [copied,setCopied]=useState(false);
 const copyTimer=useRef<ReturnType<typeof setTimeout>|null>(null);

 useEffect(()=>{
  const sync=()=>{const slug=window.location.hash.replace('#progetto/','');const found=projects.find(p=>p.slug===slug);setProject(found??null);};
  sync();window.addEventListener('hashchange',sync);
  return()=>{window.removeEventListener('hashchange',sync);if(copyTimer.current)clearTimeout(copyTimer.current);};
 },[]);
 useEffect(()=>{
  if(!menuOpen)return;
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenuOpen(false);};
  window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);
 },[menuOpen]);
 useLayoutEffect(()=>{
  if(paused)return;
  const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)',()=>{
   const ctx=gsap.context(()=>{
    gsap.from('.hero-line > span',{yPercent:110,duration:1.2,stagger:.11,ease:'power3.out'});
    gsap.from('.hero-foot',{opacity:0,y:15,duration:.8,delay:.45});
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el=>{gsap.from(el,{y:45,opacity:0,duration:.95,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 93%',once:true}});});
    gsap.utils.toArray<HTMLElement>('.project-visual img').forEach(el=>{gsap.fromTo(el,{yPercent:-4},{yPercent:4,ease:'none',scrollTrigger:{trigger:el.closest('.project-card'),start:'top bottom',end:'bottom top',scrub:1}});});
    gsap.to('.vision-word',{xPercent:-13,ease:'none',scrollTrigger:{trigger:'.vision-strip',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.fromTo('.portrait-frame',{rotate:-5},{rotate:3,ease:'none',scrollTrigger:{trigger:'.about',start:'top bottom',end:'bottom top',scrub:1}});
   },root);
   return()=>ctx.revert();
  });
  return()=>media.revert();
 },[paused]);
 useEffect(()=>{requestAnimationFrame(()=>ScrollTrigger.refresh());},[filter]);

 const openProject=(p:Project)=>{setMenuOpen(false);window.location.hash=`progetto/${p.slug}`;};
 const closeProject=()=>{setProject(null);history.replaceState(null,'',`${location.pathname}${location.search}#lavori`);};
 const nextProject=()=>{if(project)openProject(projects[(projects.indexOf(project)+1)%projects.length]);};
 const scrollArchive=(dir:number)=>{const el=rail.current;if(el){const step=el.querySelector('button')?.getBoundingClientRect().width??300;el.scrollBy({left:dir*(step+24),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}};
 const copyEmail=async()=>{try{await navigator.clipboard.writeText('duniaalberico@icloud.com');setCopied(true);if(copyTimer.current)clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopied(false),2200);}catch{window.location.href='mailto:duniaalberico@icloud.com';}};

 return <div ref={root} className={paused?'site motion-paused':'site'}>
  <a href="#lavori" className="skip-link">Vai ai progetti</a>
  <header className="header"><a href="#home" className="wordmark" aria-label="Dunia Alberico, inizio pagina">dunia alberico<span>✳</span></a><a href="#home" className="monogram" aria-label="Inizio pagina">da.</a><nav id="mobile-menu" className={menuOpen?'navigation is-open':'navigation'} aria-label="Navigazione principale"><a href="#lavori" onClick={()=>setMenuOpen(false)}>Lavori <sup>(06)</sup></a><a href="#archivio" onClick={()=>setMenuOpen(false)}>Archivio</a><a href="#about" onClick={()=>setMenuOpen(false)}>About</a><a href="#contatti" onClick={()=>setMenuOpen(false)}>Parliamone <Arrow diagonal/></a></nav><button className="menu-toggle" onClick={()=>setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen?'Chiudi menu':'Apri menu'}><span>{menuOpen?'Chiudi':'Menu'}</span><span aria-hidden="true">{menuOpen?'−':'+'}</span></button></header>
  <main>
   <section className="hero" id="home" aria-labelledby="hero-title">
    <div className="hero-kicker eyebrow"><span>FASHION & VISUAL DESIGN</span><span className="desktop-note">UN ARCHIVIO IN CONTINUA EVOLUZIONE</span><span>PORTFOLIO / 2018—2026</span></div>
    <h1 id="hero-title"><span className="hero-line"><span>Sono <em>Dunia.</em><span className="hero-asterisk" aria-hidden="true">✳</span></span></span><span className="hero-line"><span>La moda è il mio</span></span><span className="hero-line"><span><em>linguaggio</em> visivo.</span></span></h1>
    <div className="hero-foot"><p>Smontare la realtà. Ricostruirla attraverso<br className="desktop-note"/> forme, materia e nuove prospettive.</p><a className="text-link" href="#lavori">Esplora i lavori <span className="down-arrow" aria-hidden="true">↓</span></a></div>
   </section>
   <section id="lavori" className="works" aria-labelledby="works-title">
    <div className="section-bar"><h2 id="works-title">Lavori selezionati <sup>(06)</sup></h2><div className="filters" role="group" aria-label="Filtra i progetti">{['Tutti','Design','Styling','Ricerca'].map(f=><button key={f} aria-pressed={filter===f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>
    <div className="projects-grid">{projects.filter(p=>filter==='Tutti'||p.category===filter).map((p)=><button className={`project-card ${p.theme}`} key={p.slug} onClick={()=>openProject(p)} aria-label={`Esplora ${p.title}: ${p.subtitle}`}><div className="project-visual"><img src={image(p.cover)} alt={p.title==='Asimmetrie'?'Look asimmetrico giallo con cintura nera':`${p.title}, immagine dal portfolio di Dunia Alberico`} loading={Number(p.number)<=3?'eager':'lazy'} width="1000" height="1300"/><span className="project-hover" aria-hidden="true">Esplora <Arrow diagonal/></span>{p.number==='03'&&<span className="card-note">a study in<br/><em>deconstruction</em></span>}</div><div className="project-label"><span className="project-number">/{p.number}</span><h3>{p.title}</h3><Arrow diagonal/></div><p className="project-subtitle">{p.category} <span>—</span> {p.subtitle}</p></button>)}</div>
    <p className="works-footnote eyebrow">SEI CAPITOLI. UN UNICO LINGUAGGIO CREATIVO.</p>
   </section>
   <section className="vision-strip" aria-label="Visione creativa"><div className="vision-word" aria-hidden="true">Deconstruct. <em>Reimagine.</em> Repeat.</div><p>Non guardo alla silhouette come a un limite.<br/>La guardo come a uno spazio di possibilità.</p><span className="vision-star" aria-hidden="true">✳</span></section>
   <section id="archivio" className="archive" aria-labelledby="archive-title">
    <div className="archive-heading"><div><p className="eyebrow" data-reveal>APPUNTI VISIVI / IN PROGRESS</p><h2 id="archive-title" data-reveal>L’altro lato<br/><em>della ricerca.</em></h2></div><p data-reveal>Styling, immagini, intuizioni.<br/>Un archivio in cui la ricerca<br/>si prende la libertà di sperimentare.</p></div>
    <div className="archive-controls"><p className="eyebrow">SCORRI L’ARCHIVIO <span aria-hidden="true">↔</span></p><div className="rail-buttons"><button onClick={()=>scrollArchive(-1)} aria-label="Immagine precedente" disabled={activeArchive===0}><span aria-hidden="true">←</span></button><button onClick={()=>scrollArchive(1)} aria-label="Immagine successiva" disabled={archiveAtEnd}><span aria-hidden="true">→</span></button></div></div>
    <div className="archive-rail" ref={rail} onScroll={()=>{const el=rail.current;if(el){const step=(el.firstElementChild?.getBoundingClientRect().width??300)+24;setActiveArchive(Math.min(archive.length-1,Math.round(el.scrollLeft/step)));setArchiveAtEnd(el.scrollLeft+el.clientWidth>=el.scrollWidth-5);}}}>{archive.map((a,i)=><button className="archive-item" key={a.image} onClick={()=>openProject(projects[a.project])} aria-label={`Apri ${a.title}`}><div><img src={image(a.image)} alt={`${a.title} — fotografia dall’archivio di Dunia`} loading="lazy" width="700" height="1000"/><span aria-hidden="true"><Arrow diagonal/></span></div><p><span className="eyebrow">/{String(i+1).padStart(2,'0')}</span>{a.title}</p><span className="archive-type">{a.type}</span></button>)}</div>
    <div className="archive-bottom"><span className="eyebrow">{String(activeArchive+1).padStart(2,'0')} / 06</span><span className="handwritten">Stay curious.</span></div>
   </section>
   <section id="about" className="about" aria-labelledby="about-title"><div className="about-top"><p className="eyebrow">DIETRO LE IMMAGINI</p><h2 id="about-title">La moda è una<br/><em>necessità espressiva.</em></h2></div><div className="about-grid"><div className="portrait-column" data-reveal><figure className="portrait-frame"><img src={image('portrait')} alt="Ritratto di Dunia Alberico dal portfolio" width="495" height="605" loading="lazy"/></figure><p className="handwritten">Hello, it’s me.</p></div><div className="about-copy"><p className="lead" data-reveal>Dal Liceo Artistico all’Accademia di Belle Arti di Roma, ho imparato a guardare alla moda come a una forma d’arte dinamica e concettuale.</p><p data-reveal>La mia ricerca va oltre il capo d’abbigliamento. Dallo styling alla fotografia, dall’illustrazione ai contenuti digitali, ogni progetto è un’estensione dello stesso linguaggio creativo.</p><p data-reveal>Lo studio di Martin Margiela, Rei Kawakubo e Yohji Yamamoto ha definito la mia visione: smontare la realtà per ricostruirla, esplorando l’asimmetria e la manipolazione dei volumi.</p><div className="practice-list"><span className="eyebrow">IL MIO UNIVERSO</span>{['Fashion design','Fashion styling','Fotografia & ricerca visiva','Illustrazione & contenuti digitali'].map((v,i)=><div key={v}><span className="eyebrow">0{i+1}</span><span>{v}</span><span aria-hidden="true">↗</span></div>)}</div><a className="text-link pdf-link" href={portfolioUrl} target="_blank" rel="noreferrer">Il portfolio completo <Arrow diagonal/><span className="eyebrow">PDF / 21 PAGINE</span></a></div></div></section>
   <section id="contatti" className="contact" aria-labelledby="contact-title"><div className="contact-meta eyebrow"><span>NUOVE IDEE, NUOVE PROSPETTIVE</span><span>DUNIA ALBERICO / FASHION & VISUAL DESIGN</span></div><a className="contact-title" href="mailto:duniaalberico@icloud.com"><h2 id="contact-title">Facciamo<br/><em>qualcosa di bello.</em></h2><span className="contact-arrow"><Arrow diagonal/></span></a><div className="contact-links"><div><a href="mailto:duniaalberico@icloud.com">duniaalberico@icloud.com</a><button onClick={copyEmail} aria-label="Copia indirizzo email">{copied?'Copiato ✓':'Copia ↗'}</button><span className="sr-only" aria-live="polite">{copied?'Indirizzo email copiato':''}</span></div><a href="https://www.instagram.com/evadamn/" target="_blank" rel="noreferrer">Instagram / @evadamn <Arrow diagonal/></a></div></section>
  </main>
  <footer className="footer"><span>© {new Date().getFullYear()} Dunia Alberico</span><button onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?'Riprendi':'Pausa'} movimento <span aria-hidden="true">{paused?'▷':'Ⅱ'}</span></button><a href="#home">Torna su ↑</a></footer>
  <ProjectDialog project={project} onClose={closeProject} onNext={nextProject}/>
 </div>;
}
