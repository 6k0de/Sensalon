import { Link } from "react-router-dom";
import {
  FaHouse,
  FaMoneyBillTransfer,
  FaBuilding,
  FaTags,
  FaUser,
  FaLayerGroup,
  FaImages,
  FaSliders,
  FaTruck,
  FaWarehouse,
  FaTag,
  FaFilePen
} from "react-icons/fa6";

export const Sidebar = () => {
  const iconClassName =
    "w-5 h-5 shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white";

  return (
    <aside
      className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white sm:translate-x-0 dark:bg-gray-800"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
        <ul className="space-y-2 font-medium">
          <li>
            <Link
              to="/inicio"
              className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaHouse
                className={iconClassName}
                aria-hidden="true"
              />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">
                Inicio
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/transacciones"
              className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaMoneyBillTransfer
                className={iconClassName}
                aria-hidden="true"
              />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">
                Transacciones / Ventas
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/ordenespendientes"
              className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaFilePen
                className={iconClassName}
                aria-hidden="true"
              />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">
                Ordenes sin transaccion
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/almacen"
              className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaWarehouse
                className={iconClassName}
                aria-hidden="true"
              />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">
                Entrada almacen
              </span>
            </Link>
          </li>
           <li>
            <Link
              to="/descuentos"
              className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaTag
                className={iconClassName}
                aria-hidden="true"
              />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">
                Codigo de descuentos
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/productos"
              className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaTags
                className={iconClassName}
                aria-hidden="true"
              />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">
                Productos
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/marcas"
              className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaBuilding
                className={iconClassName}
                aria-hidden="true"
              />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">
                Marcas
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/usuarios"
              className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaUser
                className={iconClassName}
                aria-hidden="true"
              />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">
                Usuarios
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/proveedores"
              className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaTruck
                className={iconClassName}
                aria-hidden="true"
              />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">
                Proveedores
              </span>
            </Link>
          </li>

          <li>
            <Link
              to="/categorias"
              className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaLayerGroup
                className={iconClassName}
                aria-hidden="true"
              />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">
                Categorias
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/slider"
              className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaImages
                className={iconClassName}
                aria-hidden="true"
              />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">
                Slider
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/configuracionbancaria"
              className="flex items-center p-2 text-[#1d1d1b] rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaSliders
                className={iconClassName}
                aria-hidden="true"
              />
              <span className="flex-1 ms-3 whitespace-nowrap text-lg">
                Configuración Bancaria
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};
