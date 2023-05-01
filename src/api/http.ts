// Import .env files
import dotenv from "dotenv";
dotenv.config();
dotenv.config({path: '.env.local', override: true});

import axios from "axios";
import type { AxiosInstance } from "axios";

export const clientHttp :AxiosInstance = axios.create({
    baseURL: process.env.PTERODACTYL_URL + '/client/',
    headers: {
        'Authorization': 'Bearer ' + process.env.PTERODACTYL_CLIENT_KEY
    }
});

export const applicationHttp :AxiosInstance = axios.create({
    baseURL: process.env.PTERODACTYL_URL + '/application/',
    headers: {
        'Authorization': 'Bearer ' + process.env.PTERODACTYL_APP_KEY
    }
});
