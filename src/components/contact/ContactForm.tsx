'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactForm() {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSubmitted(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setContactSubmitted(false), 5000);
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-5xl mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[#1F51C6] font-bold text-xs uppercase bg-blue-50 px-3 py-1.5 rounded-full tracking-wider font-mono">Get in Touch</span>
        <h1 className="text-3xl md:text-5xl font-bold text-[#0B1B40] mt-4 mb-3">We'd Love to Hear From You</h1>
        <p className="text-slate-500 text-base">Cottage owners, travelers, or affiliate networks — feel free to drop us a line below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-50 text-[#1F51C6] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail size={24} />
          </div>
          <h4 className="font-bold text-[#0B1B40] mb-1">Email Us</h4>
          <p className="text-sm text-slate-500 font-medium">contact@cottageescape.ca</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-50 text-[#1F51C6] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Phone size={24} />
          </div>
          <h4 className="font-bold text-[#0B1B40] mb-1">Call Us</h4>
          <p className="text-sm text-slate-500 font-medium">+1 (514) 555-0192</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-50 text-[#1F51C6] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin size={24} />
          </div>
          <h4 className="font-bold text-[#0B1B40] mb-1">Head Office</h4>
          <p className="text-sm text-slate-500 font-medium">Old Port, Montreal, QC, Canada</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-[#0B1B40] mb-6 flex items-center gap-2"><Send size={20} className="text-[#1F51C6]" /> Send a Message</h3>

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
              className="w-full px-4 py-3 rounded-full border border-slate-100 bg-[#f8fafc] focus:bg-white outline-none focus:ring-2 focus:ring-[#1F51C6]/20 focus:border-[#1F51C6] transition-all text-sm"
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
              className="w-full px-4 py-3 rounded-full border border-slate-100 bg-[#f8fafc] focus:bg-white outline-none focus:ring-2 focus:ring-[#1F51C6]/20 focus:border-[#1F51C6] transition-all text-sm"
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
              className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-[#f8fafc] focus:bg-white outline-none focus:ring-2 focus:ring-[#1F51C6]/20 focus:border-[#1F51C6] transition-all text-sm"
            />
          </div>
          <button type="submit" className="w-full bg-[#1F51C6] hover:bg-[#163FA3] text-white font-bold py-3.5 rounded-full text-sm transition-colors shadow-md">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
