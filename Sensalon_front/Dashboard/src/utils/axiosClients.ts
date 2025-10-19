import axios from "axios";

export const BASE_URL = 'https://test-api.sensalon.com.mx'; //http://localhost:3000
export const BASE_URL_IMAGE = 'https://test-api.sensalon.com.mx/imagenes'; //http://localhost:3000/imagenes
export const BASE_URL_FILES = 'https://test-api.sensalon.com.mx/api'; //http://localhost:3000/api


export const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    timeout: 5000,
})

export const payment = axios.create({
    baseURL: `${BASE_URL}/payments`,
    timeout: 5000,
})

export const paymentClient = axios.create({
  baseURL: `${BASE_URL}/payments`,
  timeout: 5000,
});

export const filesClient = axios.create({
  baseURL: `${BASE_URL}/imagenes`, // ejemplo para imágenes
  timeout: 5000,
});

export const recipt = axios.create({
  baseURL: `${BASE_URL}/assets/comprobantetransf`,
  timeout: 5000,
});