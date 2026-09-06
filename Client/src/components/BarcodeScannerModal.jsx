import React, { useState, useEffect, useRef } from "react";
import { X, Camera, RefreshCw, AlertCircle, ScanLine, Check } from "lucide-react";

const BarcodeScannerModal = ({ isOpen, onClose, onDetected }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  const [isScanning, setIsScanning] = useState(false);
  const [manualIsbn, setManualIsbn] = useState("");
  const [supportedFormats, setSupportedFormats] = useState(null);

  // Check BarcodeDetector support
  useEffect(() => {
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      window.BarcodeDetector.getSupportedFormats()
        .then((formats) => setSupportedFormats(formats))
        .catch(() => setSupportedFormats([]));
    }
  }, []);

  // Camera stream setup
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError("");
    setIsScanning(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setHasCamera(true);
      startBarcodeDetection();
    } catch (err) {
      console.warn("Camera start warning:", err);
      setHasCamera(false);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access or type the ISBN manually."
          : "Unable to access camera on this device. You can type the ISBN below."
      );
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const toggleFacingMode = () => {
    stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        audioCtx.close();
      }, 100);
    } catch (e) {
      // Audio not supported or blocked
    }
  };

  const handleScanSuccess = (rawValue) => {
    playBeep();
    stopCamera();
    onDetected(rawValue);
    onClose();
  };

  const startBarcodeDetection = () => {
    if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
      return;
    }

    try {
      const barcodeDetector = new window.BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "code_128", "code_39"],
      });

      const detectFrame = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          animFrameRef.current = requestAnimationFrame(detectFrame);
          return;
        }

        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            if (code) {
              handleScanSuccess(code);
              return;
            }
          }
        } catch (e) {
          // ignore frame errors
        }

        animFrameRef.current = requestAnimationFrame(detectFrame);
      };

      animFrameRef.current = requestAnimationFrame(detectFrame);
    } catch (err) {
      console.warn("BarcodeDetector error:", err);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualIsbn.trim()) {
      handleScanSuccess(manualIsbn.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-pop">
      <div className="w-full max-w-lg bg-white dark:bg-[#1C1C24] border-3 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 nb-card-cyan border-b-3 border-black">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-black text-[#00E5FF] border-2 border-black font-black shadow-[2px_2px_0px_0px_#FFFDF5]">
              <ScanLine className="w-5 h-5 stroke-2.5" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-black leading-tight">
                BARCODE SCANNER
              </h2>
              <p className="text-[11px] font-extrabold text-black/80 uppercase">
                Point camera at the ISBN barcode on book back
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-white text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FF4D4D] hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-3" />
          </button>
        </div>

        {/* Viewfinder / Video Canvas */}
        <div className="relative bg-black aspect-[4/3] flex items-center justify-center overflow-hidden">
          {hasCamera && (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Viewfinder Target Box with Neubrutalist Corners */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
            <div className="relative w-64 h-36 border-2 border-dashed border-[#CCFF00] rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              {/* Animated laser line */}
              <div className="absolute left-0 right-0 h-1 bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D] animate-bounce top-1/2" />

              {/* Corner Accents */}
              <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-4 border-l-4 border-[#CCFF00]" />
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-4 border-r-4 border-[#CCFF00]" />
              <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-4 border-l-4 border-[#CCFF00]" />
              <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-4 border-r-4 border-[#CCFF00]" />
            </div>
          </div>

          {/* Camera controls toolbar */}
          {hasCamera && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="nb-badge nb-badge-white text-xs cursor-pointer hover:bg-[#FFDE59]"
                title="Switch Camera"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-2.5" />
                <span>FLIP</span>
              </button>
            </div>
          )}

          {/* Camera Error Message */}
          {!hasCamera && (
            <div className="p-6 text-center text-white max-w-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FF4D4D] text-white border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000]">
                <Camera className="w-6 h-6 stroke-2.5" />
              </div>
              <p className="text-xs font-bold text-neutral-300">{cameraError}</p>
            </div>
          )}
        </div>

        {/* Manual ISBN Input & Footer */}
        <div className="p-5 bg-white dark:bg-[#1C1C24] space-y-3 border-t-2 border-black">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Or enter 10/13 digit ISBN directly..."
              value={manualIsbn}
              onChange={(e) => setManualIsbn(e.target.value)}
              className="nb-input text-sm font-bold flex-1"
            />
            <button
              type="submit"
              className="nb-btn nb-btn-lime nb-btn-sm shrink-0"
            >
              <Check className="w-4 h-4 stroke-3" />
              <span>USE ISBN</span>
            </button>
          </form>

          <p className="text-[11px] font-extrabold text-black/60 dark:text-white/60 text-center">
            Supported formats: ISBN-10, ISBN-13, EAN-13, UPC barcodes
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
