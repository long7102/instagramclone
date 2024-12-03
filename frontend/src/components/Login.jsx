import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';
import loginImage from '../assets/login.jpg'
import { Link, useNavigate } from 'react-router-dom';
import instagramSVG from '../assets/ig.svg'
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

const Login = () => {
    const [input, setInput] = useState({
        username: "",
        password: ""
    })
    const [loading, setLoading] = useState(false)
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value })
    }
    const signupHandler = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const res = await axios.post('http://localhost:8000/api/v1/user/login', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            })
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                navigate("/")
                toast.success(res.data.message)
                setInput({
                    username: "",
                    password: ""
                })
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        if(user) {
            navigate("/")
        }
    })
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-900 bg-cover bg-no-repeat" style={{ backgroundImage: `url(${loginImage})` }}>
            <div className="rounded-xl bg-gray-800 bg-opacity-15 px-16 py-8 shadow-lg backdrop-blur-md max-sm:px-8">
                <div className="text-white">
                    <div className="mb-5 flex flex-col items-center">
                        <img src={instagramSVG} alt="Instagram Logo" className="w-24 animate-bounce-slow" />
                        <h1 className="mb-2 text-xl font-bold">Instagram</h1>
                        <span className="text-gray-300 text-sm text-center">Đăng nhập ngay hôm nay để kết nối với mọi người</span>
                    </div>
                    <form onSubmit={signupHandler}>
                        <div className="mb-4 text-sm">
                            <span className='my-2'>Nhập tên đăng nhập</span>
                            <Input
                                className="rounded-3xl border-opacity-50 bg-transparent bg-opacity-100 px-6 py-2 text-center text-inherit placeholder-slate-200 shadow-lg outline-none backdrop-blur-md focus-visible:ring-transparent"
                                type="text"
                                name="username"
                                
                                value={input.username}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div className="mb-4 text-sm">
                            <span>Mật khẩu</span>
                            <Input
                                className="rounded-3xl border-opacity-50 bg-transparent bg-opacity-100 px-6 py-2 text-center text-inherit placeholder-slate-200 shadow-lg outline-none backdrop-blur-md focus-visible:ring-transparent"
                                type="password"
                                name="password"
                                value={input.password}
                                onChange={changeEventHandler} />
                        </div>
                        {
                            loading ? (
                                <div className="m-5 flex justify-center text-lg text-black">
                                    <Button
                                        className="rounded-3xl bg-transparent-400 bg-opacity-50 px-10 py-2 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-yellow-500"
                                    >
                                        <Loader2 className='mr-2 h-4 m-4 animate-spin' />
                                        Vui lòng đợi
                                    </Button>

                                </div>
                            ) : (<div className="m-5 flex justify-center text-lg text-black">
                                <Button
                                    className="rounded-3xl bg-transparent-400 bg-opacity-50 px-10 py-2 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-yellow-500"
                                >
                                    Đăng nhập
                                </Button>

                            </div>)
                        }

                        <div className="flex justify-center text-md text-black">

                            <span className='text-center text-white'>Chưa có tài khoản <Link to="/signup" className='text-blue-400'>đăng ký ngay</Link></span>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    );
};

export default Login;
