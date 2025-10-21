import { Minus, Plus, Trash2 } from 'lucide-react';
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
//import { MercadoPagoButton } from '../components/Buttons/mercadoPago';
import { BankTransferButton } from '../components/Buttons/transferencia';
import { TransferModal } from '../components/Modal/modal.banktransfer';
import { createOrderTransfer } from '../services/Pay/Pay';
import { isAdminUser, isDistributorUser, isGuestUser, isNormalUser, isSalonUser, readUser } from '../helpers/detectedUserRole';

export const ShoppingCar = () => {
    const { cart, updateQuantity, removeFromCart } = useCartStore();
    const navigate = useNavigate()
    const [showAddresForm, setShowAddresForm] = useState<boolean>(false)
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error" | null>(null);
    const [showToast, setShowToast] = useState(true);
    const [shippingData, setShippingData] = useState([])
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const [deliveryCost, setDeliveryCost] = useState<any>([])
    //const [mpLoading, setMpLoading] = useState(false)
    const [bankLoading, setBankLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [brands, setBrands] = useState<{ iIdCompany: string; vcname: string }[]>([]);
    const [cashback, setCashback] = useState<number>(0)
    const [credit, setCredit] = useState<number>(0)
    const [useCashback, setUseCashback] = useState(false);
    const [useCredit, setUseCredit] = useState(false);
    const [creditState, setCreditState] = useState<boolean>(false)
    const [cashbackToUse, setCashbackToUse] = useState<number>(0);
    const [creditToUse, setCreditToUse] = useState<number>(0);


    const userData = readUser()
    const isDistributor = isDistributorUser(userData)
    const isNormal = isNormalUser(userData)

    const isAuthenticated = localStorage.getItem("auth") === "true";
    // Lo parseas (con seguridad para evitar errores si no existe)
    const parsed = userData || null;
    // Accedes al idUser si existe
    console.log(parsed)
    const idUser = parsed?.user?.iIdUser || parsed?.idUser || null;
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

    const brandMap = Object.fromEntries(
        brands.map((b) => [b.iIdCompany, b.vcname])
    );

    useEffect(() => {
        if (isNormal) {
            api.get(`/chasback/${userData?.user?.iIdUser}`).then((res) => {
                setCashback(res.data.data.cashbackbalance || 0)
            }).catch((err) => {
                console.log(err)
            })
        } else if (isDistributor) {
            api.get(`/credit/${userData?.user?.iIdUser}`).then((res) => {
                console.log(res)
                setCredit(res?.data?.totalamount || 0)
                setCreditState(res?.data?.state === 1 || false)
            }).catch((err) => {
                console.log(err)
            })
        }
    }, [isNormal, userData?.user])

    console.log({ cashback, credit, creditState })


    const getAllShippingAddressUser = async () => {
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

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await api.get("/empresas");
                setBrands(res.data || []);
            } catch (error) {
                console.error("Error al obtener marcas:", error);
            }
        };

        fetchBrands();
    }, []);

    const subtotal = cart.reduce((sum, item) => {
        const user = readUser();
        let userPrice = item.product.decprice3; // default
        if (isGuestUser(user)) {
            userPrice = item.product.decprice3; // invitado => 3
        } else if (isDistributorUser(user) || isAdminUser(user)) {
            userPrice = item.product.decprice1;
        } else if (isSalonUser(user)) {
            userPrice = item.product.decprice2;
        } else if (isNormalUser(user)) {
            userPrice = item.product.decprice3;
        }


        return sum + (userPrice * item.quantity);
    }, 0);
    console.log(deliveryCost.secobraenvio)

    const shipping = deliveryCost.secobraenvio === 1 ? 150 : 0;

    const baseTotal = Math.max(0, subtotal + shipping)
    const maxCashbackUsable = isNormal ? Math.min(cashback, baseTotal) : 0;

    const appliedCashback = isNormal && useCashback ? Math.min(Math.max(0, cashbackToUse), maxCashbackUsable) : 0;

    const maxCreditUsable = isDistributor ? Math.min(credit, baseTotal) : 0;

    const appliedCredit = isDistributor && useCredit
        ? Math.min(Math.max(0, creditToUse), maxCreditUsable)
        : 0;

    const total = Math.max(0, baseTotal - appliedCashback - appliedCredit);

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setAddress({ ...address, [name]: value });
    };

    const groupedCart: Record<string, { product: any; quantity: number }[]> = cart.reduce(
        (groups, item) => {
            const companyId = item.product.iFIdCompany || item.product.iIdCompany || "sin-id";
            const companyName = brandMap[companyId] || "Sin empresa";
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


    /* const handleMercadoPago = async () => {
        setMpLoading(true)
        try {

            const user = readUser();
            const getUserPrice = (p: any) => {
                const p1 = Number(p?.decprice1 ?? 0);
                const p2 = Number(p?.decprice2 ?? 0);
                const p3 = Number(p?.decprice3 ?? 0);

                if (isDistributorUser(user) || isAdminUser(user)) return p1 || p2 || p3;
                if (isSalonUser(user)) return p2 || p1 || p3;
                return p3 || p2 || p1; // público
            };

            const productsPayload = cart.map((item) => {
                const unitPrice = getUserPrice(item.product);
                const quantity = Number(item.quantity) || 0;
                const total = Number((unitPrice * quantity).toFixed(2));

                return {
                    product: {
                        iIdProduct: item.product.iIdProduct,
                        vcname: item.product.vcname,
                        iFIdCompany: item.product.iFIdCompany || item.product.iIdCompany,
                        vcdescription: item.product.vcdescription,
                        vccategories: item.product.vccategories,
                        vcphoto: item.product.vcphoto,
                    },
                    quantity,
                    unitPrice, // <- útil en backend
                    total,     // <- precio * cantidad según rol
                };
            });

            const payload = {
                idUser,
                email: parsed.user.vcemail || parsed.vcemail,
                shipping: selectedAddressId, // o el objeto completo si es nueva
                envio: shipping, // tu costo de envío calculado
                products: productsPayload,
                addCredit: isDistributor && useCredit,
                credit: isDistributor && useCredit ? appliedCredit : 0,
                useCashback: !isDistributor && useCashback,
                cashback: !isDistributor && useCashback ? appliedCashback : 0,
            };

            const res = await payment.post("/createOrder", payload);
            if (res.data.init_point) {
                console.log(res.data)
                window.location.href = res.data.init_point; // redirige a MP
            } else {
                throw new Error("No se recibió init_point");
            }
        } catch (error) {
            console.error("Error al iniciar pago:", error);
            setToastMessage("Error al procesar el pago");
            setToastType("error");
            setShowToast(true);
        } finally {
            setMpLoading(false);
        }
    } */

    if (!isAuthenticated) {
        return (
            <div className=" flex flex-col items-center justify-center px-4 pt-24">
                <div className="bg-white shadow-md rounded-lg p-8 max-w-md text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso restringido</h2>
                    <p className="text-gray-600 mb-6">
                        Necesitas iniciar sesión para acceder a tu carrito de compras.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }

    const handleConfirm = async ({ file }: { file: File }) => {
        setBankLoading(true);
        try {
            const formData = new FormData();
            formData.append("idUser", idUser);
            formData.append("email", parsed.user.vcemail || parsed.vcemail);
            formData.append("shipping", selectedAddressId!);
            formData.append("envio", shipping.toString());
            formData.append("addCredit", String(isDistributor && useCredit));
            formData.append("credit", String(isDistributor && useCredit ? appliedCredit : 0));
            formData.append("useCashback", String(!isDistributor && useCashback));
            formData.append("cashback", String(!isDistributor && useCashback ? appliedCashback : 0));
            const user = readUser();
            const getUserPrice = (p: any) => {
                const p1 = Number(p?.decprice1 ?? 0);
                const p2 = Number(p?.decprice2 ?? 0);
                const p3 = Number(p?.decprice3 ?? 0);

                if (isDistributorUser(user) || isAdminUser(user)) return p1 || p2 || p3;
                if (isSalonUser(user)) return p2 || p1 || p3;
                return p3 || p2 || p1; // público
            };

            const productsPayload = cart.map((item) => {
                const unitPrice = getUserPrice(item.product);
                const quantity = Number(item.quantity) || 0;
                const total = Number((unitPrice * quantity).toFixed(2));

                return {
                    product: {
                        iIdProduct: item.product.iIdProduct,
                        vcname: item.product.vcname,
                        iFIdCompany: item.product.iFIdCompany || item.product.iIdCompany,
                        vcdescription: item.product.vcdescription,
                        vccategories: item.product.vccategories,
                        vcphoto: item.product.vcphoto,
                    },
                    quantity,
                    unitPrice, // <- útil en backend
                    total,     // <- precio * cantidad según rol
                };
            });

            formData.append("products", JSON.stringify(productsPayload));
            // ✅ Archivo recibido del modal
            formData.append("file", file);

            const res = await createOrderTransfer(formData);
            console.log(res)
            if (res.data === 1) {
                navigate(`/transferPending?orderNumber=${encodeURIComponent(res.orderNumber)}`);
            } else {
                throw new Error(res.data.message || "Error desconocido");
            }
        } catch (error) {
            console.error("Error al confirmar la compra:", error);
            setToastMessage("Error al confirmar la compra");
            setToastType("error");
            setShowToast(true);
        } finally {
            setBankLoading(false);
        }
    };


    console.log(cart)
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
                                            console.log(product)
                                            const user = readUser();
                                            let userPrice = product.decprice3; // default
                                            if (isGuestUser(user)) {
                                                userPrice = product.decprice3; // invitado => 3
                                            } else if (isDistributorUser(user) || isAdminUser(user)) {
                                                userPrice = product.decprice1;
                                            } else if (isSalonUser(user)) {
                                                userPrice = product.decprice2;
                                            } else if (isNormalUser(user)) {
                                                userPrice = product.decprice3;
                                            }
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
                                                        ${(userPrice * (Number(quantity) || 1)).toFixed(2)}
                                                    </p>
                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(product.iIdProduct, quantity - 1)
                                                            }
                                                            disabled={quantity <= 0}
                                                            className={`p-2 rounded-md ${quantity <= 0 ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-gray-200'}`}
                                                        >
                                                            <Minus size={20} />
                                                        </button>
                                                        <span className="mx-2">{quantity}</span>
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(product.iIdProduct, quantity + 1)
                                                            }
                                                            disabled={quantity >= product.istock}
                                                            className={`p-2 rounded-md ${quantity >= product.istock ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-gray-200'}`}
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


                            {/* Desglose de deducciones si aplica */}
                            {(appliedCashback > 0 || appliedCredit > 0) && (
                                <div className="mt-3 space-y-1 text-sm">
                                    {appliedCashback > 0 && (
                                        <div className="flex justify-between text-green-700">
                                            <span>Cashback aplicado</span>
                                            <span>- ${appliedCashback.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {appliedCredit > 0 && (
                                        <div className="flex justify-between text-indigo-700">
                                            <span>Crédito aplicado</span>
                                            <span>- ${appliedCredit.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>

                                <div className="mt-4 py-3 border-t">
                                    {/* Cashback: solo usuario normal */}
                                    {!isDistributor && cashback > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUseCashback(v => {
                                                    const next = !v;
                                                    if (next) {
                                                        setCashbackToUse(Number(maxCashbackUsable));
                                                    } else {
                                                        // si quieres, al desactivar, lo dejas en 0
                                                        setCashbackToUse(0);
                                                    }
                                                    return next;
                                                });
                                            }}
                                            className={`w-full px-3 py-2 rounded-lg border transition ${useCashback ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            {useCashback ? "✓ Usando" : "Usar"} cashback (${cashback})
                                        </button>
                                    )}
                                    {useCashback && (
                                        <div className="mt-2 space-y-2 rounded-lg border border-green-200 bg-green-50 p-3">
                                            <div className="flex items-center justify-between text-xs text-green-800">
                                                <span>Cashback disponible: ${Number(maxCashbackUsable).toFixed(2)}</span>
                                            </div>

                                            {/* Slider */}
                                            <input
                                                type="range"
                                                min={0}
                                                max={Math.floor(maxCashbackUsable)}
                                                step={1}
                                                value={Math.min(cashbackToUse, maxCashbackUsable)}
                                                onChange={(e) => setCashbackToUse(Math.min(Number(e.target.value) || 0, maxCashbackUsable))}
                                                className="l
                                                        w-full h-2 rounded-full appearance-none cursor-pointer
                                                        border border-gray-300
                                                        bg-white
                                                        [&::-webkit-slider-thumb]:appearance-none
                                                        [&::-webkit-slider-thumb]:h-4
                                                        [&::-webkit-slider-thumb]:w-4
                                                        [&::-webkit-slider-thumb]:rounded-full
                                                        [&::-webkit-slider-thumb]:bg-green-600
                                                        [&::-webkit-slider-thumb]:border-2
                                                        [&::-webkit-slider-thumb]:border-white
                                                        [&::-moz-range-thumb]:h-4
                                                        [&::-moz-range-thumb]:w-4
                                                        [&::-moz-range-thumb]:rounded-full
                                                        [&::-moz-range-thumb]:bg-green-600
                                                        [&::-moz-range-thumb]:border-2
                                                        [&::-moz-range-thumb]:border-white
                                                        "
                                                style={{
                                                    // verde hasta el % (llenado), luego blanco
                                                    background: `linear-gradient(to right, #16a34a 0%, #16a34a ${(cashbackToUse / maxCashbackUsable) * 100}%, #ffffff ${(cashbackToUse / maxCashbackUsable) * 100}%, #ffffff 100%)`,
                                                }}
                                            />

                                            {/* Input numérico + quick actions */}
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex gap-2 text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCashbackToUse(Math.min(0.25 * maxCashbackUsable, maxCashbackUsable))}
                                                        className="px-2 py-1 rounded border border-green-300 text-green-700 bg-white hover:bg-green-100"
                                                    >
                                                        25%
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCashbackToUse(Math.min(0.5 * maxCashbackUsable, maxCashbackUsable))}
                                                        className="px-2 py-1 rounded border border-green-300 text-green-700 bg-white hover:bg-green-100"
                                                    >
                                                        50%
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCashbackToUse(maxCashbackUsable)}
                                                        className="px-2 py-1 rounded border border-green-300 text-green-700 bg-white hover:bg-green-100"
                                                    >
                                                        Máximo
                                                    </button>
                                                    {/*  <button
                                                        type="button"
                                                        onClick={() => setCashbackToUse(0)}
                                                        className="px-2 py-1 rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
                                                    >
                                                        Limpiar
                                                    </button> */}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-green-800">Cashback a aplicar:</span>
                                                <span className="font-semibold text-green-900">
                                                    ${appliedCashback.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Crédito: solo distribuidor */}
                                    {isDistributor && baseTotal >= (credit * 2) && creditState === false && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUseCredit(v => {
                                                    const next = !v;
                                                    if (next) {
                                                        setCreditToUse(Number(maxCreditUsable));
                                                    } else {
                                                        // si quieres, al desactivar, lo dejas en 0
                                                        setCreditToUse(0);
                                                    }
                                                    return next;
                                                });
                                            }}
                                            className={`w-full px-3 py-2 rounded-lg border transition ${useCredit ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            {useCredit ? "✓ Usando" : "Usar"} crédito (${Number(credit).toFixed(2)})
                                        </button>
                                    )}

                                    {useCredit && (
                                        <div className="mt-2 space-y-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                                            <div className="flex items-center justify-between text-xs text-indigo-800">
                                                <span>Crédito disponible: ${Number(credit).toFixed(2)}</span>
                                            </div>

                                            {/* Slider */}
                                            <input
                                                type="range"
                                                min={0}
                                                max={Math.floor(maxCreditUsable)}
                                                step={1}
                                                value={Math.min(creditToUse, maxCreditUsable)}
                                                onChange={(e) => setCreditToUse(Math.min(Number(e.target.value) || 0, maxCreditUsable))}
                                                className="w-full"
                                            />

                                            {/* Input numérico + quick actions */}
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex gap-2 text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCreditToUse(Math.min(0.25 * maxCreditUsable, maxCreditUsable))}
                                                        className="px-2 py-1 rounded border border-indigo-300 text-indigo-700 bg-white hover:bg-indigo-100"
                                                    >
                                                        25%
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCreditToUse(Math.min(0.5 * maxCreditUsable, maxCreditUsable))}
                                                        className="px-2 py-1 rounded border border-indigo-300 text-indigo-700 bg-white hover:bg-indigo-100"
                                                    >
                                                        50%
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCreditToUse(maxCreditUsable)}
                                                        className="px-2 py-1 rounded border border-indigo-300 text-indigo-700 bg-white hover:bg-indigo-100"
                                                    >
                                                        Máximo
                                                    </button>
                                                    {/* <button
                                                        type="button"
                                                        onClick={() => setCreditToUse(0)}
                                                        className="px-2 py-1 rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
                                                    >
                                                        Limpiar
                                                    </button> */}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-indigo-800">Crédito a aplicar:</span>
                                                <span className="font-semibold text-indigo-900">
                                                    ${appliedCredit.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between font-semibold text-lg mt-2 pt-2">
                                    <span>Total</span>
                                    <span>{total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Métodos de pago */}
                            <div className="mt-7">
                                <h2 className="text-xl font-semibold mb-4">Metodos de pago</h2>
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <BankTransferButton
                                            size="lg"
                                            onClick={() => setModalOpen(true)}
                                            loading={bankLoading}
                                            className="w-full"
                                            disabled={!selectedAddressId || cart.length <= 0}
                                        />
                                        {/* <MercadoPagoButton
                                            size="lg"
                                            onClick={handleMercadoPago}
                                            loading={mpLoading}
                                            className="w-full"
                                            disabled={!selectedAddressId || cart.length <= 0}
                                        /> */}
                                    </div>
                                </div>
                                <TransferModal
                                    isOpen={modalOpen}
                                    onClose={() => setModalOpen(false)}
                                    onConfirm={handleConfirm}
                                    amountTotal={Number(total.toFixed(2))}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </>
    );
};
