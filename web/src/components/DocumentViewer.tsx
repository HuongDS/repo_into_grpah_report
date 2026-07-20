'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Download, Loader2, Eye, AlertCircle } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  url: string
  format: string
  title: string
  uploader?: string
  uploadDate?: string
}

const formatColorMap: Record<string, { bg: string; text: string; border: string }> = {
  '.pdf': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
  '.md': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  '.html': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  '.docx': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
}

export default function DocumentViewer({
  isOpen,
  onClose,
  url,
  format,
  title,
  uploader,
  uploadDate,
}: DocumentViewerProps) {
  const [mdContent, setMdContent] = useState<string>('')
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fmt = format?.toLowerCase() || ''
  const colorScheme = formatColorMap[fmt] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' }

  // Prevent scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  // Clear state on open
  useEffect(() => {
    if (!isOpen) {
      setMdContent('')
      setHtmlContent('')
      setError(null)
      setLoading(false)
      return
    }

    if (fmt === '.md' || fmt === '.html') {
      setLoading(true)
      setError(null)
      fetch(url)
        .then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.text()
        })
        .then(text => {
          if (fmt === '.md') setMdContent(text)
          if (fmt === '.html') setHtmlContent(text)
        })
        .catch(err => {
          setError('Không thể tải nội dung file. Vui lòng thử mở trong tab mới.')
          console.error(err)
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, url, fmt])

  // Close on ESC key
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Đang tải tài liệu...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Không thể hiển thị tài liệu</h3>
            <p className="text-slate-500 max-w-sm">{error}</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <ExternalLink className="w-4 h-4" />
            Mở trong tab mới
          </a>
        </div>
      )
    }

    // PDF: embed directly
    if (fmt === '.pdf') {
      return (
        <iframe
          src={`${url}#toolbar=1&navpanes=1&view=FitH`}
          className="w-full h-full border-0"
          title={title}
          allow="fullscreen"
        />
      )
    }

    // HTML: render with srcdoc so it renders, not shows source
    if (fmt === '.html') {
      if (!htmlContent) return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )
      return (
        <iframe
          srcDoc={htmlContent}
          className="w-full h-full border-0 bg-white"
          title={title}
          sandbox="allow-scripts allow-same-origin"
        />
      )
    }

    // MD: beautiful formatted output
    if (fmt === '.md') {
      if (!mdContent && !loading) return null
      return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-white">
          <div className="max-w-3xl mx-auto px-6 py-10 md:px-12 md:py-12">
            <div className="md-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {mdContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )
    }

    // Fallback
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center">
          <Download className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Định dạng chưa hỗ trợ xem trực tiếp</h3>
          <p className="text-slate-500 max-w-sm">Trình xem hỗ trợ PDF, HTML và Markdown. Vui lòng mở file trong tab mới để xem nội dung.</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          Mở file gốc
        </a>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative w-full md:max-w-6xl h-[92vh] md:h-[90vh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-slate-100 shrink-0 bg-white/95 backdrop-blur-sm">
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border shrink-0 ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`}>
                  {format}
                </span>
                <div className="min-w-0">
                  <h2 className="font-bold text-slate-800 truncate text-sm md:text-base" title={title}>{title}</h2>
                  {(uploader || uploadDate) && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {uploader && <span>Đăng bởi <span className="font-semibold text-slate-500">{uploader}</span></span>}
                      {uploader && uploadDate && <span className="mx-1.5">·</span>}
                      {uploadDate && <span>{uploadDate}</span>}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mở trong tab mới"
                  className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Đóng (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden bg-slate-50 relative">
              {renderContent()}
            </div>

            {/* Mobile drag handle */}
            <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-200 rounded-full" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
