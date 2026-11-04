import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  // --- STATE CONSOLIDATED ---
  const [searchTerm, setSearchTerm] = useState("");
  const [tradition, setTradition] = useState("Ayurveda");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [reviewedItems, setReviewedItems] = useState(new Set());

  // Auth State
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("ayulink_active_role");
    const name = localStorage.getItem("ayulink_active_name");

    if (!role) {
      navigate("/login");
    } else {
      setUserRole(role);
      setUserName(role === "Admin" ? "Sahil" : name);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("ayulink_active_role");
    localStorage.removeItem("ayulink_active_name");
    navigate("/");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true); // Tell the UI to show results

    try {
      // Fetch directly from the Python backend
      const response = await fetch("http://127.0.0.1:8000/api/map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: searchTerm,
          tradition: tradition, // Fixed variable name
        }),
      });

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (result, status) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaste_term: searchTerm, // Fixed variable name
          icd11_code: result.code,
          icd11_term: result.term,
          tradition: tradition,
          confidence_score: result.confidence,
          status: status,
        }),
      });

      if (response.ok) {
        setReviewedItems((prev) => new Set(prev).add(result.code));
      }
    } catch (error) {
      console.error("Review submission failed:", error);
    }
  };

  const getBadgeStyle = (score) => {
    if (score >= 0.33)
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 0.3) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  // Prevent rendering until auth is checked
  if (!userRole) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 mt-4 md:mt-12">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  Phase 2 ML Active
                </div>
                {userRole === "Admin" && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors shadow-sm"
                  >
                    View Admin Portal →
                  </Link>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                AyuLink Mapping Engine
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-slate-900">
                  {userName}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {userRole} Account
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-xl shadow-sm transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Search Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 relative z-20">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row items-center gap-2"
          >
            <div className="flex-1 flex items-center w-full bg-transparent px-4">
              <svg
                className="w-5 h-5 text-slate-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchTerm} // Wired up to the correct state
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search NAMASTE term (e.g., vatavyadhi)..."
                className="w-full bg-transparent border-none px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 text-lg font-medium"
              />
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-200"></div>

            <div className="flex w-full md:w-auto items-center gap-2 px-2 pb-2 md:pb-0">
              <select
                value={tradition}
                onChange={(e) => setTradition(e.target.value)}
                className="w-1/2 md:w-auto bg-transparent border-none py-3 pl-4 pr-8 text-slate-600 font-medium focus:outline-none focus:ring-0 cursor-pointer hover:text-slate-900"
              >
                <option value="Ayurveda">Ayurveda</option>
                <option value="Siddha">Siddha</option>
                <option value="Unani">Unani</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="w-1/2 md:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-3 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? "Searching..." : "Search Database"}
              </button>
            </div>
          </form>
        </section>

        {/* Results Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
          {!searched && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-5 border border-slate-100">
                <svg
                  className="w-8 h-8 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Ready for Queries
              </h3>
              <p className="text-slate-500 max-w-sm font-medium">
                Enter a NAMASTE clinical term to view semantically mapped WHO
                ICD-11 codes.
              </p>
            </div>
          )}

          {searched && !loading && results.length > 0 && (
            <div className="flex-1 flex flex-col">
              <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-2">TM2 Code</div>
                <div className="col-span-5">Mapped Term</div>
                <div className="col-span-2 text-center">Confidence Score</div>
                <div className="col-span-3 text-right">Expert Action</div>
              </div>

              <div className="divide-y divide-slate-100">
                {results.map((r, idx) => {
                  const isReviewed = reviewedItems.has(r.code);

                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-6 md:px-8 md:py-5 items-center transition-colors group ${isReviewed ? "bg-slate-50/30 opacity-70" : "hover:bg-slate-50/50"}`}
                    >
                      <div className="col-span-1 md:col-span-2">
                        <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                          {r.code}
                        </span>
                      </div>
                      <div className="col-span-1 md:col-span-5 text-slate-800 font-semibold text-base">
                        {r.term}
                      </div>
                      <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getBadgeStyle(r.confidence)}`}
                        >
                          {(r.confidence * 100).toFixed(1)}% Match
                        </span>
                      </div>
                      <div className="col-span-1 md:col-span-3 flex items-center justify-start md:justify-end gap-2 mt-4 md:mt-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                        {isReviewed ? (
                          <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Feedback Saved
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleReview(r, "REJECTED")}
                              className="text-sm font-semibold text-slate-400 hover:text-rose-600 transition-colors px-3 py-1.5"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleReview(r, "APPROVED")}
                              className="text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors px-4 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-sm"
                            >
                              Approve Mapping
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
