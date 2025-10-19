import { Sequelize } from "sequelize";

//PRODUCCION
/*const conn = new Sequelize('sensalon', 'gkode', 'Desarollo1!', {
  host: '74.208.27.35',
  dialect: 'mysql',
  port: 3306
})
try {
  conn.authenticate()
  console.log('Conexion establecida con exito')
} catch (error) {
  console.error('error al contectar con la bd', error)
}

export default conn
 */

//DESAROLLO
 const conn = new Sequelize("dev_sensalon", "dev_sensalon", "D3vSensalon", {
  host: "74.208.27.35",
  dialect: "mysql",
  port: 3306,
});
try {
  conn.authenticate();
  console.log("Conexion establecida con exito");
} catch (error) {
  console.error("error al contectar con la bd", error);
}

export default conn;
