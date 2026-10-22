import { readFileSync, writeFileSync } from 'node:fs';

const c = JSON.parse(readFileSync('profile.json', 'utf8'));
const d = JSON.parse(readFileSync('.profile/data.json', 'utf8'));
const esc = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
const palettes = {
  dark: { bg:'#1c241e', panel:'#29352c', primary:'#a0d5ac', ink:'#e1e5de', muted:'#bfcbbf', accent:'#174e2c', onAccent:'#b4f1bf', outline:'#536355' },
  light: { bg:'#edf5eb', panel:'#e0eddf', primary:'#326b43', ink:'#182019', muted:'#4e6353', accent:'#b5efc1', onAccent:'#103b20', outline:'#94a997' },
};
for (const theme of ['light','dark']) {
  const p = palettes[theme];
  // Reuse the generator's embedded Latin and Cyrillic fonts; no remote font dependency.
  const source = readFileSync(`assets/hero-${theme}.svg`, 'utf8');
  const style = source.match(/<style>([\s\S]*?)<\/style>/)?.[1] || '';
  const text = (x,y,s,size=16,color=p.ink,weight=500,extra='') => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" ${extra}>${esc(s)}</text>`;
  const svg = (name,w,h,title,body) => writeFileSync(`assets/${name}-${theme}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><style>${style}\n.flow{stroke-dasharray:5 7;${c.motion?'animation:flow 4s linear infinite':''}}@keyframes flow{to{stroke-dashoffset:-48}}@media(prefers-reduced-motion:reduce){.flow{animation:none}}</style>${body}</svg>`);
  const section = (name,n,title,note) => svg(name,840,62,title,
    text(4,40,n,13,p.primary,700,'letter-spacing="1"') + text(42,42,title,25,p.ink,650) + text(832,40,note,12,p.muted,500,'text-anchor="end"'));
  section('projects-heading','01','Экосистема HYDRA','SELF-HOSTED · OPEN SOURCE');
  section('activity-heading','02','Разработка в цифрах','GITHUB ACTIVITY');

  let map = `<rect width="840" height="222" rx="28" fill="${p.bg}"/>`;
  map += text(28,37,'Три проекта. Одна инфраструктура.',21,p.ink,650);
  map += text(28,63,'HydraCore работает на сервере и внутри Android-клиента.',14,p.muted);
  map += `<path class="flow" d="M263 133H301 M539 133H577" fill="none" stroke="${p.primary}" stroke-width="2"/>`;
  const nodes = [
    {x:28,name:'HYDRA-ULTIMATE',role:'Управление VPS',tag:'PYTHON'},
    {x:303,name:'HydraCore',role:'Сетевой рантайм',tag:'GO / SING-BOX'},
    {x:578,name:'HydraBox',role:'Android-клиент',tag:'KOTLIN / COMPOSE'},
  ];
  nodes.forEach((n,i) => {
    map += `<rect x="${n.x}" y="88" width="234" height="108" rx="20" fill="${i===1?p.accent:p.panel}"/>`;
    map += text(n.x+18,113,n.tag,10,i===1?p.onAccent:p.muted,650,'letter-spacing="1"');
    map += text(n.x+18,145,n.name,20,i===1?p.onAccent:p.ink,650);
    map += text(n.x+18,174,n.role,14,i===1?p.onAccent:p.muted);
  });
  svg('ecosystem',840,222,'HYDRA: сервер, сетевой рантайм и Android-клиент',map);

  let docs = `<rect width="412" height="232" rx="28" fill="${p.panel}"/>`;
  docs += `<rect x="22" y="22" width="60" height="60" rx="22" fill="${p.accent}"/><path d="M39 40h12q6 0 6 5v21q-3-4-8-4H39z M57 45q0-5 6-5h10v22H63q-4 0-6 4" fill="none" stroke="${p.onAccent}" stroke-width="2.5" stroke-linejoin="round"/>`;
  docs += `<circle cx="372" cy="40" r="18" fill="${p.bg}"/><path d="M366 46l12-12m-10 0h10v10" fill="none" stroke="${p.muted}" stroke-width="2"/>`;
  docs += text(24,116,'Как всё устроено',23,p.ink,650);
  docs += text(24,148,'Архитектура, установка и протоколы.',16);
  docs += text(24,173,'Документация HYDRA-ULTIMATE.',16);
  docs += `<rect x="24" y="192" width="118" height="25" rx="12.5" fill="${p.accent}"/>` + text(39,209,'Документация',12,p.onAccent,600);
  svg('documentation',412,232,'Документация HYDRA: архитектура, установка и протоколы',docs);

  let community = `<rect width="840" height="126" rx="28" fill="${p.accent}"/><circle cx="770" cy="64" r="47" fill="${p.primary}" opacity=".16"/>`;
  community += text(28,36,'НА СВЯЗИ',11,p.onAccent,650,'letter-spacing="1.8"');
  community += text(28,69,'HYDRA в Telegram',25,p.onAccent,650);
  community += text(28,100,'Обсуждение проекта и обратная связь · @hydraucb',15,p.onAccent);
  community += `<path d="M746 66l46-18-9 36-14-11-9 8 2-15 20-10-24 12z" fill="${p.onAccent}"/>`;
  svg('community',840,126,'Сообщество HYDRA в Telegram: @hydraucb',community);
}

const picture = (name,alt,width='100%') => `<picture><source media="(prefers-color-scheme: dark)" srcset="assets/${name}-dark.svg"><img src="assets/${name}-light.svg" width="${width}" alt="${esc(alt)}"></picture>`;
const link = (url,content) => `<a href="${esc(url)}">${content}</a>`;
const parts = [picture('hero',`${c.hero.greeting} ${c.hero.name || c.login}`)];
if (!c.hidden.includes('about')) parts.push(picture('about',c.about.title));
if (!c.hidden.includes('projects')) {
  parts.push(picture('projects-heading','Экосистема HYDRA'),picture('ecosystem','Связь сервера, HydraCore и HydraBox'));
  const repos = c.projects.source === 'manual' ? c.projects.repos.map(name=>d.all.find(r=>r.name===name)).filter(Boolean) : d.pins;
  const cards = repos.map(r=>link(r.url,picture(`project-${r.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}`,r.name,'49%')));
  cards.push(link('https://github.com/gr33nimax/HYDRA-ULTIMATE#readme',picture('documentation','Документация HYDRA','49%')));
  for(let i=0;i<cards.length;i+=2) parts.push(cards.slice(i,i+2).join('&nbsp;'));
}
if (!c.hidden.includes('stack')) parts.push(picture('stack',c.stack.title));
if (!c.hidden.includes('stats')) parts.push(picture('activity-heading','Разработка в цифрах'),picture('stats',c.stats.title));
if (!c.hidden.includes('streak')) parts.push(picture('streak',c.streak.title));
parts.push(link('https://t.me/hydraucb',picture('community','Сообщество HYDRA в Telegram')));
if (!c.hidden.includes('buttons')) parts.push(c.buttons.items.map((b,i)=>link(b.url || `https://github.com/${c.login}?tab=repositories`,picture(`button-${i+1}`,b.label,'auto'))).join('&nbsp;&nbsp;'));
parts.push(link(`https://metawka.github.io/expressive-profile/?from=${encodeURIComponent(c.login)}`,picture('credit','Made with Expressive Profile','auto')));
writeFileSync('README.md',`<div align="center">\n\n${parts.join('\n\n')}\n\n</div>\n`);
console.log('Polished profile: ecosystem, project grid, stack and community');
