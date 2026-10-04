import React, { useState } from 'react';
import { X, Upload, Image, Link, Check, RefreshCw, Globe, Sparkles } from 'lucide-react';
import { fetchVirtualTourEasyTour, extractVTETourId } from '../utils/virtualTourEasySync';
import { Room } from '../types/tour';

interface CustomPanoramaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomTexture: (url: string, title: string) => void;
  onImportVTETour?: (rooms: Room[], title: string) => void;
}

export const CustomPanoramaModal: React.FC<CustomPanoramaModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomTexture,
  onImportVTETour,
}) => {
  const [tab, setTab] = useState<'vte' | 'url' | 'upload'>('vte');
  const [vteInput, setVteInput] = useState('https://viewer.virtualtoureasy.com/?r=ZHF8dREyqk');
  const [vteLoading, setVteLoading] = useState(false);
  const [vteError, setVteError] = useState<string | null>(null);

  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('Custom 360 View');

  if (!isOpen) return null;

  const handleVteImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vteInput.trim()) return;

    setVteLoading(true);
    setVteError(null);

    try {
      const { title, rooms } = await fetchVirtualTourEasyTour(vteInput.trim());
      if (onImportVTETour) {
        onImportVTETour(rooms, title);
      } else if (rooms[0]) {
        onApplyCustomTexture(rooms[0].panoUrl || rooms[0].photoUrl, rooms[0].title);
      }
      onClose();
    } catch (err: any) {
      setVteError(err.message || 'Failed to load 360° tour.');
    } finally {
      setVteLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onApplyCustomTexture(event.target.result as string, file.name.replace(/\.[^/.]+$/, ''));
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onApplyCustomTexture(urlInput.trim(), titleInput.trim() || 'Custom 360 Photo');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div
        className="w-full max-w-lg bg-slate-950 border border-white/15 rounded-2xl shadow-2xl p-6 text-white relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display">Source 360° Scene</h3>
            <p className="text-xs text-slate-400">
              Load 360° panoramic scenes via tour link, direct image, or local file.
            </p>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl mb-4 text-xs font-semibold">
          <button
            onClick={() => setTab('vte')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'vte' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tour Link</span>
          </button>
          <button
            onClick={() => setTab('url')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'url' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Direct Image URL</span>
          </button>
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'upload' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>

        {/* Tab 1: Tour Link direct import */}
        {tab === 'vte' && (
          <form onSubmit={handleVteImport} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                360° Tour URL or Reference ID
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={vteInput}
                  onChange={(e) => setVteInput(e.target.value)}
                  placeholder="https://viewer.virtualtoureasy.com/?r=ZHF8dREyqk"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Loads the full-fidelity 4K equirectangular 360° scene.
              </p>
            </div>

            {vteError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                {vteError}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={vteLoading || !vteInput.trim()}
                className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl transition-all flex items-center gap-1.5"
              >
                {vteLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{vteLoading ? 'Importing 360°...' : 'Load 360° Scene'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Direct Image URL */}
        {tab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Image URL</label>
              <div className="relative">
                <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/property-360-photo.jpg"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Room / View Label</label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. Master Bedroom View"
                className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!urlInput.trim()}
                className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl transition-all"
              >
                Load into 3D Viewer
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: File Upload */}
        {tab === 'upload' && (
          <div>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/15 hover:border-amber-400/50 rounded-xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-amber-400 mb-2 transition-colors" />
              <span className="text-xs font-semibold text-slate-200">
                Click to browse or drop 360° image file
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                Supports JPG, PNG, WEBP equirectangular panoramas
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
