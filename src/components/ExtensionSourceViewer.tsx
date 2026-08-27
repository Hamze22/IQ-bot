import React, { useState } from 'react';
import { EXTENSION_FILES } from '../extensionSource/files';
import { Code2, Download, Copy, Check, FileCode, Info } from 'lucide-react';

interface ExtensionSourceViewerProps {
  onDownloadZip: () => void;
}

export const ExtensionSourceViewer: React.FC<ExtensionSourceViewerProps> = ({ onDownloadZip }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const selectedFile = EXTENSION_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    onDownloadZip();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Installation Instructions Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">
                Chrome Extension Package (Manifest V3)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold">
                v3.0.0 LATEST PRO BUILD
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Contains updated 1m Scalping engine, Pocket Option web DOM overlay badge, risk safeguards, and instant scan button.
              <br />
              <strong className="text-slate-200">1. Click "Download Extension Package v3.0.0 (.ZIP)"</strong> →
              Unzip the folder. <br />
              <strong className="text-slate-200">2. Open Chrome</strong> → Navigate to{' '}
              <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">
                chrome://extensions
              </code>{' '}
              → Enable <strong>Developer Mode</strong> (top right). <br />
              <strong className="text-slate-200">3. Click "Load Unpacked"</strong> → Select the unzipped extension directory!
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-xl shadow-emerald-500/25 transition active:scale-95 shrink-0 border border-emerald-300/40"
        >
          <Download className={`w-4 h-4 ${downloaded ? 'animate-bounce text-slate-950' : ''}`} />
          <span>{downloaded ? 'ZIP Downloaded! (v3.0.0 PRO)' : 'Download Extension Package v3.0.0 (.ZIP)'}</span>
          <span className="bg-slate-950 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-emerald-500/40">
            UPDATED BUILD
          </span>
        </button>
      </div>

      {/* Main Code Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* File List Sidebar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-3 py-2 block">
            Extension Files ({EXTENSION_FILES.length})
          </span>

          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {EXTENSION_FILES.map((f, idx) => (
              <button
                key={f.name}
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition flex items-center justify-between ${
                  selectedFileIndex === idx
                    ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{f.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.5 bg-slate-950 rounded">
                  {f.type}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* File Content Viewer */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                {selectedFile.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedFile.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy File Content
                </>
              )}
            </button>
          </div>

          {/* Preformatted Source Code Box */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 overflow-x-auto max-h-[500px]">
            <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
