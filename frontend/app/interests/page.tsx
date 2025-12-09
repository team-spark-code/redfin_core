'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserInterests } from '@/lib/actions/user';

const INTEREST_OPTIONS = [
  { id: 'economy', label: '경제', icon: '💼' },
  { id: 'science', label: '과학', icon: '🔬' },
  { id: 'art', label: '미술', icon: '🎨' },
  { id: 'technology', label: '기술', icon: '💻' },
  { id: 'sports', label: '스포츠', icon: '⚽' },
  { id: 'health', label: '건강', icon: '🏥' },
  { id: 'travel', label: '여행', icon: '✈️' },
  { id: 'food', label: '음식', icon: '🍽️' },
  { id: 'music', label: '음악', icon: '🎵' },
  { id: 'books', label: '도서', icon: '📚' },
  { id: 'movies', label: '영화', icon: '🎬' },
  { id: 'fashion', label: '패션', icon: '👗' },
];

export default function InterestsPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      alert('최소 하나 이상의 관심사를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserInterests(selectedInterests);
      router.push('/'); // 메인 페이지로 리다이렉트
    } catch (error) {
      console.error('관심사 저장 실패:', error);
      alert('관심사 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/'); // 건너뛰고 메인 페이지로
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            관심사를 선택해주세요
          </h1>
          <p className="text-gray-600">
            관심사를 선택하시면 맞춤형 RSS 피드를 제공해드립니다.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest.id}
                onClick={() => handleInterestToggle(interest.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedInterests.includes(interest.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{interest.icon}</div>
                <div className="font-medium">{interest.label}</div>
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={handleSkip}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              나중에 설정
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                메인페이지로 이동
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedInterests.length === 0}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  selectedInterests.length > 0 && !isSubmitting
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? '저장 중...' : `완료 (${selectedInterests.length}개 선택)`}
              </button>
            </div>
          </div>
        </div>

        {selectedInterests.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <h3 className="font-medium text-gray-900 mb-2">선택된 관심사:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedInterests.map((interestId) => {
                const interest = INTEREST_OPTIONS.find(opt => opt.id === interestId);
                return (
                  <span
                    key={interestId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {interest?.icon} {interest?.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
