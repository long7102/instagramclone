import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

const ProtectedRoutes = ({children}) => {
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    useEffect(()=>{
        if(!user){
           alert("Vui lòng đăng nhập để sử dụng tính năng này")
            navigate("/login");
        }
    },[navigate, user])
  return <>{children}</>
}

export default ProtectedRoutes;