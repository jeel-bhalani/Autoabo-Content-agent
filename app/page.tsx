"use client";

import { useState } from "react";

export default function Home() {
  const [car, setCar] = useState("");
  const [result, setResult] = useState("");

  function handleGenerate() {
    if (!car.trim()) return;
    setResult(`Here the AI will write a post about: ${car}`);
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
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
          >
            Generate
          </button>
        </div>

        {result && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-gray-800">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}