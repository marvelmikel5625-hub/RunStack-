import React, { useState } from 'react';
import { X, ShieldCheck, Zap, DownloadCloud, CheckCircle2 } from 'lucide-react';
import { RunStackLogo } from '../common/RunStackLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onContinueAsGuest,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <RunStackLogo size="sm" />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              No Account Required to Code
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              RunStack is built local-first. You can write, execute, inspect, save projects, and export ZIPs directly in your browser without logging in.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-left space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Instant playground with Python, SQL & Web</span>
            </div>
            <div className="flex items-center gap-2">
              <DownloadCloud className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Full IndexedDB persistence & ZIP export/import</span>
            </div>
          </div>

          {subscribed ? (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>You're on the list for multi-device cloud sync!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="text-[11px] text-slate-500 text-left font-medium">
                Want cross-device cloud sync when available?
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
                >
                  Notify Me
                </button>
              </div>
            </form>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onContinueAsGuest();
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              Continue to Playground Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
