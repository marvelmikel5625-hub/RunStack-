import React from 'react';
import { AnimationInfo } from '../../types/diagnostics';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';

interface AnimationsTabProps {
  animations: AnimationInfo[];
  onControlAnimation: (action: 'pause' | 'play' | 'restart' | 'rate', rate?: number) => void;
}

export const AnimationsTab: React.FC<AnimationsTabProps> = ({
  animations,
  onControlAnimation,
}) => {
  return (
    <div className="flex flex-col h-full bg-white font-sans text-xs">
      {/* Animation Inspector Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-600 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-slate-800">CSS Animation Inspector</span>
          <span className="text-[10px] text-slate-500 font-mono tabular-nums">
            ({animations.length} active)
          </span>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onControlAnimation('play')}
            disabled={animations.length === 0}
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
            title="Resume animations"
          >
            <Play className="w-3 h-3 fill-slate-700" />
            <span>Play</span>
          </button>
          <button
            onClick={() => onControlAnimation('pause')}
            disabled={animations.length === 0}
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
            title="Pause animations"
          >
            <Pause className="w-3 h-3 fill-slate-700" />
            <span>Pause</span>
          </button>
          <button
            onClick={() => onControlAnimation('restart')}
            disabled={animations.length === 0}
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
            title="Restart animations from 0s"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restart</span>
          </button>

          {/* Speed Presets */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-sm ml-1">
            <span className="text-[10px] text-slate-400 px-1 hidden sm:inline">Speed:</span>
            {[0.25, 0.5, 1, 2].map((rate) => (
              <button
                key={rate}
                onClick={() => onControlAnimation('rate', rate)}
                disabled={animations.length === 0}
                className="px-1.5 py-0.5 text-[10px] font-mono rounded-xs text-slate-600 hover:text-slate-900 hover:bg-white transition-colors disabled:opacity-40 cursor-pointer"
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Animation List */}
      <div className="flex-1 overflow-y-auto p-3">
        {animations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 select-none">
            <Activity className="w-6 h-6 mb-1 opacity-40" />
            <p className="text-xs font-medium text-slate-600">No active CSS animations detected</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              CSS keyframes and Web Animations in the live preview document will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {animations.map((anim) => (
              <div
                key={anim.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-xs font-mono truncate">
                    {anim.name}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-xs font-mono uppercase font-semibold ${
                      anim.playState === 'running'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {anim.playState}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target:</span>
                    <span className="font-mono text-slate-800">
                      &lt;{anim.targetTag}&gt; {anim.targetClass ? `.${anim.targetClass}` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span className="font-mono text-slate-800 tabular-nums">
                      {Math.round(anim.duration)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Playback Rate:</span>
                    <span className="font-mono text-slate-800 tabular-nums">{anim.playbackRate}x</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
