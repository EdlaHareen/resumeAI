import { Upload, FileText } from "lucide-react";
import { useRef, useState, useCallback } from "react";

interface Props {
  file: File | null;
  onFileSelect: (file: File) => void;
}

const ACCEPTED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ACCEPTED_EXT = [".pdf", ".docx"];

export function UploadZone({ file, onFileSelect }: Props) {
  const [dragging, setDragging] = useState(false);
  const [typeError, setTypeError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((f: File): boolean => {
    const name = f.name.toLowerCase();
    const ok = ACCEPTED_TYPES.includes(f.type) || ACCEPTED_EXT.some((ext) => name.endsWith(ext));
    if (!ok) { setTypeError("Only PDF and DOCX files are accepted."); return false; }
    if (f.size > 5 * 1024 * 1024) { setTypeError("File must be under 5 MB."); return false; }
    setTypeError("");
    return true;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && validate(dropped)) onFileSelect(dropped);
  }, [onFileSelect, validate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && validate(selected)) onFileSelect(selected);
  };

  const borderColor = dragging
    ? "rgba(204,255,0,0.6)"
    : file
    ? "rgba(16,185,129,0.5)"
    : "rgba(255,255,255,0.12)";

  const bgColor = dragging
    ? "rgba(204,255,0,0.04)"
    : file
    ? "rgba(16,185,129,0.05)"
    : "rgba(255,255,255,0.02)";

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload resume file. Click or drag and drop a PDF or DOCX file."
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          borderRadius: "1.25rem",
          border: `2px dashed ${borderColor}`,
          background: bgColor,
          padding: "2.5rem 1.5rem",
          cursor: "pointer",
          transition: "border-color 0.2s, background 0.2s",
          outline: "none",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(204,255,0,0.5)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = borderColor)}
      >
        {file ? (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FileText size={22} color="#10b981" aria-hidden="true" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>{file.name}</p>
            <p style={{ fontSize: 12, color: "rgba(235,235,235,0.35)" }}>Click to replace</p>
          </>
        ) : (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Upload size={22} color="rgba(235,235,235,0.5)" aria-hidden="true" />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--white-primary)" }}>
                Drop your resume here
              </p>
              <p style={{ fontSize: 12, color: "rgba(235,235,235,0.35)", marginTop: 4 }}>
                PDF or DOCX, up to 5 MB
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="sr-only"
          onChange={handleChange}
          aria-hidden="true"
        />
      </div>
      {typeError && (
        <p role="alert" style={{ marginTop: "0.5rem", fontSize: 12, color: "#f87171" }}>{typeError}</p>
      )}
    </div>
  );
}
