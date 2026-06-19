import { useId, useRef } from 'react';

type AdminImagePickerProps = {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  helperText?: string;
};

function emptySlots(images: string[]) {
  return Math.max(4, images.length + 1);
}

function AdminImagePicker({ label, images, onChange, helperText }: AdminImagePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    const nextImages = await Promise.all(
      Array.from(fileList).map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Could not read image.'));
            reader.readAsDataURL(file);
          }),
      ),
    );

    onChange([...images, ...nextImages.filter(Boolean)]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  const slotCount = emptySlots(images);

  return (
    <div className="input-group">
      <div className="admin-image-picker-head">
        <label htmlFor={inputId}>{label}</label>
        <button className="button-secondary" type="button" onClick={() => inputRef.current?.click()}>Add Pic</button>
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
                onClick={() => inputRef.current?.click()}
                aria-label={image ? `Replace image ${index + 1}` : `Add image ${index + 1}`}
              >
                {image ? <img src={image} alt="" /> : <span>Add Pic</span>}
              </button>
              {image ? (
                <button
                  type="button"
                  className="admin-image-remove"
                  onClick={() => onChange(images.filter((_, imageIndex) => imageIndex !== index))}
                >
                  Remove Pic
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
      {helperText ? <p className="form-note">{helperText}</p> : null}
    </div>
  );
}

export default AdminImagePicker;
