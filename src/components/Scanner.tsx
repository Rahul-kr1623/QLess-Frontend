import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle2, QrCode, Loader2 } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanSuccess }) => {
  const [scanResult, setScanResult] = useState<{ status: string; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastScanRef = useRef<string>("");

  const playBeep = (freq: number, dur: number) => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, context.currentTime);
      osc.start();
      osc.stop(context.currentTime + dur / 1000);
    } catch (e) { console.log("Audio not supported"); }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0 
    }, false);

    scanner.render(async (text) => {
      if (isProcessing || text === lastScanRef.current) return;
      
      setIsProcessing(true);
      lastScanRef.current = text;
      
      const currentEventId = localStorage.getItem('current_event_id');

      try {
        const response = await fetch('https://qless-backend-fubj.onrender.com/mark-attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reg_no: text, event_id: currentEventId }) 
        });

        const data = await response.json();
        if (data.success) {
          if (data.type === 'new') {
            setScanResult({ status: 'success', message: `Verified: ${data.name}` });
            playBeep(1000, 200);
          } else {
            setScanResult({ status: 'dup', message: `${data.name}: Already Marked!` });
            playBeep(500, 400);
          }
          onScanSuccess(); 
        } else {
          setScanResult({ status: 'error', message: data.message });
          playBeep(300, 600);
        }
      } catch (err) {
        setScanResult({ status: 'error', message: "Server Connection Failed!" });
      } finally {
        setTimeout(() => {
          setIsProcessing(false);
          setScanResult(null);
          lastScanRef.current = ""; 
        }, 3000);
      }
    }, () => {});

    return () => { scanner.clear().catch(e => console.log("Scanner clear error")); };
  }, [onScanSuccess]);

  return (
    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto p-4">
      <div id="reader" className="w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-black"></div>
      <div className={`w-full p-5 rounded-2xl flex items-center justify-center gap-3 border shadow-lg transition-all duration-500 transform ${
        scanResult?.status === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-500 scale-105' :
        scanResult?.status === 'dup' ? 'bg-orange-500/20 border-orange-500/50 text-orange-500' :
        scanResult?.status === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-500 scale-95' :
        'bg-white/5 border-white/10 text-white/50'
      }`}>
        {isProcessing && !scanResult ? (
          <><Loader2 className="animate-spin" /> <span className="font-bold tracking-widest uppercase text-xs">Processing...</span></>
        ) : scanResult ? (
          <><CheckCircle2 /> <span className="font-bold text-center">{scanResult.message}</span></>
        ) : (
          <><QrCode className="animate-pulse" /> <span className="font-medium">Waiting for QR Code</span></>
        )}
      </div>
    </div>
  );
};

export default Scanner;