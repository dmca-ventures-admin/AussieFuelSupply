import IssueForm from "@/components/IssueForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Share Feedback — Australia Fuel Supply Tracker" };

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <main className="container mx-auto px-4 py-12 max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl border border-blue-500/30 mb-4">
            <svg
              className="w-8 h-8 text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Share Feedback</h1>
          <p className="text-slate-400">
            Missing a data source? Want a new feature? We&apos;d love to hear from you.
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 md:p-8">
          <IssueForm type="feedback" />
        </div>
      </main>
    </div>
  );
}
