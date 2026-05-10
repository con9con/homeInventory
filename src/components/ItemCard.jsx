const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const dateFmt = date =>
  new Date(date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default function ItemCard({ item, onEdit, onDelete, onView }) {
  const [thumb] = item.photos;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div onClick={onView} className="cursor-pointer flex flex-col flex-1">
        <div className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
          {thumb ? (
            <img
              src={thumb}
              alt={`${item.brand} ${item.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-300 text-5xl select-none">📦</span>
          )}
        </div>
        <div className="p-4 flex flex-col gap-1 flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{item.brand}</p>
          <p className="font-semibold text-gray-800 leading-snug">{item.model}</p>
          <p className="text-blue-600 font-medium text-sm">{fmt.format(item.price)}</p>
          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
            <p className="text-gray-400 text-xs">{dateFmt(item.dateAdded)}</p>
            {item.category && (
              <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 truncate">
                {item.category}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex border-t border-gray-100">
        <button
          onClick={() => onEdit(item)}
          className="flex-1 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Edit
        </button>
        <div className="w-px bg-gray-100" />
        <button
          onClick={() => onDelete(item.id)}
          className="flex-1 py-2 text-sm text-red-400 hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
