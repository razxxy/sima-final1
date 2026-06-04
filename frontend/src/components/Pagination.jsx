export default function Pagination({ page, total, limit, onPageChange }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-sm text-gray-500">
        Menampilkan {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} dari {total} data
      </p>
      <div className="flex gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">‹</button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 text-sm border rounded-lg ${p === page ? 'bg-primary-800 text-white border-primary-800' : 'hover:bg-gray-50'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">›</button>
      </div>
    </div>
  );
}