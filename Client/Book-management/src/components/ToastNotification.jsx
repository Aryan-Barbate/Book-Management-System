import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastNotification = ({ toast, onClose }) => {
  const isError = toast.type === "error";
  const isSuccess = toast.type === "success";

  const bgStyle = isSuccess
    ? "bg-[#CCFF00] text-black"
    : isError
      ? "bg-[#FF4D4D] text-white"
      : "bg-[#00E5FF] text-black";

  const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;

  return (
    <div
      className={`nb-card ${bgStyle} p-4 border-3 border-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-3 min-w-[280px] max-w-md animate-slide-down`}
    >
      <Icon className="w-5 h-5 shrink-0 stroke-2.5" />
      <div className="flex-1 text-xs font-black uppercase tracking-wide">
        {toast.message}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-colors border border-black"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5 stroke-3" />
      </button>
    </div>
  );
};

export default ToastNotification;
