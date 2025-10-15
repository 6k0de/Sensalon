import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { Companie } from "../../interfaces/companies";
import axios from 'axios'
import { Categorie } from "../../interfaces/categories";
import { InsertProducts } from "../../services/products/InsertProducts";
import { Product } from "../../interfaces/products";
import { UpdateProduct } from "../../services/products/updateProduct";
import { api, BASE_URL_IMAGE } from "../../utils/axiosClients";

export const ModalProduct = ({ show, onClose, data, mode }: { show: boolean, onClose: (message: string, type: "success" | "error" | null) => void, data: Product | any, mode: number }) => {
    // en la variable mode, 0 = creando y 1 = editando
    const [empresasError, setEmpresasError] = useState<string | null>(null);
    const [categoriasError, setCategoriasError] = useState<string | null>(null);

    const [empresas, SetEmpresas] = useState<Companie[]>([]);
    const [categorias, SetCategorias] = useState<Categorie[]>([]);

    // Variables de estado para los campos del formulario
    const [empresa, setEmpresa] = useState<string>(data?.iFIdCompany || '');
    const [nombre, setNombre] = useState<string>(data?.vcname || '');
    const [descripcion, setDescripcion] = useState<string>(data?.vcdescription || '');
    const [peso, setPeso] = useState<string>(data?.vcweight?.match(/\d+/g)[0] || '');
    const [unidades, setUnidades] = useState<string>(data?.vcweight?.match(/[a-zA-Z]+/g)[0] || 'g');
    const [cantidad, setCantidad] = useState<string>(data?.vcquantity || '');
    const [precio1, setPrecio1] = useState<string>(data?.decprice1 || '');
    const [precio2, setPrecio2] = useState<string>(data?.decprice2 || '');
    const [precio3, setPrecio3] = useState<string>(data?.decprice3 || '');
    const [existencia, setExistencia] = useState<string>(data?.istock || '');
    const [existenciaMinima, setExistenciaMinima] = useState<string>(data?.istocklimit || '');
    const [selectedCategories, setSelectedCategories] = useState<{ Categorias: { idCategoria: string }[] }>({ Categorias: [] });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(data?.vcphoto || null); // Estado para el archivo de imagen
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        axios.all([
            api.get('/empresas').catch((error) => {
                setEmpresasError("Error al obtener empresas: " + error.message);
                return null;
            }),
            axios.get('/categorias').catch((error) => {
                setCategoriasError('Error al obtener las categorias' + error.message)
                return null
            })
        ]).then(axios.spread((resemp, rescat) => {
            if (resemp) SetEmpresas(resemp.data)
            if (rescat) SetCategorias(rescat.data)
        }))
    }, [])

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setShowDropdown(false);
        }
    };

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
                const imageurl = `${BASE_URL_IMAGE}/${normalizedPath}`;
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

    const handelsubmit = (e: any) => {
        e.preventDefault()
        const formData = new FormData()
        //console.log(empresa.value, nombre.value, peso.value + unidades.value, precio1.value, precio2.value, precio3.value, JSON.stringify(selectedCategories), existencia.value, existenciaminima.value)
        formData.append('iFIdCompany', empresa);
        formData.append('vccategories', JSON.stringify(selectedCategories));
        formData.append('vcname', nombre);
        formData.append('vcdescription', descripcion);
        formData.append('vcweight', peso + unidades);
        formData.append('vcquantity', cantidad);

        if (selectedFile) {
            formData.append('vcphoto', selectedFile);
        }
        formData.append('decprice1', precio1);
        formData.append('decprice2', precio2);
        formData.append('decprice3', precio3);
        formData.append('istock', existencia);
        formData.append('istocklimit', existenciaMinima);


        if (mode === 0) {
            InsertProducts(formData).then((res) => {
                if (res.valor != 0) {
                    onClose(res.message, "error");
                } else {
                    onClose(res.message, "success");
                }

            })
        } else {
            formData.append('piIdProduct', data?.iIdProduct)
            UpdateProduct(formData).then((res) => {
                if (res.valor != 0) {
                    onClose(res.message, 'error')
                } else {
                    onClose(res.message, 'success')
                }
            })
        }
    }

    return (
        <>
            <div id="crud-modal" aria-hidden="true" className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${show ? "opacity-100" : "opacity-0 pointer-events-none"} duration-300 ease-in-out`}>
                <div className="fixed inset-0 bg-[#1d1d1b] bg-opacity-50 transition-opacity duration-300 ease-in-out"></div>
                <div className={`sm:m-12 mt-12 md:relative w-full max-w-5xl max-h-full bg-white rounded-xl shadow dark:bg-gray-700 transform transition-transform ${show ? "scale-100" : "scale-95"} duration-300 ease-in-out `}>
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-2xl font-bold text-[#1d1d1b] dark:text-white">{mode == 0 ? 'Creando nuevo producto' : 'Actualizando producto'}</h3>
                        <button type="button" onClick={() => onClose('', null)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-xl text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span className="sr-only">Cerrar modal</span>
                        </button>
                    </div>
                    <form onSubmit={handelsubmit} className="p-4 md:p-5" encType="multipart/form-data">
                        <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
                            <div className='col-span-2  lg:col-span-4'>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Empresa:</label>
                                <select id="empresas" name="empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                    <option selected>Seleccione una empresa</option>
                                    {empresasError ?
                                        <>
                                            <option>Error al obtener las empresas</option>
                                        </>
                                        :
                                        empresas.map((empresa) => (
                                            <>
                                                <option key={empresa.iIdCompany} value={empresa.iIdCompany}>{empresa.vcname}</option>
                                            </>
                                        ))}
                                </select>

                            </div>
                            <div className='col-span-2 lg:col-span-4'>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre:</label>
                                <input value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" name="nombre" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Type product name" />
                            </div>

                            <div className="col-span-2 lg:col-span-4">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Peso:</label>
                                <div className="flex w-full">
                                    <input
                                        type="number"
                                        id="weight-input"
                                        name="peso"
                                        value={peso}
                                        onChange={(e) => setPeso(e.target.value)}
                                        className="block p-2 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-l-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
                                        placeholder="Introduzca el peso"
                                        required
                                    />
                                    <select
                                        id="unit-select"
                                        name="unidades"
                                        value={unidades}
                                        onChange={(e) => setUnidades(e.target.value)}
                                        className="block px-1 z-20 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-r-xl focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                                    >
                                        <option value="g">Gramos(g)</option>
                                        <option value="kg">Kilogramos(kg)</option>
                                        <option value="L">Litros(L)</option>
                                        <option value="ml">Mililitros(ml)</option>
                                    </select>
                                </div>
                            </div>

                        </div>

                        <div className={`grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 ${mode == 1 ? 'lg:grid-cols-5' : 'lg:grid-cols-5'}`}>


                            {mode == 0 &&
                                <div className="col-span-2 lg:col-span-2">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cantidad:</label>
                                    <input value={cantidad} onChange={(e) => setCantidad(e.target.value)} type="number" name="cantidad" id="quantity" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter quantity" />
                                </div>
                            }

                            {mode == 1 &&
                                <div className="col-span-2 lg:col-span-2">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cantidad:</label>
                                    <input value={cantidad} onChange={(e) => setCantidad(e.target.value)} type="number" name="cantidad" id="quantity" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter quantity" />
                                </div>
                            }
                            <div className="col-span-2 lg:col-span-1">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Precio 1:</label>
                                <input value={precio1} onChange={(e) => setPrecio1(e.target.value)} type="number" name="precio1" id="precio1" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="$100" />
                            </div>
                            <div className="col-span-2 lg:col-span-1">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Precio 2:</label>
                                <input value={precio2} onChange={(e) => setPrecio2(e.target.value)} type="number" name="precio2" id="precio2" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="$500" />
                            </div>
                            <div className="col-span-2 lg:col-span-1">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Precio 3:</label>
                                <input value={precio3} onChange={(e) => setPrecio3(e.target.value)} type="number" name="precio3" id="precio3" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="$1000" />
                            </div>




                        </div>

                        <div className={`grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 ${mode == 1 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
                            {mode == 0 &&
                                <div className="col-span-2 lg:col-span-2" ref={dropdownRef}>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Categorías:</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowDropdown(!showDropdown)}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 flex justify-between items-center"
                                        >
                                            <p className="text-start">
                                                {selectedCategories.Categorias.length > 0
                                                    ? selectedCategories.Categorias
                                                        .map(catObj => categorias.find(c => c.iIdCategory === catObj.idCategoria)?.vcname)
                                                        .join(', ')
                                                    : "Seleccione las categorías"}
                                            </p>
                                            <FaChevronDown className="text-[#6B7280] " />
                                        </button>

                                        {showDropdown && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg dark:bg-gray-600">
                                                <ul className="p-2 max-h-48 overflow-y-auto">
                                                    {categoriasError ?
                                                        <>Error al obtener las categorias</>
                                                        :
                                                        categorias.map(category => (
                                                            <li key={category.iIdCategory} className="flex items-center px-2 py-1">
                                                                <input
                                                                    type="checkbox"
                                                                    id={category.iIdCategory}
                                                                    value={category.iIdCategory}
                                                                    checked={selectedCategories.Categorias.some(c => c.idCategoria === category.iIdCategory)}
                                                                    onChange={() => handleCategoryChange(category.iIdCategory)}
                                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                />
                                                                <label htmlFor={category.iIdCategory} className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                    {category.vcname}
                                                                </label>
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            }
                            {mode == 1 &&
                                <div className="col-span-2 lg:col-span-3" ref={dropdownRef}>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Categorías:</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowDropdown(!showDropdown)}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 flex justify-between items-center"
                                        >
                                            <p className="text-start">
                                                {selectedCategories.Categorias.length > 0
                                                    ? selectedCategories.Categorias
                                                        .map(catObj => categorias.find(c => c.iIdCategory === catObj.idCategoria)?.vcname)
                                                        .join(', ')
                                                    : "Seleccione las categorías"}
                                            </p>
                                            <FaChevronDown className="text-[#6B7280] " />
                                        </button>

                                        {showDropdown && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg dark:bg-gray-600">
                                                <ul className="p-2 max-h-48 overflow-y-auto">
                                                    {categoriasError ?
                                                        <>Error al obtener las categorias</>
                                                        :
                                                        categorias.map(category => (
                                                            <li key={category.iIdCategory} className="flex items-center px-2 py-1">
                                                                <input
                                                                    type="checkbox"
                                                                    id={category.iIdCategory}
                                                                    value={category.iIdCategory}
                                                                    checked={selectedCategories.Categorias.some(c => c.idCategoria === category.iIdCategory)}
                                                                    onChange={() => handleCategoryChange(category.iIdCategory)}
                                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                />
                                                                <label htmlFor={category.iIdCategory} className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                    {category.vcname}
                                                                </label>
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            }

                            <div className="col-span-2 lg:col-span-1">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Existencia:</label>
                                <input value={existencia} onChange={(e) => setExistencia(e.target.value)} type="number" name="existencia" id="stock" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Producto en existencia" />
                            </div>
                            <div className="col-span-2 lg:col-span-1">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Existencia mínima:</label>
                                <input value={existenciaMinima} onChange={(e) => setExistenciaMinima(e.target.value)} type="number" name="existenciaminima" id="minStock" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Minimo producto disponible" />
                            </div>

                            {mode == 0 &&
                                <div className="col-span-2 lg:col-span-2">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Imagen:</label>
                                    <input type="file" onChange={handleImageChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 dark:text-gray-400 focus:outline-none" accept="image/*" />
                                    {imagePreview && <img src={imagePreview} alt="Imagen del producto" className="mt-1 mb-2 rounded-xl w-full max-h-48 object-cover" />}
                                </div>
                            }

                            {mode == 0 && <div className="col-span-2 lg:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descripción:</label>
                                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} cols={3} rows={11} name="descripcion" className="block w-full text-sm p-2 text-gray-900 border border-gray-300 rounded-xl bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                            </div>}

                            {
                                mode == 1 &&
                                <div className="col-span-2 lg:col-span-2">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Imagen:</label>
                                    <input type="file" onChange={handleImageChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 dark:text-gray-400 focus:outline-none" accept="image/*" />
                                    {imagePreview && <img src={imagePreview} alt="Imagen del producto" className="mt-1 mb-2 w-full rounded-xl max-h-48 object-cover" />}
                                </div>
                            }

                            {mode == 1 && <div className="col-span-2 lg:col-span-3">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descripción:</label>
                                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} cols={3} rows={11} name="descripcion" className="block  w-full text-sm p-2 text-gray-900 border border-gray-300 rounded-xl bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                            </div>}


                        </div>

                        <div className="flex justify-end mt-4">
                            <button type="submit" onClick={handelsubmit} className="flex text-white items-center bg-[#32322f] hover:bg-[#1d1d1b] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
                                </svg>
                                {mode == 1 ? 'Editar producto' : ' Crear producto'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
