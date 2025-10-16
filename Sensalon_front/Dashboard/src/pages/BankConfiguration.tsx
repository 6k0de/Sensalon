import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Building2,
  User,
  Hash,
  Banknote,
  CheckCircle,
  AlertCircle,
  Truck,
} from "lucide-react";
import { getTransfer } from "../services/Transfer/getTransfer";
import { getDeliveryInfo } from "../services/delivery/getDeliveryInfo";
import { updateTransferInfo } from "../services/Transfer/updateTransferInfo";
import { updateDeliveryInfo } from "../services/delivery/updateDeliveryInfo";
interface BankAccountData {
  iIdInfotransfer?: string;
  bankname: string;
  accountname: string;
  accountnumber: string;
  interbankcode: string;
  cardnumber: string;
  includeShipping?: boolean;
}

export const BankConfiguration = () => {
  const [formData, setFormData] = useState<BankAccountData>({
    iIdInfotransfer: "",
    bankname: "",
    accountname: "",
    accountnumber: "",
    interbankcode: "",
    cardnumber: "",
    includeShipping: false,
  });
  const [errors, setErrors] = useState<Partial<BankAccountData>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getTransferInfo = async () => {
    try {
      const data = await getTransfer();
      console.log(data);
      const deliveryInf = await getDeliveryInfo();
      console.log(deliveryInf.data[0]);
      setFormData({
        iIdInfotransfer: data?.iIdInfotransfer || "",
        bankname: data?.bankname || "",
        accountname: data?.accountname || "",
        accountnumber: data?.accountnumber || "",
        interbankcode: data?.interbankcode || "",
        cardnumber: data?.cardnumber || "",
        includeShipping: deliveryInf?.data[0].secobraenvio === 1,
      });
    } catch (error) {
      console.error("Error al cargar información de transferencia", error);
    }
  };

  useEffect(() => {
    getTransferInfo();
  }, []);

  const validateField = (
    name: keyof BankAccountData,
    value: string,
  ): string => {
    switch (name) {
      case "bankname":
        if (!value.trim()) return "El nombre del banco es requerido";
        if (value.length < 2)
          return "El nombre del banco debe tener al menos 2 caracteres";
        return "";
      case "accountname":
        if (!value.trim()) return "El nombre de la cuenta es requerido";
        if (value.length < 2)
          return "El nombre debe tener al menos 2 caracteres";
        return "";
      case "accountnumber":
        if (!value.trim()) return "El número de cuenta es requerido";
        if (!/^\d+$/.test(value))
          return "El número de cuenta solo debe contener dígitos";
        if (value.length < 8 || value.length > 20)
          return "El número de cuenta debe tener entre 8 y 20 dígitos";
        return "";
      case "interbankcode":
        if (!value.trim()) return "El código interbancario es requerido";
        if (!/^\d+$/.test(value))
          return "El código interbancario solo debe contener dígitos";
        if (value.length < 3 || value.length > 18)
          return "El código debe tener entre 3 y 18 dígitos";
        return "";
      case "cardnumber":
        if (!value.trim()) return "El número de tarjeta es requerido";
        const cleanNumber = value.replace(/\s/g, "");
        if (!/^\d+$/.test(cleanNumber))
          return "El número de tarjeta solo debe contener dígitos";
        if (cleanNumber.length !== 16)
          return "El número de tarjeta debe tener 16 dígitos";
        return "";
      default:
        return "";
    }
  };
  const formatcardnumber = (value: string): string => {
    const cleanValue = value.replace(/\s/g, "");
    const match = cleanValue.match(/.{1,4}/g);
    return match ? match.join(" ") : cleanValue;
  };
  const formataccountnumber = (value: string): string => {
    return value.replace(/\D/g, "");
  };
  const handleInputChange = (name: keyof BankAccountData, value: any) => {
    let formattedValue = value;
    if (name === "cardnumber") {
      formattedValue = formatcardnumber(value);
      if (formattedValue.replace(/\s/g, "").length > 16) return;
    } else if (name === "accountnumber" || name === "interbankcode") {
      formattedValue = formataccountnumber(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Omit<BankAccountData, "includeShipping">> = {};
    let hasErrors = false;
    // Validate all fields except includeShipping
    const fieldsToValidate: (keyof Omit<BankAccountData, "includeShipping">)[] =
      [
        "bankname",
        "accountname",
        "accountnumber",
        "interbankcode",
        "cardnumber",
      ];
    fieldsToValidate.forEach((fieldName) => {
      const error = validateField(fieldName, formData[fieldName]!);
      if (error) {
        newErrors[fieldName] = error;
        hasErrors = true;
      }
    });
    setErrors(newErrors);
    if (!hasErrors) {
      const payload = {
        iIdInfotransfer: formData.iIdInfotransfer,
        bankname: formData.bankname,
        accountname: formData.accountname,
        accountnumber: formData.accountnumber,
        interbankcode: formData.interbankcode,
        cardnumber: formData.cardnumber,
      };

      try {
        const [updateInfoBank, updateDeliveryInf] = await Promise.all([
          updateTransferInfo(payload),
          updateDeliveryInfo(formData.includeShipping ? 1 : 0),
        ]);
        console.log({ updateInfoBank, updateDeliveryInf });
        setIsSubmitted(true);
        getTransferInfo();
      } catch (err) {
        console.error("❌ Error al guardar datos:", err);
        // Aquí puedes agregar un estado para mostrar un mensaje de error
      } finally {
        setTimeout(() => {
          setIsSubmitted(false);
        }, 2000);
      }
    }
  };
  const inputClasses = (fieldName: keyof BankAccountData) => `
      w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
      ${errors[fieldName] ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}
    `;
  return (
    <>
      <div
        className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8"
        data-id="data-id"
      >
        <div className="mb-6 ">
          <h2 className="text-2xl font-bold  text-gray-900 mb-2 flex items-center justify-center gap-2">
            Información Bancaria
          </h2>
        </div>
        {isSubmitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-700">
              Información de cuenta bancaria guardada exitosamente
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bank Name */}
          <div>
            <label
              htmlFor="bankname"
              className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              <Building2 className="h-4 w-4" />
              Nombre del Banco
            </label>
            <input
              id="bankname"
              type="text"
              value={formData.bankname}
              onChange={(e) => handleInputChange("bankname", e.target.value)}
              className={inputClasses("bankname")}
              placeholder="Ej: Banco Nacional"
            />
            {errors.bankname && (
              <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.bankname}
              </div>
            )}
          </div>
          {/* Account Name */}
          <div>
            <label
              htmlFor="accountname"
              className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Nombre de la Cuenta
            </label>
            <input
              id="accountname"
              type="text"
              value={formData.accountname}
              onChange={(e) => handleInputChange("accountname", e.target.value)}
              className={inputClasses("accountname")}
              placeholder="Nombre del titular de la cuenta"
            />
            {errors.accountname && (
              <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.accountname}
              </div>
            )}
          </div>
          {/* Account Number */}
          <div>
            <label
              htmlFor="accountnumber"
              className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              <Hash className="h-4 w-4" />
              Número de Cuenta
            </label>
            <input
              id="accountnumber"
              type="text"
              value={formData.accountnumber}
              onChange={(e) =>
                handleInputChange("accountnumber", e.target.value)
              }
              className={inputClasses("accountnumber")}
              placeholder="12345678901234567890"
              maxLength={20}
            />
            {errors.accountnumber && (
              <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.accountnumber}
              </div>
            )}
          </div>
          {/* Interbank Code */}
          <div>
            <label
              htmlFor="interbankcode"
              className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              <Banknote className="h-4 w-4" />
              Clabe Interbancaria
            </label>
            <input
              id="interbankcode"
              type="text"
              value={formData.interbankcode}
              onChange={(e) =>
                handleInputChange("interbankcode", e.target.value)
              }
              className={inputClasses("interbankcode")}
              placeholder="12345678901"
              maxLength={19}
            />
            {errors.interbankcode && (
              <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.interbankcode}
              </div>
            )}
          </div>
          {/* Card Number */}
          <div>
            <label
              htmlFor="cardnumber"
              className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Número de Tarjeta
            </label>
            <input
              id="cardnumber"
              type="text"
              value={formData.cardnumber}
              onChange={(e) => handleInputChange("cardnumber", e.target.value)}
              className={inputClasses("cardnumber")}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            {errors.cardnumber && (
              <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.cardnumber}
              </div>
            )}
          </div>
          {/* Submit Button */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-3">
              <input
                id="includeShipping"
                type="checkbox"
                checked={formData.includeShipping}
                onChange={(e) =>
                  handleInputChange("includeShipping", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor="includeShipping"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
              >
                <Truck className="h-4 w-4" />
                Incluir envío
              </label>
            </div>
            <p className="ml-7 mt-1 text-xs text-gray-500">
              Marque esta opción si desea agregar el costo del envio
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Building2 className="h-5 w-5" />
            Guardar Información
          </button>
        </form>
        {/* Security Note */}
        {/*<div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            Recuerda que esta información bancaria se le pasara a mercado pago,
            para todo el tema de los pagos
          </p>
        </div>*/}
      </div>
    </>
  );
};
