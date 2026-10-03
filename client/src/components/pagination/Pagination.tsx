import "./Pagination.css";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalItems, pageSize, onPageChange }: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1
  );

  return (
    <nav className="pagination-bar" aria-label="Pagination">
      <span className="pagination-summary">
        Showing {start}-{end} of {totalItems}
      </span>

      <ul className="pagination-list">
        <li>
          <button
            type="button"
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            Prev
          </button>
        </li>

        {pages.map((page, index) => {
          const previousPage = pages[index - 1];
          const showEllipsis = previousPage !== undefined && page - previousPage > 1;

          return (
            <li key={page} style={{ display: "flex" }}>
              {showEllipsis && <span className="pagination-ellipsis">…</span>}
              <button
                type="button"
                className={`pagination-button ${page === currentPage ? "pagination-button-active" : ""}`}
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            </li>
          );
        })}

        <li>
          <button
            type="button"
            className="pagination-button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
