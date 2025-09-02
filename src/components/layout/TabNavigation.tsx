interface Tab {
  key: string;
  label: string;
}

export default function TabNavigation({
  tabs,
  value,
  onChange
}: {
  tabs: Tab[];
  value: string;
  onChange: (k: string) => void;
}) {
  return (
    <nav className="flex gap-1 border-b border-gray-200">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 text-sm border-b-2 ${
            value === t.key
              ? 'border-sushi-600 text-sushi-700'
              : 'border-transparent text-gray-500'
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
