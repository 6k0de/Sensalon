DELIMITER $$
CREATE PROCEDURE `DistributorCompaniesInsert`(IN `piFIdUser` CHAR(36), IN `pvccompanies` JSON, IN `pvcaddress` VARCHAR(128), IN `pvcstate` VARCHAR(64), IN `pvccity` VARCHAR(64), IN `pvcpostalcode` VARCHAR(64), IN `pvccountry` VARCHAR(64), IN `pvcphone` VARCHAR(64), IN `pvcemail` VARCHAR(128), IN `pvcrfc` VARCHAR(64), IN `pvcconsfis` MEDIUMTEXT, IN `pvcrazonsocial` VARCHAR(255), OUT `p_outStatus` INT)
BEGIN
    DECLARE vcGeneratedUUID CHAR(36);
    DECLARE insertDistributorSuccess INT DEFAULT 0;
    DECLARE insertCompanySuccess INT DEFAULT 0;
    
    IF pvccompanies IS NULL OR pvccompanies = '' THEN
    	SET pvccompanies = '{"Empresas": []}';
	END IF;

    -- Generar un nuevo UUID
    SET vcGeneratedUUID = UUID();
    
    WHILE EXISTS (SELECT 1 FROM distributors WHERE iIdistributor = vcGeneratedUUID) DO
        SET vcGeneratedUUID = UUID(); -- Generar otro UUID
    END WHILE;

    -- Insertar el nuevo distribuidor en la tabla distributors
    INSERT INTO distributors 
    (
        iIdistributor,
        iFIdUser,
        vccompanies,
        vcaddress,
        vcstate,
        vccity,
        vczipcode,
        vccountry,
        vcphone,
        vcemail,
        vcrfc,
        vcconstfisc,
        vcrazonsocial,
        dtcreation
    )
    VALUES 
    (
        vcGeneratedUUID,
        piFIdUser,
        pvccompanies,
        pvcaddress,
        pvcstate,
        pvccity,
        pvcpostalcode,
        pvccountry,
        pvcphone,
        pvcemail,
        pvcrfc,
        pvcconsfis,
        pvcrazonsocial,
        NOW()
    );

    -- Verificar si la inserción fue exitosa
    SET insertDistributorSuccess = ROW_COUNT();

    -- Insertar las relaciones distribuidor-empresa 
    INSERT INTO reldistributorscompanies(iFIdDistributor, iFIdCompany)
    SELECT 
        vcGeneratedUUID, 
        jt.idEmpresa
    FROM 
        JSON_TABLE(
            pvccompanies,
            '$.Empresas[*]' 
            COLUMNS (
                idEmpresa VARCHAR(50) PATH '$.idEmpresa'
            )
        ) AS jt;

    -- Verificar si la inserción de empresas fue exitosa
    SET insertCompanySuccess = ROW_COUNT();

    -- Confirmar o revertir la transacción
    IF insertDistributorSuccess > 0 AND insertCompanySuccess > 0 THEN
        SET p_outStatus = 0; -- Todo salió bien
    ELSE
        SET p_outStatus = 1; -- Algo salió mal
    END IF;

END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `DistributorCompaniesUpdate`(IN `piFIdUser` CHAR(36), IN `pvccompanies` JSON, IN `pvcaddress` VARCHAR(128), IN `pvcstate` VARCHAR(64), IN `pvccity` VARCHAR(64), IN `pvcpostalcode` VARCHAR(64), IN `pvccountry` VARCHAR(64), IN `pvcphone` VARCHAR(64), IN `pvcemail` VARCHAR(128), IN `pvcrfc` VARCHAR(64), IN `pvcconsfis` MEDIUMTEXT, IN `pvcrazonsocial` VARCHAR(255), IN `p_generateNewId` TINYINT, IN `p_outStatus` INT)
BEGIN
    DECLARE updateDistributorSuccess INT DEFAULT 0;
    DECLARE updateCompanySuccess     INT DEFAULT 0;
    DECLARE v_DistributorId          CHAR(36);
    DECLARE v_NewDistributorId       CHAR(36); -- Guarda el ID si el parámetro p_generateNewId = 1.
	DECLARE distributorExists        INT DEFAULT 0;
    DECLARE vcGeneratedUUIDCredit    CHAR(36);
    
	IF pvccompanies IS NULL OR pvccompanies = '' THEN
    	SET pvccompanies = '{"Empresas": []}';
	END IF;
    
    -- Verifica si el distribuidor ya existe para el usuario
    SELECT COUNT(1)
    	INTO distributorExists
    FROM distributors
    WHERE iFIdUser = piFIdUser;
    
    -- Verifica si se debe generar un nuevo ID y crear un nuevo distribuidor
    IF distributorExists = 0 OR p_generateNewId = 1 THEN
        -- Generar un nuevo UUID para el distribuidor
        SET v_NewDistributorId = UUID();
        
        -- Validar que no haya un UUID duplicado en la tabla distributors
        WHILE EXISTS (SELECT 1 FROM distributors WHERE iIdistributor = v_NewDistributorId LIMIT 1) DO
            SET v_NewDistributorId = UUID(); -- Generar otro UUID si hay duplicado
        END WHILE;

        -- Insertar el nuevo distribuidor en la tabla `distributors`
        INSERT INTO distributors (
            iIdistributor, 
            iFIdUser, 
            vccompanies, 
            vcaddress, 
            vcstate, 
            vccity, 
            vczipcode, 
            vccountry, 
            vcphone, 
            vcemail, 
            vcrfc, 
            vcconstfisc, 
            vcrazonsocial,
            dtcreation, 
            dtupdate
        ) VALUES (
            v_NewDistributorId,
            piFIdUser,
            pvccompanies,
            pvcaddress,
            pvcstate,
            pvccity,
            pvcpostalcode,
            pvccountry,
            pvcphone,
            pvcemail,
            pvcrfc,
            pvcconsfis,
            pvcrazonsocial,
            NOW(),
            NOW()
        );

        -- Asignar el nuevo ID del distribuidor para usarlo en las relaciones
        SET v_DistributorId = v_NewDistributorId;

        -- Marca como exitosa la creación del nuevo distribuidor
        SET updateDistributorSuccess = ROW_COUNT();
    ELSE
        -- Obtén el ID del distribuidor existente
        SELECT iIdistributor 
            INTO v_DistributorId
        FROM distributors
        WHERE iFIdUser = piFIdUser
        LIMIT 1;

        -- Actualiza la información del distribuidor en la tabla `distributors`
        UPDATE distributors
        SET
            vccompanies = pvccompanies,
            vcaddress   = pvcaddress,
            vcstate     = pvcstate,
            vccity      = pvccity,
            vczipcode   = pvcpostalcode,
            vccountry   = pvccountry,
            vcphone     = pvcphone,
            vcemail     = pvcemail,
            vcrfc       = pvcrfc,
            vcconstfisc = pvcconsfis,
            vcrazonsocial = pvcrazonsocial,
            dtupdate    = NOW()  
        WHERE iIdistributor = v_DistributorId;

        -- Verifica si la actualización del distribuidor fue exitosa
        SET updateDistributorSuccess = ROW_COUNT();
    END IF;

    -- Elimina las relaciones distribuidor-empresa existentes y agrega las nuevas
    DELETE FROM reldistributorscompanies WHERE iFIdDistributor = v_DistributorId;

    -- Inserta las nuevas relaciones distribuidor-empresa
    INSERT INTO reldistributorscompanies(iFIdDistributor, iFIdCompany)
    SELECT 
        v_DistributorId, 
        jt.idEmpresa
    FROM 
        JSON_TABLE(
            pvccompanies,
            '$.Empresas[*]' 
            COLUMNS (
                idEmpresa VARCHAR(50) PATH '$.idEmpresa'
            )
        ) AS jt;

    -- Verifica si la inserción de relaciones fue exitosa
    SET updateCompanySuccess = ROW_COUNT();
    
    
    SET vcGeneratedUUIDCredit = UUID();
    
     -- Validar que no haya un UUID duplicado en la tabla credits
    WHILE EXISTS (SELECT 1 FROM credits WHERE iIdCredits = vcGeneratedUUIDCredit) DO
        SET vcGeneratedUUIDCredit = UUID(); -- Generar otro UUID si hay duplicado en credits
    END WHILE;
    
    INSERT INTO credits (iIdCredits, iFIdUser, totalamount, payamount, state, dtcreation, dtUpdate)
        SELECT UUID(), piFIdUser, 20000, 0, 0, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM credits WHERE iFIdUser = piFIdUser);

    -- Confirma el estado de la operación
    IF updateDistributorSuccess > 0 AND updateCompanySuccess > 0 THEN
        SET p_outStatus = 0; -- Todo salió bien
    ELSE
        SET p_outStatus = 1; -- Algo salió mal
    END IF;

