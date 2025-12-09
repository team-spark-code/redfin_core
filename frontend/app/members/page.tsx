import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MembersPage() {
  // 서버 컴포넌트에서 직접 세션 정보를 확인
  const session = await auth();
  
  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  // (더 강력한 보호는 미들웨어를 통해 구현됩니다)
  if (!session?.user) {
    redirect("/login");
  }

  // 데이터베이스에서 모든 사용자 정보를 조회 (비밀번호 제외)
  const allUsers = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: (users, { asc }) => [asc(users.name)],
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">회원 목록</h1>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  이름
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  이메일
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6">
           <Link href="/" className="font-medium text-blue-600 hover:underline">
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
