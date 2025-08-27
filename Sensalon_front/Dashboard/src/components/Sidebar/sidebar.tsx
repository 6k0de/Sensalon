import { Link } from 'react-router-dom';
import { FaHouse, FaMoneyBillTransfer, FaBuilding, FaTags, FaUser, FaLayerGroup } from 'react-icons/fa6';

export const Sidebar = () => {
  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white sm:translate-x-0 dark:bg-gray-800" aria-label="Sidebar">
      <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
        <ul className="space-y-2 font-medium">
          <li>
            <Link to="/inicio" className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              <FaHouse className='w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white' aria-hidden="true" />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">Inicio</span>
            </Link>
          </li>
          <li>
            <Link to="/transacciones" className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              <FaMoneyBillTransfer className='w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white' aria-hidden="true" />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">Transacciones / Ventas</span>
            </Link>
          </li>
          <li>
            <Link to="/productos" className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              <FaTags className='w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white' aria-hidden="true" />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">Productos</span>
            </Link>
          </li>
          <li>
            <Link to="/empresas" className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              <FaBuilding className='w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white' aria-hidden="true" />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">Empresas</span>
            </Link>
          </li>
          <li>
            <Link to="/usuarios" className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              <FaUser className='w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white' aria-hidden="true" />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">Usuarios</span>
            </Link>
          </li>
          <li>
            <Link to="/categorias" className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              <FaLayerGroup className='w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white' aria-hidden="true" />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">Categorias</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};
