"use client";

import { useState } from "react";
import Link from "next/link";

interface IssueFormProps {
  type: "feedback" | "bug";
}

const config = {
  feedback: {
    placeholder: "What could be improved? Any data sources we're missing? Ideas for new features?",
    buttonLabel: "Send Feedback",
    buttonClass:
      "border-blue-500/30 bg-blue-600 hover:bg-blue-500 disabled:opacity-60",
    inputBorder: "border-slate-600 focus:border-blue-500 focus:ring-blue-500/20",
    successMessage: "Thanks for your feedback! We really appreciate it.",
  },
  bug: {
    placeholder: "Describe what happened and what you expected to happen...",
    buttonLabel: "Submit Bug Report",
    buttonClass:
      "border-red-500/30 bg-red-600 hover:bg-red-500 disabled:opacity-60",
    inputBorder: "border-slate-600 focus:border-red-500 focus:ring-red-500/20",
    successMessage: "Bug report submitted! Thanks for helping us improve.",
  },
};

export default function IssueForm({ type }: IssueFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const cfg = config[type];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/submit-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, email: email.trim(), message: message.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 mb-4">
          <svg
            className="w-8 h-8 text-emerald-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-white mb-6">{cfg.successMessage}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-xl border border-slate-600 bg-slate-800 text-white transition-all duration-200 hover:bg-slate-700"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider"
        >
          Email{" "}
          <span className="text-slate-600 font-normal normal-case">(optional)</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={`w-full rounded-xl border ${cfg.inputBorder} bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all duration-200`}
          disabled={isSubmitting}
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider"
        >
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={cfg.placeholder}
          rows={5}
          required
          className={`w-full rounded-xl border ${cfg.inputBorder} bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 resize-none`}
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/"
          className="flex-1 text-center rounded-xl border border-slate-600 text-slate-300 font-semibold py-3 px-6 hover:bg-slate-800 hover:border-slate-500 transition-all duration-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className={`flex-1 rounded-xl border ${cfg.buttonClass} text-white font-bold py-3 px-6 transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer`}
        >
          {isSubmitting ? (
            <>
              <span
                className="inline-block w-4 h-4 border-[3px] border-white border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
              Submitting...
            </>
          ) : (
            cfg.buttonLabel
          )}
        </button>
      </div>
    </form>
  );
}
