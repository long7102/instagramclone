import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';
import signupImage from '../assets/signup.jpg'
import { Link, useNavigate } from 'react-router-dom';
import instagramSVG from '../assets/ig.svg'
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: ""
  })
  const [loading, setLoading] = useState(false)
  const {user} = useSelector(store=>store.auth);
  const navigate = useNavigate()
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }
  const signupHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axios.post('https://instagramclone-8sw9.onrender.com/api/v1/user/register', input, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      if (res.data.success) {
        navigate("/login")
        toast.success(res.data.message)
        setInput({
          username: "",
          email: "",
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
    <div className="flex h-screen w-full items-center justify-center bg-gray-900 bg-cover bg-no-repeat" style={{ backgroundImage: `url(${signupImage})` }}>
      <div className="rounded-xl bg-gray-800 bg-opacity-15 px-16 py-8 shadow-lg backdrop-blur-md max-sm:px-8">
        <div className="text-white">
          <div className="mb-8 flex flex-col items-center">
            <img src={instagramSVG} alt="Instagram Logo" className="w-24 animate-bounce-slow" />
            <h1 className="mb-2 text-xl font-bold">Instagram</h1>
            <span className="text-gray-300 text-sm text-center">Đăng ký ngay hôm nay để kết nối với mọi người</span>
          </div>
          <form onSubmit={signupHandler}>
          <div className="mb-4 text-sm">
              <span>Tên đăng nhập</span>
              <Input
                className="rounded-3xl border-opacity-50 bg-transparent bg-opacity-100 px-6 py-2 text-center text-inherit placeholder-slate-200 shadow-lg outline-none backdrop-blur-md focus-visible:ring-transparent"
                type="text"
                name="username"
                value={input.username}
                onChange={changeEventHandler}
              />
            </div>
            <div className="mb-4 text-sm">
              <span className='my-2'>Email</span>
              <Input
                className="rounded-3xl border-opacity-50 bg-transparent bg-opacity-100 px-6 py-2 text-center text-inherit placeholder-slate-200 shadow-lg outline-none backdrop-blur-md focus-visible:ring-transparent"
                type="email"
                name="email"
                value={input.email}
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
                    <Loader2 className=' h-4 animate-spin' />
                    Vui lòng đợi
                </Button>

            </div>
              ) : (
                <div className="my-3 flex justify-center text-lg text-black">
                <Button
                type="submit"
                  className="rounded-3xl bg-transparent-400 bg-opacity-50 px-10 py-2 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-yellow-500"
                >
                  
                  Đăng ký
                </Button>
  
              </div>
              )
            }

            <div className="flex justify-center text-md text-black">

              <span className='text-center text-white'>Đã có tài khoản <Link to="/login" className='text-blue-400'>đăng nhập ngay</Link></span>
            </div>
          </form>
        </div>
      </div>
    </div>

  );
};

export default Signup;
