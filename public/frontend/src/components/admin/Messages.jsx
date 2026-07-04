// Messages - paste from Base44
// Paste your Base44 code here.
import React, { useState } from 'react';
import { Mail, Star, Trash2, Reply } from 'lucide-react';

const initialMessages = [
  { id: 1, name: 'Sarah Mitchell', email: 'sarah.m@email.com', subject: 'Question about Pinewood Haven', preview: 'Hi! Is the cottage available for booking in August? We...', date: 'Jul 03, 2026', read: false, starred: false },
  { id: 2, name: 'Jean-François Roy', email: 'jf.roy@email.com', subject: 'Affiliate partnership inquiry', preview: 'Bonjour, I run a travel blog and would love to discuss...', date: 'Jul 02, 2026', read: false, starred: true },
  { id: 3, name: 'Emily Chen', email: 'emily.c@email.com', subject: 'Thank you for the guide!', preview: 'Just wanted to say your Ontario guide was incredibly...', date: 'Jun 28, 2026', read: true, starred: false },
  { id: 4, name: 'David Thompson', email: 'd.thompson@email.com', subject: 'Booking issue with VRBO link', preview: 'The booking button on Eagle Cliff Lodge seems to...', date: 'Jun 25, 2026', read: true, starred: false }
];

export default function Messages() {
  const [messages, setMessages] = useState(initialMessages);
  const [selected, setSelected] = useState(null);

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)]">
      {/* List */}
      <div className="w-full sm:w-80 flex-shrink-0 overflow-y-auto rounded-2xl bg-white border border-slate-100">
        <div className="px-4 py-3 border-b border-slate-100 sticky top-0 bg-white">
          <p className="text-xs text-slate-400">{messages.length} messages · {unreadCount} unread</p>
        </div>
        {messages.map((m) => (
          <button
            key={m.id}
            onClick={() => { setSelected(m); setMessages(prev => prev.map(x => x.id === m.id ? { ...x, read: true } : x)); }}
            className={`block w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${selected?.id === m.id ? 'bg-[#0f51ec]/5' : ''}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                {!m.read && <span className="w-2 h-2 rounded-full bg-[#0f51ec] flex-shrink-0" />}
                <span className={`text-sm truncate ${m.read ? 'font-medium text-[#191e3b]' : 'font-bold text-[#191e3b]'}`}>{m.name}</span>
              </div>
              {m.starred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
            </div>
            <p className="text-xs font-semibold text-[#191e3b] truncate mb-0.5">{m.subject}</p>
            <p className="text-xs text-slate-400 truncate">{m.preview}</p>
            <p className="text-[10px] text-slate-300 mt-1">{m.date}</p>
          </button>
        ))}
      </div>

      {/* Detail */}
      <div className="flex-1 hidden sm:block rounded-2xl bg-white border border-slate-100 overflow-y-auto">
        {selected ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0f51ec] to-[#77e1fb] flex items-center justify-center text-white font-bold">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{selected.name}</h3>
                  <p className="text-xs text-slate-400">{selected.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <Star className={`w-4 h-4 ${selected.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                </button>
                <button onClick={() => setMessages(prev => prev.filter(x => x.id !== selected.id))} className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
            <h2 className="text-lg font-bold text-[#191e3b] mb-2" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{selected.subject}</h2>
            <p className="text-xs text-slate-400 mb-4">{selected.date}</p>
            <div className="text-sm text-slate-600 leading-relaxed mb-6" style={{ lineHeight: 1.8 }}>
              <p>{selected.preview}</p>
              <p className="mt-3">Looking forward to hearing from you.</p>
              <p className="mt-3">Best regards,</p>
              <p>{selected.name}</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0f51ec] text-white text-sm font-semibold hover:bg-[#0d44c9] transition-colors">
                <Reply className="w-4 h-4" /> Reply
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-[#191e3b]">Select a message</p>
            <p className="text-xs text-slate-400 mt-1">Choose a conversation from the list to read</p>
          </div>
        )}
      </div>
    </div>
  );
}