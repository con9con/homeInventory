import ItemCard from './ItemCard';

export default function ItemList({ items, onEdit, onDelete, isFiltered }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <span className="text-6xl mb-4">{isFiltered ? '🔍' : '🏠'}</span>
        <p className="text-lg font-medium">
          {isFiltered ? 'No items match your search' : 'No items yet'}
        </p>
        {!isFiltered && (
          <p className="text-sm mt-1">Click "Add Item" to start building your inventory.</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map(item => (
        <ItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