END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetAdministradorLogin`(IN `p_idUser` CHAR(36))
BEGIN
    DECLARE v_role_id CHAR(36);
    DECLARE v_role_name VARCHAR(50);

        -- Verificar si el usuario existe y obtener su rol
    SELECT iFIdRole
    INTO v_role_id
    FROM users 
    WHERE iIdUser = p_idUser;

    SELECT vctyperole
    INTO v_role_name
    FROM roles
    WHERE iIdRole = v_role_id;


    -- Validar si es administrador
    IF v_role_name = 'Administrador' THEN
        SELECT 
            a.vcfirstname,
            a.vcemail    
        FROM users a
        WHERE a.iIdUser = p_idUser;  
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No es un administrador';
    END IF;

END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetDistributorsCompaniesProductsByUser`(IN `p_iIdUser` CHAR(36), IN `p_Idcart` CHAR(36))
BEGIN
    SELECT 
    	p_Idcart,
        b.vcfirstname,
        b.vclastname,
        r.vctyperole,
        b.iFIdRole,	
        a.vccompanies,
        d.iIdCompany,
        d.vcname,
        p.iIdProduct,
        p.vcname,
        p.vcdescription,
        p.decprice1,
        p.vccategories,
        p.vcweight,
        p.vcquantity,
        p.vcphoto,
        p.istock,
        p.istocklimit
    FROM 
        distributors a 
    INNER JOIN 
        users b ON a.iFIdUser = b.iIdUser
    INNER JOIN 
        roles r ON b.iFIdRole = r.iIdRole
    LEFT JOIN 
        reldistributorscompanies c ON a.iIdistributor = c.iFIdDistributor
    INNER JOIN 
        companies d ON c.iFIdCompany = d.iIdCompany
    LEFT JOIN 
        products p ON p.iFIdCompany = d.iIdCompany
    WHERE 
        b.iIdUser = p_iIdUser; -- Filtro por el usuario logueado
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetMostSoldProducts`()
BEGIN
    -- Crear una tabla temporal para almacenar los productos del JSON
    CREATE TEMPORARY TABLE IF NOT EXISTS TempSoldProducts (
        vcname VARCHAR(255),
        quantity INT
    );

    -- Extraer y contar los productos del JSON de la tabla transactions
    INSERT INTO TempSoldProducts (vcname, quantity)
    SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(j.value, '$.name')) AS vcname,
        JSON_UNQUOTE(JSON_EXTRACT(j.value, '$.quantity')) AS quantity
    FROM transactions t
    JOIN JSON_TABLE(t.products, '$[*]' COLUMNS (
        value JSON PATH '$'
    )) AS j
    WHERE t.status = 'approved';

    -- Obtener los productos más vendidos agrupados y ordenados por cantidad vendida
    SELECT 
        p.iIdProduct,
        p.vcname,
        SUM(tsp.quantity) AS total_sold
    FROM TempSoldProducts tsp
    JOIN products p ON tsp.vcname = p.vcname
    GROUP BY p.iIdProduct, p.vcname
    ORDER BY total_sold DESC;

    -- Eliminar la tabla temporal
    DROP TEMPORARY TABLE IF EXISTS TempSoldProducts;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetProductsBySalon`(IN `p_idCart` CHAR(36))
BEGIN
    SELECT 
    	p_idCart,	
        b.vcname,
        b.vcorigin,
        a.iIdProduct,
        a.vcname,
        a.vcdescription,
        a.iFIdCompany,
        a.vcquantity,
        a.vcweight,
        a.vcquantity,
        a.decprice2,
        a.vccategories,
        a.vcphoto,
        a.istock,
        a.istocklimit       
    FROM 
        products a 
    INNER JOIN 
        companies b ON a.iFIdCompany = b.iIdCompany;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetProductsByUser`(IN `p_idCart` CHAR(36))
BEGIN
    SELECT
    	p_idCart,
        b.vcname,
        b.vcorigin,
        a.iIdProduct,
        a.vcname,
        a.vcdescription,
        a.vcweight,
        a.vcquantity,
        a.decprice3,
        a.iFIdCompany,
        a.vccategories,
        a.vcphoto,
        a.istock,
        a.istocklimit
    FROM 
        products a 
    INNER JOIN 
        companies b ON a.iFIdCompany = b.iIdCompany;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetRolUserLogin`(IN `p_idUser` CHAR(36))
BEGIN
    DECLARE v_role_id CHAR(36);
    DECLARE v_cart_id CHAR(36);

    -- Validar que el usuario exista
    SELECT iFIdRole 
    INTO v_role_id
    FROM users
    WHERE iIdUser = p_idUser;

    IF v_role_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario no encontrado o sin rol asignado';
    END IF;

    -- Obtener el carrito del usuario
    SELECT iIdCart
    INTO v_cart_id
    FROM cart
    WHERE iFIdUser = p_idUser;

    IF v_cart_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario no tiene un carrito asociado';
    END IF;
	
    -- Evaluar el ID del rol directamente
    CASE v_role_id
        WHEN 'a3f8994a-64d3-11ef-b0bc-9828a641' THEN
            SELECT 'Administrador' AS Rol, 'Usuario tipo Administrador' AS Descripción;
        WHEN '542c325b-7177-11ef-a9b1-0050563b' THEN
            CALL GetProductsBySalon(v_cart_id);
        WHEN '542c2e4e-7177-11ef-a9b1-0050563b' THEN
            CALL GetDistributorsCompaniesProductsByUser(p_idUser, v_cart_id);
        WHEN '8337416f-7177-11ef-a9b1-0050563b' THEN
            CALL GetProductsByUser(v_cart_id);
        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rol no reconocido en el sistema';
    END CASE;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetSimilarProductsByCategory`(IN `p_userId` CHAR(36), IN `p_productId` CHAR(36))
BEGIN
  DECLARE vRoleId    CHAR(36) DEFAULT NULL;
  DECLARE vPriceTier INT       DEFAULT 3;  -- 1=dist, 2=salon, 3=usuario

  -- Si llega userId, obtenemos su roleId
  IF p_userId IS NOT NULL THEN
    SELECT u.iFIdRole
      INTO vRoleId
    FROM users u
    WHERE u.iIdUser = p_userId
    LIMIT 1;
  END IF;

  -- Mapeo roleId -> tier de precio (cambia por tus IDs reales)
  IF vRoleId = '542c2e4e-7177-11ef-a9b1-0050563b' THEN
    SET vPriceTier = 1;  -- distribuidor
  ELSEIF vRoleId = '542c325b-7177-11ef-a9b1-0050563b' THEN
    SET vPriceTier = 2;  -- salón
  ELSE
    SET vPriceTier = 3;  -- usuario
  END IF;

  SELECT 
      p.iIdProduct,
      p.iFIdCompany,
      p.vccategories,
      p.vcname,
      p.vcdescription,
      p.vcweight,
      p.vcquantity,
      p.vcphoto,
      CASE 
        WHEN vPriceTier = 1 THEN p.decprice1
        WHEN vPriceTier = 2 THEN p.decprice2
        ELSE p.decprice3
      END AS price,
      p.istock,
      p.istocklimit
  FROM products p
  JOIN relproductscategories rpc
    ON rpc.iFIdProduct = p.iIdProduct
  WHERE rpc.iFIdCategory IN (
          SELECT iFIdCategory
          FROM relproductscategories
          WHERE iFIdProduct = p_productId
        )
    AND p.iIdProduct <> p_productId
  ORDER BY RAND()
  LIMIT 4;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetTopDistributorsByTransactions`()
