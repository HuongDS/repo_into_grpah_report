'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  url: string
  format: string
  title: string
}

export default function DocumentViewer({ isOpen, onClose, url, format, title }: DocumentViewerProps) {
  const [mdContent, setMdContent] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  // Fetch markdown content if it's a .md file
  useEffect(() => {
    if (isOpen && format === '.md' && url) {
      setLoading(true)
      fetch(url)
        .then(res => res.text())
        .then(text => {
          setMdContent(text)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setMdContent('Lỗi khi tải nội dung file Markdown.')
          setLoading(false)
        })
    }
  }, [isOpen, format, url])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )
    }

    if (format === '.pdf' || format === '.html') {
      return (
        <iframe 
          src={url} 
          className="w-full h-full border-0 bg-white"
          title={title}
        />
      )
    }

    if (format === '.md') {
      return (
        <div className="p-8 max-w-4xl mx-auto prose prose-blue prose-slate md:prose-lg w-full h-full overflow-y-auto bg-white custom-scrollbar">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {mdContent}
          </ReactMarkdown>
        </div>
      )
    }

    // Fallback for docx or other formats
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
          <Download className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">Không hỗ trợ xem trước định dạng này</h3>
        <p className="text-slate-500 max-w-md">Trình xem tích hợp hiện chỉ hỗ trợ PDF, HTML và Markdown. Vui lòng tải xuống hoặc mở trong tab mới để xem file.</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 mt-4"
        >
          <ExternalLink className="w-5 h-5" />
          Mở file gốc
        </a>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="relative w-full max-w-7xl h-[95vh] bg-slate-50 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-white border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3 pr-4 truncate">
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md uppercase tracking-wide shrink-0">
                  {format}
                </span>
                <h2 className="font-bold text-slate-800 truncate" title={title}>{title}</h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors hidden md:flex"
                  title="Mở tab mới"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden relative bg-slate-50">
              {renderContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
