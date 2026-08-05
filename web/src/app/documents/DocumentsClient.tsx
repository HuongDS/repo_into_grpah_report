"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadDocument, deleteDocument } from "@/app/actions";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  FileText,
  UploadCloud,
  Trash2,
  X,
  Search,
  FileUp,
  DownloadCloud,
  Eye,
} from "lucide-react";
import { clsx } from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const FORMAT_COLORS: Record<string, string> = {
  ".pdf": "bg-red-50 text-red-600 border-red-100",
  ".md": "bg-emerald-50 text-emerald-700 border-emerald-100",
  ".html": "bg-amber-50 text-amber-700 border-amber-100",
  ".docx": "bg-blue-50 text-blue-600 border-blue-100",
  ".doc": "bg-blue-50 text-blue-600 border-blue-100",
};

export default function DocumentsClient({
  initialDocuments,
  session,
}: {
  initialDocuments: any[];
  session: any;
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [search, setSearch] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [mdContent, setMdContent] = useState<string>("");
  const [loadingMd, setLoadingMd] = useState(false);

  const userRole = session?.user?.role;
  const userId = session?.user?.id ? parseInt(session.user.id) : null;

  const uniqueUsernames = Array.from(
    new Set(documents.map((d) => d.uploader?.username).filter(Boolean)),
  );

  const filteredDocs = documents
    .filter((doc) => {
      const matchSearch =
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        (doc.description &&
          doc.description.toLowerCase().includes(search.toLowerCase()));
      const matchUser =
        usernameFilter === "ALL" || doc.uploader?.username === usernameFilter;
      return matchSearch && matchUser;
    })
    .sort((a, b) => {
      if (sortOrder === "NEWEST")
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (sortOrder === "OLDEST")
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      return 0;
    });

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData(e.currentTarget);
      const res = await uploadDocument(formData);

      if (res?.error) {
        setErrorMsg(res.error);
      } else if (res?.success) {
        setIsUploadOpen(false);
        window.location.reload(); // Hoặc fetch lại qua server action revalidatePath
      }
    } catch (error) {
      setErrorMsg("Lỗi khi upload. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

    setDeletingId(id);
    const res = await deleteDocument(id);
    if (res?.error) {
      alert(res.error);
    } else {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto pt-4 pb-24 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10 px-6 md:px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-navy-300 text-xs font-semibold uppercase tracking-widest mb-1">
              Hệ thống bảo mật
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              Tài liệu Nội bộ
            </h1>
            <p className="text-navy-200/80 text-sm max-w-lg">
              Quản lý các tài liệu kỹ thuật, hướng dẫn và quy trình nội bộ an
              toàn.
            </p>
          </div>
          <div className="shrink-0">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 bg-white text-navy-800 px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              Tải lên tài liệu
            </button>
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-3 items-center"
      >
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tài liệu..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200 text-sm text-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 shadow-sm cursor-pointer"
          >
            <option value="ALL">Tất cả người dùng</option>
            {uniqueUsernames.map((uname) => (
              <option key={uname as string} value={uname as string}>
                {uname as string}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200 text-sm text-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 shadow-sm cursor-pointer"
          >
            <option value="NEWEST">Mới nhất trước</option>
            <option value="OLDEST">Cũ nhất trước</option>
          </select>
        </div>

        <p className="text-sm text-slate-500 whitespace-nowrap hidden lg:block">
          {filteredDocs.length} tài liệu
        </p>
      </motion.div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-400 font-medium">
            Chưa có tài liệu nào được tải lên
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc, idx) => {
            const fmtKey = doc.format?.toLowerCase() || "";
            const canDelete = userRole === "ADMIN" || doc.uploaderId === userId;

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div
                      className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                        FORMAT_COLORS[fmtKey] ||
                          "bg-slate-50 text-slate-600 border-slate-200",
                      )}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <span
                      className={clsx(
                        "text-[10px] font-bold px-2.5 py-1 rounded-md border",
                        FORMAT_COLORS[fmtKey] ||
                          "bg-slate-100 text-slate-600 border-slate-200",
                      )}
                    >
                      {doc.format?.toUpperCase().replace(".", "") || "FILE"}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base line-clamp-1 mb-1">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3 h-10">
                      {doc.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-auto pt-2 text-xs text-slate-400">
                    <span className="font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {doc.uploader?.username}
                    </span>
                    <span>•</span>
                    <span>{format(new Date(doc.createdAt), "dd/MM/yyyy")}</span>
                    {doc.size && (
                      <>
                        <span>•</span>
                        <span>{Math.round(doc.size / 1024)} KB</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-100 p-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setPreviewDoc(doc);
                      if (
                        doc.format?.toLowerCase() === ".md" ||
                        doc.format?.toLowerCase() === ".txt"
                      ) {
                        setLoadingMd(true);
                        setMdContent("");
                        fetch(doc.fileUrl)
                          .then((res) => res.text())
                          .then((text) => setMdContent(text))
                          .catch(() =>
                            setMdContent("Lỗi khi tải nội dung file."),
                          )
                          .finally(() => setLoadingMd(false));
                      }
                    }}
                    className="p-2 text-navy-600 hover:bg-navy-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Eye className="w-4 h-4" /> Xem
                  </button>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                  >
                    <DownloadCloud className="w-4 h-4" /> Tải về
                  </a>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Xóa tài liệu"
                    >
                      {deletingId === doc.id ? (
                        <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewDoc(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-4 md:px-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5 text-navy-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 line-clamp-1">
                      {previewDoc.title}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {previewDoc.format?.toUpperCase().replace(".", "") ||
                        "FILE"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors flex items-center gap-2 text-sm font-semibold px-4 hidden sm:flex"
                  >
                    <DownloadCloud className="w-4 h-4" /> Tải xuống
                  </a>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="p-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl text-slate-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-100/50 p-4 md:p-6 overflow-hidden">
                {[".jpg", ".jpeg", ".png", ".gif", ".svg"].includes(
                  previewDoc.format?.toLowerCase(),
                ) ? (
                  <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl border border-slate-200 p-2 shadow-inner">
                    <img
                      src={previewDoc.fileUrl}
                      alt={previewDoc.title}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                ) : previewDoc.format?.toLowerCase() === ".pdf" ? (
                  <iframe
                    src={previewDoc.fileUrl}
                    className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-sm"
                  />
                ) : previewDoc.format?.toLowerCase() === ".md" ||
                  previewDoc.format?.toLowerCase() === ".txt" ? (
                  <div className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-auto p-6 md-prose">
                    {loadingMd ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-4 border-navy-200 border-t-navy-600 rounded-full animate-spin"></div>
                      </div>
                    ) : previewDoc.format?.toLowerCase() === ".md" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {mdContent}
                      </ReactMarkdown>
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {mdContent}
                      </pre>
                    )}
                  </div>
                ) : (
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(previewDoc.fileUrl)}&embedded=true`}
                    className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-sm"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal (existing code) */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-extrabold text-slate-800">
                    Tải lên Tài liệu
                  </h2>
                  <button
                    onClick={() => setIsUploadOpen(false)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpload} className="space-y-5">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 font-medium text-sm">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Tiêu đề tài liệu
                    </label>
                    <input
                      required
                      type="text"
                      name="title"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none transition-all"
                      placeholder="VD: Hướng dẫn tích hợp AI"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Mô tả ngắn gọn (Tùy chọn)
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none transition-all resize-none"
                      placeholder="Mô tả nội dung tài liệu..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      File đính kèm
                    </label>
                    <div className="relative w-full">
                      <input
                        required
                        type="file"
                        name="file"
                        className="w-full px-3 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none transition-all file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100 cursor-pointer text-sm"
                        accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.md"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileUp className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(false)}
                      className="flex-1 py-3 text-slate-600 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      disabled={loading}
                      type="submit"
                      className="flex-1 py-3 bg-navy-700 text-white rounded-xl font-bold hover:bg-navy-800 transition-colors disabled:opacity-70 flex justify-center items-center gap-2 shadow-md shadow-navy-900/10"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Tải lên"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
