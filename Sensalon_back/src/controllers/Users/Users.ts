import { Request, Response } from "express";
import bcrypt from "bcrypt";
import conn from "../../bd/config/config";
import { Users } from "../../bd/models/Users.model";

/* export const getAllUsers = async (_: Request, res: Response) => {
    const usuarios = await conn.query('CALL GetUserInfo()')
    res.json(usuarios)
}
 */
export const getAllDistributors = async (_: Request, res: Response) => {
  const distributorsData = await conn.query("CALL GetUserDistributorInfo()");
  if (distributorsData) {
    res.status(200).json({
      value: 1,
      message: "Distribuidores obtenidos con exito",
      distribuidores: distributorsData,
    });
  } else {
    res.status(400).json({
      value: 1,
      message: "Error al obtener los distribuidores",
      distribuidores: [],
    });
  }
};

export const getAllSalons = async (_: Request, res: Response) => {
  const salonData = await conn.query("CALL GetUserSalonInfo()");
  if (salonData) {
    res.status(200).json({
      value: 1,
      message: "Salones obtenidos con exito",
      salones: salonData,
    });
  } else {
    res
      .status(400)
      .json({ value: 1, message: "Error al obtener los Salones", salones: [] });
  }
};

export const getAllUsersN = async (_: Request, res: Response) => {
  const usersData = await conn.query("CALL GetUserPerfilInfo()");
  if (usersData) {
    console.log(usersData);
    res.status(200).json({
      value: 1,
      message: "Usuarios obtenidos con exito",
      usuarios: usersData,
    });
  } else {
    res.status(400).json({
      value: 1,
      message: "Error al obtener los Usuarios",
      usuarios: [],
    });
  }
};

export const CreateUser = async (req: Request, res: Response) => {
  const salt = 12;
  const {
    role,
    nombres,
    apellidos,
    username,
    password,
    email,
    salonData,
    distributorData,
  } = req.body;
  console.log({
    role,
    nombres,
    apellidos,
    username,
    password,
    email,
    salonData,
    distributorData,
  });

  let constanciaFiscalPath: string | null = null;
  let logoPath: string | null = null;

  if (req.files && !Array.isArray(req.files)) {
    if ("constanciaFiscal" in req.files) {
      constanciaFiscalPath = `/assets/archivos/${req.files["constanciaFiscal"][0].filename}`;
    }
    if ("logoSalon" in req.files) {
      logoPath = `/assets/logos/${req.files["logoSalon"][0].filename}`;
    }
  }

  try {
    const newPassword = await bcrypt.hash(password, salt);
    console.log({ constanciaFiscalPath, logoPath });

    const parameters = {
      p_vcRole: role,
      p_vcfirstname: nombres,
      p_vclastname: apellidos,
      p_vcusername: username,
      p_vcpassword: newPassword,
      p_vcemail: email,
      p_vcsalonData: salonData
        ? JSON.stringify({ ...salonData, logo: logoPath })
        : null,
      p_vcdistributorData: distributorData
        ? JSON.stringify({
            ...distributorData,
            constanciaFiscal: constanciaFiscalPath,
          })
        : null,
    };

    console.log("hola", parameters);

    const result = await conn
      .query(
        "CALL UserInsert(:p_vcRole, :p_vcfirstname, :p_vclastname, :p_vcusername, :p_vcpassword, :p_vcemail, :p_vcdistributorData, :p_vcsalonData)",
        { replacements: parameters },
      )
      .then((result) => {
        const jsonString = (result[0] as unknown as { insertado: string })
          .insertado;
        let valor = JSON.parse(jsonString);
        let resultado = valor.insertado;
        if (resultado == 0) {
          res.send({ valor: 0, message: "Usuario insertado exitosamente" });
        } else {
          res.send({ valor: 1, message: "Error al Insertar usuario" });
        }
      })
      .catch((error) => {
        console.log(error);
        res.send({ valor: 2, message: "Error en el servidor" });
      });
    console.log(result);
  } catch (err) {
    res.status(500).json({
      message: "Error al crear el usuario",
      error: err instanceof Error ? err.message : err,
    });
    console.error(err);
  }
};

