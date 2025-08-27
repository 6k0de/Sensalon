import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

export const Terms = () => {
    const [openSections, setOpenSections] = useState<number[]>([]);

    const toggleSection = (index: number) => {
        setOpenSections(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const sections = [
        {
            title: 'I. GENERALIDADES Y CONTACTO',
            content: `I.1 Bienvenido al sitio de compras en línea de SENSALON, líder mundial en distribución de productos capilares. Los presentes términos y condiciones se aplican a la venta y oferta de productos en territorio mexicano mediante la página de internet www.sensalon.com.mx (en lo sucesivo, Sensalon), así como para el apartado de productos en línea para recogerlos con un distribuidor autorizado.

I.2 El presente sitio es operado por el proveedor BRALIZA SA DE CV, quien también desarrolla sus actividades con distribuidores autorizados, siendo una empresa mexicana con domicilio en Calle de Gardenia 354, Colonia Los Sabinos, Montemorelos, Nuevo León, en los Estados Unidos Mexicanos, Código Postal 67515, y en lo sucesivo denominada Sensalon.

I.3 Para información sobre los métodos de compra a través del presente sitio web, así como de los productos aquí ofertados, se pone a su disposición el siguiente correo electrónico: info@sensalon.com.mx, disponible de lunes a viernes de 9 am a 7 pm, hora centro de México.

I.4 Los presentes términos y condiciones se establecen en términos de la Ley Federal de Protección al Consumidor, especialmente del contenido del Capítulo VIII Bis de dicha ley.

I.5 Para tener acceso a comprar en línea por medio de sensalon.com.mx, los clientes deberán registrarse en dicha página de internet y tener al menos 18 años de edad, o si es menor de edad, contar con la autorización de su padre o tutor.`
        },
        {
            title: 'II. PRODUCTOS DISPONIBLES PARA COMPRA EN LÍNEA',
            content: `II.1 Los productos disponibles para compra en línea, así como las promociones que les apliquen, son exclusivamente aquellas indicadas como tales en sensalon.com.mx.

II.2 La descripción de los productos disponibles para compra en línea será publicada en sensalon.com.mx; dicha información incluirá los detalles, descripción general e imágenes de los productos.

II.3 Los productos disponibles para compra en línea se venden únicamente para uso personal, quedando prohibida la reventa de cualquiera de dichos productos, incluso de las muestras, salvo pacto específico en contrario. En tal virtud, Sensalon determinará la cantidad de productos que cada uno de sus clientes podrá comprar por este medio, pudiendo incluso cancelar o reducir pedidos cuando, a juicio de Sensalon, se incurra en una violación a lo aquí dispuesto.

II.4 Las compras en línea a través de sensalon.com.mx podrán realizarse únicamente por personas cuyo domicilio se encuentre dentro de los Estados Unidos Mexicanos.`
        },
        {
            title: 'III. RECOGE CON DISTRIBUIDOR AUTORIZADO',
            content: `III.1 Los clientes podrán, a través de sensalon.com.mx, realizar compras para recoger con un distribuidor autorizado, con un tiempo de almacenaje de 10 días; posterior a eso, si no es recolectado por el cliente, el pedido será cancelado automáticamente.

III.2 Los pedidos de recogida con distribuidor autorizado están sujetos a disponibilidad de inventario; en caso de no contar con el producto disponible, la orden será cancelada automáticamente.`
        },
        {
            title: 'IV. PRECIOS',
            content: `IV.1 Los precios de los productos son aquellos señalados en sensalon.com.mx, en pesos mexicanos, los cuales incluyen el impuesto al valor agregado (IVA) en los términos que la ley fiscal vigente lo establezca al momento de la compra. Los precios de los productos en línea pueden variar de los de tienda física o distribuidor autorizado.

IV.2 Los gastos de envío deberán ser cubiertos por el cliente, en forma adicional al precio de los productos. Ocasionalmente, Sensalon PROFISSIONAL MÉXICO podrá otorgar descuentos en dichos gastos, lo cual será debidamente comunicado en sensalon.com.mx.

IV.3 Cualquier gasto adicional al precio del producto que el cliente deba cubrir con el fin de concretar la adquisición del mismo, estará debidamente desglosado desde antes de realizar la compra, así como al momento del pago, con el fin de que exista plena certeza para el cliente.`
        },
        {
            title: 'V. CÓMO HACER UNA COMPRA EN LÍNEA',
            content: `V.1 Las compras en línea se realizan siguiendo las instrucciones que se indican en sensalon.com.mx.

V.2 Las compras en línea únicamente podrán realizarse respecto de productos de los que se tenga inventario disponible en la tienda en línea y estarán limitadas a que la suma de los pedidos que realice un cliente no exceda de $20,000.00 pesos mexicanos por día. La cantidad antes mencionada podrá ser modificada por Sensalon mediante aviso publicado en sensalon.com.mx, o bien, mediante la modificación de los presentes términos y condiciones.

V.3 Para realizar un pedido, el cliente deberá ingresar a sensalon.com.mx y registrarse en la página. Al generar este registro, proporcionará los datos solicitados, tales como dirección de envío y datos de la tarjeta de débito o crédito con la cual se realizarán los pagos de las compras en línea, en su caso.

V.4 Una vez hecho lo anterior, el cliente podrá seleccionar los productos que desee adquirir y realizar el pago correspondiente con el medio de pago deseado. El envío del pedido se realizará al domicilio señalado para tal efecto en el registro correspondiente.

V.5 Cuando se pague el pedido, Sensalon tendrá un plazo de 2 días hábiles para confirmar el envío de la mercancía o bien, devolver el monto pagado por aquellos productos de los que no hubiera existencia. La devolución se realizará en la forma original de pago.`
        },
        {
            title: 'VI. OPCIONES DE PAGO',
            content: `VI.1 El pago de las compras en línea se podrá realizar mediante tarjetas de crédito o débito, siendo las aceptadas las siguientes: VISA y MasterCard.

VI.2 Para solicitar el comprobante fiscal correspondiente a una compra realizada en sensalon.com.mx, el cliente deberá comunicarse al departamento de Servicio al Cliente de Sensalon mediante un correo electrónico a: info@sensalon.com.mx, en un horario de atención de lunes a viernes de 9 am a 6 pm.`
        },
        {
            title: 'VII. ENVÍOS',
            content: `VII.1 Las entregas de los envíos se harán únicamente en días laborales, excepto en los festivos, y dentro del territorio de los Estados Unidos Mexicanos.

VII.2 Los gastos de envío serán pagados por los clientes, y éstos serán debidamente informados antes de la compra del producto, con el fin de que al momento del pago no exista duda sobre el monto por los mismos. En pedidos superiores al monto de $4,900.00 pesos mexicanos, los gastos de envío regulares serán gratis y solo aplican para 99 Minutos, Estafeta y PaquetExpress.

VII.3 La entrega de los productos se realizará acorde al tipo de envío seleccionado por el cliente:

Envío regular: El tiempo de entrega es de 3 hasta 5 días hábiles, contados a partir del día siguiente en que se finalizó la compra en línea por parte del cliente y tendrá un costo de $150.00 a $250.00 pesos mexicanos. Los tiempos de envío son estimados, ya que están sujetos a los tiempos de entrega según la zona por parte de la paquetería.
Cuando se haya finalizado una compra y resulte que algunos de los productos del pedido no se encuentran disponibles en el inventario, Sensalon notificará dicha situación al cliente mediante correo electrónico, informando el cambio en la orden o la cancelación como tal. En este caso, el envío correspondiente no se realizará en los plazos mencionados.

VII.4 El tiempo de entrega de los envíos a cualquiera de los siguientes municipios será de 14 días hábiles contados a partir del día siguiente en que se finalizó la compra en línea por parte del cliente: [Lista de municipios]

Sensalon realiza tanto los envíos como devoluciones de los productos comprados en sensalon.com.mx a la dirección de envío proporcionada por el mismo cliente al momento de confirmar su pedido, y es por ello que no se hace responsable por reclamaciones relacionadas con productos enviados a un domicilio equivocado cuando este error no sea atribuible a Sensalon.`
        },
        {
            title: 'VIII. GARANTÍAS',
            content: `VIII.1 Los clientes que adquieran productos comprados en línea en sensalon.com.mx podrán reponerlos o sustituirlos únicamente cuando éstos resulten defectuosos y estos estén dentro de los 5 días a partir de la entrega de su pedido.

VIII.2 Las solicitudes de cambios o devoluciones por satisfacción comprados en sensalon.com.mx únicamente se harán válidas de acuerdo a los productos aplicables dentro de la política de cambios y devoluciones de tienda en línea, y estos deberán contar con su empaque original, sellado y sin haber sido utilizado u abierto.

VIII.3 Los productos eléctricos cuentan con 2 años de garantía por defecto de fábrica (sin costo adicional) excepto los eléctricos de la marca Izutech y deberá seguirse el siguiente procedimiento:

[Procedimiento detallado]

VIII.4 En el caso de los demás productos, consulta la descripción de los mismos en sensalon.com.mx para verificar si cuentan con garantía, o bien, revisa en el empaque si incluye garantía.

VIII.5 Una vez recibido su paquete, cuenta con 5 días hábiles para realizar una reclamación por faltante o producto en mal estado.`
        },
        {
            title: 'IX. JURISDICCIÓN',
            content: `IX.1 Todas las compras en línea realizadas en sensalon.com.mx deberán sujetarse a las disposiciones aplicables mexicanas, especialmente a la Ley Federal de Protección al Consumidor.

IX.2 Cualquier conflicto surgido de las compras en línea realizadas en sensalon.com.mx deberá sujetarse a la jurisdicción de los Tribunales competentes en la ciudad de Monterrey, Nuevo León, Estados Unidos Mexicanos.`
        },
        {
            title: 'X. MARCAS',
            content: `X.1 Todos los materiales, incluyendo imágenes, ilustraciones, diseños, marcas registradas y demás elementos que sean distribuidos y/o licenciados por Sensalon, se encuentran protegidos por la legislación mexicana aplicable y los tratados internacionales en materia de propiedad intelectual.

X.2 Sensalon se reserva todos los derechos intelectuales en el contenido de texto, productos, procesos, programas y demás materiales que aparecen en sensalon.com.mx.`
        },
        {
            title: 'XI. PROPIEDAD INTELECTUAL E INDUSTRIAL',
            content: `Sensalon y sus licenciantes y licenciatarios ostentan, ya sea por sí mismos o por virtud de la celebración de algún contrato con terceros, todos los derechos sobre el contenido, diseño y código fuente del sitio web, y en especial, con carácter enunciativo pero no limitativo, sobre las fotografías, imágenes, textos, logos, diseños, marcas, nombres comerciales y datos que se incluyen en el mismo.

Se advierte a todos los clientes que los derechos antes mencionados se encuentran protegidos por la legislación vigente mexicana e internacional relativa a la propiedad intelectual e industrial y de derechos de autor.

Asimismo, el contenido de este sitio web también tiene la consideración de programa informático, y por lo tanto, le resulta también aplicable toda la normativa mexicana e internacional vigente en la materia.

Queda expresamente prohibida la reproducción total o parcial de este sitio web, sin el previo permiso expreso y por escrito de Sensalon.

Asimismo, queda totalmente prohibida la copia, reproducción, adaptación, modificación, distribución, comercialización, comunicación pública y/o cualquier otra acción que comporte una infracción de la legislación vigente mexicana y/o internacional en materia de propiedad intelectual y/o industrial, así como el uso de los contenidos del sitio web si no es con la previa autorización expresa y por escrito de Sensalon.`
        },
        {
            title: 'XII. REGALOS Y PROMOCIONES EXCLUSIVAS EN LÍNEA',
            content: `XII.1 Envío regular gratis en compras mayores a $4,900. El envío regular tarda de 4 a 5 días hábiles en llegar al destino según la cobertura de la zona. Envíos locales en Monterrey y zona metropolitana se realizan con entrega el mismo día en pedidos realizados de 12 am a 1 pm de lunes a viernes. Fuera de ese horario, tu pedido será entregado al día siguiente.

XII.2 Los productos de regalo en promociones como recompensas están sujetos a disponibilidad durante el tiempo que dure la promoción. En caso de agotarse el producto, no será enviado en el pedido generado. Así mismo, esta promoción no aplica con otras promociones ni es acumulable.`
        },
        {
            title: 'XIII. CUPONES DE DESCUENTO',
            content: `Códigos de descuento de influencers, cumpleaños. No se pueden combinar con otras promociones o descuentos. No se aceptan cambios ni devoluciones en estos productos. No aplica en marcas nacionales o internacionales.`
        },
    ];
    return (
        <div className="flex-grow w-full h-full flex items-center justify-center bg-white mt-5">
           <div className="w-full h-full mx-auto bg-white rounded-lg  overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">TÉRMINOS Y CONDICIONES BRALIZA SA DE CV</h1>
                    <div className="space-y-4 h-full w-full overflow-y-auto">
                        {sections.map((section, index) => (
                            <div key={index} className="border-b border-gray-200 pb-4">
                                <button
                                    className="flex justify-between items-center w-full text-left font-semibold text-gray-900 focus:outline-none"
                                    onClick={() => toggleSection(index)}
                                >
                                    <span>{section.title}</span>
                                    {openSections.includes(index) ? (
                                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                                    ) : (
                                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                    )}
                                </button>
                                {openSections.includes(index) && (
                                    <div className="mt-2 text-gray-600 text-sm whitespace-pre-wrap">
                                        {section.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
