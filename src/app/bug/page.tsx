import IssueForm from "@/components/IssueForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Report a Bug — Australia Fuel Supply Tracker" };

export default function BugPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <main className="container mx-auto px-4 py-12 max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-2xl border border-red-500/30 mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Report a Bug</h1>
          <p className="text-slate-400">
            Something not working right? Let us know and we&apos;ll fix it.
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 md:p-8">
          <IssueForm type="bug" />
        </div>
      </main>
    </div>
  );
}
