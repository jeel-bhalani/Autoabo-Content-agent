"use client";

import { useState } from "react";

type Status = "draft" | "approved";

const INSTAGRAM_LIMIT = 2200;

export default function Home() {
  const [car, setCar] = useState("");
  const [post, setPost] = useState("");
  const [status, setStatus] = useState<Status>("draft");
  const [toolCalls, setToolCalls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const isApproved = status === "approved";
  const tooLong = post.length > INSTAGRAM_LIMIT;

  async function handleGenerate() {
    if (!car.trim() || loading) return;

    setLoading(true);
    setError("");
    setPost("");
    setToolCalls([]);
    setStatus("draft");
    setCopied(false);

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
        setPost(data.post);
        setToolCalls(data.toolCalls ?? []);
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(post);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Please select the text and copy it manually.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900">AutoAbo Content Agent</h1>
        <p className="mt-2 text-gray-600">
          Enter a car. The AI agent drafts a post, and you review it before publishing.
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

        {post && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {isApproved ? "✓ Approved" : "Draft: please review"}
              </span>
              <span className={`text-xs ${tooLong ? "text-red-600" : "text-gray-500"}`}>
                {post.length} / {INSTAGRAM_LIMIT} characters
              </span>
            </div>

            <textarea
              value={post}
              onChange={(e) => setPost(e.target.value)}
              readOnly={isApproved}
              rows={10}
              className={`mt-3 w-full resize-y rounded-lg border border-gray-300 p-3 text-gray-800 ${
                isApproved ? "bg-gray-50" : "bg-white"
              }`}
            />

            <div className="mt-3 flex gap-3">
              {isApproved ? (
                <>
                  <button
                    onClick={handleCopy}
                    className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                  >
                    {copied ? "Copied! ✓" : "Copy post"}
                  </button>
                  <button
                    onClick={() => setStatus("draft")}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Edit again
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setStatus("approved")}
                    disabled={!post.trim() || tooLong}
                    className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Regenerate
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}