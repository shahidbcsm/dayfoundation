import React, { useRef, useState, useCallback } from "react";
import { Upload, CheckCircle, XCircle } from "lucide-react";
import { fileToCompressedBase64 } from "../firebase/services";

interface ImageUploaderProps {
  /** Storage folder label, e.g. "gallery", "blogs", "events", "team" */
  folder: string;
  /** Called with the final public image URL once upload completes */
  onUpload: (imageUrl: string) => void;
  /** Optional: current image URL (shows as preview) */
  currentUrl?: string;
  /** Optional label override */
  label?: string;
  /** Whether the uploader is disabled */
  disabled?: boolean;
}

type UploadStatus = "idle" | "uploading" | "done" | "error";

// ImgBB API key configuration
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "f0eb7ec5873816f933ddf7ae9487564d";

const ImageUploader: React.FC<ImageUploaderProps> = ({
  folder,
  onUpload,
  currentUrl = "",
  label = "Upload Photo",
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(currentUrl);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const uploadFile = useCallback(
    async (file: File) => {
      // Validate type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg("Only JPG, PNG, WebP, GIF allowed.");
        setStatus("error");
        return;
      }
      // Validate size (32MB limit)
      if (file.size > 32 * 1024 * 1024) {
        setErrorMsg("File too large. Max 32MB.");
        setStatus("error");
        return;
      }

      setStatus("uploading");
      setProgress(20);
      setErrorMsg("");

      // Convert to compressed Base64 Data URL for instant, reliable Firestore storage
      let base64DataUrl: string;
      try {
        base64DataUrl = await fileToCompressedBase64(file, 1200, 0.82);
        setPreview(base64DataUrl);
        onUpload(base64DataUrl);
        setStatus("done");
      } catch {
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        onUpload(localUrl);
      }

      // Try ImgBB upload in background for hosted URL fallback
      try {
        const formData = new FormData();
        formData.append("image", file);
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(pct);
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            try {
              const res = JSON.parse(xhr.responseText);
              if (res.success && res.data && res.data.url) {
                setPreview(res.data.url);
                onUpload(res.data.url);
              }
            } catch {
              // base64 is active
            }
          }
        });
        xhr.open("POST", `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`);
        xhr.send(formData);
      } catch {
        // base64 fallback is active
      }
    },
    [folder, onUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleClick = () => {
    if (!disabled && status !== "uploading") inputRef.current?.click();
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview("");
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
    onUpload("");
  };

  return (
    <div style={{ width: "100%" }}>
      <label
        style={{
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "var(--color-text)",
          marginBottom: "0.5rem",
          display: "block",
        }}
      >
        {label}
      </label>

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${
            isDragging
              ? "var(--color-primary)"
              : status === "error"
              ? "#f59e0b"
              : status === "done"
              ? "#16a34a"
              : "var(--color-border)"
          }`,
          borderRadius: "12px",
          padding: "1.25rem",
          textAlign: "center",
          cursor: disabled || status === "uploading" ? "not-allowed" : "pointer",
          background: isDragging ? "rgba(15, 76, 129, 0.05)" : "var(--color-bg-white)",
          transition: "all 0.2s ease",
          position: "relative",
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={disabled || status === "uploading"}
        />

        {/* Preview thumbnail */}
        {preview && (
          <div style={{ position: "relative", marginBottom: "0.4rem" }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "2px solid var(--color-border-light)",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {status !== "uploading" && (
              <button
                onClick={handleReset}
                title="Remove photo"
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* idle, no preview */}
        {status === "idle" && !preview && (
          <>
            <Upload size={28} style={{ color: "var(--color-text-muted)" }} />
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              <strong>Click to upload</strong> or drag &amp; drop
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
              JPG, PNG, WebP, GIF · Max 25MB
            </div>
          </>
        )}

        {/* idle, has preview */}
        {status === "idle" && preview && (
          <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
            Click to replace image
          </div>
        )}

        {/* uploading */}
        {status === "uploading" && (
          <div style={{ width: "100%", maxWidth: "220px" }}>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--color-primary)",
                fontWeight: 600,
                marginBottom: "0.4rem",
              }}
            >
              Uploading… {progress}%
            </div>
            <div
              style={{
                background: "var(--color-border-light)",
                borderRadius: "99px",
                height: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
                  borderRadius: "99px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}

        {/* done */}
        {status === "done" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#16a34a",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            <CheckCircle size={16} />
            Uploaded successfully!
          </div>
        )}

        {/* error */}
        {status === "error" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#f59e0b",
              fontSize: "0.78rem",
              textAlign: "left",
              maxWidth: "220px",
            }}
          >
            <XCircle size={16} style={{ flexShrink: 0 }} />
            {errorMsg}
          </div>
        )}
      </div>

      {/* URL paste fallback — always visible */}
      <div style={{ marginTop: "0.5rem" }}>
        <input
          type="text"
          className="form-input"
          placeholder="Or paste an image URL directly…"
          style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}
          onChange={(e) => {
            const val = e.target.value.trim();
            if (val) {
              setPreview(val);
              setStatus("done");
              onUpload(val);
            } else {
              setPreview("");
              setStatus("idle");
              onUpload("");
            }
          }}
        />
      </div>
    </div>
  );
};

export default ImageUploader;
