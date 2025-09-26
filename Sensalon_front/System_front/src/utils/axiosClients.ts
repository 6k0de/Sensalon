import axios from "axios";

const BASE_URL = 'http://localhost:3000';

export const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    timeout: 5000,
})

export const payment = axios.create({
    baseURL: `${BASE_URL}/payments`,
    timeout: 5000,
})

export const filesClient = axios.create({
  baseURL: `${BASE_URL}/imagenes`, // ejemplo para imágenes
  timeout: 5000,
});

export const recipt = axios.create({
  baseURL: `${BASE_URL}/assets/comprobantetransf`,
  timeout: 5000,
});