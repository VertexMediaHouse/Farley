
interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">✅</div>
        <h2>Thanks for filling form</h2>
        <p>We have received your request and will get back to you shortly.</p>
        <button className="btn btn-blue" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
