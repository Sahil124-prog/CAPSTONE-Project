import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const [reviews, setReviews] = useState([]);
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [stats, setStats] = useState({
    total_namaste_terms: 0,
    confirmed_mappings: 0,
    coverage_pct: "0.0",
    total_queries: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("ayulink_active_role");
    if (role !== "Admin") {
      navigate("/dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Python ML data AND Node.js Audit Stats concurrently
        const [revRes, prioRes, statsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/reviews").catch(() => null),
          fetch("http://127.0.0.1:8000/api/priority/unreviewed").catch(
            () => null,
          ),
          fetch("http://localhost:5002/api/audit/stats").catch(() => null),
        ]);

        const revData = revRes ? await revRes.json() : { reviews: [] };
        const prioData = prioRes ? await prioRes.json() : { unreviewed: [] };
        const statsData = statsRes ? await statsRes.json() : null;

        setReviews(revData.reviews || []);
        setPriorityQueue(prioData.unreviewed || []);
        if (statsData && !statsData.error) {
          setStats(statsData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Recharts Data Prep
  const approvedCount = reviews.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = reviews.filter((r) => r.status === "REJECTED").length;

  const coverageData = [
    { name: "Mapped", value: stats.confirmed_mappings },
    {
      name: "Unmapped",
      value: stats.total_namaste_terms - stats.confirmed_mappings,
    },
  ];
  const COLORS = ["#10b981", "#f1f5f9"];

  const reviewChartData = [
    { name: "Approved", count: approvedCount, fill: "#10b981" },
    { name: "Rejected", count: rejectedCount, fill: "#f43f5e" },
  ];

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
                Phase 9 Admin Portal
              </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
              AyuLink Analytics
            </h1>
            <p className="text-slate-500 font-medium">
              Live mapping progress, gold set metrics, and active learning
              feedback loop.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            Logout
          </button>
        </header>

        {/* Phase 9 Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
              Total System Queries
            </div>
            <div className="text-4xl font-black text-slate-900">
              {stats.total_queries}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center">
            <div className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">
              Gold Set (Approved)
            </div>
            <div className="text-4xl font-black text-emerald-700">
              {approvedCount}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-center">
            <div className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-1">
              Rejected (Filtered)
            </div>
            <div className="text-4xl font-black text-rose-700">
              {rejectedCount}
            </div>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl shadow-sm flex flex-col justify-center text-white">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
              DB Coverage
            </div>
            <div className="text-4xl font-black text-white">
              {stats.coverage_pct}%
            </div>
          </div>
        </div>

        {/* Phase 9 Recharts Visualizations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Coverage Pie Chart */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">
              Overall Database Coverage
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coverageData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {coverageData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm font-medium text-slate-500">
              {stats.confirmed_mappings} out of {stats.total_namaste_terms}{" "}
              NAMASTE terms successfully mapped to ICD-11
            </div>
          </section>

          {/* Expert Feedback Bar Chart */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">
              Expert Review Distribution
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reviewChartData}
                  margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Priority Review Queue */}
        <section className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden flex flex-col">
          <div className="px-8 py-5 border-b border-amber-100 bg-amber-50/50 flex justify-between items-center">
            <h3 className="font-bold text-amber-900">
              Priority Review Queue (Top Unmapped Searches)
            </h3>
          </div>
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              Loading queue...
            </div>
          ) : priorityQueue.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              No pending terms in the queue. All caught up!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-4">Priority Rank</th>
                    <th className="px-8 py-4">NAMASTE Term</th>
                    <th className="px-8 py-4 text-right">Search Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {priorityQueue.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-amber-50/30 transition-colors"
                    >
                      <td className="px-8 py-4 font-bold text-slate-400">
                        #{idx + 1}
                      </td>
                      <td className="px-8 py-4 font-bold text-slate-900">
                        {item.term}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className="bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full border border-rose-100">
                          {item.query_count} queries
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Reviews Data Table (Gold Set) */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mb-12">
          <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Expert Feedback</h3>
            <button
              onClick={handleExportCSV}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-100"
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
                      <td className="px-8 py-4">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded border border-slate-200">
                          {(r.confidence_score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span
                          className={`inline-flex font-bold px-3 py-1 rounded-full text-xs border ${r.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}
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


