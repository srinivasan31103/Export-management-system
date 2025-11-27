import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { Search, Filter, X, Calendar, DollarSign, MapPin, Tag } from 'lucide-react';

export default function AdvancedSearch({ onSearch, onFilterChange, filterConfig = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch({ searchTerm, filters, dateRange });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setDateRange({ from: '', to: '' });
    setSearchTerm('');
    if (onFilterChange) {
      onFilterChange({});
    }
    if (onSearch) {
      onSearch({ searchTerm: '', filters: {}, dateRange: { from: '', to: '' } });
    }
  };

  const activeFilterCount = Object.keys(filters).filter(k => filters[k]).length +
    (dateRange.from || dateRange.to ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders, buyers, products..."
            className="input pl-10 pr-4"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`btn ${isOpen ? 'btn-primary' : 'btn-secondary'} relative`}
        >
          <Filter className="h-5 w-5 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {activeFilterCount}
            </motion.span>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="btn btn-primary"
        >
          Search
        </motion.button>
      </form>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="card p-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Filter className="h-5 w-5 mr-2 text-primary-600" />
                Advanced Filters
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Filter */}
              <FilterField
                label="Status"
                icon={<Tag className="h-4 w-4" />}
              >
                <Select
                  isMulti
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'packed', label: 'Packed' },
                    { value: 'shipped', label: 'Shipped' },
                    { value: 'invoiced', label: 'Invoiced' },
                    { value: 'closed', label: 'Closed' },
                  ]}
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select status..."
                  styles={customSelectStyles}
                />
              </FilterField>

              {/* Country Filter */}
              <FilterField
                label="Country"
                icon={<MapPin className="h-4 w-4" />}
              >
                <Select
                  options={[
                    { value: 'US', label: 'United States' },
                    { value: 'UK', label: 'United Kingdom' },
                    { value: 'DE', label: 'Germany' },
                    { value: 'FR', label: 'France' },
                    { value: 'CN', label: 'China' },
                    { value: 'JP', label: 'Japan' },
                  ]}
                  value={filters.country}
                  onChange={(value) => handleFilterChange('country', value)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select country..."
                  isClearable
                  styles={customSelectStyles}
                />
              </FilterField>

              {/* Amount Range */}
              <FilterField
                label="Amount Range"
                icon={<DollarSign className="h-4 w-4" />}
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minAmount || ''}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    className="input text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAmount || ''}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    className="input text-sm"
                  />
                </div>
              </FilterField>

              {/* Date Range */}
              <FilterField
                label="Date Range"
                icon={<Calendar className="h-4 w-4" />}
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="input text-sm"
                  />
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="input text-sm"
                  />
                </div>
              </FilterField>

              {/* Currency */}
              <FilterField label="Currency">
                <Select
                  options={[
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                    { value: 'GBP', label: 'GBP' },
                    { value: 'JPY', label: 'JPY' },
                  ]}
                  value={filters.currency}
                  onChange={(value) => handleFilterChange('currency', value)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select currency..."
                  isClearable
                  styles={customSelectStyles}
                />
              </FilterField>

              {/* Incoterm */}
              <FilterField label="Incoterm">
                <Select
                  options={[
                    { value: 'FOB', label: 'FOB' },
                    { value: 'CIF', label: 'CIF' },
                    { value: 'EXW', label: 'EXW' },
                    { value: 'DDP', label: 'DDP' },
                  ]}
                  value={filters.incoterm}
                  onChange={(value) => handleFilterChange('incoterm', value)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select incoterm..."
                  isClearable
                  styles={customSelectStyles}
                />
              </FilterField>
            </div>

            {/* Quick Filters */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick Filters
              </p>
              <div className="flex flex-wrap gap-2">
                <QuickFilterButton
                  active={filters.quickFilter === 'today'}
                  onClick={() => handleFilterChange('quickFilter', 'today')}
                >
                  Today
                </QuickFilterButton>
                <QuickFilterButton
                  active={filters.quickFilter === 'week'}
                  onClick={() => handleFilterChange('quickFilter', 'week')}
                >
                  This Week
                </QuickFilterButton>
                <QuickFilterButton
                  active={filters.quickFilter === 'month'}
                  onClick={() => handleFilterChange('quickFilter', 'month')}
                >
                  This Month
                </QuickFilterButton>
                <QuickFilterButton
                  active={filters.quickFilter === 'pending'}
                  onClick={() => handleFilterChange('quickFilter', 'pending')}
                >
                  Pending Orders
                </QuickFilterButton>
                <QuickFilterButton
                  active={filters.quickFilter === 'shipped'}
                  onClick={() => handleFilterChange('quickFilter', 'shipped')}
                >
                  Shipped Only
                </QuickFilterButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {Object.entries(filters).map(([key, value]) =>
            value && (
              <FilterChip
                key={key}
                label={`${key}: ${Array.isArray(value) ? value.map(v => v.label).join(', ') : value.label || value}`}
                onRemove={() => handleFilterChange(key, null)}
              />
            )
          )}
          {(dateRange.from || dateRange.to) && (
            <FilterChip
              label={`Date: ${dateRange.from || '...'} - ${dateRange.to || '...'}`}
              onRemove={() => setDateRange({ from: '', to: '' })}
            />
          )}
        </motion.div>
      )}
    </div>
  );
}

function FilterField({ label, icon, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
        {icon && <span className="mr-1.5 text-gray-500">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function QuickFilterButton({ children, active, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {children}
    </motion.button>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#1471d8' : '#cdcee0',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(20, 113, 216, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#1471d8',
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#1471d8'
      : state.isFocused
      ? '#fafbfc'
      : 'white',
  }),
};
