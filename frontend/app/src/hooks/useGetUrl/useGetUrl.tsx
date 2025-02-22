import axios from 'axios'
import { useCallback } from 'react';


export default function useGetUrl() {
//     const baseUrl = "http://127.0.0.1:8000";
    const baseUrl = "http://backend.markus.localhost:8000";

    return useCallback((url: string) => axios.get(baseUrl + "/" + url)
          .then((response: { data: any; }) => {
            return response.data;
          })
          .catch(error => error.message), [])
}