import { useEffect, useMemo, useState } from "react"
import { createOrderTransferPayCredit, getCreditByUserId, getCreditPayByCreditId } from "../services/Credit/credit"
import { Credit } from "../interfaces/credits"
import { CheckCircle } from "lucide-react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from "@heroui/react";
import { TransferModal } from "../components/Modal/modal.banktransfer";
import { SuccessToast } from "../components/Toast/successToast";
import { ErrorToast } from "../components/Toast/errorToast";

export const MyCredit = () => {

  const [credit, setCredit] = useState<Credit>()
  const [creditPay, setCreditPay] = useState<any[]>([]) // 👈 luego puedes tipar mejor
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const itemsPerPage = 5

  const pages = Math.ceil(creditPay.length / itemsPerPage)

  const items = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    return creditPay.slice(start, end);
  }, [page, creditPay]);

  const user = localStorage?.getItem("user")
  const userId = user ? JSON.parse(user)?.user?.iIdUser : null

  const getCreditByUser = async (id: string) => {
    const data = await getCreditByUserId(id)
    setCredit(data)
  }

  const getCreditPay = async (id: string) => {
    const data = await getCreditPayByCreditId(id)
    setCreditPay(data)
  }

  console.log(credit)
  useEffect(() => {
    if (userId) {
      getCreditByUser(userId)
    }
  }, [])

  useEffect(() => {
    if (credit?.iIdCredits) {
      getCreditPay(credit.iIdCredits)
    }
  }, [setCredit, credit])

  const handleConfirm = async (data: { amount: string; files: File[] }) => {
    try {
      const formData = new FormData();
      formData.append("idUser", userId);
      formData.append("amount", data.amount); // ya es string
      data.files.forEach((f) => formData.append("files", f));

      const res = await createOrderTransferPayCredit(formData);

      setShowSuccessToast(true);
      setToastMessage(
        `${res.message}. Espera a que el pago sea confirmado para verlo en la lista.`
      );
      setModalOpen(false);
    } catch (err: any) {
      setShowErrorToast(true);
      setToastMessage(
        (err.response?.data?.error || err.message) + " Por favor, intenta de nuevo."
      );
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  console.log(creditPay)

  return (
    <>
      <div className="fixed mt-5 right-5">
        {showSuccessToast && <SuccessToast message={toastMessage} showToast={showSuccessToast} />}
        {showErrorToast && <ErrorToast message={toastMessage} showToast={showErrorToast} />}
      </div>

      <main className="min-h-screen  py-10">
        <section className="container mx-auto px-4 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 flex gap-3">
            Mi Crédito
          </h2>

          {!credit ? (
            <p className="text-gray-500 italic">Cargando información...</p>
          ) : credit.state === 0 ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-10">
              <CheckCircle className="text-green-500" size={60} />
              <h3 className="text-xl font-semibold text-gray-700">
                ¡Aún no has utilizado tu crédito!
              </h3>
              <p className="text-gray-600">
                Tienes un saldo disponible de:{" "}
                <span className="font-bold text-black text-2xl">
                  {formatCurrency(Number(credit.totalamount))}
                </span>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className=" bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <div className="flex flex-row justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Tu crédito ha sido utilizado
                    </h3>
                    <p className="text-gray-600">
                      deuda actual:{" "}
                      <span className="font-bold text-black text-2xl">
                        {formatCurrency(Number(credit.totalpayamount) - Number(credit?.payamount || 0))}
                      </span>
                    </p>
                  </div>

                  <div className=" mt-6">
                    <button
                      onClick={() => setModalOpen(true)}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition"
                    >
                      Realizar Pago
                    </button>

                    <TransferModal
                      isOpen={modalOpen}
                      onClose={() => setModalOpen(false)}
                      onConfirm={handleConfirm}
                      creditTotal={Number(credit.totalamount)}
                    />
                  </div>
                </div>
              </div>

              {/* 👇 Ejemplo de tabla para historial de pagos */}
              <section>
                <h3 className="w-full text-center text-3xl font-extrabold text-gray-800 mb-6 flex items-center justify-center gap-3 mt-14">
                  Historial de Pagos
                </h3>
                <div className="overflow-x-auto">
                  <Table
                    aria-label="Pagos de creditos"
                    bottomContent={
                      <div className="flex w-full justify-center">
                        <Pagination
                          isCompact
                          showControls
                          showShadow
                          color="secondary"
                          page={page}
                          total={pages}
                          onChange={(page) => setPage(page)}
                        />
                      </div>
                    }
                    classNames={{
                      wrapper: "min-h-[222px]",
                    }}
                  >
                    <TableHeader>
                      <TableColumn key="iIdPay">ID PAGO</TableColumn>
                      <TableColumn key="paymount">MONTO</TableColumn>
                      <TableColumn key="datepay">FECHA DE PAGO</TableColumn>
                      <TableColumn key="paymentmethod">METODO DE PAGO</TableColumn>
                      <TableColumn key="referencpay">REFERENCIA DE PAGO</TableColumn>
                    </TableHeader>

                    <TableBody items={items} emptyContent={"No hay pagos registrados todavía"}>
                      {(item) => (
                        <TableRow key={item.iIdPay}>
                          <TableCell>{item.iIdPay}</TableCell>
                          <TableCell>{formatCurrency(item.paymount)}</TableCell>
                          <TableCell>{formatDate(item.datepay)}</TableCell>
                          <TableCell>{item.paymentmethod || "—"}</TableCell>
                          <TableCell>{item.referencpay || "—"}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>


                </div>
              </section>

            </div>
          )}
        </section>
      </main>
    </>
  )
}
