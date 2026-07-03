import axios from "axios";

/*  export const BASE_URL_PROD = 'https://api.sensalon.com.mx';
export const BASE_URL_IMAGE_PROD = 'https://api.sensalon.com.mx/imagenes';
export const BASE_URL_FILES_PROD = 'https://api.sensalon.com.mx/api'  */

/* export const BASE_URL_PREPROD = 'https://test-api.sensalon.com.mx'
export const BASE_URL_IMAGE_PREPROD = 'https://test-api.sensalon.com.mx/imagenes'
export const BASE_URL_FILES_PREPROD = 'https://test-api.sensalon.com.mx/api' */

// DEV (activo) — se mantienen los nombres _PROD porque se importan por nombre en otros archivos
export const BASE_URL_PROD = 'http://localhost:3000';
export const BASE_URL_IMAGE_PROD = 'http://localhost:3000/imagenes';
export const BASE_URL_FILES_PROD = 'http://localhost:3000/api';

export const api = axios.create({
    baseURL: `${BASE_URL_PROD}/api`,
    timeout: 5000,
})

export const payment = axios.create({
    baseURL: `${BASE_URL_PROD}/payments`,
    timeout: 5000,
})

export const paymentClient = axios.create({
  baseURL: `${BASE_URL_PROD}/payments`,
  timeout: 5000,
});

export const filesClient = axios.create({
  baseURL: `${BASE_URL_IMAGE_PROD}`, // ejemplo para imágenes
  timeout: 5000,
});

export const recipt = axios.create({
  baseURL: `${BASE_URL_PROD}/assets/comprobantetransf`,
  timeout: 5000,
});
