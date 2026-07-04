"use client";

interface DownloadButtonProps {
  blob: Blob;
  filename: string;
  label?: string;
}

export default function DownloadButton({
  blob,
  filename,
  label = "Download result",
}: DownloadButtonProps) {
  function handleClick() {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn-primary"
      style={{
        background: "linear-gradient(180deg, #16a34a, #15803d)",
        boxShadow: "0 10px 26px -10px rgba(22,163,74,0.5), 0 1px 0 rgba(255,255,255,0.25) inset",
      }}
    >
      <svg
        aria-hidden
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      {label}
      <span className="ml-1 text-xs font-normal opacity-80">{filename}</span>
    </button>
  );
}