import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios"
import { useNavigate } from "react-router-dom"
export default function VerifySuccess(){
 const navigate = useNavigate()
 const [searchParams] = useSearchParams();
 const { login } = useAuth();
 const API_URL = import.meta.env.VITE_API_URL;
useEffect(() => {

    const token = searchParams.get("token");

    axios.get(`${API_URL}/api/auth/me`, {headers:{Authorization:`Bearer ${token}`}
    })
    .then(res=>{
        console.log(res.data.user);
    login(token, res.data.user);
    navigate("/dashboard");
    });

},[]);
}