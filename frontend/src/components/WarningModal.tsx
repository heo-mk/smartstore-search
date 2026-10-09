import { useEffect } from 'react';

interface WarningModalProps {
  message: string;
  onClose: () => void;
}

export function WarningModal({ message, onClose }: WarningModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-label="경고"
        onClick={(e) => e.stopPropagation()}
      >
        <p>{message}</p>
        <button type="button" className="modal-confirm" onClick={onClose} autoFocus>
          확인
        </button>
      </div>
    </div>
  );
}
