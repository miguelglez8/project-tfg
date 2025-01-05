
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { LOGIN_PATH } from "../routes/app-routes.js";

const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

const CheckAuth = () => {
    const navigate = useNavigate()

    useEffect(() => {
        if(!isAuthenticated()){
            navigate(LOGIN_PATH)
        }
    }, [navigate]);

    return (
        isAuthenticated() ?
        <Outlet /> : <></>
    )
}


export default CheckAuth;