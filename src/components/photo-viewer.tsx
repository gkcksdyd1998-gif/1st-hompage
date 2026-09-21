"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
export type ViewPhoto = {
  src: string;
  title: string;
  detail?: string;
  mapUrl?: string;
};
export function PhotoViewer({
  photos,
  index,
  onChange,
  onClose,
}: {
  photos: ViewPhoto[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const photo = photos[index];
  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    node?.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      node?.close();
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, []);
  if (!photo) return null;
  const advance = (step: number) =>
    onChange((index + step + photos.length) % photos.length);
  return (
    <dialog
      ref={dialog}
      className="photo-dialog"
      aria-label={photo.title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          advance(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          advance(1);
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="viewer-top">
        <span>
          {index + 1} / {photos.length}
        </span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="사진 닫기"
          title="사진 닫기"
        >
          <X />
        </button>
      </div>
      <div className="viewer-image">
        <Image
          src={photo.src}
          alt={photo.title}
          fill
          sizes="95vw"
          className="contain"
          priority
        />
        <button
          className="viewer-prev icon-button"
          aria-label="이전 사진"
          title="이전 사진"
          onClick={() => advance(-1)}
        >
          <ChevronLeft />
        </button>
        <button
          className="viewer-next icon-button"
          aria-label="다음 사진"
          title="다음 사진"
          onClick={() => advance(1)}
        >
          <ChevronRight />
        </button>
      </div>
      <div className="viewer-caption" aria-live="polite">
        <div>
          <h2>{photo.title}</h2>
          <p>{photo.detail}</p>
        </div>
        {photo.mapUrl && (
          <a href={photo.mapUrl} target="_blank" rel="noreferrer">
            지도 <ExternalLink size={16} />
          </a>
        )}
      </div>
    </dialog>
  );
}
