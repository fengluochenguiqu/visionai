// API 基础地址（开发时通过 Vite 代理，生产环境通过环境变量配置）
const API_BASE = import.meta.env.VITE_API_BASE || "";

// 分析模式类型
export type AnalyzeMode = "describe" | "object" | "scene" | "ocr" | "color";
export type AIModel = "gpt-4v" | "glm-4v";

// 分析模式配置
export const ANALYZE_MODES: Record<AnalyzeMode, { label: string; icon: string; description: string }> = {
  describe: {
    label: "智能描述",
    icon: "FileText",
    description: "详细描述图片内容",
  },
  object: {
    label: "物体识别",
    icon: "ScanSearch",
    description: "识别图中所有物体",
  },
  scene: {
    label: "场景分析",
    icon: "Mountain",
    description: "分析场景与氛围",
  },
  ocr: {
    label: "文字识别",
    icon: "Type",
    description: "提取图片中的文字",
  },
  color: {
    label: "色彩分析",
    icon: "Palette",
    description: "分析色彩构成与搭配",
  },
};

// 历史记录类型
export interface HistoryItem {
  id: string;
  image_url: string;
  mode: AnalyzeMode;
  result_summary: string;
  created_at: string;
}

export interface HistoryDetail {
  id: string;
  image_url: string;
  mode: AnalyzeMode;
  result: string;
  created_at: string;
}

export interface HistoryListResponse {
  items: HistoryItem[];
  total: number;
}

// SSE 流式分析
export async function analyzeImage(
  file: File,
  mode: AnalyzeMode,
  model: AIModel = "gpt-4v",
  onChunk: (content: string) => void,
  onDone: (id: string, mode: string) => void,
  onError: (error: string) => void
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode);
  formData.append("model", model);

  try {
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      onError(errorData.detail || `请求失败: ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError("无法读取响应流");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "chunk") {
              onChunk(parsed.content);
            } else if (parsed.type === "done") {
              onDone(parsed.id, parsed.mode);
            } else if (parsed.type === "error") {
              onError(parsed.content);
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (err) {
    onError(err instanceof Error ? err.message : "网络请求失败");
  }
}

// 获取历史列表
export async function getHistory(
  page: number = 1,
  pageSize: number = 12,
  mode?: AnalyzeMode
): Promise<HistoryListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (mode) params.append("mode", mode);

  const response = await fetch(`${API_BASE}/api/history?${params}`);
  if (!response.ok) throw new Error("获取历史记录失败");
  return response.json();
}

// 获取历史详情
export async function getHistoryDetail(id: string): Promise<HistoryDetail> {
  const response = await fetch(`${API_BASE}/api/history/${id}`);
  if (!response.ok) throw new Error("获取详情失败");
  return response.json();
}

// 删除历史记录
export async function deleteHistory(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/history/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("删除失败");
}

// 健康检查
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
