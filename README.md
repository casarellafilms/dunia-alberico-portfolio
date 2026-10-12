# Dunia Alberico — Fashion & Visual Design

Portfolio editoriale in italiano, costruito sui lavori e sulle immagini del PDF `PORTFOLIO D.A. ita.pdf` fornito dal cliente.

## Sito

https://dunia-alberico-portfolio.vercel.app

## Avvio e build

```sh
npm ci
npm run dev
npm run build
npm run preview
```

React, TypeScript, Vite e GSAP ScrollTrigger. Sito statico senza servizi backend, tracking o cookie applicativi. Font ospitati localmente; immagini WebP ottimizzate.

## Contenuti

Sei capitoli: Asimmetrie, Wild Synthesis, Adidas × Y-3 (concept progettuale), Denim Experiment, Iconography e Personal Project. Le schede contengono le tavole complete del documento, con ingrandimento. Testi adattati dal PDF, senza aggiungere clienti, date di progetto o collaborazioni non documentate. Recapiti forniti dal cliente: `duniaalberico@icloud.com`, Instagram `@evadamn`.

`src/data.ts` raccoglie i progetti e l’archivio. `src/App.tsx` contiene le sezioni e le interazioni. `src/style.css` contiene il sistema visivo e i breakpoint. Il PDF originale è conservato in una GitHub Release perché supera il limite di dimensione dei singoli file GitHub.

## Interazioni e accessibilità

- Filtri per disciplina, archivio orizzontale utilizzabile con swipe, pulsanti e tastiera.
- Schede progetto con URL condivisibile `/#progetto/asimmetrie`, dialog nativo, Escape e restituzione del focus.
- Navigazione mobile, link per saltare ai progetti, indicatori di focus e testi alternativi.
- Animazioni di ingresso, parallasse leggera e tipografia allo scroll. Rispetto di `prefers-reduced-motion` e pulsante di pausa.
- Contatti email, copia indirizzo e Instagram. Download del portfolio originale.

## Pubblicazione

Il progetto Vercel è collegato al repository GitHub: le modifiche al branch `main` vengono pubblicate in produzione. La configurazione di build e gli header sono in `vercel.json`.

Le immagini e il portfolio restano di proprietà dei rispettivi autori. Il progetto Adidas × Y-3 è presentato come ricerca creativa, senza dichiarare un incarico ufficiale dei brand.

Il riferimento stilistico fornito dal cliente è il post Readymag su Instagram https://www.instagram.com/p/Dcln5MXAVId/ e il portfolio https://gougoucore.com. Il sito utilizza contenuti e codice propri.
