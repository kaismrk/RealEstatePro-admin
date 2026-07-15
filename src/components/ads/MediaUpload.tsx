"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, Film, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { backendFileUrl } from "@/lib/utils/media";
import { useUploadAdMedia } from "@/lib/hooks/useAds";
import type { AdCampaign, AdMediaType } from "@/lib/types";

// ── Client-side validation (mirrors backend rules) ───────────────────────────

export const AD_IMAGE_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const AD_VIDEO_MIME_TYPES = ["video/mp4"];
export const AD_MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const AD_MAX_VIDEO_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Validate a creative file against the campaign's media_type.
 * `kind: "poster"` always applies image rules (video thumbnail).
 * Returns an error message, or null when the file is acceptable.
 */
export function validateAdFile(
  file: { type: string; size: number },
  mediaType: AdMediaType,
  kind: "main" | "poster" = "main"
): string | null {
  const asImage = kind === "poster" || mediaType === "image";
  if (asImage) {
    if (!AD_IMAGE_MIME_TYPES.includes(file.type)) {
      return "Only JPEG, PNG or WebP images are allowed";
    }
    if (file.size > AD_MAX_IMAGE_BYTES) {
      return "Image must be 5 MB or smaller";
    }
    return null;
  }
  if (!AD_VIDEO_MIME_TYPES.includes(file.type)) {
    return "Only MP4 videos are allowed";
  }
  if (file.size > AD_MAX_VIDEO_BYTES) {
    return "Video must be 20 MB or smaller";
  }
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface MediaUploadProps {
  campaign: AdCampaign;
  onUploaded?: () => void;
}

export function MediaUpload({ campaign, onUploaded }: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const { mutate: upload, isPending } = useUploadAdMedia();

  const isVideo = campaign.media_type === "video";
  const currentUrl = backendFileUrl(campaign.media_url);
  const currentPosterUrl = backendFileUrl(campaign.thumbnail_url);

  const acceptMain = isVideo ? "video/mp4" : "image/jpeg,image/png,image/webp";

  const pickFile = useCallback(
    (picked: File | null) => {
      setError(null);
      if (!picked) return;
      const err = validateAdFile(picked, campaign.media_type, "main");
      if (err) {
        setError(err);
        setFile(null);
        return;
      }
      setFile(picked);
    },
    [campaign.media_type]
  );

  const pickPoster = useCallback(
    (picked: File | null) => {
      setError(null);
      if (!picked) return;
      const err = validateAdFile(picked, campaign.media_type, "poster");
      if (err) {
        setError(err);
        setPoster(null);
        return;
      }
      setPoster(picked);
    },
    [campaign.media_type]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    if (isVideo && poster) formData.append("poster", poster);
    setProgress(0);
    upload(
      { id: campaign.id, formData, onProgress: setProgress },
      {
        onSuccess: () => {
          setFile(null);
          setPoster(null);
          setProgress(null);
          onUploaded?.();
        },
        onError: () => {
          setProgress(null);
          setError("Upload failed. Check the file and try again.");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Current creative preview */}
      {currentUrl && (
        <div className="space-y-1">
          <Label>Current creative</Label>
          {isVideo ? (
            <video
              src={currentUrl}
              poster={currentPosterUrl ?? undefined}
              controls
              muted
              className="max-h-48 w-full rounded-md border border-neutral-200 bg-black object-contain"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={currentUrl}
              alt="Current ad creative"
              className="max-h-48 rounded-md border border-neutral-200 object-contain"
            />
          )}
        </div>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors",
          dragOver
            ? "border-primary-500 bg-primary-50"
            : "border-neutral-300 hover:border-neutral-400"
        )}
      >
        <UploadCloud className="h-8 w-8 text-neutral-400" />
        <p className="text-sm text-neutral-600">
          {file ? (
            <span className="font-medium text-neutral-900">{file.name}</span>
          ) : (
            <>Drag &amp; drop or click to select the {isVideo ? "MP4 video" : "image"}</>
          )}
        </p>
        <p className="text-xs text-neutral-400">
          {isVideo ? "MP4 · max 20 MB" : "JPEG / PNG / WebP · max 5 MB"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptMain}
          className="hidden"
          data-testid="ad-media-file-input"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Optional poster for videos */}
      {isVideo && (
        <div className="space-y-2">
          <Label>Poster image (optional)</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => posterInputRef.current?.click()}
              className="gap-1.5"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              {poster ? poster.name : "Choose poster"}
            </Button>
            {poster && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPoster(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <input
            ref={posterInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            data-testid="ad-media-poster-input"
            onChange={(e) => pickPoster(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-neutral-400">
            Shown before the video plays. JPEG / PNG / WebP · max 5 MB.
          </p>
        </div>
      )}

      {/* Local file preview */}
      {file && (
        <div className="space-y-1">
          <Label>Preview</Label>
          {isVideo ? (
            <video
              src={URL.createObjectURL(file)}
              controls
              muted
              className="max-h-48 w-full rounded-md border border-neutral-200 bg-black object-contain"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={URL.createObjectURL(file)}
              alt="Selected creative preview"
              className="max-h-48 rounded-md border border-neutral-200 object-contain"
            />
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Progress bar */}
      {progress !== null && (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500">{progress}% uploaded</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!file || isPending}
          className="gap-2"
        >
          {isVideo ? <Film className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          {isPending ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
}
