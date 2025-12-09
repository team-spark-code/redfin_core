import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    const url = 'https://datalab.naver.com/keyword/realtimeList.naver?where=main';
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      },
    });
    console.log('크롤링된 HTML 일부:', data.substring(0, 500));
    const $ = cheerio.load(data);
    const keywords: string[] = [];
    $('.keyword_rank .list span.item_title').each((_: number, el: cheerio.Element) => {
      keywords.push($(el).text().trim());
    });
    console.log('파싱된 keywords:', keywords);
    return NextResponse.json({ keywords });
  } catch (error) {
    console.log('에러 발생:', error);
    return NextResponse.json({ error: '실시간 검색어를 가져오지 못했습니다.' }, { status: 500 });
  }
}
