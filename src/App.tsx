/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Rocket, 
  Users, 
  Target, 
  TrendingUp, 
  Search, 
  ShieldCheck, 
  Zap,
  CheckCircle2,
  Mail,
  LayoutDashboard,
  UserPlus,
  BarChart3,
  Database,
  LogOut,
  ChevronRight,
  Plus,
  Loader2,
  AlertCircle,
  PieChart,
  Trash2
} from 'lucide-react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import { supabase } from './lib/supabase';

// Types
interface WaitlistEntry {
  id: string;
  fullName: string;
  email: string;
  role: 'founder' | 'investor';
  companyName?: string;
  submittedAt: string;
}

// Local helper just for Admin reading if needed (or we fetch from DB)
// For now, let's just keep the types if AdminPage still uses them, but submissions go to Supabase.

// Design Constants
const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const STAGGER = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const StartHubLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3F3DBC" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" stroke="url(#logoGradient)" strokeWidth="8" />
    <path 
      d="M62 22L38 43C38 43 32 48 35 53L48 55L40 80L64 59C64 59 70 54 67 49L54 47L62 22Z" 
      fill="url(#logoGradient)" 
    />
  </svg>
);

const WaitlistForm = ({ id, onAdd }: { id: string, onAdd?: (entry: WaitlistEntry) => void }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'founder' | 'investor' | ''>('');
  const [companyName, setCompanyName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please provide a valid business or personal email address');
      return;
    }

    const localPart = email.split('@')[0].toLowerCase();
    const domainPart = email.split('@')[1]?.toLowerCase();
    const vowels = localPart.match(/[aeiouy]/g) || [];
    
    if (localPart.length < 4) {
      setError('Your email looks a bit too short. Please use a standard address.');
      return;
    }

    if (localPart.length > 8 && vowels.length / localPart.length < 0.25) {
      setError('Please provide a valid, recognizable email address.');
      return;
    }

    if (['gmil.com', 'gmai.com', 'gnail.com'].includes(domainPart)) {
      setError('Did you mean gmail.com?');
      return;
    }

    if (!role) {
      setError('Please select your primary role');
      return;
    }

    if (role === 'founder' && !companyName.trim()) {
      setError('Please enter your company name');
      return;
    }
    
    setIsLoading(true);
    
    // Save to the correct Supabase table based on role
    const tableName = role === 'founder' ? 'founders' : 'investors';
    const insertData = role === 'founder'
      ? { full_name: fullName, email, startup_name: companyName }
      : { full_name: fullName, email };

    const { error: submitError } = await supabase
      .from(tableName)
      .insert([insertData]);

    if (submitError) {
      if (submitError.code === '23505') {
        setError('This email is already on the waitlist.');
      } else {
        setError('An error occurred while joining. Please try again.');
        console.error(submitError);
      }
      setIsLoading(false);
      return;
    }

    if (onAdd) {
      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        fullName,
        email,
        role: role as 'founder' | 'investor',
        companyName: role === 'founder' ? companyName : undefined,
        submittedAt: new Date().toISOString()
      });
    }

    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div id={id} className="w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-starthub/5 text-left space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-starthub/20 focus:border-starthub transition-all bg-gray-50/50 text-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-starthub/20 focus:border-starthub transition-all bg-gray-50/50 text-gray-900"
                />
                <p className="text-[10px] text-gray-400 ml-1">Work email is preferred for priority access</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('founder')}
                  className={`py-3 px-4 rounded-xl border-2 transition-all font-medium flex items-center justify-center gap-2 ${
                    role === 'founder' 
                      ? 'border-starthub bg-starthub-light text-starthub' 
                      : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <Rocket className="w-4 h-4" />
                  Founder
                </button>
                <button
                  type="button"
                  onClick={() => setRole('investor')}
                  className={`py-3 px-4 rounded-xl border-2 transition-all font-medium flex items-center justify-center gap-2 ${
                    role === 'investor' 
                      ? 'border-starthub bg-starthub-light text-starthub' 
                      : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Investor
                </button>
              </div>
            </div>

            <AnimatePresence>
              {role === 'founder' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-sm font-semibold text-gray-700 ml-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-starthub/20 focus:border-starthub transition-all bg-gray-50/50 text-gray-900"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="text-red-500 text-sm font-medium ml-1"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading || !role}
              className="w-full bg-starthub text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-starthub-dark disabled:opacity-50 transition-all shadow-lg shadow-starthub/20 mt-2"
            >
              {isLoading ? 'Reserving your spot...' : 'Join Priority Waitlist'}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
            <p className="text-center text-xs text-gray-400">
              No spam. Priority access only.
            </p>
          </motion.form>
        ) : (
          <motion.div 
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-50 text-green-700 p-8 rounded-[2rem] border border-green-100 flex flex-col items-center text-center gap-4 shadow-xl shadow-green-500/5 col-span-full"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-2xl font-bold mb-2">🎉 Welcome to StartHub. You're among the earliest members.</p>
              <p className="text-green-800/70">We'll reach out soon with your access details.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Shared Layout Components & Legal/Company Pages ---

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleJoinClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById('waitlist-top')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#waitlist-top');
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <StartHubLogo className="w-9 h-9" />
          <span className="font-bold text-xl tracking-tight text-starthub-dark">StartHub</span>
        </Link>
        <div className="flex items-center gap-4">
          <motion.a 
            href="#waitlist-top"
            onClick={handleJoinClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm font-semibold bg-starthub-dark text-white px-5 py-2.5 rounded-full shadow-lg shadow-starthub/10 hover:shadow-starthub/20 transition-all cursor-pointer"
          >
            Join Waitlist
          </motion.a>
        </div>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="py-20 border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <StartHubLogo className="w-8 h-8" />
              <span className="font-bold text-xl tracking-tight text-starthub-dark">StartHub</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Redefining the early-stage investment landscape by connecting ambitious founders with a global network of micro-investors.
            </p>
            <div className="flex gap-4">
              <a href="https://x.com/starthub48" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-starthub hover:text-white transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/starthub-network-private-limited/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-starthub hover:text-white transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="https://www.instagram.com/starthubofficial_/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-starthub hover:text-white transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-starthub-dark mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/about" className="hover:text-starthub transition-colors font-medium">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-starthub transition-colors font-medium">Contact Us</Link></li>
              <li><Link to="/vision" className="hover:text-starthub transition-colors font-medium">Our Vision</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-starthub-dark mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/privacy" className="hover:text-starthub transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-starthub transition-colors font-medium">Terms & Conditions</Link></li>
              <li><Link to="/cookies" className="hover:text-starthub transition-colors font-medium">Cookie Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-starthub-dark mb-6">Get in Touch</h4>
            <div className="space-y-4">
              <a href="mailto:starthub48@gmail.com" className="flex items-center gap-3 text-sm text-gray-500 hover:text-starthub transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-starthub-light flex items-center justify-center text-starthub group-hover:bg-starthub group-hover:text-white transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                starthub48@gmail.com
              </a>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Location</p>
                <p className="text-sm text-starthub-dark font-medium leading-relaxed">
                  StartHub Network Private Limited
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-xs">
            © 2026 StartHub Network Private Limited. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs font-medium text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const PageWrapper = ({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col pt-24 text-left">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-starthub-dark mb-3">{title}</h1>
          <p className="text-sm text-gray-400 font-medium mb-12">{subtitle}</p>
          <div className="text-gray-600 leading-relaxed space-y-8 text-[15px]">
            {children}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

const AboutPage = () => {
  return (
    <PageWrapper title="About Us" subtitle="Democratizing venture capital globally.">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">Our Mission</h2>
        <p>
          At StartHub, we are on a mission to democratize the early-stage investment landscape. For decades, access to high-potential startups and capital has been closely guarded by centralized gatekeepers, geographic borders, and localized networks. We believe that genius is distributed globally, but opportunity is not. We are building the infrastructure to bridge this gap.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">Bridging Founders & Micro-Investors</h2>
        <p>
          We connect ambitious, early-stage founders with a dynamic, international network of micro-investors. Founders receive crucial pre-seed backing and supportive networks without high-friction negotiation cycles, while micro-investors get vetted, structured access to pioneering startups that were once out of reach.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">Our Story</h2>
        <p>
          Founded in 2026, StartHub began as a simple vision: to eliminate the heavy pitch overhead and geographical friction out of pre-seed funding. Today, we are designing a secure, schema-driven environment that connects global entrepreneurs with micro-angels, scaling ecosystems one waitlist, one connection, and one venture at a time.
        </p>
      </section>
    </PageWrapper>
  );
};

const ContactPage = () => {
  return (
    <PageWrapper title="Contact Us" subtitle="We'd love to hear from you.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-starthub-dark">Get in Touch</h2>
            <p>
              Have questions about our pre-market waitlist, technology stack, or partnership opportunities? Reach out to us directly, and our support team will get back to you within 24 hours.
            </p>
          </section>

          <div className="space-y-4">
            <a href="mailto:starthub48@gmail.com" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-starthub hover:shadow-sm transition-all group">
              <div className="w-10 h-10 rounded-xl bg-starthub-light flex items-center justify-center text-starthub group-hover:bg-starthub group-hover:text-white transition-all">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Us</p>
                <p className="text-sm font-semibold text-starthub-dark">starthub48@gmail.com</p>
              </div>
            </a>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-starthub-light flex items-center justify-center text-starthub">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Corporate Headquarters</p>
                <p className="text-sm font-semibold text-starthub-dark">StartHub Network Private Limited</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-starthub-dark">Quick Query</h3>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Thank you! Your query has been submitted."); }}>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Name</label>
              <input type="text" placeholder="John Doe" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-starthub/20 focus:border-starthub bg-gray-50/50 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email</label>
              <input type="email" placeholder="john@example.com" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-starthub/20 focus:border-starthub bg-gray-50/50 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Message</label>
              <textarea placeholder="Write your query..." rows={4} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-starthub/20 focus:border-starthub bg-gray-50/50 text-sm resize-none" />
            </div>
            <button type="submit" className="w-full py-3.5 rounded-xl bg-starthub text-white font-bold hover:bg-starthub-dark transition-all shadow-md shadow-starthub/15 text-sm">Send Message</button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

const VisionPage = () => {
  return (
    <PageWrapper title="Our Vision" subtitle="A decentralized and accessible future for startup financing.">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">1. Borderless Matchmaking</h2>
        <p>
          Our vision is to build an environment where geographic boundaries are obsolete. Whether you are a brilliant software engineer in Nairobi or a micro-investor in Tokyo, StartHub aims to build the standard pipeline where projects get evaluated and funded dynamically based on merit, validation, and tech maturity.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">2. The Era of Agile Micro-Capitals</h2>
        <p>
          Traditional VC structures require months of heavy diligence, complex equity agreements, and large capital injections that dilute founders too early. Our vision embraces "Agile Micro-Angel Investing" — small, high-frequency, modular capitals that enable rapid prototyping and validation loops without relinquishing operational control.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">3. Frictionless, Data-Driven Trust</h2>
        <p>
          We envision a transparent, highly automated early-stage network. By building standardized schemas, secure identity validations, and cryptographic verifications directly over the database layers, we will reduce the legal and administrative friction of seed financing to a few automated clicks.
        </p>
      </section>
    </PageWrapper>
  );
};

const PrivacyPage = () => {
  return (
    <PageWrapper title="Privacy Policy" subtitle="Last updated: May 18, 2026">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">1. Information We Collect</h2>
        <p>
          We collect basic registration information voluntarily submitted by you when joining our pre-market waitlist. For **Founders**, this includes full name, business email address, and startup details. For **Investors**, this includes full name, business or personal email address, and investment profiles.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">2. How We Secure Your Data</h2>
        <p>
          All collected waitlist details are persisted securely inside our hosted **Supabase Relational Database**. We protect this data through state-of-the-art encryption algorithms at rest and in transit, strict Row Level Security (RLS) policies on the database layers, and gated admin panels. We implement zero open-delete policies for unauthorized public profiles.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">3. Data Usage & Sharing</h2>
        <p>
          StartHub Network Private Limited does not rent, sell, trade, or distribute your email addresses or personal startup metrics to any third-party marketing brokers. Your data is used exclusively to:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Rank and place your account on our priority launch list.</li>
          <li>Send exclusive beta invites and platform milestone updates.</li>
          <li>Validate roles (Founder vs. Investor) during early matches.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">4. Your Rights (GDPR & CCPA Alignment)</h2>
        <p>
          You retain full ownership and rights over your personal information. You can request to view, export, correct, or permanently delete your waitlist profile from our active tables at any time by mailing us at <a href="mailto:starthub48@gmail.com" className="text-starthub hover:underline">starthub48@gmail.com</a>.
        </p>
      </section>
    </PageWrapper>
  );
};

const TermsPage = () => {
  return (
    <PageWrapper title="Terms & Conditions" subtitle="Last updated: May 18, 2026">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">1. Acceptance of Terms</h2>
        <p>
          By accessing the StartHub pre-market landing page, entering your credentials, and joining our waitlist, you explicitly agree to comply with and be bound by these Terms and Conditions and our Privacy Policy.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">2. Waitlist Acknowledgment</h2>
        <p>
          Registration on our waitlist serves as an expression of interest to join the upcoming StartHub platform beta. It does not constitute a guaranteed allocation of platform keys, account approvals, funding availability, or investment access. StartHub reserves the right to screen waitlist registrations and roll out beta access gradually.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">3. No Financial, Legal, or Investment Advice</h2>
        <p>
          StartHub Network Private Limited acts as an administrative matchmaking and networking tool connecting founders and micro-investors. We do **not** act as an investment broker, licensed fund manager, financial advisor, or legal counselor. Any connections or information provided through our platform or landing campaigns do not constitute investment solicitations. Users are solely responsible for conducting independent due diligence before committing capital.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">4. Acceptable Platform Conduct</h2>
        <p>
          You agree to provide true, accurate, current, and complete details when joining the waitlist. Providing falsified emails, using automated bots to register duplicate profiles, or attempting to breach our gated administrative panels will result in immediate permanent disqualification from the platform.
        </p>
      </section>
    </PageWrapper>
  );
};

const CookiesPage = () => {
  return (
    <PageWrapper title="Cookie Policy" subtitle="Last updated: May 18, 2026">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">1. What Are Cookies?</h2>
        <p>
          Cookies are small text files placed on your browser or device to help websites remember your configuration, optimize speed, and improve the user experience.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">2. Strictly Necessary Cookies</h2>
        <p>
          We use strictly necessary local storage indicators and session cookies to maintain your login status inside our gated administrative dashboards (`/admin`). These cookies do not store any identifying marketing metrics and are automatically cleared when logging out.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-starthub-dark">3. Zero Third-Party Tracker Cookies</h2>
        <p>
          We respect your digital privacy. Our landing page does **not** load invasive third-party cross-site trackers, behavioral ad-network tracking pixels, or cross-domain profiling cookies. We only measure aggregated, anonymous server-side loads to monitor waitlist success rates.
        </p>
      </section>
    </PageWrapper>
  );
};

const LandingPage = () => {
  return (
    <>
      <Header />

      <main>
        {/* 1. Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div {...FADE_UP} transition={{ delay: 0.1 }}>
              <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-bold tracking-[0.2em] text-starthub uppercase bg-starthub-light rounded-full border border-starthub/10">
                FOUNDERS • INVESTORS • EARLY ACCESS
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tight leading-[1.1] mb-8 text-starthub-dark px-4 max-w-5xl mx-auto">
                Where Early-stage <br className="hidden md:block" /> founders meet <br className="hidden md:block" /> Micro-Investors
              </h1>
              <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed px-4">
                The traditional gatekeepers are gone. We're building a curated ecosystem where the best ideas get funded by the best people, instantly.
              </p>
              
              <div className="mb-8 flex justify-center">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-xs font-semibold text-gray-500 bg-white/60 backdrop-blur-sm px-4 py-2 sm:py-1.5 rounded-full border border-gray-100 shadow-sm">
                  <div className="flex -space-x-1.5 isolate">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`w-6 h-6 rounded-full border-2 border-white bg-slate-${i === 1 ? '100' : i === 2 ? '200' : i === 3 ? '300' : '400'} shadow-sm`} />
                    ))}
                  </div>
                  <span>Joined by 400+ builders this week</span>
                </div>
              </div>
              
              <WaitlistForm id="waitlist-top" />
              
              <p className="mt-6 text-xs text-gray-400 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                Vetted access. Zero spam. Private by design.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 2. Problem Section */}
        <section className="py-24 bg-white border-y border-gray-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div variants={STAGGER} initial="initial" whileInView="animate" viewport={{ once: true }}>
                <motion.h2 variants={FADE_UP} className="text-3xl md:text-5xl font-semibold mb-6 tracking-tight text-starthub-dark">
                  Fundraising is broken. <br/>
                  <span className="text-gray-300">We're fixing it.</span>
                </motion.h2>
                <motion.div variants={FADE_UP} className="space-y-6 text-gray-500 text-base md:text-lg leading-relaxed">
                  <p>
                    Today, raising your first $100k is more about your social circle than your metrics. If you aren't in the right zip code, the door is locked.
                  </p>
                  <p className="font-medium text-starthub-dark">
                    Founders are drowning in "coffee chats" that lead nowhere, while investors miss out on gems because of opaque networks.
                  </p>
                </motion.div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-inner"
              >
                <div className="space-y-4">
                  {[
                    "The 'Warm Intro' Gatekeeper",
                    "Fragmentation of Early Capital",
                    "Biased Alumni Networks",
                    "Data-Poor Decision Making"
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold">×</span>
                      </div>
                      <span className="text-gray-800 font-semibold text-sm md:text-base">{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. Solution Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 px-4">
              <h2 className="text-3xl md:text-5xl font-semibold mb-4 text-starthub-dark tracking-tight">The new standard for early funding.</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                We've automated the heavy lifting of discovery, verification, and legal—so you can focus on scale.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
              {[
                {
                  icon: <Target className="w-6 h-6" />,
                  title: "Unlock Capital",
                  description: "Skip the brokers. Investors discover your metrics and team potential directly through a high-signal discovery feed."
                },
                {
                  icon: <ShieldCheck className="w-6 h-6" />,
                  title: "Verified Pulse",
                  description: "Every player is vetted. We maintain a high-signal environment where serious builders meet serious backers."
                },
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "Velocity of Terms",
                  description: "Move from match to closing in days, not months. Use pre-vetted, industry-standard legal frameworks."
                },
                {
                  icon: <TrendingUp className="w-6 h-6" />,
                  title: "Intelligent Matching",
                  description: "Our algorithms connect you with partners based on industry alignment, ticket size, and traction stage."
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  variants={FADE_UP}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  custom={i}
                  className="p-8 md:p-10 bg-white rounded-[2.5rem] border border-gray-100 hover:border-starthub/30 transition-all hover:shadow-2xl hover:shadow-starthub/5 flex flex-col items-start"
                >
                  <div className="w-12 h-12 bg-starthub-light text-starthub rounded-2xl flex items-center justify-center mb-8">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-starthub-dark">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-base md:text-lg">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. How It Works */}
        <section className="py-24 bg-gray-950 text-white rounded-[4rem] mx-6 shadow-2xl shadow-starthub/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-semibold mb-6 tracking-tight">The path to your first check.</h2>
              <p className="text-gray-400 text-lg">From zero to funded in four exciting steps.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-24 right-24 h-px bg-white/10" />
              {[
                { step: "01", title: "Build Profile", desc: "Showcase your traction, deck, and vision." },
                { step: "02", title: "Smart Match", desc: "Get in front of investors relevant to your industry." },
                { step: "03", title: "Direct Connect", desc: "Engage in transparent Q&A via private message." },
                { step: "04", title: "Close Round", desc: "Execute contracts and receive capital digitally." }
              ].map((item, i) => (
                <div key={i} className="relative text-center">
                  <div className="w-12 h-12 bg-starthub rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                    <span className="font-bold text-sm tracking-tighter">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. For Who */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 bg-starthub-light p-10 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="text-starthub w-8 h-8" />
                  <h3 className="text-2xl font-semibold text-starthub-dark">For Founders</h3>
                </div>
                <ul className="space-y-4 text-starthub-dark font-medium mb-8">
                  <li className="flex gap-3 items-center">
                    <CheckCircle2 className="w-5 h-5 text-starthub flex-shrink-0" />
                    Less networking, more shipping.
                  </li>
                  <li className="flex gap-3 items-center">
                    <CheckCircle2 className="w-5 h-5 text-starthub flex-shrink-0" />
                    Access 200+ micro-VCs and angels globally.
                  </li>
                  <li className="flex gap-3 items-center">
                    <CheckCircle2 className="w-5 h-5 text-starthub flex-shrink-0" />
                    Secure funding in weeks, not months.
                  </li>
                </ul>
              </div>
              <div className="flex-1 bg-starthub-dark p-10 rounded-[2.5rem] text-white">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="text-starthub w-8 h-8" />
                  <h3 className="text-2xl font-semibold">For Investors</h3>
                </div>
                <ul className="space-y-4 text-gray-300 font-medium mb-8">
                  <li className="flex gap-3 items-center">
                    <CheckCircle2 className="w-5 h-5 text-starthub flex-shrink-0" />
                    Discover opportunities before the crowd.
                  </li>
                  <li className="flex gap-3 items-center">
                    <CheckCircle2 className="w-5 h-5 text-starthub flex-shrink-0" />
                    Reduce sourcing friction via curated feeds.
                  </li>
                  <li className="flex gap-3 items-center">
                    <CheckCircle2 className="w-5 h-5 text-starthub flex-shrink-0" />
                    Standardized terms for instant deployment.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Why It Matters */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-semibold mb-8 tracking-tight text-starthub-dark">The mission.</h2>
            <div className="text-lg md:text-xl text-gray-600 space-y-6 leading-relaxed font-light">
              <p>
                We believe the next generation of world-shaping companies could come from anywhere. 
                But talent is distributed more evenly than opportunity. 
              </p>
              <p>
                By lowering the barrier to initial funding, we accelerate the global rate of innovation. 
                StartHub isn't just a marketplace; it's the engine ensuring that the best ideas get their chance to breathe—unencumbered by geography or social privilege.
              </p>
            </div>
          </div>
        </section>

        {/* 7. CTA Section */}
        <section className="py-24 pb-48">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-starthub rounded-[4rem] p-10 md:p-24 text-white relative overflow-hidden text-center shadow-2xl shadow-starthub/40">
              {/* Abstract Background Element */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[50rem] h-[50rem] bg-indigo-400/20 rounded-full blur-[120px]" />
              
              <div className="relative z-10 max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold mb-8 tracking-tight">
                  The future of funding <br className="hidden md:block" /> starts with you.
                </h2>
                <p className="text-starthub-light/90 mb-12 text-lg md:text-2xl max-w-2xl mx-auto font-light">
                  Join the exclusive waitlist for priority access to the ecosystem. Only a limited number of hubs launch each month.
                </p>
                
                <WaitlistForm id="waitlist-bottom" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

const AdminPage = () => {
  interface Founder { id: string; full_name: string; email: string; startup_name: string; startup_stage?: string; industry?: string; created_at: string; }
  interface Investor { id: string; full_name: string; email: string; investment_range?: string; preferred_industries?: string; created_at: string; }

  const [founders, setFounders] = useState<Founder[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'founders' | 'investors'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'founder' | 'investor'; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    const [fRes, iRes] = await Promise.all([
      supabase.from('founders').select('*').order('created_at', { ascending: false }),
      supabase.from('investors').select('*').order('created_at', { ascending: false }),
    ]);
    if (fRes.data) setFounders(fRes.data);
    if (iRes.data) setInvestors(iRes.data);
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchData();
    }
  }, [isAuthorized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Ajitesh@7816016526') {
      setIsAuthorized(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setPassword('');
    navigate('/');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const table = deleteTarget.type === 'founder' ? 'founders' : 'investors';

    // Optimistic update
    if (deleteTarget.type === 'founder') setFounders(prev => prev.filter(f => f.id !== deleteTarget.id));
    else setInvestors(prev => prev.filter(i => i.id !== deleteTarget.id));

    const { error } = await supabase.from(table).delete().eq('id', deleteTarget.id);
    if (error) {
      showToast('Failed to delete. Please try again.', 'error');
      fetchData(); // revert
    } else {
      showToast('Lead deleted successfully', 'success');
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const filteredFounders = founders.filter(f =>
    f.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.startup_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInvestors = investors.filter(i =>
    i.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 text-center">
          <div className="w-16 h-16 bg-starthub rounded-2xl flex items-center justify-center text-white mx-auto mb-6"><ShieldCheck size={32} /></div>
          <h2 className="text-2xl font-bold text-starthub-dark mb-2">Admin Access</h2>
          <p className="text-gray-500 mb-8 text-sm">Please enter the master password to continue.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-starthub/20 focus:border-starthub transition-all bg-gray-50/50 text-gray-900" autoFocus />
            {loginError && <p className="text-red-500 text-xs font-bold">Incorrect password. Access denied.</p>}
            <button type="submit" className="w-full bg-starthub text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-starthub-dark transition-all shadow-lg shadow-starthub/20">Unlock Dashboard</button>
            <button type="button" onClick={() => navigate('/')} className="text-gray-400 font-semibold text-sm hover:text-gray-600 transition-colors">Back to site</button>
          </form>
        </motion.div>
      </div>
    );
  }

  const renderTable = (type: 'founders' | 'investors') => {
    const data = type === 'founders' ? filteredFounders : filteredInvestors;
    const isFounder = type === 'founders';
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-3 font-bold">Name</th>
                <th className="px-6 py-3 font-bold">Email</th>
                <th className="px-6 py-3 font-bold">{isFounder ? 'Startup' : 'Inv. Range'}</th>
                <th className="px-6 py-3 font-bold">{isFounder ? 'Industry' : 'Pref. Industries'}</th>
                <th className="px-6 py-3 font-bold">Date</th>
                <th className="px-6 py-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.length > 0 ? data.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-sm text-starthub-dark">{entry.full_name}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{entry.email}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-starthub bg-indigo-50 px-2 py-0.5 rounded-md">
                      {isFounder ? (entry.startup_name || '—') : (entry.investment_range || '—')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{isFounder ? (entry.industry || '—') : (entry.preferred_industries || '—')}</td>
                  <td className="px-6 py-4 text-[10px] text-gray-400">{entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setDeleteTarget({ id: entry.id, type: isFounder ? 'founder' : 'investor', name: entry.full_name })}
                      className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Delete Lead">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400 italic text-sm">No {type} joined yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-starthub-dark text-white p-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <StartHubLogo className="w-8 h-8 filter brightness-0 invert" />
          <span className="font-bold text-xl tracking-tight">Admin</span>
        </div>
        <nav className="space-y-2 flex-1">
          {(['overview', 'founders', 'investors'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              {tab === 'overview' ? <LayoutDashboard size={18} /> : tab === 'founders' ? <Rocket size={18} /> : <TrendingUp size={18} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white text-sm font-medium transition-all border-t border-white/10 pt-6">
          <LogOut size={18} /> Logout & Back to Site
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Waitlist Management</p>
              <h1 className="text-3xl font-bold text-starthub-dark">
                {activeTab === 'overview' ? 'Dashboard Overview' : activeTab === 'founders' ? 'Founders Database' : 'Investors Database'}
              </h1>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-starthub/20 focus:border-starthub transition-all bg-white w-48 md:w-64" />
              </div>
              <button onClick={fetchData} className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-starthub hover:border-starthub transition-all" title="Refresh Data">
                <Database size={20} />
              </button>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-starthub text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-starthub/20 hover:bg-starthub-dark transition-all">
                <Plus size={18} /> Add Entry
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Leads', value: founders.length + investors.length, icon: <Users size={20} />, color: 'bg-blue-50 text-blue-600' },
              { label: 'Founders', value: founders.length, icon: <Rocket size={20} />, color: 'bg-indigo-50 text-starthub' },
              { label: 'Investors', value: investors.length, icon: <TrendingUp size={20} />, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'This Week', value: [...founders, ...investors].filter(e => { const d = new Date(e.created_at); const now = new Date(); return (now.getTime() - d.getTime()) < 7 * 86400000; }).length, icon: <BarChart3 size={20} />, color: 'bg-amber-50 text-amber-600' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>{stat.icon}</div>
                <p className="text-2xl font-bold text-starthub-dark">{stat.value}</p>
                <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-bold text-starthub-dark mb-4 flex items-center gap-2"><Rocket size={18} /> Recent Founders ({founders.length})</h2>
                {renderTable('founders')}
              </div>
              <div>
                <h2 className="text-lg font-bold text-starthub-dark mb-4 flex items-center gap-2"><TrendingUp size={18} /> Recent Investors ({investors.length})</h2>
                {renderTable('investors')}
              </div>
            </div>
          )}
          {activeTab === 'founders' && (
            <div>
              <h2 className="text-lg font-bold text-starthub-dark mb-4">Founders ({filteredFounders.length})</h2>
              {renderTable('founders')}
            </div>
          )}
          {activeTab === 'investors' && (
            <div>
              <h2 className="text-lg font-bold text-starthub-dark mb-4">Investors ({filteredInvestors.length})</h2>
              {renderTable('investors')}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isDeleting && setDeleteTarget(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-4"><Trash2 size={28} /></div>
              <h3 className="text-xl font-bold text-starthub-dark mb-2">Delete this lead permanently?</h3>
              <p className="text-gray-500 text-sm mb-6">"{deleteTarget.name}" will be removed from the database. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
                <button onClick={confirmDelete} disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isDeleting ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-starthub rounded-xl flex items-center justify-center text-white">
                    <UserPlus size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-starthub-dark">Manual Lead Entry</h3>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <div className="p-8">
                <WaitlistForm 
                  id="admin-add" 
                  onAdd={() => {
                    fetchData();
                    setTimeout(() => {
                      setShowAddModal(false);
                      showToast('Lead manual entry added!', 'success');
                    }, 2000);
                  }} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-6 right-6 z-[70] px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a] font-sans selection:bg-starthub-light">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/vision" element={<VisionPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
        </Routes>
      </div>
    </Router>
  );
}