export const UpdateUser = async (req: Request, res: Response) => {
  const salt = 12;
  const {
    p_UserId,
    p_RolId,
    nombres,
    apellidos,
    username,
    password,
    email,
    salonData,
    distributorData,
  } = req.body;
  console.log({
    p_UserId,
    p_RolId,
    nombres,
    apellidos,
    username,
    password,
    email,
    salonData,
    distributorData,
  });
  let constanciaFiscalPath = null;
  let logoPath = null;
  if (req.files && !Array.isArray(req.files)) {
    if ("constanciaFiscal" in req.files) {
      constanciaFiscalPath = `/assets/archivos/${req.files["constanciaFiscal"][0].filename}`;
    }
    if ("logoSalon" in req.files) {
      logoPath = `/assets/logos/${req.files["logoSalon"][0].filename}`;
    }
  }
  let newPassword;
  if (password === "") {
    console.log("Antes de encriptar", password);
    newPassword = null;
    console.log("despues de encriptar", newPassword);
  } else {
    newPassword = await bcrypt.hash(password, salt);
  }
  try {
    const parameters = {
      p_UserId,
      p_RolId,
      p_vcfirstname: nombres,
      p_vclastname: apellidos,
      p_vcusername: username,
      p_vcpassword: newPassword,
      p_vcemail: email,
      p_vcdistributorData: distributorData
        ? JSON.stringify({
            ...distributorData,
            constanciaFiscal: constanciaFiscalPath,
          })
        : null,
      p_vcsalonData: salonData
        ? JSON.stringify({ ...salonData, logo: logoPath })
        : null,
    };
    console.log("hola", parameters);
    await conn
      .query(
        "CALL UserUpdate(:p_UserId, :p_RolId ,:p_vcfirstname, :p_vclastname, :p_vcusername, :p_vcpassword, :p_vcemail, :p_vcdistributorData, :p_vcsalonData)",
        { replacements: parameters },
      )
      .then((result) => {
        console.log(result);
        const jsonString = (result[0] as unknown as { resultado: string })
          .resultado;
        const parsedResult = JSON.parse(jsonString); // Parsear el JSON
        // Acceder al valor de "Actualizado"
        const actualizado = parsedResult.Actualizado;
        if (actualizado === "0") {
          // Comparar como string
          res.send({ valor: 0, message: "Usuario actualizado exitosamente" });
        } else {
          res.send({ valor: 1, message: "Error al actualizar usuario" });
        }
      })
      .catch((error) => {
        res.send({ valor: 2, message: error });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error al crear el usuario",
      error: err instanceof Error ? err.message : err,
    });
  }
};

export const deleteUsers = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedRows = await Users.destroy({ where: { iIdUser: id } });
    if (deletedRows > 0) {
      res
        .status(200)
        .json({ value: 0, message: "Usuario eliminado correctamente" });
    } else {
      res
        .status(404)
        .json({ value: 1, message: "Usuario no encontraro o ya eliminado" });
    }
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    res.status(500).json({
      value: 1,
      message: "Error al intentar eliminar el ususarios",
      error,
    });
  }
};

export const deleteUsersSalon = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedRows = await Users.destroy({ where: { iIdUser: id } });
    if (deletedRows > 0) {
      res
        .status(200)
        .json({ value: 0, message: "Usuario eliminado correctamente" });
    } else {
      res
        .status(404)
        .json({ value: 1, message: "Usuario no encontraro o ya eliminado" });
    }
  } catch (error) {
    console.error("Error al eliminar al Salon:", error);
    res.status(500).json({
      value: 1,
      message: "Error al intentar eliminar el ususarios",
      error,
    });
  }
};

export const deleteUsersDistributor = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedRows = await Users.destroy({ where: { iIdUser: id } });
    if (deletedRows > 0) {
      res
        .status(200)
        .json({ value: 0, message: "Usuario eliminado correctamente" });
    } else {
      res
        .status(404)
        .json({ value: 1, message: "Usuario no encontraro o ya eliminado" });
    }
  } catch (error) {
    console.error("Error al eliminar al distribuidor:", error);
    res.status(500).json({
      value: 1,
      message: "Error al intentar eliminar el ususarios",
      error,
    });
  }
};
