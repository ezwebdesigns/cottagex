'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import {
  Bold, Italic, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, List, ListOrdered,
  Heading1, Heading2, Heading3,
  Undo, Redo, Image as ImageIcon,
  Table as TableIcon, Trash2, Columns2, Rows2
} from 'lucide-react';

type TiptapEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing...'
}: TiptapEditorProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string }[]>([]);

  async function loadMedia() {
    try {
      const res = await fetch('/api/admin/library');
      if (res.ok) {
        const data = await res.json();
        const files = (data.files || []).filter((f: any) => f.mimetype?.startsWith('image/'));
        setMediaFiles(files.map((f: any) => ({ name: f.name, url: f.url })));
      }
    } catch {
      setMediaFiles([]);
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        link: false,
      }),
      BulletList.configure({
        HTMLAttributes: { class: 'list-disc ml-4' },
      }),
      OrderedList.configure({
        HTMLAttributes: { class: 'list-decimal ml-4' },
      }),
      ListItem,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#1F51C6] underline cursor-pointer' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-xl max-w-full' },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full border border-stone-300 my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-stone-100 font-bold border border-stone-300 p-2',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-stone-300 p-2',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const contentSet = useRef(false);

  useEffect(() => {
    if (!editor || !content) return;
    if (contentSet.current) return;
    editor.commands.setContent(content);
    contentSet.current = true;
  }, [content, editor]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();
    }
  };

  const ToolbarButton = ({
    onClick,
    active,
    children,
    title
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${
        active
          ? 'bg-[#1F51C6] text-white'
          : 'text-stone-600 hover:bg-stone-100'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-stone-200 bg-stone-50">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-stone-200 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-stone-200 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-stone-200 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-stone-200 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-stone-200 mx-1" />

        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Add Link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={() => { setShowMediaPicker(true); loadMedia(); }} title="Insert Image">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-stone-200 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table">
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>

        {editor.isActive('table') && (
          <>
            <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column">
              <Columns2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row">
              <Rows2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column">
              <Trash2 className="w-4 h-4 text-red-500 opacity-50 hover:opacity-100" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">
              <Trash2 className="w-4 h-4 text-red-500 opacity-50 hover:opacity-100" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">
              <Trash2 className="w-4 h-4 text-red-500" />
            </ToolbarButton>
          </>
        )}
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-stone max-w-none p-4 min-h-64 focus:outline-none prose-headings:font-serif prose-a:text-[#1F51C6] [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_td]:border [&_td]:border-stone-300 [&_td]:p-2 [&_th]:border [&_th]:border-stone-300 [&_th]:p-2 [&_th]:bg-stone-50"
      />

      {showMediaPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h3 className="font-semibold text-stone-900">Select Image</h3>
              <button onClick={() => setShowMediaPicker(false)} className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500">×</button>
            </div>
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {mediaFiles.map((file) => (
                  <button key={file.name} onClick={() => { editor.chain().focus().setImage({ src: file.url }).run(); setShowMediaPicker(false); }} className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-[#1F51C6] transition-colors">
                    <img src={file.url} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
              {mediaFiles.length === 0 && <div className="text-center py-8 text-stone-400 text-sm">No images in media library yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
