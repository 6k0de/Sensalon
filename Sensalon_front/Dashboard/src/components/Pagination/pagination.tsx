type PaginationProps = {
    productsPerPage: number;
    totalProducts: number;
    paginate: (pageNumber: number) => void;
    currentPage: number;
  };
  
  export const Pagination = ({ productsPerPage, totalProducts, paginate, currentPage }: PaginationProps) => {
    const pageNumbers = [];
  
    for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) {
      pageNumbers.push(i);
    }
  
    return (
      <nav className="mt-4 flex justify-center">
        <ul className="inline-flex -space-x-px">
          <li>
            <button
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
              disabled={currentPage === 1}
            >
              Anterior
            </button>
          </li>
          {pageNumbers.map(number => (
            <li key={number}>
              <button
                onClick={() => paginate(number)}
                className={`px-3 py-2 leading-tight ${
                  currentPage === number ? 'text-white bg-[#1d1d1b]' : 'text-gray-500 bg-white'
                } border border-gray-300 hover:bg-gray-100 hover:text-gray-700`}
              >
                {number}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => paginate(currentPage < pageNumbers.length ? currentPage + 1 : currentPage)}
              className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
              disabled={currentPage === pageNumbers.length}
            >
              Siguiente
            </button>
          </li>
        </ul>
      </nav>
    );
  };
  