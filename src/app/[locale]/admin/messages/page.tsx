'use client';

import { Mail } from 'lucide-react';

const sampleMessages = [
  { id: 1, name: 'John-Marc L.', email: 'john.marc@example.com', text: 'Is there a way to receive bulk affiliate discount links for group bookings in Muskoka?', date: 'Yesterday' }
];

export default function AdminMessagesPage() {
  const messages = sampleMessages;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-[#0B1B40] text-lg mb-4">Moderator Inbox ({messages.length})</h3>
        {messages.length === 0 ? (
          <p className="text-slate-500 text-sm">All caught up! No incoming inquiries.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map((msg) => (
              <div key={msg.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-[#0B1B40]">{msg.name}</h4>
                    <p className="text-xs text-[#1F51C6] font-medium">{msg.email}</p>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">{msg.date}</span>
                </div>
                <p className="text-gray-600 text-sm bg-slate-50 p-3 rounded-xl mt-2 italic">"{msg.text}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
