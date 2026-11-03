import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-6xl mx-auto w-full">
        <div className="text-2xl font-extrabold tracking-tight text-slate-900">
          Ayu<span className="text-blue-600">Link</span>
        </div>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="text-slate-600 font-semibold hover:text-slate-900 px-4 py-2 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/login"
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl font-semibold transition-all shadow-sm"
          >
            Launch Engine
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 mt-12 md:mt-24 mb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wide mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          WHO ICD-11 TM2 Compatible
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-tight">
          Standardizing Traditional <br className="hidden md:block" />
          Medicine for the <span className="text-blue-600">Modern Grid.</span>
        </h1>

        <p className="text-xl text-slate-500 max-w-2xl font-medium mb-10 leading-relaxed">
          AyuLink uses dense vector embeddings to semantically map Ayurveda,
          Siddha, and Unani terminologies directly to global WHO healthcare
          standards in milliseconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Start Mapping Codes
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
          <a
            href="#architecture"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-sm flex items-center justify-center"
          >
            View Architecture
          </a>
        </div>
      </main>

      {/* Feature Highlights */}
      <section
        className="bg-white border-t border-slate-200 py-16 md:py-24"
        id="architecture"
      >
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 border border-blue-100">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Vector Semantic Search
            </h3>
            <p className="text-slate-500 font-medium">
              Bypasses strict keyword matching using pgvector and HuggingFace
              MiniLM-L6 transformers.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 border border-emerald-100">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Expert Review Queue
            </h3>
            <p className="text-slate-500 font-medium">
              Built-in clinical feedback loop allowing domain experts to curate
              and finalize standard mappings.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 border border-purple-100">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              100% Target Recall
            </h3>
            <p className="text-slate-500 font-medium">
              Engineered with materialized CTEs to ensure every WHO ICD-11 code
              is evaluated accurately.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
