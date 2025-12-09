"use client";
import { useState } from "react";

export default function ScrapInput({ onScrapSaved }: { onScrapSaved: () => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!url) {
      setError("URL을 입력하세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/scrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "저장 실패");
      } else {
        setUrl("");
        onScrapSaved();
      }
    } catch (err) {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
      <input
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="뉴스 URL 입력"
        className="flex-1 px-3 py-2 border rounded"
        disabled={loading}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "저장 중..." : "스크랩"}
      </button>
      {error && <span className="text-red-500 ml-2">{error}</span>}
    </form>
  );
}

