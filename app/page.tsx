"use client";

import { useState } from "react";

export default function Home() {
  const [car, setCar] = useState("");
  const [result, setResult] = useState("");
  const [toolCalls, setToolCalls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!car.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult("");
    setToolCalls([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ car }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data.post);
        setToolCalls(data.toolCalls ?? []);
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900">AutoAbo Content Agent</h1>
        <p className="mt-2 text-gray-600">
          Enter a car and the AI agent writes a social media post for it.
        </p>

        <div className="mt-8 flex gap-3">
          <input
            type="text"
            value={car}
            onChange={(e) => setCar(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="e.g. VW ID.4 2024"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Agent working..." : "Generate"}
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {toolCalls.length > 0 && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-100 p-4 text-sm text-gray-700">
            <p className="font-medium">🔧 Agent steps</p>
            <ul className="mt-2 list-disc pl-5 font-mono">
              {toolCalls.map((call, index) => (
                <li key={index}>{call}</li>
              ))}
            </ul>
          </div>
        )}

        {result && (
          <div className="mt-4 whitespace-pre-wrap rounded-lg border border-gray-200 bg-white p-4 text-gray-800">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}