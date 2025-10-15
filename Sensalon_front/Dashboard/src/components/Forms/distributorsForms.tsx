import { useEffect, useRef, useState } from "react";
import { formData } from "../../interfaces/formData";
import { Companie } from "../../interfaces/companies";
import { FaChevronDown } from "react-icons/fa6";
import { api } from "../../utils/axiosClients";

export const DistributorsForms = ({
  formData,
  setFormData,
}: {
  formData: formData;
  setFormData: React.Dispatch<React.SetStateAction<formData>>;
}) => {
  const [companies, setCompanies] = useState<Companie[]>([]);
  const [documentoPreview, setDocumentoPreview] = useState<string | null>(null);
  const [creditStatus, setCreditStatus] = useState<boolean>(false)

  const [showDropdownCompanies, setShowDropdownCompanies] = useState(false);
  const dropdownRefCompanie = useRef<HTMLDivElement>(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const distributorData = formData.distributorData || {};

  console.log(formData);
  console.log(distributorData);

  useEffect(() => {
    api.get("/empresas").then((res) => {
      setCompanies(res.data);
    });
  }, []);

  console.log(formData.iIdUser)
  useEffect(() => {
    if (formData?.iIdUser && formData?.iIdUser !== "") {
      api.get(`/credit/${formData?.iIdUser}`).then((res) => {
        console.log(res.data)
        setFormData((prevFormData) => ({
          ...prevFormData,
          distributorData: {
            ...prevFormData.distributorData,
            credit: res.data.totalamount,
          },
        }));
        setCreditStatus(res.data.state === 1)
      })
    }
  }, [formData?.iIdUser])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRefCompanie.current &&
        !dropdownRefCompanie.current.contains(event.target as Node)
      ) {
        setShowDropdownCompanies(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleServiceChange = (companieId: any) => {
    const empresas = distributorData.empresasRelacionadas
      ? JSON.parse(distributorData.empresasRelacionadas).Empresas
      : [];

    // Si el servicio ya está seleccionado, lo eliminamos
    if (
      empresas.some(
        (empresa: { idEmpresa: string }) => empresa.idEmpresa === companieId,
      )
    ) {
      const updatedEmpresas = empresas.filter(
        (empresa: { idEmpresa: string }) => empresa.idEmpresa !== companieId,
      );
      updateEmpresas(updatedEmpresas);
    } else {
      // Si no está seleccionado, lo agregamos
      const updatedEmpresas = [...empresas, { idEmpresa: companieId }];
      updateEmpresas(updatedEmpresas);
    }
  };

  const updateEmpresas = (updatedEmpresas: any) => {
    const empresasJSON = JSON.stringify({
      Empresas: updatedEmpresas,
    });
    setFormData((prevFormData) => ({
      ...prevFormData,
      distributorData: {
        ...prevFormData.distributorData,
        empresasRelacionadas: empresasJSON,
      },
    }));
  };

  const handleDocumentChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        distributorData: {
          ...prevFormData.distributorData,
          constanciaFiscal: file, // Guardar el archivo en el estado
        },
      }));

      const reader = new FileReader();
      reader.onload = () => setDocumentoPreview(reader.result as string); // Previsualización local
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      distributorData: {
        ...prevFormData.distributorData,
        [name]: value,
      },
    }));
  };

  const PdfIcon = () => (
    <svg
      className="w-8 h-8 text-red-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <rect width="20" height="24" x="2" y="0" rx="3" fill="#f87171" />
      <text x="7" y="17" fontSize="10" fill="white" fontWeight="bold">
        PDF
      </text>
    </svg>
  );

  return (
    <>
      <form>
        <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-9">
          <div className="col-span-2 lg:col-span-3" ref={dropdownRefCompanie}>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Marcas:
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdownCompanies(!showDropdownCompanies)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 flex justify-between items-center"
              >
                <p className="text-start">
                  {distributorData?.empresasRelacionadas &&
                    JSON?.parse(distributorData?.empresasRelacionadas).Empresas
                      ?.length > 0
                    ? JSON?.parse(distributorData?.empresasRelacionadas)
                      .Empresas.map(
                        (empresaObj: { idEmpresa: string }) =>
                          companies.find(
                            (s) => s.iIdCompany === empresaObj.idEmpresa,
                          )?.vcname,
                      )
                      .join(", ")
                    : "Seleccione las marcas"}
                </p>
                <FaChevronDown className="text-[#6B7280]" />
              </button>

              {showDropdownCompanies && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg dark:bg-gray-600">
                  <ul className="p-2 max-h-48 overflow-y-auto">
                    {companies.length === 0 ? (
                      <li>No hay Empresas disponibles</li>
                    ) : (
                      companies.map((companie) => (
                        <li
                          key={companie.iIdCompany}
                          className="flex items-center px-2 py-1"
                        >
                          <input
                            type="checkbox"
                            id={companie.iIdCompany}
                            value={companie.iIdCompany}
                            checked={
                              distributorData.empresasRelacionadas
                                ? JSON.parse(
                                  distributorData.empresasRelacionadas,
                                ).Empresas.some(
                                  (s: { idEmpresa: string }) =>
                                    s.idEmpresa === companie.iIdCompany,
                                )
                                : false
                            }
                            onChange={() =>
                              handleServiceChange(companie?.iIdCompany)
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={companie.iIdCompany}
                            className="ml-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            {companie.vcname}
                          </label>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="col-span-2 lg:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Razón Social:
            </label>
            <input
              type="text"
              name="vcrazonsocial"
              id="vcrazonsocial"
              value={distributorData?.vcrazonsocial || ""}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="JRGLEZ"
            />
          </div>

          <div className="col-span-2 lg:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Credito del ditribuidor:
            </label>
            <input
              type="text"
              name="credit"
              id="credit"
              value={distributorData?.credit || ""}
              onChange={handleInputChange}
              className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${creditStatus ? "cursor-not-allowed opacity-50 " : ""}`}
              placeholder=""
              disabled={creditStatus}
            />
            {creditStatus && (
              <p className="text-red-500 text-sm px-2">
                Credito no pagado
              </p>
            )}
          </div>

          <div className="col-span-2 lg:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Telefono:
            </label>
            <input
              type="text"
              name="telefono"
              id="telefono"
              value={distributorData?.telefono || ""}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="8261555555"
            />
          </div>

        </div>

        <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Correo electronico:
            </label>
            <input
              type="text"
              name="correo"
              id="correo"
              value={distributorData?.correo || ""}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Arriaga Montero"
            />
          </div>

          <div className="col-span-2 lg:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Ciudad:
            </label>
            <input
              type="text"
              name="ciudad"
              id="ciudad"
              value={distributorData?.ciudad || ""}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Arriaga Montero"
            />
          </div>
          <div className="col-span-2 lg:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              País:
            </label>
            <input
              type="text"
              name="pais"
              id="pais"
              value={distributorData?.pais || ""}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Francisco Javier"
            />
          </div>

        </div>

        <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Estado:
            </label>
            <input
              type="text"
              name="estado"
              id="estado"
              value={distributorData?.estado || ""}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Francisco Javier"
            />
          </div>
          <div className="col-span-2 lg:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Codigo postal:
            </label>
            <input
              type="text"
              name="codigoPostal"
              id="codigoPostal"
              value={distributorData?.codigoPostal || ""}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="67500"
            />
          </div>
          <div className="col-span-2 lg:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Rfc:
            </label>
            <input
              type="text"
              name="rfc"
              id="rfc"
              value={distributorData?.rfc || ""}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="VECJ880326"
            />
          </div>
        </div>
        <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-8">

          <div className="col-span-2 lg:col-span-4 flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Constancia Sit. Fiscal:
            </label>
            <input
              type="file"
              ref={inputFileRef}
              onChange={handleDocumentChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 dark:text-gray-400 focus:outline-none"
              accept="image/*,.pdf"
            />

            {documentoPreview && (
              <div className="flex items-center mt-1 bg-gray-50 border rounded-lg px-2 py-1 shadow-sm gap-2 w-fit max-w-full">
                {/* Si es imagen */}
                {documentoPreview.startsWith("data:image") ? (
                  <img
                    src={documentoPreview}
                    alt="Previsualización"
                    className="rounded-md border max-h-14 w-auto object-contain"
                  />
                ) : (
                  // Si es PDF
                  <div className="flex items-center gap-2">
                    <PdfIcon />
                    <span className="text-xs font-medium truncate max-w-[110px]">
                      {/** fileName puedes obtenerlo así: */}
                      {formData.distributorData?.constanciaFiscal?.name ||
                        "Documento.pdf"}
                    </span>
                    <a
                      href={documentoPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline text-xs"
                    >
                      Ver
                    </a>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setDocumentoPreview(null);
                    setFormData((prev) => ({
                      ...prev,
                      distributorData: {
                        ...prev.distributorData,
                        constanciaFiscal: undefined,
                      },
                    }));
                    if (inputFileRef.current) {
                      inputFileRef.current.value = "";
                    }
                  }}
                  className="ml-1 text-red-500 hover:text-red-700 font-bold text-lg"
                  title="Quitar archivo"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <div className="col-span-2 lg:col-span-4">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Direccion de residencia:
            </label>
            <input
              type="text"
              name="direccion"
              id="direccion"
              value={distributorData?.direccion || ""}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Francisco Javier"
            />
          </div>
        </div>
      </form>
    </>
  );
};