BEGIN
   SELECT 
        C.vctyperole,
        B.vcfirstname,
        B.vclastname,
        B.vcemail,
        A.iuserId, 
        COUNT(*) AS total_transactions
    FROM 
        transactions A
    INNER JOIN 
        users B ON A.iuserId = B.iIdUser
    INNER JOIN 
        roles C ON B.iFIdRole = C.iIdRole
    WHERE 
        C.vctyperole = 'Distribuidor' AND A.status = 'approved'
    GROUP BY 
        A.iuserId
    ORDER BY 
        total_transactions DESC;

END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetTopSellingCompanies`()
BEGIN
    -- Crear una tabla temporal para almacenar los productos desglosados del JSON con sus empresas
    CREATE TEMPORARY TABLE IF NOT EXISTS TempCompanySales (
        iFIdCompany INT,
        quantity INT
    );

    -- Extraer y contar los productos vendidos con la empresa correspondiente
    INSERT INTO TempCompanySales (iFIdCompany, quantity)
    SELECT 
        p.iFIdCompany,  -- ID de la empresa propietaria del producto
        CAST(JSON_UNQUOTE(JSON_EXTRACT(j.value, '$.quantity')) AS UNSIGNED) AS quantity
    FROM transactions t
    JOIN JSON_TABLE(t.products, '$[*]' COLUMNS (
        value JSON PATH '$'
    )) AS j
    JOIN products p ON JSON_UNQUOTE(JSON_EXTRACT(j.value, '$.name')) = p.vcname
    WHERE t.status = 'approved';  -- Filtra solo las transacciones aprobadas

    -- Obtener las empresas con más ventas agrupadas y ordenadas por cantidad vendida
    SELECT 
        c.iIdCompany,
        c.vcname AS company_name,
        SUM(tcs.quantity) AS total_sold
    FROM TempCompanySales tcs
    JOIN companies c ON tcs.iFIdCompany = c.iIdCompany
    GROUP BY c.iIdCompany, c.vcname
    ORDER BY total_sold DESC;

    DROP TEMPORARY TABLE IF EXISTS TempCompanySales;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetUserCashbackBalance`(IN `p_user_id` CHAR(36))
BEGIN
    -- Validar que el usuario exista
    IF EXISTS (SELECT 1 FROM users WHERE iIdUser = p_user_id) THEN
        -- Obtener el cashbackbalance
        SELECT cashbackbalance 
        FROM users
        WHERE iIdUser = p_user_id;
    ELSE
        -- Si el usuario no existe, asignar NULL al parámetro de salida
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El id de Usuario no existe en la tabla de Users.';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetUserDistributorInfo`()
BEGIN

    --  USUARIOS DE DISTRIBUIDOR --
	SELECT 
    	r.iIdRole,
        r.vctyperole as role, -- Tipo de usuario: Salón o Distribuidor
        u.iIdUser,
        u.vcusername as username,
        u.vcfirstname as nombres,
        u.vclastname as apellidos,
        u.vcemail as email,
        u.vcpassword as password,
        d.vcaddress as direccion,
        d.vcstate as estado,
        d.vccity as ciudad,
        d.vczipcode as codigoPostal,
        d.vccountry as pais,
        d.dtcreation,
        d.vccompanies, -- Mantienes el JSON original con los IDs de las empresas
        CASE 
            WHEN d.vccompanies IS NULL THEN NULL
            ELSE JSON_ARRAYAGG(comp.vcname) 
        END AS companies_names_array, -- Arreglo JSON con los nombres de las empresas
        d.vcphone as telefono,
        d.vcemail AS correo,
        d.vcrfc as rfc,
        d.vcconstfisc,
        d.vcrazonsocial as vcrazonsocial,
        d.dtcreation
    FROM users u
    INNER JOIN roles r 
        ON u.iFIdRole = r.iIdRole
    LEFT JOIN distributors d  
        ON u.iIdUser = d.iFIdUser
    LEFT JOIN JSON_TABLE(
        d.vccompanies,
        '$.Empresas[*]' COLUMNS (idEmpresa VARCHAR(255) PATH '$.idEmpresa')
    ) AS companies_json 
        ON TRUE
    LEFT JOIN companies comp 
        ON companies_json.idEmpresa = comp.iIdCompany -- Obtenemos los nombres de las empresas
    WHERE r.vctyperole = 'distribuidor'
    GROUP BY u.iIdUser 
    ORDER BY r.vctyperole ASC;
    
   
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetUserPerfilInfo`()
BEGIN
    --  USUARIOS --
    SELECT 
        r.vctyperole, 
        r.iIdRole,
        u.iIdUser,
        u.vcusername as username,
        u.vcfirstname as nombres,
        u.vclastname as apellidos,
        u.vcemail as email,
        u.vcpassword as password,
        u.dtcreation
    FROM users u
    INNER JOIN roles r 
        ON u.iFIdRole = r.iIdRole
    WHERE r.vctyperole = 'usuario'
    GROUP BY u.iIdUser;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetUserSalonInfo`()
