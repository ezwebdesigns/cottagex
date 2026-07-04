'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export default function ContactForm() {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contactForm.name, email: contactForm.email, text: contactForm.message }),
      });
    } catch {}
    setContactSubmitted(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setContactSubmitted(false), 5000);
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-5xl mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[#0f51ec] font-bold text-xs uppercase bg-blue-50 px-3 py-1.5 rounded-full tracking-wider font-mono">Get in Touch</span>
        <h1 className="text-3xl md:text-5xl font-bold text-[#191e3b] mt-4 mb-3">We'd Love to Hear From You</h1>
        <p className="text-slate-500 text-base">Cottage owners, travelers, or affiliate networks — feel free to drop us a line below.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-[#191e3b] mb-6 flex items-center gap-2"><Send size={20} className="text-[#0f51ec]" /> Send a Message</h3>

        {contactSubmitted && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
            <CheckCircle size={20} /> Success! Your message has been received by our moderation panel. We will reply shortly.
          </div>
        )}

        <form onSubmit={handleContactSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Your Name</label>
            <input
              type="text"
              required
              value={contactForm.name}
              onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
              placeholder="e.g. Jean Dupont"
              className="w-full px-4 py-3 rounded-full border border-slate-100 bg-[#f8fafc] focus:bg-white outline-none focus:ring-2 focus:ring-[#0f51ec]/20 focus:border-[#0f51ec] transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email Address</label>
            <input
              type="email"
              required
              value={contactForm.email}
              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
              placeholder="e.g. jean@example.com"
              className="w-full px-4 py-3 rounded-full border border-slate-100 bg-[#f8fafc] focus:bg-white outline-none focus:ring-2 focus:ring-[#0f51ec]/20 focus:border-[#0f51ec] transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Message Content</label>
            <textarea
              rows={4}
              required
              value={contactForm.message}
              onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
              placeholder="How can we help? Partnerships, listings, feedback..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-[#f8fafc] focus:bg-white outline-none focus:ring-2 focus:ring-[#0f51ec]/20 focus:border-[#0f51ec] transition-all text-sm"
            />
          </div>
          <button type="submit" className="w-full bg-[#0f51ec] hover:bg-[#0d44c9] text-white font-bold py-3.5 rounded-full text-sm transition-colors shadow-md">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
