import { useState, useEffect, useRef } from "react";
import { Service } from "../../interfaces/services";
import axios from "axios";
import { FaChevronDown } from "react-icons/fa6";
import { formData } from "../../interfaces/formData";

export const SalonForms = ({
  formData,
  setFormData,
}: {
  formData: formData;
  setFormData: React.Dispatch<React.SetStateAction<formData>>;
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]); // siempre IDs
  const [showDropdownServices, setShowDropdownServices] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [, setSelectedFile] = useState<File | null>(null);
  const dropdownRefServices = useRef<HTMLDivElement>(null);

  const SalonData = formData.salonData || {};

  useEffect(() => {
    axios.get("http://localhost:3000/api/services").then((res) => {
      setServices(res.data);
    });
  }, []);

  // Normaliza serviciosOfrecidos a IDs cada vez que cambie la fuente o el catálogo
  useEffect(() => {
    const raw = SalonData?.serviciosOfrecidos;
    if (!raw) {
      setSelectedServices([]);
      return;
    }

    try {
      let ids: string[] = [];

      // Utilidades
      const idSet = new Set(services.map((s) => s.iIdService));
      const nameToId = new Map(
        services.map((s) => [s.vcservicename, s.iIdService] as const),
      );

      if (Array.isArray(raw)) {
        // Puede ser array de IDs o de nombres
        if (raw.every((v) => idSet.has(v))) {
          ids = raw as string[];
        } else {
          ids = (raw as string[])
            .map((name) => nameToId.get(name))
            .filter(Boolean) as string[];
        }
      } else if (typeof raw === "string") {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          // Igual que arriba: IDs o nombres
          if (parsed.every((v: string) => idSet.has(v))) {
            ids = parsed as string[];
          } else {
            ids = (parsed as string[])
              .map((name: string) => nameToId.get(name))
              .filter(Boolean) as string[];
          }
        } else if (parsed?.Services && Array.isArray(parsed.Services)) {
          // Formato canónico con IDs
          ids = parsed.Services.map((s: any) => s.idService);
        }
      }

      setSelectedServices(ids);
    } catch (e) {
      console.error("Error al parsear serviciosOfrecidos:", e);
      setSelectedServices([]);
    }
  }, [SalonData?.serviciosOfrecidos, services]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRefServices.current &&
        !dropdownRefServices.current.contains(event.target as Node)
      ) {
        setShowDropdownServices(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleServiceChange = (serviceId: string) => {
    // Trabajamos SIEMPRE con IDs
    const nextIds = selectedServices.includes(serviceId)
      ? selectedServices.filter((id) => id !== serviceId)
      : [...selectedServices, serviceId];

    setSelectedServices(nextIds);

    // Sincroniza formData en formato canónico
    const servicesArray = nextIds.map((id) => ({ idService: id }));
    const serviciosJSON = JSON.stringify({ Services: servicesArray });

    setFormData((prev) => ({
      ...prev,
      salonData: {
        ...prev.salonData,
        serviciosOfrecidos: serviciosJSON,
      },
    }));
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    setFormData((prev) => ({
      ...prev,
      salonData: {
        ...prev.salonData,
        logoSalon: file,
      },
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      salonData: {
        ...prev.salonData,
        [name]: value,
      },
    }));
  };

  // Nombres visibles en el botón (desde selectedServices -> names)
  const selectedServiceNames =
    selectedServices
      .map((id) => services.find((s) => s.iIdService === id)?.vcservicename)
      .filter(Boolean)
      .join(", ") || "Seleccione los servicios";

  return (
    <>
      <form>
        <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Nombre del salón:
            </label>
            <input
              type="text"
              name="nombreSalon"
              id="nombreSalon"
              value={SalonData.nombreSalon || ""}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Francisco Javier"
            />
          </div>
          <div className="col-span-2 lg:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Teléfono:
            </label>
            <input
              type="text"
              name="telefono"
              id="telefono"
              value={SalonData.telefono || ""}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="555-123-4567"
            />
          </div>
          <div className="col-span-2 lg:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Correo electrónico:
            </label>
            <input
              type="text"
              name="correo"
              id="correo"
              value={SalonData.correo || ""}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="salon@ejemplo.com"
            />
          </div>
        </div>

        <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-6">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Dirección completa
            </label>
            <input
              type="text"
              name="direccion"
              id="direccion"
              value={SalonData.direccion || ""}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Calle, número, ciudad, estado, código postal"
            />
          </div>
        </div>

        <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Hora de apertura:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 11-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L13 11.586V8Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="time"
                  name="horaApertura"
                  id="horaApertura"
                  value={SalonData.horaApertura || "09:00"}
                  onChange={handleInputChange}
                  min="07:00"
                  max="23:59"
                  required
                  className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 lg:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Hora de cierre:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 11-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L13 11.586V8Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="time"
                name="horaCierre"
                id="horaCierre"
                value={SalonData.horaCierre || "18:00"}
                onChange={handleInputChange}
                min="07:00"
                max="23:59"
                required
                className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
            </div>
          </div>

          <div className="col-span-2 lg:col-span-2" ref={dropdownRefServices}>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Servicios ofrecidos:
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdownServices(!showDropdownServices)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 flex justify-between items-center"
              >
                <p className="text-start">{selectedServiceNames}</p>
                <FaChevronDown className="text-[#6B7280]" />
              </button>

              {showDropdownServices && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg dark:bg-gray-600">
                  <ul className="p-2 max-h-48 overflow-y-auto">
                    {services.length === 0 ? (
                      <li>No hay servicios disponibles</li>
                    ) : (
                      services.map((service) => {
                        const isChecked = selectedServices.includes(
                          service.iIdService,
                        );
                        return (
                          <li
                            key={service.iIdService}
                            className="flex items-center px-2 py-1"
                          >
                            <input
                              type="checkbox"
                              id={service.iIdService}
                              value={service.iIdService}
                              checked={isChecked}
                              onChange={() =>
                                handleServiceChange(service.iIdService)
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor={service.iIdService}
                              className="ml-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              {service.vcservicename}
                            </label>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2 lg:col-span-3">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Logo de la empresa:
            </label>
            <input
              type="file"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 dark:text-gray-400 focus:outline-none"
              accept="image/*"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Logo"
                className="mt-1 mb-2 w-full rounded-xl max-h-48 object-cover"
              />
            )}
          </div>
        </div>
      </form>
    </>
  );
};
