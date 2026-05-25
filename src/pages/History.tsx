import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  History as HistoryIcon,
  Trash2,
  Search,
  Filter,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getHistory,
  deleteHistory,
  type HistoryItem,
  type HistoryDetail,
  type AnalyzeMode,
  ANALYZE_MODES,
} from "@/services/api";
import { getHistoryDetail } from "@/services/api";

const API_BASE = import.meta.env.VITE_API_BASE || "";

const MODE_COLORS: Record<AnalyzeMode, string> = {
  describe: "bg-accent-purple/15 text-accent-purple-light",
  object: "bg-accent-blue/15 text-accent-blue-light",
  scene: "bg-accent-green/15 text-accent-green-light",
  ocr: "bg-amber-500/15 text-amber-400",
  color: "bg-pink-500/15 text-pink-400",
};

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<AnalyzeMode | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<HistoryDetail | null>(null);

  const pageSize = 12;
  const totalPages = Math.ceil(total / pageSize);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const mode = filterMode === "all" ? undefined : filterMode;
      const data = await getHistory(page, pageSize, mode);
      setItems(data.items);
      setTotal(data.total);
    } catch {
      // 静默处理错误
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterMode]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("确定删除此记录？")) return;
    try {
      await deleteHistory(id);
      fetchHistory();
    } catch {
      alert("删除失败");
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const detail = await getHistoryDetail(id);
      setSelectedItem(detail);
    } catch {
      alert("获取详情失败");
    }
  };

  const filteredItems = searchQuery
    ? items.filter(
        (item) =>
          item.result_summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ANALYZE_MODES[item.mode]?.label.includes(searchQuery)
      )
    : items;

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white mb-2">
            历史记录
          </h1>
          <p className="text-dark-400 text-sm">
            查看和管理你的图像分析历史
          </p>
        </div>

        {/* 筛选栏 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          {/* 搜索 */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="搜索分析记录..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800/50 border border-white/5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-accent-purple/30 transition-colors"
            />
          </div>

          {/* 模式筛选 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-dark-500" />
            <select
              value={filterMode}
              onChange={(e) => {
                setFilterMode(e.target.value as AnalyzeMode | "all");
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-dark-800/50 border border-white/5 text-sm text-dark-300 focus:outline-none focus:border-accent-purple/30 transition-colors appearance-none cursor-pointer"
            >
              <option value="all">全部模式</option>
              {(Object.entries(ANALYZE_MODES) as [AnalyzeMode, (typeof ANALYZE_MODES)[AnalyzeMode]][]).map(
                ([mode, config]) => (
                  <option key={mode} value={mode}>
                    {config.label}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* 历史列表 */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <HistoryIcon className="w-12 h-12 text-dark-600 mb-4" />
            <p className="text-dark-400 mb-2">暂无分析记录</p>
            <Link
              to="/analyze"
              className="text-accent-purple-light text-sm hover:underline"
            >
              去分析一张图片
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleViewDetail(item.id)}
                  className="card-hover group p-4 rounded-2xl bg-dark-800/30 border border-white/5 cursor-pointer"
                >
                  {/* 缩略图 */}
                  <div className="relative rounded-xl overflow-hidden mb-3 aspect-video bg-dark-800">
                    <img
                      src={`${API_BASE}${item.image_url}`}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* 信息 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${
                          MODE_COLORS[item.mode] || "bg-dark-700 text-dark-300"
                        }`}
                      >
                        {ANALYZE_MODES[item.mode]?.label || item.mode}
                      </span>
                      <p className="text-dark-400 text-xs mt-2 line-clamp-2">
                        {item.result_summary || "无摘要"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-dark-500 text-xs">
                    <Clock className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleString("zh-CN")}
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-dark-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[80vh] bg-dark-900 rounded-2xl border border-white/10 overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                    MODE_COLORS[selectedItem.mode] || "bg-dark-700 text-dark-300"
                  }`}
                >
                  {ANALYZE_MODES[selectedItem.mode]?.label || selectedItem.mode}
                </span>
                <span className="text-dark-500 text-xs">
                  {new Date(selectedItem.created_at).toLocaleString("zh-CN")}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(80vh - 60px)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 图片 */}
                <div className="rounded-xl overflow-hidden bg-dark-800">
                  <img
                    src={`${API_BASE}${selectedItem.image_url}`}
                    alt=""
                    className="w-full h-auto object-contain"
                  />
                </div>

                {/* 分析结果 */}
                <div className="markdown-content text-sm">
                  {selectedItem.result.split("\n").map((line, i) => {
                    if (!line.trim()) return <br key={i} />;
                    if (line.startsWith("### "))
                      return <h3 key={i}>{line.slice(4)}</h3>;
                    if (line.startsWith("## "))
                      return <h2 key={i}>{line.slice(3)}</h2>;
                    if (line.startsWith("# "))
                      return <h1 key={i}>{line.slice(2)}</h1>;
                    if (line.startsWith("- ") || line.startsWith("* "))
                      return (
                        <div key={i} className="flex gap-2 ml-2">
                          <span className="text-accent-purple">•</span>
                          <span>{line.slice(2)}</span>
                        </div>
                      );
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
