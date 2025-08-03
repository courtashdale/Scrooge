'use client';

type DateFilter = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'all';

interface FilterControlsProps {
  currentFilter: DateFilter;
  onFilterChange: (filter: DateFilter) => void;
}

export default function FilterControls({ currentFilter, onFilterChange }: FilterControlsProps) {
  const filters: { value: DateFilter; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-black">Filter by Date</h3>
      <div className="flex flex-wrap gap-2">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentFilter === value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}