import conn from "./config/config";
import { Users } from "./models/Users.model";
import { Roles } from "./models/Roles.model";
import { AssociationsRolesUsers } from "./associations/AssociationsRolesUsers";


AssociationsRolesUsers()

conn.sync({ alter: false })  // Usar alter: true para actualizar tablas existentes
    .then(() => {
        console.log('Modelos sincronizados con la base de datos');
    })
    .catch(error => {
        console.error('Error al sincronizar los modelos con la base de datos', error);
    });