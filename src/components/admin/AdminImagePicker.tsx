import { useEffect, useId, useRef, useState } from 'react';

type AdminImagePickerProps = {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  captions?: string[];
  onCaptionsChange?: (captions: string[]) => void;
  helperText?: string;
};

function emptySlots(images: string[]) {
  return Math.max(4, images.length + 1);
}

function AdminImagePicker({ label, images, onChange, captions = [], onCaptionsChange, helperText }: AdminImagePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();
  const [slotCount, setSlotCount] = useState(emptySlots(images));
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setSlotCount((current) => Math.max(current, emptySlots(images)));
  }, [images]);

  async function uploadFile(file: File) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read image.'));
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        filename: file.name,
        dataUrl,
      }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload.url) {
      throw new Error(payload.message || 'Could not upload image.');
    }
    return String(payload.url);
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(true);
    setErrorMessage('');
    try {
      const nextImages = await Promise.all(Array.from(fileList).map((file) => uploadFile(file)));
      const filtered = nextImages.filter(Boolean);
      if (targetIndex !== null) {
        const next = [...images];
        if (filtered[0]) {
          next[targetIndex] = filtered[0];
        }
        onChange(next);
        if (onCaptionsChange) {
          const nextCaptions = [...captions];
          nextCaptions[targetIndex] = nextCaptions[targetIndex] || '';
          onCaptionsChange(nextCaptions);
        }
        setTargetIndex(null);
      } else {
        onChange([...images, ...filtered]);
        if (onCaptionsChange) {
          onCaptionsChange([...captions, ...filtered.map(() => '')]);
        }
      }
      setSlotCount((current) => Math.max(current, images.length + filtered.length, 4));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not upload image.');
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  return (
    <div className="input-group">
      <div className="admin-image-picker-head">
        <label htmlFor={inputId}>{label}</label>
        <button className="button-secondary" type="button" onClick={() => setSlotCount((current) => current + 1)} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Add Pic'}
        </button>
      </div>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="admin-file-input"
        onChange={(event) => {
          handleFiles(event.target.files).catch(() => undefined);
        }}
      />
      <div className="admin-image-grid">
        {Array.from({ length: slotCount }).map((_, index) => {
          const image = images[index];
          return (
            <div className="admin-image-tile" key={`${label}-${index}`}>
              <button
                type="button"
                className={`admin-image-frame${image ? ' has-image' : ''}`}
                onClick={() => {
                  setTargetIndex(index);
                  inputRef.current?.click();
                }}
                aria-label={image ? `Replace image ${index + 1}` : `Add image ${index + 1}`}
                disabled={uploading}
              >
                {image ? <img src={image} alt="" /> : <span>Add Pic</span>}
              </button>
              {image ? (
                <>
                  {onCaptionsChange ? (
                    <div className="input-group admin-image-caption-field">
                      <label htmlFor={`${inputId}-caption-${index}`}>Caption</label>
                      <input
                        id={`${inputId}-caption-${index}`}
                        value={captions[index] || ''}
                        onChange={(event) => {
                          const nextCaptions = [...captions];
                          nextCaptions[index] = event.target.value;
                          onCaptionsChange(nextCaptions);
                        }}
                        placeholder="Optional caption"
                      />
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="admin-image-remove"
                    onClick={() => {
                      onChange(images.filter((_, imageIndex) => imageIndex !== index));
                      if (onCaptionsChange) {
                        onCaptionsChange(captions.filter((_, captionIndex) => captionIndex !== index));
                      }
                    }}
                    disabled={uploading}
                  >
                    Remove Pic
                  </button>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
      {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      {helperText ? <p className="form-note">{helperText}</p> : null}
    </div>
  );
}

export default AdminImagePicker;
