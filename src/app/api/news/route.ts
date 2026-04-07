import { NextResponse } from "next/server";

interface NewsItem {
  title: string;
  url: string;
  source: string;
  date: string;
  summary: string;
}

function parseRSSItems(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const url = block.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
    const description =
      block.match(/<description><!\[CDATA\[(.*?)\]\]>/)?.[1] ??
      block.match(/<description>(.*?)<\/description>/)?.[1] ??
      "";

    // Strip HTML tags from description
    const summary = description.replace(/<[^>]*>/g, "").trim().slice(0, 200);

    if (title && url) {
      items.push({
        title: title.trim(),
        url: url.trim(),
        source,
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        summary,
      });
    }
  }

  return items;
}

export async function GET() {
  const feeds = [
    { url: "https://www.abc.net.au/news/feed/51120/rss.xml", source: "ABC News" },
    { url: "https://feeds.reuters.com/reuters/commoditiesNews", source: "Reuters" },
  ];

  const allItems: NewsItem[] = [];

  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      try {
        const res = await fetch(feed.url, {
          next: { revalidate: 21600 }, // 6 hours
          headers: {
            "User-Agent": "AussieFuelSupply/1.0",
          },
        });
        if (!res.ok) return [];
        const xml = await res.text();
        return parseRSSItems(xml, feed.source);
      } catch {
        console.error(`Failed to fetch RSS from ${feed.source}`);
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // Sort by date descending, take max 20
  allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const top20 = allItems.slice(0, 20);

  return NextResponse.json(
    {
      items: top20,
      fetched_at: new Date().toISOString(),
      feed_count: feeds.length,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=43200",
      },
    }
  );
}
