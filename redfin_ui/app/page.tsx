// app/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { FeaturedNewsSection } from "./components/FeaturedNewsSection";
import { LLMRecommendationSection } from "./components/LLMRecommendationSection";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Skeleton } from "./components/ui/skeleton";
import { getCatStyle, getCategoryIcon, categoryLabels } from "./lib/categoryStyle";
import { useAuth } from "./contexts/AuthContext";

// RSS 데이터 타입 추가
type RSSItem = {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  author?: string;
  category?: string;
  imageUrl?: string | null;
};

type ArticlesListResponse = {
  items: Array<{
    id?: string;
    _id?: { $oid?: string };
    Title?: string | null;
    Summary?: string | null;
    URL: string;
    category?: string | null;
    published_at?: string | null;
    created_at?: string | null;
    tags?: string[] | null;
    hero_image_url?: string | null;
    author_name?: string | null;
  }>;
  total: number;
  page: number;
  size: number;
};

type NewsNormalized = {
  id: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  imageUrl?: string | null;
  sourceUrl: string;
  source: string;
  tags: string[];
};

function formatDateKST(s?: string) {
  if (!s) return "";
  const d = new Date(s.replace(" ", "T"));
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}

const sortByRecent = (a: NewsNormalized, b: NewsNormalized) => {
  const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
  const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
  return tb - ta;
};

async function fetchNews(params?: { search?: string; tags?: string[] }) {
  const qp = new URLSearchParams();
  qp.set("page", "1");
  qp.set("size", "200");
  qp.set("include_news", "false");

  if (params?.search) {
    qp.set("search", params.search);
  } else {
    qp.set("search", "AI OR 인공지능 OR ChatGPT OR GPT OR 머신러닝 OR 딥러닝 OR OpenAI OR 생성형AI");
  }

  qp.append("tags", "topic/AI");
  qp.append("tags", "technology");
  (params?.tags ?? []).forEach((t) => qp.append("tags", t));

  try {
    const r = await fetch(`/api/news?${qp.toString()}`, { cache: "no-store" });
    if (!r.ok) {
      const errorData = await r.json().catch(() => ({ error: "Unknown error" }));
      console.error('API Error:', errorData.error || `API returned ${r.status}`);
      return { items: [], total: 0, page: 1, size: 200 };
    }
    return await r.json();
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return { items: [], total: 0, page: 1, size: 200 };
  }
}

function normalizeRSSData(rssItems: RSSItem[]): NewsNormalized[] {
  const aiKeywords = [
    'ai', 'artificial intelligence', '인공지능', 'chatgpt', 'gpt',
    '머신러닝', 'machine learning', '딥러닝', 'deep learning',
    'openai', '생성형ai', 'generative ai', '자율주행', 'autonomous',
    'neural network', '신경망', 'llm', 'large language model'
  ];

  return rssItems
    .filter((item) => {
      const text = `${item.title} ${item.description || ''}`.toLowerCase();
      return aiKeywords.some(keyword => text.includes(keyword));
    })
    .map((item, i) => ({
      id: item.link || `rss-${i}`,
      title: item.title || "(제목 없음)",
      description: item.description || "",
      category: "technology",
      publishedAt: item.pubDate || new Date().toISOString(),
      imageUrl: item.imageUrl || null,
      sourceUrl: item.link,
      source: "RSS",
      tags: ["AI", "technology"],
    }));
}

async function fetchRSSNews(): Promise<NewsNormalized[]> {
  try {
    const response = await fetch("/api/rss", { cache: "no-store" });
    if (!response.ok) {
      console.error(`RSS fetch failed (${response.status})`);
      return [];
    }
    const data = await response.json();
    return normalizeRSSData(data.data || []);
  } catch (error) {
    console.error("RSS fetch error:", error);
    return [];
  }
}

function normalizeNews(list: ArticlesListResponse): NewsNormalized[] {
  return (list.items ?? []).map((n, i) => ({
    id: n._id?.$oid || n.id || n.URL || `row-${i}`,
    title: n.Title ?? "(제목 없음)",
    description: n.Summary ?? "",
    category: (n.category ?? "technology").toString(),
    publishedAt: n.published_at ?? n.created_at ?? "",
    imageUrl: n.hero_image_url || null,
    sourceUrl: n.URL,
    source: "articles",
    tags: n.tags ?? [],
  }));
}

