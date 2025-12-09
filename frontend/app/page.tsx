import Link from 'next/link';
import { auth } from '@/auth';
import { logout } from '@/lib/actions/user';
import ScrapInput from './ScrapInput';
import { ThemeToggleButton } from './components/ThemeToggleButton';

// 로그아웃 버튼 컴포넌트
function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="px-6 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
      >
        로그아웃
      </button>
    </form>
  );
}

export default async function Home() {
  // 서버 컴포넌트에서 세션 정보 가져오기
  const session = await auth();
  const user = session?.user;
  let scraps = [];
  if (user) {
    try {
      const res = await fetch('http://localhost:8080/api/scrap', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        scraps = await res.json();
      }
    } catch {}
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <ThemeToggleButton />
      </div>
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">메인 페이지</h1>
        {user ? (
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            안녕하세요, <span className="font-semibold">{user.name}</span>님!
          </p>
        ) : (
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            로그인하여 모든 기능을 이용해보세요.
          </p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          // 로그인 상태일 때 보여줄 UI
          <>
            <Link
              href="/members"
              className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              회원 목록
            </Link>
            <LogoutButton />
          </>
        ) : (
          // 로그아웃 상태일 때 보여줄 UI
          <>
            <Link
              href="/login"
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
            >
              회원가입
            </Link>
          </>
        )}
      </div>

      {user && (
        <div className="w-full max-w-2xl mt-8">
          <ScrapInput onScrapSaved={async () => { location.reload(); }} />
          <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">내 스크랩 목록</h2>
          <ul className="bg-white dark:bg-gray-800 rounded shadow p-4">
            {scraps.length === 0 ? (
              <li className="text-gray-500 dark:text-gray-400">스크랩한 뉴스가 없습니다.</li>
            ) : (
              scraps.map((scrap: any) => (
                <li key={scrap.id} className="py-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700">
                  <a
                    href={scrap.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {scrap.url}
                  </a>
                  <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                    {new Date(scrap.createdAt).toLocaleString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </main>
  );
}
