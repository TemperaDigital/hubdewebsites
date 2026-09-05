import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

interface NewsItem {
  id: string
  title: string
  url: string
  description: string
  source: string
  author: string | null
  image: string | null
  publishedAt: string | null
}

async function fetchDevTo(): Promise<NewsItem[]> {
  try {
    const res = await fetch('https://dev.to/api/articles?per_page=15&top=7', {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data as any[]).map((a) => ({
      id: `devto-${a.id}`,
      title: a.title,
      url: a.url,
      description: a.description ?? '',
      source: 'dev.to',
      author: a.user?.name ?? null,
      image: a.cover_image ?? a.social_image ?? null,
      publishedAt: a.published_at ?? null,
    }))
  } catch (_e) {
    return []
  }
}

async function fetchHackerNews(): Promise<NewsItem[]> {
  try {
    const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    if (!idsRes.ok) return []
    const ids: number[] = await idsRes.json()
    const top = ids.slice(0, 15)
    const stories = await Promise.all(
      top.map(async (id) => {
        const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        if (!r.ok) return null
        return r.json()
      }),
    )
    return stories
      .filter((s) => s && s.title && s.url)
      .map((s) => ({
        id: `hn-${s.id}`,
        title: s.title,
        url: s.url,
        description: s.text ? String(s.text).replace(/<[^>]*>/g, '').slice(0, 200) : '',
        source: 'Hacker News',
        author: s.by ?? null,
        image: null,
        publishedAt: s.time ? new Date(s.time * 1000).toISOString() : null,
      }))
  } catch (_e) {
    return []
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const [devto, hn] = await Promise.all([fetchDevTo(), fetchHackerNews()])
    const items = [...devto, ...hn].sort((a, b) => {
      const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0
      const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0
      return tb - ta
    })

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e), items: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
