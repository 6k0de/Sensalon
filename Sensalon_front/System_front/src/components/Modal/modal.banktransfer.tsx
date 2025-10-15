// components/TransferModal.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Chip,
} from "@heroui/react";
import { InfoTransfer } from "../../interfaces/infoTransfer";
import { getInfoTransfer } from "../../services/InfoTransfer/infoTransfer";
import { Paperclip, X } from "lucide-react";

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { amount: string; file: File }) => void;
    creditTotal?: number | string;
    amountTotal?: number | string;
}

export const TransferModal = ({
    isOpen,
    onClose,
    onConfirm,
    creditTotal = 0,
    amountTotal = 0
}: TransferModalProps) => {
    const [accountInfo, setAccountInfo] = useState<InfoTransfer>()
    const [amount, setAmount] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const maxAmount = Number(creditTotal || amountTotal);
    const amountNum = Number(amount);

    const amountError = useMemo(() => {
        if (!amount) return "";
        if (Number.isNaN(amountNum)) return "Monto inválido";
        if (amountNum < 1) return "El monto debe ser al menos $1.00";
        if (Number(amountTotal) > 0 && amountNum !== Number(amountTotal)) return `El monto debe ser igual al total a pagar ($${Number(amountTotal).toFixed(2)})`;
        if (amountNum > maxAmount) return `No puede exceder $${maxAmount.toFixed(2)}`;
        return "";
    }, [amount, amountNum, maxAmount, amountTotal]);

    const handlePickFile = () => fileRef.current?.click();
    useEffect(() => {
        getInfoTransfer().then((data) => {
            setAccountInfo(data);
        })
    }, [])

    const handleFileChange = (f?: File) => {
        if (!f) {
            setFile(null);
            setFileError(null);
            return;
        }
        // Validaciones de archivo (opcional)
        const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
        const maxSizeMB = 10;

        if (!allowed.includes(f.type)) {
            setFile(null);
            setFileError("Formato no permitido. Sube imagen (PNG/JPG) o PDF.");
            return;
        }
        if (f.size > maxSizeMB * 1024 * 1024) {
            setFile(null);
            setFileError(`El archivo supera ${maxSizeMB} MB.`);
            return;
        }

        setFile(f);
        setFileError(null);
    };

    const handleConfirm = () => {
        if (amountError || !file) return;
        onConfirm({ amount, file });
        // limpia después de confirmar
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setAmount("");
        setFile(null);
        setFileError(null);
    };

    // 👇 Limpia cuando el modal se cierra
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const isConfirmDisabled = !!amountError || !amount || !file;
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" placement="center">
            <ModalContent>
                <ModalHeader className="text-xl font-bold">
                    Detalles de la transferencia
                </ModalHeader>

                <ModalBody className="space-y-2">
                    <p>
                        Por favor realiza tu transferencia a la siguiente cuenta:
                    </p>


                    <div className="text-sm space-y-2 ">
                        <p><strong>Banco:</strong> {accountInfo?.bankname}</p>
                        <p><strong>Cuenta:</strong> {accountInfo?.accountnumber}</p>
                        <p><strong>CLABE:</strong> {accountInfo?.interbankcode}</p>
                        <p><strong>No tarjeta:</strong> {accountInfo?.cardnumber}</p>
                        <p><strong>Referencia:</strong> {accountInfo?.accountname}</p>
                    </div>

                    <div>
                        <Input
                            label={<span>Monto a pagar <span className="text-red-600">*</span></span>}
                            labelPlacement="outside"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min={0}
                            step="0.01"
                            description={`Saldo por pagar: $${maxAmount.toFixed(2)}`}
                            isInvalid={!!amountError}
                            errorMessage={amountError || undefined}
                            startContent={
                                <div className="pointer-events-none flex items-center">
                                    <span className="text-default-400 text-small">$&nbsp;</span>
                                </div>
                            }
                            type="number"
                            variant="bordered"
                            radius="md"
                            className="mt-8"
                        />
                    </div>

                    <p className="text-base text-yellow-600">
                        No cierres esta ventana hasta que hayas subido el comprobante de tu transferencia.
                        El formato debe ser una imagen o archivo PDF.
                    </p>

                    <div className="space-y-2">
                        <label className="block font-medium text-sm text-gray-700">
                            Comprobante de transferencia <span className="text-red-600">*</span>
                        </label>

                        <Button
                            variant="flat"
                            onPress={handlePickFile}
                            startContent={<Paperclip size={16} />}
                            className="w-full h-12 justify-center"
                        >
                            {file ? "Cambiar archivo" : "Adjuntar archivo"}
                        </Button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => handleFileChange(e.target.files?.[0] || undefined)}
                        />

                        {file && (
                            <Chip
                                variant="flat"
                                color="secondary"
                                endContent={
                                    <button
                                        className="ml-1"
                                        onClick={() => handleFileChange(undefined)}
                                        aria-label="Quitar archivo"
                                    >
                                        <X size={14} />
                                    </button>
                                }
                            >
                                {file.name}
                            </Chip>
                        )}

                        <p className="text-xs text-gray-500">
                            Formatos permitidos: JPG, PNG o PDF. Tamaño máx. 10MB.
                        </p>
                        {fileError && (
                            <p className="text-xs text-red-600">{fileError}</p>
                        )}
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button color="danger" onPress={onClose}>
                        Cancelar
                    </Button>
                    <Button color="success" className="text-white" onPress={handleConfirm} isDisabled={isConfirmDisabled}>
                        Confirmar transferencia
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
