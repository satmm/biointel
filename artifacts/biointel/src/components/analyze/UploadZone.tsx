import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { ImagePlus, Loader2, AlertCircle, CheckCircle2, HelpCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { identifyImage, TopMatch } from '../../lib/api';

type ScanState = 'idle' | 'scanning' | 'verified' | 'uncertain' | 'failed';

interface IdentResult {
  confidenceLevel: 'high' | 'medium' | 'low';
  confidence: number;
  speciesId: string | null;
  speciesName: string | null;
  scientificName: string | null;
  reasoning: string | null;
  imageQuality: string;
  topMatches: TopMatch[];
  message: string | null;
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function ConfidenceBadge({ pct, level }: { pct: number; level: string }) {
  const color =
    level === 'high' ? 'text-[var(--teal)] bg-[var(--teal-dim)] border-[rgba(15,255,232,0.25)]' :
    level === 'medium' ? 'text-[var(--amber)] bg-[rgba(245,166,35,0.08)] border-[rgba(245,166,35,0.25)]' :
    'text-[var(--red-ext)] bg-[var(--red-dim)] border-[rgba(255,59,92,0.25)]';
  return (
    <span className={`font-mono text-[11px] px-2 py-0.5 rounded-full border-[0.5px] ${color}`}>
      {Math.round(pct * 100)}%
    </span>
  );
}

export function UploadZone() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanStatus, setScanStatus] = useState('');
  const [result, setResult] = useState<IdentResult | null>(null);
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(false); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const processFile = (f: File) => {
    setFile(f);
    setResult(null);
    setScanState('idle');
    setPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setScanState('idle');
    setScanStatus('');
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setScanState('scanning');
    setResult(null);
    setScanStatus('Preprocessing image...');

    try {
      setScanStatus('Running vision AI analysis...');
      const r = await identifyImage(file);

      const ident: IdentResult = {
        confidenceLevel: r.confidence_level,
        confidence: r.confidence,
        speciesId: r.species_id,
        speciesName: r.species_name,
        scientificName: r.scientific_name,
        reasoning: r.reasoning,
        imageQuality: r.image_quality,
        topMatches: r.top_matches,
        message: r.message,
      };

      setResult(ident);

      if (r.verified && r.species_id) {
        setScanState('verified');
        setScanStatus('Species identified!');
        setTimeout(() => setLocation(`/species/${r.species_id}`), 1200);
      } else if (r.identified) {
        setScanState('uncertain');
        setScanStatus('');
      } else {
        setScanState('failed');
        setScanStatus('');
      }
    } catch {
      setScanState('failed');
      setScanStatus('');
      setResult({
        confidenceLevel: 'low',
        confidence: 0,
        speciesId: null,
        speciesName: null,
        scientificName: null,
        reasoning: null,
        imageQuality: 'unknown',
        topMatches: [],
        message: 'Vision analysis service is unavailable. Please try again.',
      });
    }
  };

  const isScanning = scanState === 'scanning';

  return (
    <div className="w-full max-w-[640px] mx-auto flex flex-col gap-4">
      {/* Drop zone */}
      <div
        className={`relative w-full rounded-[20px] transition-all duration-300 overflow-hidden ${
          isDragActive
            ? 'bg-[rgba(15,255,232,0.04)] border-[1.5px] border-[var(--teal)] scale-[1.01]'
            : scanState === 'verified'
            ? 'border-[1.5px] border-[var(--teal)]'
            : scanState === 'uncertain'
            ? 'border-[1.5px] border-[var(--amber)]'
            : scanState === 'failed'
            ? 'border-[1.5px] border-[rgba(255,59,92,0.5)]'
            : 'bg-[var(--void-2)] border-[1.5px] border-dashed border-[rgba(15,255,232,0.2)]'
        } ${!file ? 'cursor-pointer' : ''} min-h-[260px] flex items-center justify-center`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
        />

        {preview ? (
          <>
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />

            {/* Scan line while analysing */}
            {isScanning && (
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--teal)] to-transparent animate-[scan_1.5s_ease-in-out_infinite]" />
            )}

            {/* Verified overlay */}
            {scanState === 'verified' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(8,12,16,0.6)] backdrop-blur-[2px]">
                <CheckCircle2 className="w-12 h-12 text-[var(--teal)] mb-3" />
                <span className="font-heading font-medium text-[18px] text-[var(--text-primary)]">
                  {result?.speciesName}
                </span>
                <span className="font-mono text-[12px] text-[var(--text-tertiary)] italic mt-1">
                  {result?.scientificName}
                </span>
                <span className="font-mono text-[11px] text-[var(--teal)] mt-2 tracking-widest uppercase">
                  Opening profile...
                </span>
              </div>
            )}

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 w-full bg-[rgba(8,12,16,0.85)] backdrop-blur-sm px-4 py-3 flex justify-between items-center border-t border-[rgba(255,255,255,0.05)]">
              <span className="font-mono text-[12px] text-[var(--text-primary)] truncate">{file?.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="text-[var(--teal)] text-[12px] font-body hover:underline ml-3 shrink-0 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Change
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-[40px] text-center">
            <ImagePlus className={`w-[40px] h-[40px] text-[var(--teal)] mb-4 ${isDragActive ? 'animate-pulse opacity-100' : 'opacity-60'}`} />
            <h3 className="font-heading font-medium text-[18px] text-[var(--text-primary)] mb-2">Drop your species image here</h3>
            <p className="font-body text-[14px] text-[var(--text-secondary)] mb-6">or click to browse</p>
            <span className="font-mono text-[11px] bg-[rgba(255,255,255,0.05)] text-[var(--text-tertiary)] px-3 py-1 rounded-full">
              JPG · PNG · WEBP · up to 10MB
            </span>
          </div>
        )}
      </div>

      {/* Uncertain state — show top matches for user to confirm */}
      {scanState === 'uncertain' && result && (
        <div className="bg-[var(--void-2)] border-[0.5px] border-[rgba(245,166,35,0.35)] rounded-[14px] overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgba(245,166,35,0.15)] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[var(--amber)] shrink-0" />
            <span className="font-body text-[13px] text-[var(--amber)]">
              {result.message || 'Moderate confidence — please confirm the species.'}
            </span>
          </div>
          {result.topMatches.length > 0 && (
            <div className="flex flex-col">
              <div className="px-4 py-2 border-b border-[var(--border)]">
                <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">Top matches — click to view profile</span>
              </div>
              {result.topMatches.map((match, i) => (
                <button
                  key={i}
                  onClick={() => setLocation(`/species/${toSlug(match.species)}`)}
                  className={`w-full flex items-center gap-4 px-4 py-3 hover:bg-[rgba(245,166,35,0.04)] transition-colors text-left ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}
                >
                  <div className="w-8 h-8 rounded-[6px] bg-[var(--void-3)] border border-[var(--border)] flex items-center justify-center shrink-0">
                    <span className="font-mono text-[11px] text-[var(--text-tertiary)]">{i + 1}</span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-body text-[14px] text-[var(--text-primary)] truncate">{match.species}</span>
                    <span className="font-mono text-[11px] text-[var(--text-tertiary)] truncate italic">{match.scientific_name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ConfidenceBadge pct={match.confidence} level={match.confidence >= 0.75 ? 'high' : match.confidence >= 0.5 ? 'medium' : 'low'} />
                    <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </div>
                </button>
              ))}
            </div>
          )}
          {result.reasoning && (
            <div className="px-4 py-3 border-t border-[var(--border)]">
              <p className="font-body text-[12px] text-[var(--text-tertiary)] leading-relaxed">
                <span className="text-[var(--text-secondary)]">AI reasoning: </span>{result.reasoning}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Failed state */}
      {scanState === 'failed' && result && (
        <div className="bg-[var(--void-2)] border-[0.5px] border-[rgba(255,59,92,0.3)] rounded-[14px] overflow-hidden">
          <div className="px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[var(--red-ext)] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-body text-[13px] text-[var(--text-primary)]">
                {result.message || 'Unable to identify species. Please upload a clearer image.'}
              </span>
              {result.imageQuality === 'poor' || result.imageQuality === 'unclear' ? (
                <span className="font-mono text-[11px] text-[var(--text-tertiary)]">Image quality: {result.imageQuality}</span>
              ) : null}
            </div>
          </div>
          {result.topMatches.length > 0 && (
            <>
              <div className="px-4 py-2 border-t border-[var(--border)]">
                <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">Possible candidates</span>
              </div>
              {result.topMatches.map((match, i) => (
                <button
                  key={i}
                  onClick={() => setLocation(`/species/${toSlug(match.species)}`)}
                  className={`w-full flex items-center gap-4 px-4 py-2.5 hover:bg-[rgba(255,59,92,0.04)] transition-colors text-left ${i > 0 ? 'border-t border-[var(--border)]' : 'border-t border-[var(--border)]'}`}
                >
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-body text-[13px] text-[var(--text-primary)] truncate">{match.species}</span>
                    <span className="font-mono text-[10px] text-[var(--text-tertiary)] truncate italic">{match.scientific_name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ConfidenceBadge pct={match.confidence} level="low" />
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Analyse button */}
      <button
        onClick={handleAnalyze}
        disabled={!file || isScanning || scanState === 'verified'}
        className={`w-full py-[16px] rounded-[12px] font-heading font-medium text-[16px] transition-all flex items-center justify-center gap-2 ${
          file && !isScanning && scanState !== 'verified'
            ? 'bg-[var(--teal)] text-[#080C10] hover:opacity-90'
            : 'bg-[var(--void-3)] text-[var(--text-tertiary)] cursor-not-allowed border border-[var(--border)]'
        }`}
      >
        {isScanning ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {scanStatus || 'Analysing with vision AI...'}
          </>
        ) : scanState === 'verified' ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Species identified — loading profile...
          </>
        ) : scanState === 'uncertain' || scanState === 'failed' ? (
          'Try another image →'
        ) : (
          'Analyse this species →'
        )}
      </button>
    </div>
  );
}
