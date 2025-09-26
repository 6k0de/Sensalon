import { Minus, Plus, Trash2, CreditCard, Landmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCartStore } from '../hooks/useCartStore';
import { useNavigate } from 'react-router-dom';
import { SuccessToast } from '../components/Toast/successToast';
import { ErrorToast } from '../components/Toast/errorToast';
import { createShipping } from '../services/Shipping/createShipping';
import { api, payment } from '../utils/axiosClients';
import { ShippingAddress } from '../interfaces/shippingAdd';
import { deleteShipping } from '../services/Shipping/deleteShipping';
import { ModalSuccesCancel } from '../components/Modal/modal.acceptcancel';
import { MercadoPagoButton } from '../components/Buttons/mercadoPago';
import { BankTransferButton } from '../components/Buttons/transferencia';

export const ShoppingCar = () => {
    const { cart, updateQuantity, removeFromCart } = useCartStore();
    const navigate = useNavigate()
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('mercadopago');
    const [showAddresForm, setShowAddresForm] = useState<boolean>(false)
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error" | null>(null);
    const [showToast, setShowToast] = useState(true);
    const [shippingData, setShippingData] = useState([])
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const [deliveryCost, setDeliveryCost] = useState<any>([])
    const [mpLoading, setMpLoading] = useState(false)
    const [bankLoading, setBankLoading] = useState(false)


    const [address, setAddress] = useState({
        country: '',
        name: '',
        lastname: '',
        address: '',
        interior: '',
        suburb: '',
        state: '',
        zipcode: '',
        city: '',
        phone: '',
        additonal: ''
    });

    const getAllShippingAddressUser = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{')
        const idUser = user.idUser
        try {
            const getShipping = await api.get(`/shippingaddres/${idUser}`)
            setShippingData(getShipping.data || [])

        } catch (error) {
            console.error('Error al obtener las direcciones de envío:', error);
            return { data: 0, message: 'Error en el servidor' }
        }
    }

    const getDeliveryCost = async () => {
        try {
            const delivery = await payment.get('/delivery')
            setDeliveryCost(delivery.data.data[0] || 0)
        } catch (error) {
            console.error('Error al obtener el costo del envio:', error);
            return { data: 0, message: 'Error en el servidor' }
        }

    }

    useEffect(() => {
        getAllShippingAddressUser()
        getDeliveryCost()
    }, [])

    const subtotal = cart.reduce((sum, item) => {
        const price = item.product.decprice1 !== null && item.product.decprice1 !== undefined
            ? item.product.decprice1
            : item.product.decprice2 !== null && item.product.decprice2 !== undefined
                ? item.product.decprice2
                : item.product.decprice3 || 0;

        return sum + (price * item.quantity);
    }, 0);
    console.log(deliveryCost.secobraenvio)
    const shipping = deliveryCost.secobraenvio === 1 ? 150 : 0;
    const total = subtotal + shipping;

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setAddress({ ...address, [name]: value });
    };

    const groupedCart: Record<string, { product: any; quantity: number }[]> = cart.reduce(
        (groups, item) => {
            const companyName = item.product.company?.vcname || "Sin empresa";
            if (!groups[companyName]) {
                groups[companyName] = [];
            }
            groups[companyName].push(item);
            return groups;
        },
        {} as Record<string, { product: any; quantity: number }[]>
    );

    const handleSaveAddress = async () => {
        const requiredFields: Record<string, string> = {
            name: "Nombres",
            lastname: "Apellidos",
            address: "Dirección",
            interior: "Número interior",
            suburb: "Colonia",
            zipcode: "Código Postal",
            city: "Ciudad",
            state: "Estado",
            country: "País",
            phone: "Teléfono"
        };

        const missing = Object.entries(requiredFields)
            .filter(([field]) => !address[field as keyof typeof address])
            .map(([, label]) => label);

        if (missing.length === Object.keys(requiredFields).length) {
            setToastMessage("Por favor llena todos los campos obligatorios");
            setToastType("error");
            setShowToast(true);
            setTimeout(() => {
                setToastMessage(null);
                setToastType(null);
                setShowToast(false);
            }, 4000);
            return;
        } else if (missing.length === 1) {
            setToastMessage(`Por favor completa el campo: ${missing[0]}`);
            setToastType("error");
            setShowToast(true);
            setTimeout(() => {
                setToastMessage(null);
                setToastType(null);
                setShowToast(false);
            }, 4000);
            return;
        } else if (missing.length > 1) {
            setToastMessage(`Por favor completa los siguientes campos: ${missing.join(", ")}`);
            setToastType("error");
            setShowToast(true);
            setTimeout(() => {
                setToastMessage(null);
                setToastType(null);
                setShowToast(false);
            }, 4000);
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{')
            const idUser = user.idUser
            const shippingSave = await createShipping(idUser, address)
            if (shippingSave.data === 1) {
                setToastMessage(shippingSave.message);
                setToastType("success");
                setShowToast(true);
                setTimeout(() => {
                    setToastMessage(null);
                    setToastType(null);
                    setShowToast(false);
                }, 4000);
            } else {
                setToastMessage(shippingSave.message);
                setToastType("error");
                setShowToast(true);
                setTimeout(() => {
                    setToastMessage(null);
                    setToastType(null);
                    setShowToast(false);
                }, 4000);
            }
        } catch (error) {
            setToastMessage('Error en el servidor');
            setToastType("error");
            setShowToast(true);
            setTimeout(() => {
                setToastMessage(null);
                setToastType(null);
                setShowToast(false);
            }, 4000);
        } finally {
            setShowAddresForm(false);
            setAddress({
                country: '',
                name: '',
                lastname: '',
                address: '',
                interior: '',
                suburb: '',
                state: '',
                zipcode: '',
                city: '',
                phone: '',
                additonal: ''
            });
            getAllShippingAddressUser()
        }
    };

    const handleDeleteAddress = async (id: string) => {
        console.log(id)
        try {
            const shippingDelete = await deleteShipping(id)
            if (shippingDelete.data === 1) {
                setToastMessage(shippingDelete.message);
                setToastType("success");
                setShippingData(prev => prev.filter((addr: ShippingAddress) => addr.iIdAddressId !== id));
                if (selectedAddressId === id) {
                    setSelectedAddressId(null);
                }
                setShowToast(true);
                setTimeout(() => {
                    setToastMessage(null);
                    setToastType(null);
                    setShowToast(false);
                }, 4000);

                getAllShippingAddressUser()
            } else {
                setToastMessage(shippingDelete.message);
                setToastType("error");
                setShowToast(true);
                setTimeout(() => {
                    setToastMessage(null);
                    setToastType(null);
                    setShowToast(false);
                }, 4000);
            }
        } catch (error) {
            console.error("Error eliminando dirección");
            setToastMessage('Error en el servidor');
            setToastType("error");
            setShowToast(true);
            setTimeout(() => {
                setToastMessage(null);
                setToastType(null);
                setShowToast(false);
            }, 4000);
        } finally {
            getAllShippingAddressUser()
        }
    };

    const confirmDeleteAddress = (id: string) => {
        setAddressToDelete(id);
        setShowConfirmModal(true);
    };

    // cuando el usuario confirme
    const handleConfirmDelete = async () => {
        if (addressToDelete) {
            await handleDeleteAddress(addressToDelete);
            setAddressToDelete(null);
            setShowConfirmModal(false);
            getAllShippingAddressUser()
        }
    };

    // cuando cancele
    const handleCancelDelete = () => {
        setAddressToDelete(null);
        setShowConfirmModal(false);
    };


    const handleMercadoPago = () => {
        setMpLoading(true)
        console.log('hola mercado pago')
    }

    const handleBankTransfer = () => {
        setBankLoading(true)
        console.log('hola transferencia bancaria')
    }
    return (
        <>
            <div className="fixed top-0 right-0 z-50 p-4">
                {toastMessage && toastType === "success" && (
                    <SuccessToast message={toastMessage} showToast={showToast} />
                )}
                {toastMessage && toastType === "error" && (
                    <ErrorToast message={toastMessage} showToast={showToast} />
                )}
            </div>

            <ModalSuccesCancel
                message="¿Estás seguro de que quieres eliminar esta dirección?"
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                show={showConfirmModal}
            />

            <main className="container mx-auto px-4 py-8">
                <div className='flex flex-col lg:flex-row gap-8'>
                    <div className="lg:w-2/3">
                        <div className='flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 sm:gap-0'>
                            <h1 className="text-3xl font-bold text-center sm:text-left">Carrito de compras</h1>
                            <button onClick={() => navigate('/productos')} className='bg-slate-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition w-full sm:w-auto'>Seguir Comprando</button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar border rounded-lg p-4 bg-gray-50">
                            {cart.length > 0 ? (
                                Object.entries(groupedCart).map(([companyName, items]: [string, any[]]) => (
                                    <div key={companyName} className=" bg-white rounded-lg shadow-md p-6 mb-6">
                                        {/* Encabezado de compañía */}
                                        <h2 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">
                                            {companyName}
                                        </h2>

                                        {/* Productos de esa compañía */}
                                        {items.map(({ product, quantity }) => {
                                            const normalizedPath = product?.vcphoto
                                                ?.replace(/\\/g, "/")
                                                .split("/imagenes/")[1];
                                            const imageUrl = `https://api.sensalon.com.mx/imagenes/${normalizedPath}`;

                                            return (
                                                <div
                                                    key={product.iIdProduct}
                                                    className="flex items-center gap-4 border-b py-4"
                                                >
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
                                                    <p className="font-semibold">
                                                        $
                                                        {(
                                                            (Number(product.decprice1) ||
                                                                Number(product.decprice2) ||
                                                                Number(product.decprice3)) * quantity
                                                        ).toFixed(2)}
                                                    </p>
                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(product.iIdProduct, quantity - 1)
                                                            }
                                                            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                                        >
                                                            <Minus size={20} />
                                                        </button>
                                                        <span className="mx-2">{quantity}</span>
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(product.iIdProduct, quantity + 1)
                                                            }
                                                            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                                        >
                                                            <Plus size={20} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(product.iIdProduct)}
                                                        className="p-1 text-red-500"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">El carrito está vacío.</p>
                            )}
                        </div>

                        <section className="py-5">
                            <div className='bg-gray-50 p-4 rounded-lg shadow mt-3'>
                                <span className="text-lg text-center font-bold ml-2">Donde quieres que te enviemos tus productos </span>

                                <div className='py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {shippingData?.map((addr: ShippingAddress) => (
                                        <label
                                            key={addr.iIdAddressId}
                                            className={`border bg-white rounded-lg p-4 flex flex-col relative cursor-pointer transition`}
                                        >
                                            <input
                                                type="radio"
                                                name="shipping"
                                                checked={selectedAddressId === addr.iIdAddressId}
                                                onChange={() => setSelectedAddressId(addr.iIdAddressId)}
                                                className="absolute top-3 left-3"
                                            />

                                            <div className="ml-6">
                                                <p className="font-bold mb-1">
                                                    {addr.vcfirstname} <br />{addr.vclastname}
                                                </p>
                                                <p className='mb-1'><span className='font-semibold'>Calle:</span> {addr.vcaddress}</p>
                                                <p className='mb-1'><span className='font-semibold'>Colonia:</span> {addr.vcsuburb}</p>
                                                <p className='mb-1'><span className='font-semibold'>C.P:</span> {addr.vczipcode}</p>
                                                <p className='mb-1'><span className='font-semibold'>Ciudad:</span> {addr.vccity}</p>
                                                <p className='mb-1'><span className='font-semibold'>Estado:</span> {addr.vcstate}</p>
                                                <p className='mb-1'><span className='font-semibold'>País:</span> {addr.vccountry}</p>
                                                <p className='mb-1'><span className='font-semibold'>Referencia:</span> {addr.vcadditonalindication}</p>
                                            </div>

                                            <button
                                                onClick={() => confirmDeleteAddress(addr.iIdAddressId)}
                                                type="button"
                                                className="absolute top-2 right-2 text-red-600 flex items-center gap-1"
                                            >
                                                <Trash2 size={16} /> Eliminar
                                            </button>
                                        </label>
                                    ))}

                                    <div onClick={() => setShowAddresForm(true)} className='border-dashed border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-400 transition duration-300'>
                                        <span className='text-2xl font-bold text-gray-500'>+</span>
                                        <p className='text-sm text-gray-600'>Agregar nueva dirección</p>
                                    </div>
                                </div>
                                {showAddresForm && (
                                    <div className='mt-8'>
                                        <h2 className='text-xl font-semibold mb-4'>Nueva dirección</h2>
                                        <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Nombres *"
                                                value={address.name}
                                                onChange={handleInputChange}
                                                className="border border-gray-400 rounded-lg px-4 py-2"
                                            />
                                            <input
                                                type="text"
                                                name="lastname"
                                                placeholder="Apellidos *"
                                                value={address.lastname}
                                                onChange={handleInputChange}
                                                className="border border-gray-400 rounded-lg px-4 py-2"
                                            />

                                            <input
                                                type="text"
                                                name="address"
                                                placeholder="Dirección(calle y número) *"
                                                value={address.address}
                                                onChange={handleInputChange}
                                                className="border border-gray-400 rounded-lg px-4 py-2"
                                            />

                                            <input
                                                type="text"
                                                name="interior"
                                                placeholder="Número interior, Letra, Departamento"
                                                value={address.interior}
                                                onChange={handleInputChange}
                                                className="border border-gray-400 rounded-lg px-4 py-2 "
                                            />

                                            <input
                                                type="text"
                                                name="suburb"
                                                placeholder="Colonia *"
                                                value={address.suburb}
                                                onChange={handleInputChange}
                                                className="border border-gray-400 rounded-lg px-4 py-2 "
                                            />
                                            <input
                                                type="text"
                                                name="zipcode"
                                                placeholder="Código Postal *"
                                                value={address.zipcode}
                                                onChange={handleInputChange}
                                                className="border border-gray-400 rounded-lg px-4 py-2"
                                            />
                                            <input
                                                type="text"
                                                name="city"
                                                placeholder="Ciudad *"
                                                value={address.city}
                                                onChange={handleInputChange}
                                                className="border border-gray-400 rounded-lg px-4 py-2"
                                            />
                                            <input
                                                type="text"
                                                name="state"
                                                placeholder="Estado *"
                                                value={address.state}
                                                onChange={handleInputChange}
                                                className="border border-gray-400 rounded-lg px-4 py-2"
                                            />
                                            <input
                                                type="text"
                                                name="country"
                                                placeholder="País *"
                                                value={address.country}
                                                onChange={handleInputChange}
                                                className="border border-gray-400 rounded-lg px-4 py-2"
                                            />
                                            <input
                                                type="text"
                                                name="phone"
                                                placeholder="Télefono *"
                                                value={address.phone}
                                                onChange={handleInputChange}
                                                className="border border-gray-400 rounded-lg px-4 py-2"
                                            />
                                            <input
                                                type="text"
                                                name="additonal"
                                                placeholder="Instrucciones adicionales"
                                                value={address.additonal}
                                                onChange={handleInputChange}
                                                className="border border-gray-400 rounded-lg px-4 py-2  col-span-2"
                                            />
                                        </form>
                                        <div className="flex justify-end gap-4 mt-6">
                                            <button
                                                onClick={handleSaveAddress}
                                                className="px-6 py-2 rounded-lg bg-black text-white hover:bg-opacity-90 transition"
                                            >
                                                Agregar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowAddresForm(false)
                                                    setAddress({
                                                        country: '',
                                                        name: '',
                                                        lastname: '',
                                                        address: '',
                                                        interior: '',
                                                        suburb: '',
                                                        state: '',
                                                        zipcode: '',
                                                        city: '',
                                                        phone: '',
                                                        additonal: ''
                                                    })
                                                }}
                                                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
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
                                <span>{total.toFixed(2)}</span>
                            </div>


                            {/* Métodos de pago */}
                            <div className="mt-8">
                                <h2 className="text-xl font-semibold mb-4">Metodos de pago</h2>
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <BankTransferButton
                                            size="lg"
                                            onClick={handleBankTransfer}
                                            loading={bankLoading}
                                            className="w-full"
                                            disabled={!selectedAddressId || cart.length <= 0}
                                        />
                                        <MercadoPagoButton
                                            size="lg"
                                            onClick={handleMercadoPago}
                                            loading={mpLoading}
                                            className="w-full"
                                            disabled={!selectedAddressId || cart.length <= 0}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </>
    );
};