// 뉴스 카드 클릭 핸들러
const handleNewsClick = (newsItem: NewsNormalized) => {
  if (newsItem.sourceUrl) {
    window.open(newsItem.sourceUrl, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = `/news/${newsItem.id}`;
  }
};

// 뉴스 카드 컴포넌트
const NewsCard = ({ n }: { n: NewsNormalized }) => {
  const s = getCatStyle(n.category);
  const Icon = getCategoryIcon(n.category);
  return (
    <div
      key={n.id}
      className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
      onClick={() => handleNewsClick(n)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNewsClick(n);
        }
      }}
    >
      <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border ${s.grad} ${s.border}`}>
        <div className={`flex size-10 items-center justify-center rounded-xl ${s.bg} ${s.border} border shadow-sm`}>
          <Icon className={`size-6 ${s.text}`} />
        </div>
      </div>
      <div className="min-w-0">
        <div className="font-semibold hover:underline line-clamp-2">{n.title}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          <span className={`mr-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] border ${s.bg} ${s.text} ${s.border}`}>
            {n.category ?? "Uncategorized"}
          </span>
          {n.source} · {formatDateKST(n.publishedAt)}
          {n.sourceUrl && <span className="ml-2 text-blue-500">🔗</span>}
        </div>
      </div>
    </div>
  );
};


export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [news, setNews] = useState<NewsNormalized[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [rssNews, setRssNews] = useState<NewsNormalized[]>([]);

  const loadNews = useCallback(async (query?: string) => {
    let alive = true;
    setIsLoading(true);
    setError(null);
    try {
      const [articlesRes, rssData] = await Promise.all([
        fetchNews(query ? { search: query } : undefined),
        fetchRSSNews(),
      ]);
      if (alive) {
        setNews(normalizeNews(articlesRes).sort(sortByRecent));
        setRssNews(rssData.sort(sortByRecent));
      }
    } catch (e: unknown) {
      if (alive) {
        const message = e instanceof Error ? e.message : "뉴스를 불러오지 못했습니다.";
        setError(message);
      }
    } finally {
      if (alive) setIsLoading(false);
    }
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    // 사용자 관심사를 기반으로 검색 쿼리 생성
    if (user && user.interests && user.interests.length > 0) {
      const interestQuery = user.interests.join(' OR ');
      loadNews(interestQuery);
    } else {
      loadNews(); // 기본 뉴스 로드
    }
  }, [user, loadNews]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery) {
        loadNews(searchQuery);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, loadNews]);

  const handleRefresh = () => {
    if (user && user.interests && user.interests.length > 0 && !searchQuery) {
        const interestQuery = user.interests.join(' OR ');
        loadNews(interestQuery);
    } else {
        loadNews(searchQuery);
    }
  };

  const allNews = useMemo(() => [...news, ...rssNews].sort(sortByRecent), [news, rssNews]);

  const textOf = (n: NewsNormalized) => `${n.title} ${n.description} ${n.source} ${n.tags.join(" ")}`.toLowerCase();
  const passesSearch = (n: NewsNormalized) => !searchQuery || textOf(n).includes(searchQuery.toLowerCase());
  const passesCategory = (n: NewsNormalized) => selectedCategory === "all" || n.category === selectedCategory;

  const filteredNews = useMemo(() => {
    return allNews.filter(n => passesSearch(n) && passesCategory(n));
  }, [allNews, searchQuery, selectedCategory]);

  const isUSUKNews = (n: NewsNormalized) => {
    if (!n.sourceUrl) return false;
    try {
      const url = new URL(n.sourceUrl);
      const usukDomains = [
        'wsj.com', 'wired.com', 'techcrunch.com', 'cnn.com', 'npr.org',
        'theverge.com', 'technologyreview.com', 'nytimes.com', 'washingtonpost.com',
        'bloomberg.com', 'reuters.com', 'associated-press.org', 'time.com',
        'bbc.co.uk', 'theguardian.com', 'ft.com', 'independent.co.uk',
        'telegraph.co.uk', 'economist.com', 'sky.com'
      ];
      return usukDomains.some(domain => url.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const isAIRelated = (n: NewsNormalized) => {
    const aiKeywords = [
      'ai', 'artificial intelligence', '인공지능', 'machine learning', '머신러닝',
      'deep learning', '딥러닝', 'chatgpt', 'gpt', 'openai', 'neural network',
      '신경망', 'llm', 'large language model', 'generative ai', '생성형ai',
      'automation', 'robotics', 'computer vision', 'nlp', 'algorithm'
    ];
    const text = `${n.title} ${n.description} ${n.tags.join(' ')}`.toLowerCase();
    return aiKeywords.some(keyword => text.includes(keyword));
  };

  const featuredNews = useMemo(() => {
    const potentialFeatured = filteredNews.filter(n => isUSUKNews(n) && isAIRelated(n));

    if (!user || !user.interests || user.interests.length === 0) {
        return potentialFeatured.slice(0, 3);
    }

    const interests = user.interests;
    const AI_FIELD_INTERESTS = [
        "Deep Learning", "Machine Learning", "LLM", "Fine-tuning", 
        "Data Analysis", "Natural Language Processing", "Computer Vision", 
        "Recommendation System", "Generative AI", "Reinforcement Learning"
    ];

    const slots: (NewsNormalized | undefined)[] = [undefined, undefined, undefined];
    const usedIds = new Set<string>();

    // Find the user's selected AI field interest
    const userAiFieldInterest = interests.find(i => AI_FIELD_INTERESTS.includes(i));

    // Slot 2: AI Field Article
    if (userAiFieldInterest) {
        const fieldArticle = potentialFeatured.find(news =>
            textOf(news).includes(userAiFieldInterest.toLowerCase())
        );
        if (fieldArticle) {
            slots[1] = fieldArticle;
            usedIds.add(fieldArticle.id);
        }
    }

    // Slot 1: Other Primary Interest Article (Job or Company)
    const otherInterests = interests.filter(i => !AI_FIELD_INTERESTS.includes(i));
    if (otherInterests.length > 0) {
        for (const interest of otherInterests) {
            const primaryArticle = potentialFeatured.find(news =>
                !usedIds.has(news.id) && textOf(news).includes(interest.toLowerCase())
            );
            if (primaryArticle) {
                slots[0] = primaryArticle;
                usedIds.add(primaryArticle.id);
                break;
            }
        }
    }

    // Edge Case: If only an AI Field interest was found, move it to the first slot.
    if (!slots[0] && slots[1]) {
        slots[0] = slots[1];
        slots[1] = undefined;
    }

    // Fill Remaining Slots
    const remainingNews = potentialFeatured.filter(news => !usedIds.has(news.id));
    let remainingIndex = 0;
    for (let i = 0; i < slots.length; i++) {
        if (!slots[i] && remainingIndex < remainingNews.length) {
            slots[i] = remainingNews[remainingIndex];
            usedIds.add(remainingNews[remainingIndex].id);
            remainingIndex++;
        }
    }

    return slots.filter((news): news is NewsNormalized => news !== undefined);
}, [filteredNews, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }
  
  const handleLogin = () => router.push('/login');
  const handleSignup = () => router.push('/signup');
  const handleLogout = () => logout();
  const handleProfileClick = () => router.push('/profile');
  const handleInterestsClick = () => router.push('/interests');
  const handleHomeClick = () => router.push('/');

  const FeaturedLoadingSkeleton = () => (
    <section className="bg-gradient-to-br from-primary/5 to-secondary/10 border-b">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <div className="aspect-[16/9] w-full rounded-lg border bg-slate-100" />
              <Skeleton className="mt-4 h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        user={user}
        onLogout={handleLogout}
        onLoginClick={handleLogin}
        onSignupClick={handleSignup}
        onProfileClick={handleProfileClick}
        onInterestsClick={handleInterestsClick}
        onHomeClick={handleHomeClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {error && (
        <div className="container mx-auto px-4 mt-3">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button onClick={handleRefresh} className="ml-2 underline hover:no-underline">
              다시 시도
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pt-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>총 {filteredNews.length}개 AI 뉴스 (일반: {news.length}, RSS: {rssNews.length})</span>
          <button onClick={handleRefresh} className="hover:text-foreground transition-colors" disabled={isLoading}>
            RSS 새로고침
          </button>
        </div>
      </div>

      {isLoading ? <FeaturedLoadingSkeleton /> : <FeaturedNewsSection featuredNews={featuredNews} />}

      <LLMRecommendationSection onNewsClick={() => {}} />

      <main className="container mx-auto px-4 py-8 flex-1 space-y-10">
        <section className="space-y-4">
          <h2 className="text-xl font-bold">하이라이트</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {(["오늘", "이번 주", "이번 달"] as const).map((label, idx) => {
              const days = [1, 7, 30][idx];
              const from = Date.now() - days * 24 * 3600 * 1000;
              const items = filteredNews
                .filter(n => (n.publishedAt ? Date.parse(n.publishedAt) : 0) >= from)
                .sort(sortByRecent)
                .slice(0, 6);

              return (
                <div key={label} className="rounded-xl border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">{label} 하이라이트</h3>
                    <span className="text-xs text-muted-foreground">총 {items.length}건</span>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">데이터 없음</p>
                  ) : (
                    <div className="grid gap-4">
                      {items.map((n) => <NewsCard key={n.id} n={n} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">카테고리별 Top 3</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(
              news.reduce<Record<string, NewsNormalized[]>>((acc, cur) => {
                const key = cur.category || "Uncategorized";
                (acc[key] ||= []).push(cur);
                return acc;
              }, {})
            ).map(([cat, items]) => {
              const filtered = items
                .filter(n => passesSearch(n) && passesCategory(n))
                .sort(sortByRecent)
                .slice(0, 3);
              const s = getCatStyle(cat);
              return (
                <div key={cat} className={`rounded-xl border bg-card p-4 ${s.border}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">{categoryLabels[cat] ?? cat}</h3>
                    <span className="text-xs text-muted-foreground">Top 3</span>
                  </div>
                  {filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground">데이터 없음</p>
                  ) : (
                    <div className="space-y-4">
                      {filtered.map((n) => <NewsCard key={n.id} n={n} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
