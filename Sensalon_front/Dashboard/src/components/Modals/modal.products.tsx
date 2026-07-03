import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { Companie } from "../../interfaces/companies";
import axios from 'axios'
import { Categorie } from "../../interfaces/categories";
import { InsertProducts } from "../../services/products/InsertProducts";
import { Product, ProductType } from "../../interfaces/products";
import { UpdateProduct } from "../../services/products/updateProduct";
import { api, BASE_URL_IMAGE_PROD, } from "../../utils/axiosClients";
import { ErrorToast } from "../Toast/errorToast";
import { ProductAutocomplete } from "../Autocomplete";
import { ColorPickerField } from "../ColorPicker";

export const ModalProduct = ({ show, onClose, data, mode }: { show: boolean, onClose: (message: string, type: "success" | "error" | null) => void, data: Product | any, mode: number }) => {
    // en la variable mode, 0 = creando y 1 = editando
    const [empresasError, setEmpresasError] = useState<string | null>(null);
    const [categoriasError, setCategoriasError] = useState<string | null>(null);
    const [_, setProductsError] = useState<string | null>(null);

    const [empresas, SetEmpresas] = useState<Companie[]>([]);
    const [categorias, SetCategorias] = useState<Categorie[]>([]);
    const [products, SetProducts] = useState<any[]>([])
    console.log(data)
    // Variables de estado para los campos del formulario
    const [tipoProducto, setTipoProducto] = useState<ProductType>(data?.producttype || 'SIMPLE')
    const [empresa, setEmpresa] = useState<string>(data?.iFIdCompany || '');
    const [nombre, setNombre] = useState<string>(data?.vcname || '');
    const [idProductRelacionado, setIdProductoRelacionado] = useState<string>(data?.relatedproductId)
    const [colorVariant, setColorVariant] = useState(data?.variantcolor || '')
    const [descripcion, setDescripcion] = useState<string>(data?.vcdescription || '');
    const [peso, setPeso] = useState<string>(data?.vcweight?.match(/\d+/g)?.[0] || "");
    const [unidades, setUnidades] = useState<string>(data?.vcweight?.match?.(/[a-zA-Z]+/g)[0] || 'g');
    const [cantidad, setCantidad] = useState<string>(data?.vcquantity || '');
    const [precio1, setPrecio1] = useState<string>(data?.decprice1 || '');
    const [precio2, setPrecio2] = useState<string>(data?.decprice2 || '');
    const [precio3, setPrecio3] = useState<string>(data?.decprice3 || '');
    const [existencia, setExistencia] = useState<string>((data?.istock || ''));
    const [existenciaMinima, setExistenciaMinima] = useState<string>(data?.istocklimit || '');
    const [selectedCategories, setSelectedCategories] = useState<{ Categorias: { idCategoria: string }[] }>({ Categorias: [] });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(data?.vcphoto || null); // Estado para el archivo de imagen
    const [showDropdown, setShowDropdown] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error" | null>(null);
    const [showToast, setShowToast] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [packageItems, setPackageItems] = useState<{ product_id: string; product_name: string; quantity: number; }[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [packageQty, setPackageQty] = useState<number>(1);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const categoriasRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        axios.all([
            api.get('/empresas').catch((_) => {
                setEmpresasError("Error al obtener empresas: ");
                return null;
            }),
            api.get('/categorias').catch((_) => {
                setCategoriasError('Error al obtener las categorias')
                return null
            }),
            api.get("/productos").catch((_) => {
                setProductsError('Error al obtener los productos')
                return null
            })

        ]).then(axios.spread((resemp, rescat, resprod) => {
            if (resemp) SetEmpresas(resemp.data)
            if (rescat) SetCategorias(rescat.data)
            if (resprod) SetProducts(resprod.data)
        }))
    }, [])

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setShowDropdown(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (categoriasRef.current && !categoriasRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowDropdown(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    useEffect(() => {
        // Si estamos editando, cargamos los datos del producto
        if (mode === 1 && data) {
            if (data?.vccategories) {
                const parsedCategories = JSON.parse(data.vccategories);
                if (parsedCategories && parsedCategories.Categorias) {
                    setSelectedCategories(parsedCategories);
                }
            }
            if (data?.vcphoto) {
                const normalizedPath = data?.vcphoto.replace(/\\/g, '/').split('/imagenes/')[1];
                const imageurl = `${BASE_URL_IMAGE_PROD}/${normalizedPath}`;
                setImagePreview(imageurl);
            } else {
                setImagePreview(null);
            }

        }

        // Si estamos creando un nuevo producto, limpiamos todos los campos
        if (mode === 0) {
            setSelectedCategories({ Categorias: [] });
            setImagePreview(null);
        }
    }, [data, mode]);

    const handleImageChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);  // Guardar el archivo en el estado
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string); // Previsualización local de la nueva imagen seleccionada
            reader.readAsDataURL(file);
        }
    };

    const handleCategoryChange = (id: string) => {
        setSelectedCategories(prevCategories => {
            const categoryExists = prevCategories.Categorias.some(c => c.idCategoria === id);
            if (categoryExists) {
                return {
                    Categorias: prevCategories.Categorias.filter(c => c.idCategoria !== id)
                };
            } else {
                return {
                    Categorias: [...prevCategories.Categorias, { idCategoria: id }]
                };
            }
        });
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const toNullish = (v: any) => {
        if (v === undefined || v === null) return null;
        if (typeof v === "string") {
            const t = v.trim();
            if (t === "" || t === "undefined" || t === "null") return null;
        }
        return v;
    };

    //const isNonEmptyArray = (arr: any) => Array.isArray(arr) && arr.length > 0;

    const handelsubmit = (e: any) => {
        e.preventDefault()
        if (tipoProducto !== "PACKAGE" && (!empresa || empresa === "Seleccione una empresa")) {
            setToastMessage("Seleccione una empresa");
            setToastType("error");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                setToastType(null);
                setToastMessage(null);
            }, 3000);
            return;
        } if (!nombre.trim()) { setToastMessage("Ingrese el nombre del producto"); setToastType("error"); setShowToast(true); setTimeout(() => { setShowToast(false); setToastType(null); setToastMessage(null) }, 3000); return };
        if (!precio1 || !precio2 || !precio3) { setToastMessage("Ingrese los tres precios"); setToastType("error"); setShowToast(true); setTimeout(() => { setShowToast(false); setToastType(null); setToastMessage(null) }, 3000); return };
        if (!existencia && mode === 1) { setToastMessage("Ingrese la existencia"); setToastType("error"); setShowToast(true); setTimeout(() => { setShowToast(false); setToastType(null); setToastMessage(null) }, 3000); return };
        if (!existenciaMinima) { setToastMessage("Ingrese la existencia mínima"); setToastType("error"); setShowToast(true); setTimeout(() => { setShowToast(false); setToastType(null); setToastMessage(null) }, 3000); return };
        if (mode === 0 && !selectedFile) { setToastMessage("Debe seleccionar una imagen del producto"); setToastType("error"); setShowToast(true); setTimeout(() => { setShowToast(false); setToastType(null); setToastMessage(null) }, 3000); return };

        const formData = new FormData()
        //console.log(empresa.value, nombre.value, peso.value + unidades.value, precio1.value, precio2.value, precio3.value, JSON.stringify(selectedCategories), existencia.value, existenciaminima.value)
        if (tipoProducto === "PACKAGE" && !empresa) {
            formData.append("iFIdCompany", "");
        } else {
            formData.append("iFIdCompany", empresa);
        }
        formData.append('vccategories', JSON.stringify(selectedCategories));
        formData.append('vcname', nombre);
        formData.append('vcdescription', descripcion);
        formData.append('producttype', tipoProducto)
        if (tipoProducto !== 'VARIANT') {
            formData.append('relatedproductId', '');
            formData.append('variantcolor', '');
        }

        if (tipoProducto === "VARIANT") {
            const cleanRelated = toNullish(idProductRelacionado);
            if (!cleanRelated) {
                setToastMessage("Seleccione el producto relacionado (VARIANT).");
                setToastType("error");
                setShowToast(true);
                setTimeout(() => { setShowToast(false); setToastType(null); setToastMessage(null); }, 3000);
                return;
            }
            formData.append("relatedproductId", cleanRelated);
        }
        if (tipoProducto === "VARIANT") {
            const vc =
                colorVariant && typeof colorVariant === "object" &&
                    typeof colorVariant.hex === "string" && colorVariant.hex
                    ? JSON.stringify({ name: colorVariant.name ?? "", hex: colorVariant.hex })
                    : null;
            if (vc) formData.append("variantcolor", vc);
        }

        if (tipoProducto === 'PACKAGE') {
            formData.append('productsPackage', JSON.stringify(packageItems))
        }
        formData.append('vcweight', peso + unidades);
        formData.append('vcquantity', cantidad);
        if (selectedFile) {
            formData.append('vcphoto', selectedFile);
        }
        formData.append('decprice1', precio1);
        formData.append('decprice2', precio2);
        formData.append('decprice3', precio3);
        // siempre enviar 0 al crear; en edición mantener el valor existente
        if (mode === 0) {
            formData.append('istock', '0');
        } else {
            formData.append('istock', existencia);
        }
        formData.append('istocklimit', existenciaMinima);

        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }


        if (mode === 0) {
            InsertProducts(formData).then((res) => {
                if (res.valor != 0) {
                    setToastMessage(res.message);
                    setToastType("error");
                    setShowToast(true);
                    setTimeout(() => { setShowToast(false); setToastType(null); setToastMessage(null) }, 3000);
                } else {
                    onClose(res.message, "success");
                }

            })
        } else {
            formData.append('piIdProduct', data?.iIdProduct)
            UpdateProduct(formData).then((res) => {
                if (res.valor != 0) {
                    setToastMessage(res.message);
                    setToastType("error");
                    setShowToast(true);
                    setTimeout(() => { setShowToast(false); setToastType(null); setToastMessage(null) }, 3000);
                } else {
                    onClose(res.message, "success");
                }
            })
        }
    }

    useEffect(() => {
        if (mode === 1 && data) {
            // ... tus otros valores previos

            // Precargar color si existe
            if (data?.variantcolor) {
                try {
                    const parsedColor = JSON.parse(data.variantcolor);
                    setColorVariant(parsedColor);
                } catch {
                    setColorVariant('');
                }
            }

            // Precargar productos del paquete
            if (data?.producttype === 'PACKAGE' && Array.isArray(data.packageItems)) {
                const items = data.packageItems.map((i: any) => ({
                    product_id: i.productId,
                    product_name: i.product_name || '(sin nombre)',
                    quantity: i.quantity || 1,
                }));
                setPackageItems(items);
            }
        }
    }, [data, mode]);


    const addProductToPackage = () => {
        if (!selectedProduct) return;
        const product = products.find(p => p.iIdProduct === selectedProduct);
        if (!product) return;
        setPackageItems(prev => [...prev, { product_id: product.iIdProduct, product_name: product.vcname, quantity: packageQty }]);
        setSelectedProduct('');
        setPackageQty(1);
    };

    const removePackageItem = (id: string) => {
        setPackageItems(prev => prev.filter(item => item.product_id !== id));
    };

    const updatePackageQty = (id: string, qty: number) => {
        setPackageItems(prev =>
            prev.map(p => (p.product_id === id ? { ...p, quantity: qty } : p))
        );
    };
    return (
        <>
            <div className="fixed top-0 right-0 z-[1000] p-4">
                {toastMessage && toastType === "error" && (
                    <ErrorToast message={toastMessage} showToast={showToast} />
                )}
            </div>
            <div id="crud-modal" aria-hidden="true" className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${show ? "opacity-100" : "opacity-0 pointer-events-none"} duration-300 ease-in-out`}>
                <div className="fixed inset-0 bg-[#1d1d1b] bg-opacity-50 transition-opacity duration-300 ease-in-out"></div>
                <div
                    className={`sm:m-12 mt-12 md:relative w-full max-w-6xl max-h-[90vh]
                            bg-white rounded-xl shadow dark:bg-gray-700 transform transition-transform
                            ${show ? "scale-100" : "scale-95"} duration-300 ease-in-out
                            flex flex-col overflow-hidden`}
                >
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 shrink-0">
                        <h3 className="text-2xl font-bold text-[#1d1d1b] dark:text-white">{mode == 0 ? 'Creando nuevo producto' : 'Actualizando producto'}</h3>
                        <button type="button" onClick={() => onClose('', null)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-xl text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span className="sr-only">Cerrar modal</span>
                        </button>
                    </div>
                    <form onSubmit={handelsubmit} className="flex flex-col flex-1 min-h-0 p-4 md:p-5" encType="multipart/form-data">
                        {/* Grid estable adaptable */}
                        <div className="grid gap-4 mb-4 flex-1 min-h-0 overflow-y-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">

                            {/* Tipo de producto */}
                            <div className="col-span-2 lg:col-span-4">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Tipo de producto:
                                </label>
                                <select
                                    value={tipoProducto}
                                    onChange={(e) => setTipoProducto(e.target.value as ProductType)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                >
                                    <option value="">Seleccione tipo</option>
                                    <option value="SIMPLE">Normal</option>
                                    <option value="VARIANT">Variante</option>
                                    <option value="PACKAGE">Paquete</option>
                                </select>
                            </div>

                            {/* Empresa */}
                            <div className="col-span-2 lg:col-span-4">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Empresa:
                                </label>
                                <select
                                    value={empresa}
                                    onChange={(e) => setEmpresa(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                >
                                    <option value="">Seleccione empresa</option>
                                    {empresas.map((emp) => (
                                        <option key={emp.iIdCompany} value={emp.iIdCompany}>
                                            {emp.vcname}
                                        </option>
                                    ))}
                                </select>
                                {empresasError && (
                                    <p className="text-red-500 text-sm mt-1">{empresasError}</p>
                                )}
                            </div>

                            {/* Nombre o Producto Relacionado */}
                            {tipoProducto === "VARIANT" ? (
                                <>
                                    <div className="col-span-2 lg:col-span-4">
                                        <ProductAutocomplete
                                            products={products}
                                            onSelect={(id) => setIdProductoRelacionado(id)}
                                            isPackage={false}
                                            initialValue={idProductRelacionado}
                                        />
                                    </div>

                                    <div className="col-span-2 lg:col-span-4">
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Nombre:
                                        </label>
                                        <input
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            type="text"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                            placeholder="Nombre del producto"
                                        />
                                    </div>
                                </>


                            ) : (
                                <div className="col-span-2 lg:col-span-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Nombre:
                                    </label>
                                    <input
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        type="text"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                        placeholder="Nombre del producto"
                                    />
                                </div>
                            )}

                            {/* Peso */}
                            <div className={`col-span-2 ${tipoProducto === "VARIANT" ? "lg:col-span-4" : "lg:col-span-4"}`}>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Peso:
                                </label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        value={peso}
                                        onChange={(e) => setPeso(e.target.value)}
                                        className="flex-1 rounded-l-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 dark:bg-gray-700 dark:text-white"
                                        placeholder="Peso"
                                    />
                                    <select
                                        value={unidades}
                                        onChange={(e) => setUnidades(e.target.value)}
                                        className="rounded-r-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="g">g</option>
                                        <option value="kg">kg</option>
                                        <option value="ml">ml</option>
                                        <option value="L">L</option>
                                    </select>
                                </div>
                            </div>

                            {/* Color solo si es VARIANT */}
                            {tipoProducto === "VARIANT" && (
                                <div className="col-span-2 lg:col-span-4">
                                    <ColorPickerField value={colorVariant} onChange={(e: any) => { setColorVariant(e) }} />
                                </div>
                            )}

                            {/* Cantidad */}
                            <div className={`col-span-2 ${tipoProducto === "VARIANT" ? "lg:col-span-4" : "lg:col-span-2"}`}>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Cantidad:
                                </label>
                                <input
                                    type="number"
                                    value={cantidad}
                                    onChange={(e) => setCantidad(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                    placeholder="Cantidad"
                                />
                            </div>

                            {/* Precios */}
                            {[precio1, precio2, precio3].map((v, i) => (
                                <div key={i} className="col-span-2 lg:col-span-2">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Precio {i + 1}:
                                    </label>
                                    <input
                                        type="number"
                                        value={v}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (i === 0) setPrecio1(val);
                                            if (i === 1) setPrecio2(val);
                                            if (i === 2) setPrecio3(val);
                                        }}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                        placeholder={`$${(i + 1) * 100}`}
                                    />
                                </div>
                            ))}

                            {tipoProducto === 'PACKAGE' && (
                                <div className="col-span-12">
                                    <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                                        <div className="flex-1 min-w-[250px]">
                                            <ProductAutocomplete
                                                products={products.filter(p => p.producttype !== 'PACKAGE')}
                                                onSelect={(id) => setSelectedProduct(id)}
                                                isPackage={true}
                                                initialValue={packageItems}
                                            />
                                        </div>

                                        <input
                                            type="text"
                                            min={0}
                                            value={packageQty}
                                            onChange={(e) => setPackageQty(Number(e.target.value))}
                                            className="w-24 mt-[27px] border rounded-lg p-2 text-sm dark:bg-gray-600 dark:text-white"
                                            placeholder="Cant."
                                        />

                                        <button
                                            type="button"
                                            onClick={addProductToPackage}
                                            className="bg-blue-600 mt-[27px] text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                    {/* Tabla de productos agregados con scroll */}
                                    <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden max-h-36 overflow-y-auto shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                                                <tr>
                                                    <th className="p-2 text-left">Producto</th>
                                                    <th className="p-2 text-center">Cantidad</th>
                                                    <th className="p-2 text-center">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {packageItems.length > 0 ? (
                                                    packageItems.map((item) => (
                                                        <tr key={item.product_id} className="border-t dark:border-gray-600">
                                                            <td className="p-2">{item.product_name}</td>
                                                            <td className="p-2 text-center">
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    value={item.quantity}
                                                                    onChange={(e) =>
                                                                        updatePackageQty(item.product_id, Number(e.target.value))
                                                                    }
                                                                    className="w-16 text-center border rounded-lg p-1 dark:bg-gray-700 dark:text-white"
                                                                />
                                                            </td>
                                                            <td className="p-2 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removePackageItem(item.product_id)}
                                                                    className="text-red-500 hover:underline"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="text-center text-gray-400 p-2">
                                                            No hay productos añadidos aún
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}


                            {/* Categorías */}
                            <div className="col-span-2 lg:col-span-6">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Categorías:
                                </label>
                                <div className="relative" ref={categoriasRef}>
                                    <button
                                        type="button"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white flex justify-between"
                                    >
                                        {categoriasError &&
                                            <p className="text-red-500 text-sm mb-2">{categoriasError}</p>
                                        }
                                        {selectedCategories.Categorias.length > 0
                                            ? selectedCategories.Categorias
                                                .map((catObj) =>
                                                    categorias.find(
                                                        (c) => c.iIdCategory === catObj.idCategoria
                                                    )?.vcname
                                                )
                                                .join(", ")
                                            : "Seleccione las categorías"}
                                        <FaChevronDown className="text-gray-400" />
                                    </button>
                                    {showDropdown && (
                                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg dark:bg-gray-600">
                                            <ul className="p-2 max-h-48 overflow-y-auto">
                                                {categorias.map((cat) => (
                                                    <li key={cat.iIdCategory} className="flex items-center px-2 py-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.Categorias.some(
                                                                (c) => c.idCategoria === cat.iIdCategory
                                                            )}
                                                            onChange={() => handleCategoryChange(cat.iIdCategory)}
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <label className="ml-2 text-sm">{cat.vcname}</label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Existencias */}
                            <div className="col-span-2 lg:col-span-3">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Existencia:
                                </label>
                                <input
                                    value={existencia}
                                    onChange={(e) => setExistencia(e.target.value)}
                                    type="number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl w-full p-2.5 "
                                />
                            </div>

                            <div className="col-span-2 lg:col-span-3">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Existencia mínima:
                                </label>
                                <input
                                    value={existenciaMinima}
                                    onChange={(e) => setExistenciaMinima(e.target.value)}
                                    type="number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                />
                            </div>

                            {/* Imagen */}
                            <div className={`col-span-2 ${tipoProducto === 'VARIANT' ? 'lg:col-span-6' : 'lg:col-span-6'}`}>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Imagen:
                                </label>
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
                                    accept="image/*"
                                />
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Imagen del producto"
                                        className="mt-1 rounded-xl w-full max-h-48 object-cover"
                                    />
                                )}
                            </div>

                            {/* Descripción */}
                            <div className={`col-span-2 ${tipoProducto === 'VARIANT' ? 'lg:col-span-6' : 'lg:col-span-6'}`}>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Descripción:
                                </label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    rows={6}
                                    className="block w-full text-sm p-2 text-gray-900 border border-gray-300 rounded-xl bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                        </div>

                        {/* Botón */}
                        {/* Footer (no scrollea) */}
                        <div className="shrink-0">
                            <div className="backdrop-blur bg-white/85 dark:bg-gray-700/85 rounded-b-xl">
                                <div className="flex items-center justify-end gap-2 p-3">
                                    <button
                                        type="submit"
                                        className="flex items-center text-white bg-[#32322f] hover:bg-[#1d1d1b] font-medium rounded-xl text-sm px-5 py-2.5 focus:ring-4 focus:ring-blue-300"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        {mode === 1 ? "Editar producto" : "Crear producto"}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </form>


                </div>
            </div>
        </>
    );
};
