'use client';

import { useEffect, useState } from 'react';
import { Mail, Trash2, CheckCheck } from 'lucide-react';

type Message = {
  id: number;
  name: string;
  email: string;
  text: string;
  read: boolean;
  createdAt: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMessages() {
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMessages(); }, []);

  async function markRead(id: number) {
    await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchMessages();
  }

  async function deleteMessage(id: number) {
    if (!confirm('Delete this message?')) return;
    await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchMessages();
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-[#0B1B40] text-lg mb-4">Moderator Inbox ({messages.length})</h3>
        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-slate-500 text-sm">All caught up! No incoming inquiries.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map((msg) => (
              <div key={msg.id} className={`py-4 first:pt-0 last:pb-0 ${!msg.read ? 'bg-blue-50/40 -mx-6 px-6 rounded-lg' : ''}`}>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-[#0B1B40]">{msg.name}</h4>
                    <p className="text-xs text-[#1F51C6] font-medium">{msg.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                    {!msg.read && (
                      <button onClick={() => markRead(msg.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Mark as read">
                        <CheckCheck size={16} />
                      </button>
                    )}
                    <button onClick={() => deleteMessage(msg.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm bg-slate-50 p-3 rounded-xl mt-2 italic">&ldquo;{msg.text}&rdquo;</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
