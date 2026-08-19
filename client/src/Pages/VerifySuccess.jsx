import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom"
export default function VerifySuccess(){
 const navigate = useNavigate()
 const [searchParams] = useSearchParams();
 const { login } = useAuth();
useEffect(() => {

    api.get(`/api/auth/me`)
    .then(res=>{
    login(res.data.user);
    navigate("/dashboard");
    });

},[]);
}