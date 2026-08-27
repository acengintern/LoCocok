type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pagesAroundCurrent = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => i + Math.max(currentPage - 1, 1)
  );

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-theme-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.04] dark:hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Prev</span>
      </button>

      <div className="flex items-center gap-1">
        {currentPage > 3 && (
          <span className="flex h-8 w-6 items-center justify-center text-theme-xs text-gray-400 dark:text-gray-500">
            ...
          </span>
        )}
        {pagesAroundCurrent.map((page) => (
          <button
            type="button"
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-theme-xs font-medium transition-colors cursor-pointer ${
              currentPage === page
                ? "bg-brand-500 text-white shadow-theme-xs font-semibold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/[0.04] dark:hover:text-white"
            }`}
          >
            {page}
          </button>
        ))}
        {currentPage < totalPages - 2 && (
          <span className="flex h-8 w-6 items-center justify-center text-theme-xs text-gray-400 dark:text-gray-500">
            ...
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-theme-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.04] dark:hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <span>Next</span>
        <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
