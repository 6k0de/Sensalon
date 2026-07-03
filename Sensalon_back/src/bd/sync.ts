import conn from "./config/config";
import { AssociationsRolesUsers } from "./associations/AssociationsRolesUsers";


AssociationsRolesUsers()

conn.sync({ alter: false })  // Usar alter: true para actualizar tablas existentes
    .then(() => {
        console.log('Modelos sincronizados con la base de datos');
    })
    .catch(error => {
        console.error('Error al sincronizar los modelos con la base de datos', error);
    });