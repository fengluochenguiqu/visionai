import { create } from "zustand";
import type { AnalyzeMode, AIModel } from "@/services/api";

interface AnalysisState {
  // 当前分析状态
  isAnalyzing: boolean;
  currentMode: AnalyzeMode;
  currentModel: AIModel;
  result: string;
  resultId: string | null;
  error: string | null;

  // 上传的图片
  uploadedFile: File | null;
  previewUrl: string | null;

  // 操作方法
  setMode: (mode: AnalyzeMode) => void;
  setModel: (model: AIModel) => void;
  setUploadedFile: (file: File | null) => void;
  setPreviewUrl: (url: string | null) => void;
  startAnalysis: () => void;
  appendResult: (content: string) => void;
  finishAnalysis: (id: string) => void;
  setError: (error: string | null) => void;
  resetAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  isAnalyzing: false,
  currentMode: "describe",
  currentModel: "glm-4v",
  result: "",
  resultId: null,
  error: null,
  uploadedFile: null,
  previewUrl: null,

  setMode: (mode) => set({ currentMode: mode }),
  setModel: (model) => set({ currentModel: model }),
  setUploadedFile: (file) => set({ uploadedFile: file }),
  setPreviewUrl: (url) => set({ previewUrl: url }),

  startAnalysis: () =>
    set({
      isAnalyzing: true,
      result: "",
      resultId: null,
      error: null,
    }),

  appendResult: (content) =>
    set((state) => ({
      result: state.result + content,
    })),

  finishAnalysis: (id) =>
    set({
      isAnalyzing: false,
      resultId: id,
    }),

  setError: (error) =>
    set({
      isAnalyzing: false,
      error,
    }),

  resetAnalysis: () =>
    set({
      isAnalyzing: false,
      result: "",
      resultId: null,
      error: null,
      uploadedFile: null,
      previewUrl: null,
    }),
}));
