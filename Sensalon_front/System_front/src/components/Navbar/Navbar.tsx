import { useState, useEffect, useRef } from 'react';
import { Menu, X, User, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../hooks/useCartStore';
import { useProductStore } from '../../hooks/useProductStore';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Product } from '../../interfaces/products';
import './index.css'
export const Navbar = () => {
  const { cart, updateQuantity, removeFromCart } = useCartStore();
  const { products, fetchProducts } = useProductStore()
  const cartRef = useRef<HTMLDivElement>(null)
  const serchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setShowCart(false);
      }
      if (serchRef.current && !serchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('user');
    if (userId) {
      setIsLoggedIn(true);
    }
    if (products.length === 0) fetchProducts();


  }, [fetchProducts, products]);

  useEffect(() => {
    setShowCart(false)
  }, [location.pathname])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setFilteredProducts([]);
      setShowResults(false);
    } else {
      const results: any = products.filter((product) =>
        product.vcname.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(results);
      setShowResults(true);
    }

  };

  const handleProductClick = (id: string) => {
    setSearchTerm('');
    setShowResults(false);
    navigate(`/productDetail/${id}`); // Navega al detalle del producto
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const toggleCart = () => setShowCart(!showCart);

  const totalPrice = cart.reduce((total, item) => {
    const price = item.product.decprice1 !== null && item.product.decprice1 !== undefined
      ? item.product.decprice1
      : item.product.decprice2 !== null && item.product.decprice2 !== undefined
        ? item.product.decprice2
        : item.product.decprice3 || 0;

    return total + (price * item.quantity);
  }, 0);


  const toggleAvatarMenu = () => {
    setAvatarMenuOpen(!avatarMenuOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const hanldeGoToCart = () => {
    navigate('/carrito')
  }
  console.log(cart)
  return (
    <header className="border-b sticky top-0 bg-white z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a href='/' className="text-2xl font-bold">
          <img src="/img/SENSALON.png" alt="" className='w-[11rem] h-[5rem] object-cover' />
        </a>

        <nav className="hidden md:flex space-x-6">
          <NavLink to="/" className={({ isActive }) =>
            `text-sm font-medium pb-1 transition ${isActive ? "border-b-2 border-black text-black" : "text-gray-600 hover:text-black"
            }`
          }>Inicio</NavLink>
          <NavLink to="/productos" className={({ isActive }) =>
            `text-sm font-medium pb-1 transition ${isActive ? "border-b-2 border-black text-black" : "text-gray-600 hover:text-black"
            }`
          }>Productos</NavLink>
          <NavLink to="/salons" className={({ isActive }) =>
            `text-sm font-medium pb-1 transition ${isActive ? "border-b-2 border-black text-black" : "text-gray-600 hover:text-black"
            }`
          }>Salones</NavLink>
        </nav>

        <div className="flex items-center space-x-4">
          <div ref={serchRef} className='relative'>
            <input
              type="search"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="hidden md:block border rounded-full px-4 py-2 text-sm relative"
            />

            {showResults && filteredProducts.length > 0 && (
              <div
                className="hidden absolute left-0 mt-2 w-full md:block md:w-[120%] lg:w-[150%] bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
                style={{ top: '100%' }}
              >
                {filteredProducts.map((product: Product) => {
                  const normalizedPath = product.vcphoto.replace(/\\/g, '/').split('/imagenes/')[1];
                  const imageUrl = `https://api.sensalon.com.mx/imagenes/${normalizedPath}`;

                  return (
                    <div
                      key={product.iIdProduct}
                      className="p-3 flex items-center gap-6 cursor-pointer hover:bg-gray-100 transition"
                      onClick={() => handleProductClick(product.iIdProduct)}
                    >
                      <img
                        src={imageUrl}
                        alt={product.vcname}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-md">{product.vcname}</p>
                        <p className="text-sm text-gray-500">${product.decprice1 ?? product.decprice2 ?? product.decprice3 ?? 'Precio no disponible'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div ref={cartRef} className="relative">
            <button className="p-2" onClick={toggleCart}>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-2">
                  {cart.length}
                </span>
              )}
              <ShoppingCart size={24} />
            </button>

            {/* Mini Cart */}
            {showCart && (
              <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg p-4 z-20">
                <h2 className="text-lg font-bold mb-4">Mi Carrito</h2>
                {cart.length > 0 ? (
                  <div className="flex flex-col">
                    {/* Sección con scroll, máximo 4 productos visibles */}
                    <div className="overflow-y-auto max-h-64 custom-scrollbar">
                      {cart.map(({ product, quantity }) => {
                        const normalizedPath = product?.vcphoto?.replace(/\\/g, '/').split('/imagenes/')[1];
                        const imageUrl = `https://api.sensalon.com.mx/imagenes/${normalizedPath}`;

                        return (
                          <div key={product.iIdProduct} className="flex items-center mb-4">
                            <img
                              src={imageUrl}
                              alt={product.vcname}
                              className="w-16 h-16 rounded-lg object-cover mr-4"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold">{product.vcname}</h3>
                              <p className="text-sm text-gray-500">${product.decprice1 ?? product.decprice2 ?? product.decprice3 ?? 'Precio no disponible'}</p>
                              <div className="flex items-center  space-x-4 mt-1">
                                <button
                                  onClick={() => updateQuantity(product.iIdProduct, quantity - 1)}
                                  className="bg-gray-200 px-4 rounded"
                                >
                                  -
                                </button>
                                <span>{quantity}</span>
                                <button
                                  onClick={() => updateQuantity(product.iIdProduct, quantity + 1)}
                                  className="bg-gray-200 px-4 rounded"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => removeFromCart(product.iIdProduct)}
                                  className="text-red-600 text-base ml-2"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Sección fija con total y botón */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-around">
                        <p className="font-semibold text-lg">
                          Total: <span>${totalPrice.toFixed(2)}</span>
                        </p>
                        <button onClick={() => hanldeGoToCart()} className="py-2 px-6 text-white rounded-xl bg-[#1d1d1b] font-semibold">
                          Ir al carrito
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">El carrito está vacío.</p>
                )}
              </div>
            )}


          </div>

          {isLoggedIn ? (
            <div className="relative">
              <button onClick={toggleAvatarMenu} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={20} />
              </button>
              {avatarMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Perfil</a>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a href="/login" className="px-4 py-2 bg-[#1d1d1b] rounded-xl text-white text-sm font-semibold">
              Iniciar Sesión
            </a>
          )}

          <button className="md:hidden" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <nav className="px-2 pt-2 pb-4 space-y-1">
            <a href="/productos" className="text-sm font-medium">Productos</a>
            {/*  <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
              Empresas
            </a> */}
            <div className="px-3 py-2">
              <div className='relative'>
                <input
                  type="search"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="block border w-1/2 rounded-full px-4 py-2 text-sm relative"
                />

                {showResults && filteredProducts.length > 0 && (
                  <div
                    className="absolute left-0 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
                    style={{ top: '100%' }}
                  >
                    {filteredProducts.map((product: Product) => {
                      const normalizedPath = product.vcphoto.replace(/\\/g, '/').split('/imagenes/')[1];
                      const imageUrl = `https://api.sensalon.com.mx/imagenes/${normalizedPath}`;

                      return (
                        <div
                          key={product.iIdProduct}
                          className="p-3 flex items-center gap-6 cursor-pointer hover:bg-gray-100 transition"
                          onClick={() => handleProductClick(product.iIdProduct)}
                        >
                          <img
                            src={imageUrl}
                            alt={product.vcname}
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold text-md">{product.vcname}</p>
                            <p className="text-sm text-gray-500">${product.decprice1 ?? product.decprice2 ?? product.decprice3 ?? 'Precio no disponible'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