BEGIN
	 --  USUARIOS DE SALON --
    SELECT 
        r.iIdRole,
        r.vctyperole as role, -- Tipo de usuario: Salón
        u.vcfirstname AS nombres,             
        u.vclastname AS apellidos,                
        u.vcusername AS username,                 
        u.vcemail AS email,                        
        u.vcpassword AS password,
        s.vcsalonname as nombreSalon,
        s.iIdsalon,
        s.iFIdUser,
        s.dtCreated,
        s.vcservices as serviciosOfrecidos, -- Mantienes el JSON original con los IDs de los servicios
        CASE 
            WHEN s.vcservices IS NULL THEN NULL
            ELSE JSON_ARRAYAGG(serv.vcservicename) 
        END AS serviciosOfrecidos, -- Arreglo JSON con los nombres de los servicios
        s.vcaddress as direccion,
        s.vccellphone as telefono,
        s.vcemail AS correo,
        s.dtopeningtime as horaApertura,
        s.dtdeparturtime as horaCierre,
        s.vclogo as logoSalon,
        s.dtCreated
    FROM users u
    INNER JOIN roles r 
        ON u.iFIdRole = r.iIdRole
    LEFT JOIN salons s  
        ON u.iIdUser = s.iFIdUser
    LEFT JOIN JSON_TABLE(
        s.vcservices,
        '$.Services[*]' COLUMNS (idService VARCHAR(255) PATH '$.idService')
    ) AS services_json 
        ON TRUE
    LEFT JOIN services serv 
        ON services_json.idService = serv.iIdService 
    WHERE r.vctyperole = 'salon' AND s.vcsalonname IS NOT NULL
    GROUP BY u.iIdUser
    ORDER BY r.vctyperole ASC;
    
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetUserSalonInfoDashboard`()
BEGIN
	 --  USUARIOS DE SALON --
    SELECT 
        r.iIdRole,
        r.vctyperole, -- Tipo de usuario: Salón
        u.iIdUser,
        u.vcusername,
        u.vcfirstname,
        u.vclastname,
        u.vcemail,
        u.vcpassword,
        s.vcsalonname,
        s.vcservices, -- Mantienes el JSON original con los IDs de los servicios
        CASE 
            WHEN s.vcservices IS NULL THEN NULL
            ELSE JSON_ARRAYAGG(serv.vcservicename) 
        END AS service_names_array, -- Arreglo JSON con los nombres de los servicios
        s.vcaddress,
        s.vccellphone,
        s.vcemail AS email_salon,
        s.dtopeningtime,
        s.dtdeparturtime,
        s.vclogo,
        s.dtCreated
    FROM users u
    INNER JOIN roles r 
        ON u.iFIdRole = r.iIdRole
    LEFT JOIN salons s  
        ON u.iIdUser = s.iFIdUser
    LEFT JOIN JSON_TABLE(
        s.vcservices,
        '$.Services[*]' COLUMNS (idService VARCHAR(255) PATH '$.idService')
    ) AS services_json 
        ON TRUE
    LEFT JOIN services serv 
        ON services_json.idService = serv.iIdService 
    WHERE r.vctyperole = 'salon'
    GROUP BY u.iIdUser
    ORDER BY r.vctyperole ASC;
    
   


END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `GetUserTransactionsWithShipping`(
    IN p_UserId CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
)
BEGIN
    DECLARE v_NORMAL_ROLE_ID CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
    SET v_NORMAL_ROLE_ID = '8337416f-7177-11ef-a9b1-0050563b';

    IF p_UserId IS NULL OR p_UserId = '' THEN
        SELECT 'Debe proporcionar p_UserId' AS message, 0 AS ok;
    ELSE
        SELECT
            t.iIdTransaction,
            COALESCE(NULLIF(TRIM(t.status), ''), 'error') AS status,
            t.amount,
            t.iuserId,
            t.paymentMethod,
            t.products,
            t.urltransferrecipt,

            s.vccountry  AS ship_country,
            s.vcstate    AS ship_state,
            s.vcsuburb   AS ship_suburb,
            s.vccity     AS ship_city,
            s.vczipcode  AS ship_zipcode,
            s.vcaddress  AS ship_address,
            s.vcadditonalindication AS ship_additional,

            CASE
                WHEN u.iFIdRole COLLATE utf8mb4_general_ci = v_NORMAL_ROLE_ID
                THEN COALESCE(cb.cashbackamount, 0)
                ELSE NULL
            END AS cashback_received,

            t.createdAt,
            t.updatedAt
        FROM transactions AS t
        INNER JOIN users AS u
            ON u.iIdUser COLLATE utf8mb4_general_ci = t.iuserId COLLATE utf8mb4_general_ci
        LEFT JOIN shippingaddresses AS s
            ON s.iIdAddressId COLLATE utf8mb4_general_ci = t.ishippingaddressId COLLATE utf8mb4_general_ci
        LEFT JOIN cashback AS cb
            ON cb.FiIdUser COLLATE utf8mb4_general_ci = t.iuserId COLLATE utf8mb4_general_ci
           AND cb.FiIdTransaction = t.iIdTransaction
        WHERE
            t.iuserId COLLATE utf8mb4_general_ci = p_UserId
            AND COALESCE(NULLIF(TRIM(t.status), ''), 'error') IN ('pending','approved','error')
        ORDER BY t.createdAt DESC;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `ProductCategoriesInsert`(IN `piFIdCompany` CHAR(36), IN `pvccategories` JSON, IN `pvcname` VARCHAR(128), IN `pvcdescription` VARCHAR(256), IN `pvcweight` VARCHAR(128), IN `pvcquantity` VARCHAR(128), IN `pvcphoto` VARCHAR(256), IN `pdecprice1` DECIMAL(8,2), IN `pdecprice2` DECIMAL(8,2), IN `pdecprice3` DECIMAL(8,2), IN `pistock` INT, IN `pistocklimit` INT)
BEGIN
    DECLARE vcGeneratedUUID CHAR(36);
    DECLARE insertProductSuccess INT DEFAULT 0;
    DECLARE insertCategorySuccess INT DEFAULT 0;
    
    SET vcGeneratedUUID = UUID();

    -- Inserta el nuevo producto en la tabla products
    INSERT INTO products 
    (
        iIdProduct,
        iFIdCompany,
        vccategories,
        vcname,
        vcdescription,
        vcweight,
        vcquantity,
        vcphoto,
        decprice1,
        decprice2,
        decprice3,
        istock,
        istocklimit
    )
    VALUES 
    (
        vcGeneratedUUID,
        piFIdCompany,
        pvccategories,
        pvcname,
        pvcdescription,
        pvcweight,
        pvcquantity,
        pvcphoto,
        pdecprice1,
        pdecprice2,
        pdecprice3,
        pistock,
        pistocklimit
    );

    -- Verificar si la inserción fue exitosa
    SET insertProductSuccess = ROW_COUNT();

    -- Insertar las relaciones producto-categoría 
    INSERT INTO relproductscategories(iFIdProduct, iFIdCategory)
    SELECT 
        vcGeneratedUUID, 
        jt.idCategoria
    FROM 
        JSON_TABLE(
            pvccategories,
            '$.Categorias[*]' 
            COLUMNS (
                idCategoria VARCHAR(50) PATH '$.idCategoria'
            )
        ) AS jt;

    -- Verificar si la inserción de categorías fue exitosa
    SET insertCategorySuccess = ROW_COUNT();

    IF insertProductSuccess > 0 THEN
    IF insertCategorySuccess > 0 THEN
        SELECT JSON_OBJECT('insertado', '0', 'mensaje', 'Producto y categorías insertados') AS insertado;
    ELSE
        SELECT JSON_OBJECT('insertado', '0', 'mensaje', 'Producto insertado sin categorías') AS insertado;
    END IF;
ELSE
    SELECT JSON_OBJECT('insertado', '1', 'mensaje', 'Error al insertar producto') AS insertado;
END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `ProductCategoriesUpdate`(IN `piIdProduct` CHAR(36), IN `piFIdCompany` CHAR(36), IN `pvccategories` JSON, IN `pvcname` VARCHAR(128), IN `pvcdescription` VARCHAR(256), IN `pvcweight` VARCHAR(128), IN `pvcquantity` VARCHAR(128), IN `pvcphoto` VARCHAR(256), IN `pdecprice1` DECIMAL(8,2), IN `pdecprice2` DECIMAL(8,2), IN `pdecprice3` DECIMAL(8,2), IN `pistock` INT, IN `pistocklimit` INT)
BEGIN

	DECLARE UpdateProductSuccess INT DEFAULT 0;
	-- Actualiza el producto en la tabla products
    UPDATE products
    SET 
        iFIdCompany   = piFIdCompany,
        vccategories  = pvccategories,
        vcname        = pvcname,
        vcdescription = pvcdescription,
        vcweight      = pvcweight,
        vcquantity    = pvcquantity,
        vcphoto       = pvcphoto,
        decprice1     = pdecprice1,
        decprice2     = pdecprice2,
        decprice3     = pdecprice3,
        istock        = pistock,
        istocklimit   = pistocklimit,
        dtupdate	  = NOW()
    WHERE iIdProduct  = piIdProduct;
    
    SET UpdateProductSuccess = ROW_COUNT();
    
    IF UpdateProductSuccess > 0 THEN
        SELECT JSON_OBJECT('Actualizado', '0') AS Actualizado;
    ELSE
        SELECT JSON_OBJECT('Actualizado', '1') AS Actualizado;
    END IF;
  
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `ResetCredits`()
BEGIN
    -- Actualiza los créditos pagados completamente
    UPDATE credits
    SET payamount = 0, state = 0, totalpayamount = 0,dtUpdate = NOW()
    WHERE state = 1 AND totalpayamount = payamount;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `SalonsServicesInsert`(IN `p_iFIdUser` CHAR(36), IN `p_vcsalonName` VARCHAR(128), IN `p_vccellphone` VARCHAR(16), IN `p_vcemail` VARCHAR(128), IN `p_vcsalonAddress` VARCHAR(128), IN `p_dtopeningtime` TIME, IN `p_dtdeparturtime` TIME, IN `p_vcservices` JSON, IN `p_vclogo` TEXT, OUT `p_outStatus` INT)
BEGIN
    DECLARE vcGeneratedUUID CHAR(36);
    DECLARE insertSalonSuccess INT DEFAULT 0;
    DECLARE insertServicesSuccess INT DEFAULT 0;

    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Si ocurre un error, revertimos la transacción
        ROLLBACK;
        SET p_outStatus = 1; -- Error
    END;

    -- Iniciar la transacción
    START TRANSACTION;

    -- Generar un nuevo UUID
    SET vcGeneratedUUID = UUID();

    -- Verificar la unicidad del UUID
    WHILE EXISTS (SELECT 1 FROM salons WHERE iIdsalon = vcGeneratedUUID) DO
        SET vcGeneratedUUID = UUID(); -- Generar otro UUID
    END WHILE;

    -- Inserta el nuevo salón en la tabla salons
    INSERT INTO salons 
    (
        iIdsalon,
        iFIdUser,
        vcsalonname,
        vccellphone,
        vcemail,
        vcaddress,
        dtopeningtime,
        dtdeparturtime,
        vcservices,
        vclogo,
        dtcreated
    )
    VALUES 
    (
        vcGeneratedUUID,
        p_iFIdUser,
        p_vcsalonName,
        p_vccellphone,
        p_vcemail,
        p_vcsalonAddress,
        p_dtopeningtime,
        p_dtdeparturtime,
        p_vcservices,
        p_vclogo,
        NOW()
    );

    -- Verificar si la inserción fue exitosa
    SET insertSalonSuccess = ROW_COUNT();

    -- Insertar las relaciones salón-servicio 
    INSERT INTO relsalonservices(vcFSalonId, vcFServiceId)
    SELECT 
        vcGeneratedUUID, 
        jt.idService
    FROM 
        JSON_TABLE(
            p_vcservices,
            '$.Services[*]' 
            COLUMNS (
                idService VARCHAR(50) PATH '$.idService'
            )
        ) AS jt;

    -- Verificar si la inserción de servicios fue exitosa
    SET insertServicesSuccess = ROW_COUNT();

    -- Confirmar o revertir transacción
    IF insertSalonSuccess > 0 AND insertServicesSuccess > 0 THEN
        COMMIT;
        SET p_outStatus = 0; -- Todo salió bien
    ELSE
        ROLLBACK;
        SET p_outStatus = 1; -- Algo salió mal
    END IF;

END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `SalonsServicesUpdate`(IN `p_iFIdUser` CHAR(36), IN `p_vcsalonName` VARCHAR(128), IN `p_vccellphone` VARCHAR(16), IN `p_vcemail` VARCHAR(128), IN `p_vcsalonAddress` VARCHAR(128), IN `p_dtopeningtime` TIME, IN `p_dtdeparturtime` TIME, IN `p_vcservices` JSON, IN `p_vclogo` TEXT, IN `p_generateNewId` BOOLEAN, OUT `p_outStatus` INT)
BEGIN
    DECLARE updateSalonSuccess      INT DEFAULT 0;
    DECLARE updateServicesSuccess   INT DEFAULT 0;
    DECLARE v_SalonId               CHAR(36);
    DECLARE v_NewSalonId            CHAR(36); -- Guarda el ID si el parametro p_generateNewId = 1.
    DECLARE salonExists             INT DEFAULT 0;

    -- Asegurarse de que el parámetro p_vcservices sea un JSON válido o esté vacío
    IF p_vcservices IS NULL OR p_vcservices = '' THEN
        SET p_vcservices = '{"Services": []}';
    END IF;

    -- Verifica si el salón ya existe para el usuario
    SELECT COUNT(1)
    INTO salonExists
    FROM salons
    WHERE iFIdUser = p_iFIdUser;

    -- Si no existe un salón para el usuario o se solicita generar un nuevo ID
    IF salonExists = 0 OR p_generateNewId = 1 THEN
        -- Generar un nuevo UUID para el salón
        SET v_NewSalonId = UUID();
        -- Validar que no haya un UUID duplicado en la tabla salons
        WHILE EXISTS (SELECT 1 FROM salons WHERE iIdsalon = v_NewSalonId) DO
            SET v_NewSalonId = UUID(); -- Generar otro UUID si hay duplicado
        END WHILE;

        -- Insertar el nuevo salón en la tabla `salons`
        INSERT INTO salons (
            iIdsalon, 
            iFIdUser, 
            vcsalonname, 
            vccellphone, 
            vcemail, 
            vcaddress, 
            dtopeningtime, 
            dtdeparturtime, 
            vcservices, 
            vclogo, 
            dtcreated, 
            dtupdate
        ) VALUES (
            v_NewSalonId,
            p_iFIdUser,
            p_vcsalonName,
            p_vccellphone,
            p_vcemail,
            p_vcsalonAddress,
            p_dtopeningtime,
            p_dtdeparturtime,
            p_vcservices,
            p_vclogo,
            NOW(),
            NOW()
        );

        -- Asignar el nuevo ID del salón para usarlo en las relaciones
        SET v_SalonId = v_NewSalonId;

        -- Marca como exitosa la creación del nuevo salón
        SET updateSalonSuccess = ROW_COUNT();
    ELSE
        -- Obtén el ID del salón existente
        SELECT iIdsalon 
        INTO v_SalonId
        FROM salons
        WHERE iFIdUser = p_iFIdUser;

        -- Actualiza la información de la tabla `salons`
        UPDATE salons
        SET
            vcsalonname    = p_vcsalonName,
            vccellphone    = p_vccellphone,
            vcemail        = p_vcemail,
            vcaddress      = p_vcsalonAddress,
            dtopeningtime  = p_dtopeningtime,
            dtdeparturtime = p_dtdeparturtime,
            vcservices     = p_vcservices,
            vclogo         = p_vclogo,
            dtupdate       = NOW()  
        WHERE iIdsalon = v_SalonId;

        -- Verifica si la actualización del salón fue exitosa
        SET updateSalonSuccess = ROW_COUNT();
    END IF;

    -- Elimina las relaciones de salón-servicio existentes y agrega las nuevas
    DELETE FROM relsalonservices WHERE vcFSalonId = v_SalonId;

    -- Inserta las nuevas relaciones salón-servicio
    INSERT INTO relsalonservices(vcFSalonId, vcFServiceId)
    SELECT 
        v_SalonId, 
        jt.idService
    FROM 
        JSON_TABLE(
            p_vcservices,
            '$.Services[*]' 
            COLUMNS (
                idService VARCHAR(50) PATH '$.idService'
            )
        ) AS jt;

    -- Verifica si la inserción de servicios fue exitosa
    SET updateServicesSuccess = ROW_COUNT();

    -- Confirma el estado de la operación
    IF updateSalonSuccess > 0 AND updateServicesSuccess >= 0 THEN
        SET p_outStatus = 0; -- Todo salió bien
    ELSE
        SET p_outStatus = 1; -- Algo salió mal
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `UserDelete`(IN `p_UserId` CHAR(36))
BEGIN
    DECLARE v_vcRole VARCHAR(64);
    DECLARE v_RolId CHAR(36);
    DECLARE v_SalonId CHAR(36);
    DECLARE v_DistribuidorId CHAR(36);
    DECLARE deleteStatus INT DEFAULT 0;

    -- Selecciona el Rol Id
    SELECT 
    	a.iFIdRole 
    INTO v_RolId 
    FROM users a 
    WHERE a.iIdUser = p_UserId;

    -- Busca que tipo de rol es
    SELECT 
    	b.vctyperole 
    INTO v_vcRole 
    FROM roles b 
    WHERE b.iIdRole = v_RolId;

    IF v_vcRole = 'Salón' THEN
        -- Busca el id del salon
        SELECT 
        	a.iIdsalon 
        INTO v_SalonId 
        FROM salons a 
        WHERE a.iFIdUser = p_UserId;

        -- Elimina todas las relaciones con el id del salon
        DELETE FROM relsalonservices WHERE vcFSalonId = v_SalonId;

        -- Elimina el salon
        DELETE FROM salons WHERE iIdsalon = v_SalonId;

    ELSEIF v_vcRole = 'Distribuidor' THEN
        -- Busca el Id del distribuidor
        SELECT 
        	a.iIdistributor 
        INTO v_DistribuidorId 
        FROM distributors a 
        WHERE a.iFIdUser = p_UserId;

        -- Elimina todas las relaciones con el id del distribuidor
        DELETE FROM reldistributorscompanies WHERE iFIdDistributor = v_DistribuidorId;

        -- Elimina el distribuidor
        DELETE FROM distributors WHERE iIdistributor = v_DistribuidorId;
    END IF;
    
    -- Elimina el carrito
    DELETE FROM cart WHERE iFIdUser = p_UserId;

    -- Elimina al usuario
    DELETE FROM users WHERE iIdUser = p_UserId;
    SET deleteStatus = ROW_COUNT(); 
    
    
    IF deleteStatus > 0 THEN
        SELECT JSON_OBJECT('Listo', '0') AS resultado; -- Todo salió bien
    ELSE
        SELECT JSON_OBJECT('Error', '1') AS resultado; -- Algo salió mal
    END IF;

END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `UserInsert`(IN `p_vcRole` VARCHAR(32), IN `p_vcfirstname` VARCHAR(128), IN `p_vclastname` VARCHAR(16), IN `p_vcusername` VARCHAR(128), IN `p_vcpassword` VARCHAR(128), IN `p_vcemail` VARCHAR(128), IN `p_vcdistributorData` JSON, IN `p_vcsalonData` JSON)
BEGIN
    DECLARE vcGeneratedUUID 			CHAR(36);
    DECLARE vcGeneratedUUIDCart 		CHAR(36);
    DECLARE vcGeneratedUUIDSalon 		CHAR(36);
    DECLARE vcGeneratedUUIDDistributor 	CHAR(36);
    DECLARE vcGeneratedUUIDCredit	 	CHAR(36);
    DECLARE vcIdRole 					CHAR(36);
    DECLARE salonServicesExecuted 		INT DEFAULT 0;
    DECLARE distributorInsertExecuted 	INT DEFAULT 0;
    DECLARE insertUserSuccess 			INT DEFAULT 0;
    DECLARE insertCarSuccess  			INT DEFAULT 0;
    -- Validar que se Ejecutaron Correcto los SP's
    DECLARE salonInsertStatus 			INT DEFAULT 0;  -- Estado de inserción de salón
    DECLARE distributorInsertStatus 	INT DEFAULT 0;  -- Estado de inserción de distribuidor

    SELECT iIdRole 
    INTO vcIdRole
    FROM roles
    WHERE vctyperole = COALESCE(p_vcRole, 'Usuario');
       
    SET vcGeneratedUUID = UUID();
    SET vcGeneratedUUIDCart = UUID();
    SET vcGeneratedUUIDSalon = UUID();
    SET vcGeneratedUUIDDistributor = UUID();
    SET vcGeneratedUUIDCredit = UUID();
    
    -- Validar que no haya un UUID duplicado en la tabla users
    WHILE EXISTS (SELECT 1 FROM users WHERE iIdUser = vcGeneratedUUID) DO
        SET vcGeneratedUUID = UUID(); -- Generar otro UUID si hay duplicado
    END WHILE;
    
     -- Validar que no haya un UUID duplicado en la tabla cart
    WHILE EXISTS (SELECT 1 FROM cart WHERE iIdCart = vcGeneratedUUIDCart) DO
        SET vcGeneratedUUIDCart = UUID(); -- Generar otro UUID si hay duplicado
    END WHILE;
    
    -- Validar que no haya un UUID duplicado en la tabla salons
    WHILE EXISTS (SELECT 1 FROM salons WHERE iIdsalon = vcGeneratedUUIDSalon) DO
        SET vcGeneratedUUIDSalon = UUID(); -- Generar otro UUID si hay duplicado en salons
    END WHILE;
    
     -- Validar que no haya un UUID duplicado en la tabla distributors
    WHILE EXISTS (SELECT 1 FROM distributors WHERE iIdistributor = vcGeneratedUUIDDistributor) DO
        SET vcGeneratedUUIDDistributor = UUID(); -- Generar otro UUID si hay duplicado en salons
    END WHILE;
    
     -- Validar que no haya un UUID duplicado en la tabla credits
    WHILE EXISTS (SELECT 1 FROM credits WHERE iIdCredits = vcGeneratedUUIDCredit) DO
        SET vcGeneratedUUIDCredit = UUID(); -- Generar otro UUID si hay duplicado en salons
    END WHILE;
  
    -- Insertar el usuario en la tabla users
    INSERT INTO users(
        iIdUser,
        iFIdRole,
        vcfirstname,
        vclastname,
        vcusername,
        vcpassword,
        vcemail,
        dtcreation       
    )
    VALUES (
        vcGeneratedUUID,
        vcIdRole,
        p_vcfirstname,
        p_vclastname,
        p_vcusername,
        p_vcpassword,
        p_vcemail,
        NOW()  	
    );
  
    -- Verificar si la inserción fue exitosa
    SET insertUserSuccess = ROW_COUNT();
    
    
     -- Relaciona el usuario con su carrito
    INSERT INTO cart(
        iIdCart,
        iFIdUser,
        dtCreated     
    )
    VALUES (
        vcGeneratedUUIDCart,
        vcGeneratedUUID,
        NOW()  	
    );
  
    -- Verificar si la inserción fue exitosa
    SET insertCarSuccess = ROW_COUNT();
        
    -- Relacionar la tabla Credit con Usuario, solo sí es distribuidor 
    IF p_vcRole = 'Distribuidor' THEN 
    	-- Crear la relación en la tabla de Credits 
        -- Agregarle los $20,000 
        -- state = 0 
        -- 
        INSERT INTO credits(
            iIdCredits,
            iFIdUser,
            totalamount,
            payamount,
            state,
        	dtcreation)
        VALUES ( 
            vcGeneratedUUIDCredit,
            vcGeneratedUUID,
            20000,
            0,
            0,
        	NOW());
    
    END IF; 
           
    IF p_vcRole = 'Salón' AND (
        JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.nombreSalon')) = '' OR
        JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.telefono')) = '' OR
        JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.correo')) = '' OR
        JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.direccion')) = '' OR
        JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.horaApertura')) = '' OR
        JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.horaCierre')) = '' OR
        JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.serviciosOfrecidos')) = '' OR
        JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.logo')) = ''
    ) THEN
        INSERT INTO salons (
            iIdsalon,
            iFIdUser, 
            vcsalonname,
            vccellphone,
            vcemail,
            vcaddress,
            dtopeningtime, 
            dtdeparturtime,
            vcservices,
            vclogo
        )
        VALUES (
            vcGeneratedUUIDSalon, -- iIdsalon
            vcGeneratedUUID,      -- iFIdUser
            IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.nombreSalon')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.nombreSalon'))), -- vcsalonname
            IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.telefono')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.telefono'))), -- vccellphone
            IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.correo')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.correo'))), -- vcemail
            IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.direccion')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.direccion'))), -- vcaddress
            IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.horaApertura')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.horaApertura'))), -- dtopeningtime
            IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.horaCierre')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.horaCierre'))), -- dtdeparturtime
            IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.serviciosOfrecidos')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.serviciosOfrecidos'))), -- vcservices
            IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.logo')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.logo'))) -- vclogo
        );
        SET salonInsertStatus = ROW_COUNT();
    ELSEIF p_vcRole = 'Distribuidor' AND JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.empresasRelacionadas')) IS NULL THEN 
    	INSERT INTO distributors (
            iIdistributor,
            iFIdUser, 
            vccompanies,
            vcaddress,
            vcstate,
            vccity,
            vczipcode, 
            vccountry,
            vcphone,
            vcemail,
            vcrfc,
            vcconstfisc,
            vcrazonsocial
        )
        VALUES (
            vcGeneratedUUIDDistributor, -- iIdistributor
            vcGeneratedUUID,   -- iFIdUser
            IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.empresasRelacionadas')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.empresasRelacionadas'))), -- vccompanies
        IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.direccion')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.direccion'))), -- vcaddress
        IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.estado')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.estado'))), -- vcstate
        IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.ciudad')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.ciudad'))), -- vccity
        IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.codigoPostal')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.codigoPostal'))), -- vczipcode
        IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.pais')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.pais'))), -- vccountry
        IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.telefono')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.telefono'))), -- vcphone
        IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.correo')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.correo'))), -- vcemail
        IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.rfc')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.rfc'))), -- vcrfc
        IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.constanciaFiscal')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.constanciaFiscal'))), -- vcconstfisc
        IF(JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.vcrazonsocial')) = '', NULL, JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.vcrazonsocial')))-- vcrazonsocial
        );
    
    	SET distributorInsertStatus = ROW_COUNT();
    END IF;
    
    
    -- Procedimientos a ejecutar según el rol
    IF p_vcRole = 'Salón' AND p_vcsalonData IS NOT NULL AND JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.nombreSalon')) IS NOT NULL THEN        
        CALL SalonsServicesInsert(
            vcGeneratedUUID,                                 	   			  -- p_iFIdUser
            JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.nombreSalon')),  	  -- p_vcsalonsname
            JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.telefono')),    	  -- p_vccellphone
            JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.correo')),       	  -- p_vcemail
            JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.direccion')), 		  -- p_vcsalonAddress
            JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.horaApertura')), 	  -- p_dtopeningtime
            JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.horaCierre')), 		  -- p_dtdeparturtime
            JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.serviciosOfrecidos')), -- p_vcservices
            JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.logo')), 			   -- p_vclogo
            salonServicesExecuted  -- Capturamos el estado de inserción del salón
        );
    ELSEIF p_vcRole = 'Distribuidor' AND p_vcdistributorData IS NOT NULL AND JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.empresasRelacionadas')) IS NOT NULL THEN  
        CALL DistributorCompaniesInsert(
            vcGeneratedUUID,                                 	     				   	-- iFIdUser
            JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.empresasRelacionadas')), 	-- pvccompanies
            JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.direccion')),    		   	-- pvcaddress
            JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.estado')),       		   	-- pvcstate
            JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.ciudad')),  	   	 	   	-- pvccity
            JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.codigoPostal')),			-- pvcpostalcode
            JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.pais')), 		 			-- pvccountry
            JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.telefono')),				-- pvcphone
            JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.correo')), 				-- pvcemail
            JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.rfc')),					-- pvcrfc
            JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.constanciaFiscal')), 		-- pvcconsfis
            JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.vcrazonsocial')), 		-- pvcrazonsocial
            distributorInsertExecuted  -- Capturamos el estado de inserción del distribuidor
        );
    ELSE
        SET insertUserSuccess = 1; 
    END IF;

    
    -- Lógica final para indicar éxito o error    
    IF insertUserSuccess > 0  
        AND (
            (p_vcRole = 'Salón' AND (salonInsertStatus > 0 OR salonServicesExecuted = 0) AND insertCarSuccess > 0) 
            OR 
            (p_vcRole = 'Distribuidor' AND (distributorInsertStatus > 0 OR distributorInsertExecuted = 0) AND insertCarSuccess > 0)
            OR 
            (p_vcRole = 'Usuario' AND insertUserSuccess > 0 AND insertCarSuccess > 0) 
        ) THEN
        SELECT JSON_OBJECT('insertado', '0') AS insertado; -- Todo salió bien
    ELSE
        SELECT JSON_OBJECT('insertado', '1') AS insertado; -- Algo salió mal
    END IF;



END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `UserUpdate`(IN `p_UserId` CHAR(36), IN `p_RolId` CHAR(36), IN `p_vcfirstname` VARCHAR(128), IN `p_vclastname` VARCHAR(128), IN `p_vcusername` VARCHAR(128), IN `p_vcpassword` VARCHAR(128), IN `p_vcemail` VARCHAR(128), IN `p_vcdistributorData` JSON, IN `p_vcsalonData` JSON)
BEGIN
    DECLARE v_vcCurrentRole 			 VARCHAR(64);
    DECLARE v_vcNewRole 				 VARCHAR(64);
    DECLARE v_CurrentRolId 				 CHAR(36);
    DECLARE v_SalonId 					 CHAR(36);
    DECLARE v_DistribuidorId 			 CHAR(36);
    DECLARE deleteStatus 				 INT DEFAULT 0;
    DECLARE salonServicesExecuted 		 INT DEFAULT 0;
    DECLARE distributorCompaniesExecuted INT DEFAULT 0;
    DECLARE UpdateUser 					 INT DEFAULT 0;
    DECLARE PassNotNull					 BOOLEAN;
    
    SET PassNotNull = 0;
    
    IF p_vcpassword IS NULL OR p_vcpassword = '' THEN 
    	SET PassNotNull = 1;
    END IF;
    
    -- Obtiene el Id del Rol actual del Usuario
    SELECT a.iFIdRole 
    	INTO v_CurrentRolId 
    FROM users a 
    WHERE a.iIdUser = p_UserId
    LIMIT 1;
    
    -- Obtiene el nombre del rol del usuario actual en base al Id del Rol actual
    SELECT b.vctyperole 
    	INTO v_vcCurrentRole 
    FROM roles b 
    WHERE b.iIdRole = v_CurrentRolId
    LIMIT 1;
    
    -- Obtiene el nombre del rol nuevo
    SELECT b.vctyperole 
    	INTO v_vcNewRole 
    FROM roles b 
    WHERE b.iIdRole = p_RolId
    LIMIT 1;

    IF v_vcNewRole IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El Rol que quieres asignar no existe.';
    END IF;
    
    -- Valida que sea el mismo rol
    IF v_CurrentRolId = p_RolId THEN
        -- SELECT JSON_OBJECT('IGUAL ROL', v_vcNewRole) AS resultado;
        
        -- Verifica si el nombre de usuario debe actualizarse
        IF p_vcusername != (SELECT vcusername FROM users WHERE iIdUser = p_UserId  LIMIT 1) THEN
            -- Verifica si el nuevo nombre de usuario ya existe en la tabla
            IF EXISTS (
                SELECT 1
                FROM users
                WHERE vcUsername = p_vcusername
                LIMIT 1
            ) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El nombre de usuario ya existe.';
            ELSE
                -- Si el nombre de usuario es válido, actualiza
                UPDATE users
                SET
                    vcFirstname = p_vcfirstname,
                    vcLastname  = p_vclastname,
                    vcUsername  = p_vcusername,
                    vcPassword  = CASE 
                                     WHEN PassNotNull = 0 THEN p_vcpassword 
                                     ELSE vcPassword 
                                  END
                WHERE iIdUser = p_UserId;
            END IF;
        ELSE
            -- Si el nombre de usuario no cambia, solo actualiza los otros campos
            UPDATE users
            SET
                vcFirstname = p_vcfirstname,
                vcLastname  = p_vclastname,
                vcPassword  = CASE 
                                 WHEN PassNotNull = 0 THEN p_vcpassword 
                                 ELSE vcPassword 
                              END
            WHERE iIdUser = p_UserId;
        END IF;

        
        -- Verifica si el correo de usuario debe actualizarse
        IF p_vcemail != (SELECT vcemail FROM users WHERE iIdUser = p_UserId  LIMIT 1) THEN
            -- Verifica si el nuevo correo ya existe en la tabla
            IF EXISTS (
                SELECT 1
                FROM users
                WHERE vcemail = p_vcemail
                 LIMIT 1
            ) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El correo ya esta relacionado con un usuario existente.';
            ELSE
                -- Si el correo no existe, lo actualiza
                UPDATE users
                SET vcEmail = p_vcemail
                WHERE iIdUser = p_UserId;
            END IF;
        END IF;
             
        -- Lógica de ejecución para Distribuidor o Salón
        IF v_vcCurrentRole = 'Distribuidor' THEN
            CALL DistributorCompaniesUpdate(
                p_UserId, 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.empresasRelacionadas')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.direccion')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.estado')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.ciudad')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.codigoPostal')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.pais')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.telefono')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.correo')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.rfc')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.constanciaFiscal')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.vcrazonsocial')), 
                0, 
                distributorCompaniesExecuted 
            );
            
            IF distributorCompaniesExecuted = 1 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Al actualizar en SP DistributorCompaniesUpdate.';
            END IF;
            
        ELSEIF v_vcCurrentRole = 'Salón' THEN
            CALL SalonsServicesUpdate(
                p_UserId, 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.nombreSalon')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.telefono')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.correo')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.direccion')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.horaApertura')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.horaCierre')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.serviciosOfrecidos')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.logo')), 
                0, 
                salonServicesExecuted 
            );
            
            IF salonServicesExecuted = 1 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Al actualizar en SP salonServicesExecuted.';
            END IF;
            
            
        END IF;
        
    ELSEIF v_CurrentRolId <> p_RolId THEN
    	
        -- Cambio de rol, elimina las relaciones anteriores
        IF v_vcCurrentRole = 'Salón' THEN
            -- SELECT JSON_OBJECT('Diferente Rol, Borra Salón', v_vcCurrentRole ) AS resultado;
            
            SELECT a.iIdsalon
            	INTO v_SalonId 
            FROM salons a 
            WHERE a.iFIdUser = p_UserId
            LIMIT 1;
            
            DELETE FROM relsalonservices WHERE vcFSalonId = v_SalonId;
            DELETE FROM salons WHERE iIdsalon = v_SalonId;
                       
        ELSEIF v_vcCurrentRole = 'Distribuidor' THEN
            SELECT a.iIdistributor 
            	INTO v_DistribuidorId 
            FROM distributors a 
            WHERE a.iFIdUser = p_UserId
            LIMIT 1;
            
            DELETE FROM reldistributorscompanies WHERE iFIdDistributor = v_DistribuidorId;
            
            DELETE FROM distributors WHERE iIdistributor = v_DistribuidorId;
            
            DELETE FROM credits WHERE iFidUser = p_UserId;
        END IF;
        
        -- SELECT JSON_OBJECT('AntesDeEntrarAlIF v_vcNewRole' , v_vcNewRole ) AS resultado;
        -- Realiza la inserción del nuevo rol
        IF v_vcNewRole = 'Salón' THEN
            CALL SalonsServicesUpdate(
                p_UserId, 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.nombreSalon')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.telefono')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.correo')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.direccion')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.horaApertura')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.horaCierre')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.serviciosOfrecidos')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcsalonData, '$.logo')), 
                1, 
                salonServicesExecuted 
            );
            IF salonServicesExecuted = 1 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Al actualizar en SP salonServicesExecuted.';
            END IF;
        ELSEIF v_vcNewRole = 'Distribuidor' THEN
          -- SELECT JSON_OBJECT('SP Distribuidor v_vcNewRole' , v_vcNewRole ) AS resultado;

            CALL DistributorCompaniesUpdate(
                p_UserId, 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.empresasRelacionadas')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.direccion')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.estado')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.ciudad')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.codigoPostal')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.pais')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.telefono')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.correo')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.rfc')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.constanciaFiscal')), 
                JSON_UNQUOTE(JSON_EXTRACT(p_vcdistributorData, '$.vcrazonsocial')), 
                1, 
                distributorCompaniesExecuted 
            );
            
            IF distributorCompaniesExecuted = 1 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Al actualizar en SP distributorCompaniesExecuted.';
            END IF;
        END IF;
         

        -- Realiza el cambio de rol en la tabla users
        -- Verifica si el nombre de usuario debe actualizarse
        IF p_vcusername != (SELECT vcusername FROM users WHERE iIdUser = p_UserId  LIMIT 1) THEN
            -- Verifica si el nuevo nombre de usuario ya existe en la tabla
            IF EXISTS (
                SELECT 1
                FROM users
                WHERE vcUsername = p_vcusername
                LIMIT 1
            ) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El nombre de usuario ya existe.';
            ELSE
                -- Si el nombre de usuario es válido, actualiza
                UPDATE users
                SET
                	iFIdRole 	= p_RolId,
                    vcFirstname = p_vcfirstname,
                    vcLastname  = p_vclastname,
                    vcUsername  = p_vcusername,
                    vcPassword  = CASE 
                                     WHEN PassNotNull = 0 THEN p_vcpassword 
                                     ELSE vcPassword 
                                  END
                WHERE iIdUser = p_UserId;
            END IF;
        ELSE
            -- Si el nombre de usuario no cambia, solo actualiza los otros campos
            UPDATE users
            SET
            	iFIdRole 	= p_RolId,
                vcFirstname = p_vcfirstname,
                vcLastname  = p_vclastname,
                vcPassword  = CASE 
                                 WHEN PassNotNull = 0 THEN p_vcpassword 
                                 ELSE vcPassword 
                              END
            WHERE iIdUser = p_UserId;
        END IF;

        
        -- Verifica si el correo de usuario debe actualizarse
        IF p_vcemail != (SELECT vcemail FROM users WHERE iIdUser = p_UserId  LIMIT 1) THEN
            -- Verifica si el nuevo correo ya existe en la tabla
            IF EXISTS (
                SELECT 1
                FROM users
                WHERE vcemail = p_vcemail
                 LIMIT 1
            ) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El correo ya esta relacionado con un usuario existente.';
            ELSE
                -- Si el correo no existe, lo actualiza
                UPDATE users
                SET vcEmail = p_vcemail
                WHERE iIdUser = p_UserId;
            END IF;
        END IF;
        
        
       
    END IF;
    
    SELECT JSON_OBJECT('Actualizado', '0') AS resultado;
  
   	
END$$
DELIMITER ;
