import React, { useEffect } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"

export function Modal({ id, title, children, onClose }) {
  useEffect(() => {
    const modalEl = document.getElementById(id)
    if (!modalEl) return

    const handleHidden = () => onClose && onClose()

    modalEl.addEventListener("hidden.bs.modal", handleHidden)

    return () => {
      modalEl.removeEventListener("hidden.bs.modal", handleHidden)
    }
  }, [id, onClose])

  return (
    <div
      className="modal fade"
      id={id}
      tabIndex="-1"
      aria-labelledby={`${id}Label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${id}Label`}>{title}</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            {children}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
