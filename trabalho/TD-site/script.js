document.getElementById('year').textContent = new Date().getFullYear();

// Fetch tech news from Google News RSS via public CORS proxy
const FEED = 'https://news.google.com/rss/search?q=tecnologia+OR+intelig%C3%AAncia+artificial&hl=pt-BR&gl=BR&ceid=BR:pt-419';
const PROXY = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(FEED);

async function loadNews(){
  const grid = document.getElementById('news-grid');
  try{
    const res = await fetch(PROXY);
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, 'text/xml');
    const items = Array.from(xml.querySelectorAll('item')).slice(0,9);
    if(!items.length) throw new Error('vazio');
    grid.innerHTML = items.map(it => {
      const title = it.querySelector('title')?.textContent ?? '';
      const link  = it.querySelector('link')?.textContent ?? '#';
      const date  = new Date(it.querySelector('pubDate')?.textContent ?? Date.now());
      const src   = it.querySelector('source')?.textContent ?? 'Google News';
      return `<article class="news-card">
        <div class="meta">${src} · ${date.toLocaleDateString('pt-BR')}</div>
        <h3>${title}</h3>
        <a href="${link}" target="_blank" rel="noopener">Ler matéria →</a>
      </article>`;
    }).join('');
  }catch(e){
    grid.innerHTML = '<p class="muted">Não foi possível carregar as notícias agora. Tente novamente em instantes.</p>';
  }
}
loadNews();
