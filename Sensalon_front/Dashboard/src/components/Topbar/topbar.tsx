import { useEffect, useMemo, useState } from "react";
import { FaBell } from "react-icons/fa6";
export const Topbar = () => {
    const [user, setUser] = useState<any>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    // Efecto para obtener los datos del usuario desde localStorage al cargar el componente
    useEffect(() => {
        const userString = localStorage.getItem('user'); // Obtener el usuario almacenado
        if (userString) {
            const parsedUser = JSON.parse(userString);
            setUser(parsedUser); // Guardar el usuario en el estado
        } else {
            console.log('No hay usuario guardado en localStorage');
        }
    }, []); //


    // Función para alternar el menú
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };
    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const initials = useMemo(() => {
        const candidate =
            user?.admin?.[0] ||
            user?.user ||
            user ||
            {};

        const first =
            candidate.vcfirstname ||
            candidate.firstname ||
            candidate.name ||
            "";
        const last =
            candidate.vclastname ||
            candidate.lastname ||
            candidate.surname ||
            "";
        const email = candidate.vcemail || candidate.email || "";

        const nameParts = `${first} ${last}`.trim().split(" ").filter(Boolean);
        const letters = nameParts.slice(0, 2).map((p: string) => p[0]?.toUpperCase() || "");
        if (letters.length > 0) return letters.join("");
        if (email) return email.slice(0, 2).toUpperCase();
        return "US";
    }, [user]);

    console.log(initials)

    const fullName = useMemo(() => {
        const candidate =
            user?.admin?.[0] ||
            user?.user ||
            user ||
            {};
        const first =
            candidate.vcfirstname ||
            candidate.firstname ||
            candidate.name ||
            "";
        const last =
            candidate.vclastname ||
            candidate.lastname ||
            candidate.surname ||
            "";
        const email = candidate.vcemail || candidate.email || "";
        const combined = `${first} ${last}`.trim();
        return combined || email || "Usuario";
    }, [user]);

    return (
        <nav className="fixed top-0 z-50 w-full bg-white  dark:bg-gray-800 dark:border-gray-700">
            <div className="px-3 py-1 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start rtl:justify-end">
                        <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                            <span className="sr-only">Open sidebar</span>
                            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                            </svg>
                        </button>
                        <a href="/inicio" className="flex ms-1 md:me-22">
                            <img src="/img/sensalonLog.webp" className="h-5 w-48 me-3 sm:h-7" alt="Flowbite Logo" />
                        </a>
                    </div>
                    <div className="flex items-center">
                        <div className="py-2 text-right" role="none">
                            <p className="text-sm font-semibold text-[#1d1d1b] dark:text-white" role="none">
                                {fullName}
                            </p>
                            <p className="text-xs font-medium text-gray-500 truncate dark:text-gray-300" role="none">
                                {user?.admin?.[0]?.vcemail}
                            </p>
                        </div>

                        <div className="flex items-center mt-2 ms-3">
                            <div className="px-3 relative">
                                <button
                                    type="button"
                                    onClick={toggleDropdown}
                                    className="flex text-sm shadow text-black rounded-2xl focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 w-12 h-12 items-center justify-center font-bold"
                                    aria-expanded={dropdownOpen}
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <span className="select-none">{initials}</span>
                                </button>

                                {/* Menu desplegable */}
                                {dropdownOpen && (
                                    <div className="z-50 absolute right-0 mt-2 w-48 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600">
                                        <ul className="py-1" role="menu">
                                            <li>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                                >
                                                    Cerrar sesión
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <button>
                                <FaBell className="w-6 h-6" />
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        </nav>
    )
}
