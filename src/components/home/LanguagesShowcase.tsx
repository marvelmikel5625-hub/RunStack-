import React from 'react';
import { SUPPORTED_LANGUAGES } from '../../services/languages';
import { SupportedLanguage } from '../../types/project';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';

interface LanguagesShowcaseProps {
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const LanguagesShowcase: React.FC<LanguagesShowcaseProps> = ({ onSelectLanguage }) => {
  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Execution Engines & Environments
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            RunStack runs code honestly. Available languages execute locally via WebAssembly and browser isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            return (
              <div
                key={lang.id}
                onClick={() => onSelectLanguage(lang.id)}
                className={`p-5 rounded-xl border bg-white transition-all cursor-pointer flex flex-col justify-between ${
                  lang.isAvailable
                    ? 'border-slate-200 hover:border-blue-400 hover:shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/70 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-base text-slate-900">{lang.name}</span>
                    {lang.isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        Available Now
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        Container Required
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {lang.statusNote}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 font-mono">.{lang.extension}</span>
                  <span className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                    {lang.isAvailable ? 'Launch Playground' : 'View Template'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
