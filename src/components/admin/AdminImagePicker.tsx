import { useEffect, useId, useState } from 'react';

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
  const inputId = useId();
  const [slotCount, setSlotCount] = useState(emptySlots(images));
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingFiles, setPendingFiles] = useState<Record<number, File[]>>({});

  useEffect(() => {
    setSlotCount((current) => Math.max(current, emptySlots(images)));
  }, [images]);

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('image', file, file.name);

    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
      body: formData,
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload.url) {
      throw new Error(payload.message || 'Could not upload image.');
    }
    return String(payload.url);
  }

  async function handleFiles(targetIndex: number, files: File[]) {
    if (!files.length) return;
    setUploading(true);
    setErrorMessage('');
    try {
      const nextImages = await Promise.all(files.map((file) => uploadFile(file)));
      const filtered = nextImages.filter(Boolean);
      const isExistingImage = targetIndex < images.length;
      const next = [...images];
      if (isExistingImage) {
        if (filtered[0]) {
          next[targetIndex] = filtered[0];
        }
        if (filtered.length > 1) {
          next.push(...filtered.slice(1));
        }
      } else {
        next.push(...filtered);
      }
      onChange(next);
      if (onCaptionsChange) {
        const nextCaptions = [...captions];
        if (isExistingImage) {
          nextCaptions[targetIndex] = nextCaptions[targetIndex] || '';
          if (filtered.length > 1) {
            nextCaptions.push(...filtered.slice(1).map(() => ''));
          }
        } else {
          nextCaptions.push(...filtered.map(() => ''));
        }
        onCaptionsChange(nextCaptions);
      }
      setSlotCount((current) => Math.max(current, images.length + filtered.length, 4));
      setPendingFiles((current) => {
        const nextPending = { ...current };
        delete nextPending[targetIndex];
        return nextPending;
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  }

  function storePendingFiles(targetIndex: number, fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : [];
    if (!files.length) return;
    setErrorMessage('');
    setPendingFiles((current) => ({ ...current, [targetIndex]: files }));
  }

  return (
    <div className="input-group">
      <div className="admin-image-picker-head">
        <label htmlFor={inputId}>{label}</label>
        <button className="button-secondary" type="button" onClick={() => setSlotCount((current) => current + 1)} disabled={uploading}>
          Add Slot
        </button>
      </div>
      <div className="admin-image-grid">
        {Array.from({ length: slotCount }).map((_, index) => {
          const image = images[index];
          const tileInputId = `${inputId}-${index}`;
          const selectedFiles = pendingFiles[index] || [];
          return (
            <div className="admin-image-tile" key={`${label}-${index}`}>
              <input
                id={tileInputId}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.heic,.heif,image/*"
                multiple
                className="admin-file-input"
                onChange={(event) => {
                  storePendingFiles(index, event.target.files);
                  event.currentTarget.value = '';
                }}
                disabled={uploading}
              />
              <label
                htmlFor={tileInputId}
                className={`admin-image-frame${image ? ' has-image' : ''}`}
                aria-label={image ? `Replace image ${index + 1}` : `Add image ${index + 1}`}
              >
                {image ? <img src={image} alt="" /> : <span>Add Pic</span>}
              </label>
              <div className="admin-image-actions">
                <label className="button-secondary admin-image-upload-trigger" htmlFor={tileInputId}>
                  {image ? 'Choose New Pic' : 'Choose Pic'}
                </label>
                {selectedFiles.length ? (
                  <button
                    type="button"
                    className="button button-primary admin-image-upload-button"
                    onClick={() => {
                      handleFiles(index, selectedFiles).catch(() => undefined);
                    }}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                ) : null}
              </div>
              {selectedFiles.length ? (
                <p className="form-note admin-image-selected-files">
                  {selectedFiles.map((file) => file.name).join(', ')}
                </p>
              ) : null}
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
