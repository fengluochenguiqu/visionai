import { useCallback, useRef, useState } from "react";
import { Upload, Image as ImageIcon, X, ClipboardPaste } from "lucide-react";
import { useAnalysisStore } from "@/store/analysisStore";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function ImageUpload() {
  const { uploadedFile, previewUrl, setUploadedFile, setPreviewUrl, isAnalyzing } =
    useAnalysisStore();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert("仅支持 JPG、PNG、GIF、WebP 格式的图片");
        return;
      }
      if (file.size > MAX_SIZE) {
        alert("图片大小不能超过 10MB");
        return;
      }
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    },
    [setUploadedFile, setPreviewUrl]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    if (!isAnalyzing) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const file = new File([blob], "pasted-image.png", { type });
            handleFile(file);
            return;
          }
        }
      }
      alert("剪贴板中没有图片");
    } catch {
      alert("无法读取剪贴板，请手动上传");
    }
  }, [handleFile]);

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setUploadedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (previewUrl && uploadedFile) {
    return (
      <div className="relative group">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-dark-800/50">
          <img
            src={previewUrl}
            alt="预览"
            className="w-full max-h-[400px] object-contain"
          />
          {!isAnalyzing && (
            <button
              onClick={handleRemove}
              className="absolute top-3 right-3 p-2 rounded-full bg-dark-900/80 text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-dark-900/90 to-transparent">
            <p className="text-xs text-dark-300 truncate">{uploadedFile.name}</p>
            <p className="text-xs text-dark-400">
              {(uploadedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center min-h-[280px] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-accent-purple bg-accent-purple/10 scale-[1.02]"
            : "border-dark-600 bg-dark-800/30 hover:border-dark-400 hover:bg-dark-800/50"
        } ${isAnalyzing ? "pointer-events-none opacity-50" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
            isDragging
              ? "bg-accent-purple/20 scale-110"
              : "bg-dark-700/50"
          }`}
        >
          {isDragging ? (
            <Upload className="w-8 h-8 text-accent-purple animate-bounce" />
          ) : (
            <ImageIcon className="w-8 h-8 text-dark-400" />
          )}
        </div>
        <p className="text-sm text-dark-300 mb-1">
          {isDragging ? "释放以上传图片" : "拖拽图片到此处，或点击选择"}
        </p>
        <p className="text-xs text-dark-500">支持 JPG、PNG、GIF、WebP，最大 10MB</p>
      </div>

      {/* 粘贴按钮 */}
      <button
        onClick={handlePaste}
        disabled={isAnalyzing}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ClipboardPaste className="w-4 h-4" />
        从剪贴板粘贴
      </button>
    </div>
  );
}
