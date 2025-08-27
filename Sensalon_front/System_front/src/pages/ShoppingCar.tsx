import { Minus, Plus, Trash2, CreditCard, Building2, Store } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../hooks/useCartStore';

export const ShoppingCar = () => {
    const { cart, updateQuantity, removeFromCart } = useCartStore();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('mercadopago');
    const [address, setAddress] = useState({
        country: '',
        name: '',
        lastname: '',
        address: '',
        interior: '',
        zipcode: '',
        city: '',
        phone: '',
        additonal: ''
    });

    const subtotal = cart.reduce((sum, item) => {
        const price = item.product.decprice1 !== null && item.product.decprice1 !== undefined
            ? item.product.decprice1
            : item.product.decprice2 !== null && item.product.decprice2 !== undefined
                ? item.product.decprice2
                : item.product.decprice3 || 0;

        return sum + (price * item.quantity);
    }, 0);

    const shipping = 5.99;
    const total = subtotal + shipping;

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setAddress({ ...address, [name]: value });
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Listado de productos y formulario */}
                <div className="lg:w-2/3">
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar border rounded-lg p-4">
                        {cart.length > 0 ? (
                            cart.map(({ product, quantity }) => {
                                const normalizedPath = product?.vcphoto?.replace(/\\/g, '/').split('/imagenes/')[1];
                                const imageUrl = `https://api.sensalon.com.mx/imagenes/${normalizedPath}`;

                                return (
                                    <div key={product.iIdProduct} className="flex items-center gap-4 border-b py-4">
                                        <img
                                            src={imageUrl}
                                            alt={product.vcname}
                                            width={80}
                                            height={80}
                                            className="rounded-md"
                                        />
                                        <div className="flex-grow">
                                            <h3 className="font-semibold">{product.vcname}</h3>
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => updateQuantity(product.iIdProduct, quantity - 1)}
                                                className="p-1"
                                            >
                                                <Minus size={20} />
                                            </button>
                                            <span className="mx-2">{quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(product.iIdProduct, quantity + 1)}
                                                className="p-1"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                        <p className="font-semibold">
                                            ${((product.decprice1 ?? product.decprice2 ?? product.decprice3) * quantity).toFixed(2)}
                                        </p>

                                        <button
                                            onClick={() => removeFromCart(product.iIdProduct)}
                                            className="p-1 text-red-500"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500">El carrito está vacío.</p>
                        )}
                    </div>

                    <div className="mt-8">
                        <hr className="my-10" />
                        <h2 className="text-xl font-semibold mb-4">Direccion de envio</h2>
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <input
                                type="text"
                                name="country"
                                placeholder="Pais"
                                value={address.country}
                                onChange={() => { }}
                                className="border border-gray-400 rounded-lg px-4 py-2"
                            />
                            <input
                                type="text"
                                name="name"
                                placeholder="Nombres"
                                value={address.name}
                                onChange={() => { }}
                                className="border border-gray-400 rounded-lg px-4 py-2"
                            />
                            <input
                                type="text"
                                name="lastname"
                                placeholder="Apellidos"
                                value={address.lastname}
                                onChange={() => { }}
                                className="border border-gray-400 rounded-lg px-4 py-2"
                            />

                            <input
                                type="text"
                                name="interior"
                                placeholder="Numero interior, Letra, Departamento"
                                value={address.interior}
                                onChange={handleInputChange}
                                className="border border-gray-400 rounded-lg px-4 py-2 "
                            />
                            <input
                                type="text"
                                name="address"
                                placeholder="Dirección(calle)"
                                value={address.address}
                                onChange={() => { }}
                                className="border border-gray-400 rounded-lg px-4 py-2"
                            />
                            <input
                                type="text"
                                name="zipcode"
                                placeholder="Codigo Postal"
                                value={address.zipcode}
                                onChange={() => { }}
                                className="border border-gray-400 rounded-lg px-4 py-2"
                            />
                            <input
                                type="text"
                                name="city"
                                placeholder="Ciudad"
                                value={address.city}
                                onChange={() => { }}
                                className="border border-gray-400 rounded-lg px-4 py-2"
                            />
                            <input
                                type="text"
                                name="phone"
                                placeholder="Telefono"
                                value={address.phone}
                                onChange={() => { }}
                                className="border border-gray-400 rounded-lg px-4 py-2"
                            />
                            <input
                                type="text"
                                name="additonal"
                                placeholder="Instrucciones adicionales"
                                value={address.additonal}
                                onChange={() => { }}
                                className="border border-gray-400 rounded-lg px-4 py-2  col-span-2"
                            />
                        </form>
                    </div>
                </div>

                {/* Resumen de la orden y métodos de pago */}
                <div className="lg:w-1/3">
                    <div className="bg-gray-100 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Resumen de orden</h2>
                        <div className="flex justify-between mb-2">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Envío</span>
                            <span>${shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>


                        {/* Métodos de pago */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4">Metodos de pago</h2>
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 p-4 border rounded-lg cursor-pointer bg-white">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="mercadopago"
                                        checked={selectedPaymentMethod === 'mercadopago'}
                                        onChange={() => setSelectedPaymentMethod('mercadopago')}
                                        className="form-radio "
                                    />
                                    <CreditCard size={24} />
                                    <span>Mercado Pago</span>
                                </label>
                                <label className="flex items-center gap-2 p-4 border rounded-lg cursor-pointer bg-white">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="banktransfer"
                                        checked={selectedPaymentMethod === 'banktransfer'}
                                        onChange={() => setSelectedPaymentMethod('banktransfer')}
                                        className="form-radio"
                                    />
                                    <Building2 size={24} />
                                    <span>Bank Transfer</span>
                                </label>
                                <label className="flex items-center gap-2 p-4 border rounded-lg cursor-pointer bg-white">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="oxxo"
                                        checked={selectedPaymentMethod === 'oxxo'}
                                        onChange={() => setSelectedPaymentMethod('oxxo')}
                                        className="form-radio"
                                    />
                                    <Store size={24} />
                                    <span>Oxxo Payment</span>
                                </label>
                            </div>
                        </div>

                        <button className="w-full bg-black text-white mt-10 py-3 rounded-full hover:bg-opacity-90 transition-colors">
                            Proceder al pago
                        </button>

                    </div>
                </div>
            </div>
        </main>
    );
};
