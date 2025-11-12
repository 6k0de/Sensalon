import axios from "axios";

//const BASE_URL_PROD = 'https://api.sensalon.com.mx';
//const BASE_URL_PREPROD = 'https://test-api.sensalon.com.mx'
const BASE_URL_DEV = 'http://localhost:3000'; //


export const api = axios.create({
  baseURL: `${BASE_URL_DEV}/api`,
  timeout: 5000,
})

export const payment = axios.create({
  baseURL: `${BASE_URL_DEV}/payments`,
  timeout: 5000,
})

export const filesClient = axios.create({
  baseURL: `${BASE_URL_DEV}/imagenes`, // ejemplo para imágenes
  timeout: 5000,
});

export const recipt = axios.create({
  baseURL: `${BASE_URL_DEV}/assets/comprobantetransf`,
  timeout: 5000,
});