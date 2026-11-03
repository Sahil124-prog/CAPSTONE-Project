import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function AdminDashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("ayulink_active_role");
    if (role !== "Admin") {
      navigate("/dashboard"); // Kick non-admins back to the standard dashboard
      return;
    }

    const fetchReviews = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/reviews");
        const data = await response.json();
        setReviews(data.reviews || []);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("ayulink_active_role");
    localStorage.removeItem("ayulink_active_name");
    navigate("/");
  };

  const handleExportCSV = () => {
    const headers = [
      "NAMASTE Term",
      "Target ICD-11",
      "Tradition",
      "Model Confidence",
      "Expert Status",
    ];
    const csvData = reviews.map((r) =>
      [
        `"${r.namaste_term}"`,
        `"${r.icd11_code}"`,
        `"${r.tradition}"`,
        `${(r.confidence_score * 100).toFixed(1)}%`,
        `"${r.status}"`,
      ].join(","),
    );

    const csvContent = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ayulink_gold_set.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate Metrics
  const totalReviews = reviews.length;
  const approved = reviews.filter((r) => r.status === "APPROVED").length;
  const rejected = reviews.filter((r) => r.status === "REJECTED").length;
  const precisionRate =
    totalReviews > 0 ? ((approved / totalReviews) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 mt-4 md:mt-8">
        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                ← Back to Mapping Engine
              </Link>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wide">
                Admin Portal
              </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
              Gold Set Curation
            </h1>
            <p className="text-slate-500 font-medium">
              Evaluate expert feedback and generate dataset statistics for
              capstone metrics.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            Logout
          </button>
        </header>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
              Total Mappings Reviewed
            </div>
            <div className="text-4xl font-black text-slate-900">
              {totalReviews}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center">
            <div className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">
              Approved (Gold Set)
            </div>
            <div className="text-4xl font-black text-emerald-700">
              {approved}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-center">
            <div className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-1">
              Rejected (Recalibrate)
            </div>
            <div className="text-4xl font-black text-rose-700">{rejected}</div>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl shadow-sm flex flex-col justify-center text-white">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
              System Precision
            </div>
            <div className="text-4xl font-black text-white">
              {precisionRate}%
            </div>
          </div>
        </div>

        {/* Reviews Data Table */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Expert Feedback</h3>
            <button
              onClick={handleExportCSV}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
            >
              Export to CSV
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              Loading dataset...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              No reviews have been submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-4">NAMASTE Term</th>
                    <th className="px-8 py-4">Target ICD-11</th>
                    <th className="px-8 py-4">Tradition</th>
                    <th className="px-8 py-4">Model Confidence</th>
                    <th className="px-8 py-4 text-right">Expert Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-4 font-semibold text-slate-800">
                        {r.namaste_term}
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-700">
                            {r.icd11_code}
                          </span>
                          <span className="text-slate-500 text-xs truncate max-w-[250px]">
                            {r.icd11_term}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-slate-600 font-medium">
                        {r.tradition}
                      </td>
                      <td className="px-8 py-4">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded border border-slate-200">
                          {(r.confidence_score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span
                          className={`inline-flex font-bold px-3 py-1 rounded-full text-xs border ${
                            r.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
