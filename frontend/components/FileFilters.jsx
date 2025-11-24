import { useMemo } from 'react';
import { motion } from 'framer-motion';

const normalizeCollections = (collections) =>
  collections
    .filter(Boolean)
    .map((item) =>
      typeof item === 'string'
        ? { name: item, subCollections: [] }
        : { name: item.name, subCollections: item.subCollections || [] }
    );

const FileFilters = ({
  collections = [],
  searchValue,
  onSearchChange,
  selectedCollection,
  onCollectionChange,
  selectedSubCollection,
  onSubCollectionChange,
  onShareSelection
}) => {
  const normalizedCollections = useMemo(() => normalizeCollections(collections), [collections]);
  const activeCollection = normalizedCollections.find((item) => item.name === selectedCollection);
  const subCollections = activeCollection ? activeCollection.subCollections : [];

  return (
    <div className="glass-card p-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <label className="flex-1 text-sm font-medium">
        Search
        <div className="relative mt-2">
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Find files by name or type..."
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 pr-10 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
          />
          <span className="absolute right-3 top-3 text-textMuted text-xs">⌘K</span>
        </div>
      </label>

      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <label className="w-full md:w-56 text-sm font-medium">
          Collection
          <motion.select
            value={selectedCollection}
            onChange={(event) => {
              onCollectionChange(event.target.value);
              onSubCollectionChange('');
            }}
            whileTap={{ scale: 0.99 }}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
          >
            <option value="">All collections</option>
            {normalizedCollections.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </motion.select>
        </label>

        <label className="w-full md:w-56 text-sm font-medium">
          Sub-collection
          <motion.select
            value={selectedSubCollection}
            onChange={(event) => onSubCollectionChange(event.target.value)}
            disabled={!selectedCollection || !subCollections.length}
            whileTap={{ scale: 0.99 }}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 disabled:opacity-40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
          >
            <option value="">All sub-collections</option>
            {subCollections.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </motion.select>
        </label>

        {onShareSelection && selectedCollection && (
          <motion.button
            onClick={() => onShareSelection(selectedCollection, selectedSubCollection || null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary whitespace-nowrap"
          >
            Share selection
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default FileFilters;

