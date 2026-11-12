// src/components/AsyncView.jsx
// Menampilkan status memuat atau error, dan isi halaman hanya kalau data sudah siap.

export default function AsyncView({ loading, error, onRetry, loadingContent, children }) {
  if (loading) {
    return loadingContent || (
      <div className="loading-state" role="status">
        <span className="spinner" />
        <span>Memuat data...</span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="alert alert-error">
        <p>{error.message}</p>
        <button type="button" onClick={onRetry}>
          Coba lagi
        </button>
      </div>
    )
  }
  return children
}