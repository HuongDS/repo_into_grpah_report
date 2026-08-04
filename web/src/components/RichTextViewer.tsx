'use client'

import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

export default function RichTextViewer({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true, HTMLAttributes: { class: 'text-blue-600 underline' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl max-w-full my-3 border border-slate-200' } }),
    ],
    content,
    editable: false,
    editorProps: { attributes: { class: 'prose-editor outline-none !min-h-0 !p-0' } },
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== content) editor.commands.setContent(content)
  }, [content, editor])

  return <EditorContent editor={editor} />
}
