import { useEffect, useId, useState } from 'react';

type AdminImagePickerProps = {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  captions?: string[];
  onCaptionsChange?: (captions: string[]) => void;
  groups?: string[];
  onGroupsChange?: (groups: string[]) => void;
  groupLabel?: string;
  helperText?: string;
  minSlots?: number;
  maxSlots?: number;
  showAddButton?: boolean;
};

function emptySlots(images: string[], minSlots: number, maxSlots?: number) {
  const proposed = Math.max(minSlots, images.length + 1);
  return typeof maxSlots === 'number' ? Math.min(proposed, maxSlots) : proposed;
}

function AdminImagePicker({
  label,
  images,
  onChange,
  captions = [],
  onCaptionsChange,
  groups = [],
  onGroupsChange,
  groupLabel = 'Group',
  helperText,
  minSlots = 4,
  maxSlots,
  showAddButton = true,
}: AdminImagePickerProps) {
  const inputId = useId();
  const [slotCount, setSlotCount] = useState(emptySlots(images, minSlots, maxSlots));
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setSlotCount((current) => {
      const desired = emptySlots(images, minSlots, maxSlots);
      return typeof maxSlots === 'number'
        ? Math.min(Math.max(current, desired), maxSlots)
        : Math.max(current, desired);
    });
  }, [images, minSlots, maxSlots]);

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
      throw new Error(payload.message ? `Upload failed (${res.status}): ${payload.message}` : `Upload failed (${res.status}).`);
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
      if (onGroupsChange) {
        const nextGroups = [...groups];
        if (isExistingImage) {
          nextGroups[targetIndex] = nextGroups[targetIndex] || '';
          if (filtered.length > 1) {
            nextGroups.push(...filtered.slice(1).map(() => ''));
          }
        } else {
          nextGroups.push(...filtered.map(() => ''));
        }
        onGroupsChange(nextGroups);
      }
      setSlotCount((current) => {
        const proposed = Math.max(current, images.length + filtered.length, minSlots);
        return typeof maxSlots === 'number' ? Math.min(proposed, maxSlots) : proposed;
      });
    } catch (error) {
      console.error('Admin image upload client failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="input-group">
      <div className="admin-image-picker-head">
        <p id={`${inputId}-label`}>{label}</p>
        {showAddButton ? (
          <button
            className="button-secondary"
            type="button"
            onClick={() => setSlotCount((current) => {
              const proposed = current + 1;
              return typeof maxSlots === 'number' ? Math.min(proposed, maxSlots) : proposed;
            })}
            disabled={uploading || (typeof maxSlots === 'number' && slotCount >= maxSlots)}
          >
            {uploading ? 'Uploading...' : 'Add Pic'}
          </button>
        ) : null}
      </div>
      <div className="admin-image-grid" aria-labelledby={`${inputId}-label`}>
        {Array.from({ length: slotCount }).map((_, index) => {
          const image = images[index];
          const tileInputId = `${inputId}-${index}`;
          return (
            <div className="admin-image-tile" key={`${label}-${index}`}>
              <input
                id={tileInputId}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.heic,.heif,image/*"
                multiple
                className="admin-file-input"
                onChange={(event) => {
                  const files = event.currentTarget.files ? Array.from(event.currentTarget.files) : [];
                  event.currentTarget.value = '';
                  handleFiles(index, files).catch(() => undefined);
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
                  {onGroupsChange ? (
                    <div className="input-group admin-image-caption-field">
                      <label htmlFor={`${inputId}-group-${index}`}>{groupLabel}</label>
                      <input
                        id={`${inputId}-group-${index}`}
                        value={groups[index] || ''}
                        onChange={(event) => {
                          const nextGroups = [...groups];
                          nextGroups[index] = event.target.value;
                          onGroupsChange(nextGroups);
                        }}
                        placeholder="Optional group"
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
                      if (onGroupsChange) {
                        onGroupsChange(groups.filter((_, groupIndex) => groupIndex !== index));
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
