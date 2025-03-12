import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function getCsrfToken() {
  const response = await axios.get(`${API_URL}/csrf-token`, {
    withCredentials: true,
  });
  return { csrfToken: response.data.csrfToken };
}
