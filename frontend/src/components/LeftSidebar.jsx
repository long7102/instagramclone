/* eslint-disable react/jsx-key */
import { useEffect, useState } from "react";
import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  LucideCompass,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import instagramSVG from "../assets/ig.svg";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Link } from "react-router-dom";
import CreatePost from "./CreatePost";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";



const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const { likeNotification } = useSelector(store => store.realTimeNotification)
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Theo dõi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const logoutHandler = async () => {
    try {
      const res = await axios.get("https://instagramclone-8sw9.onrender.com/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Đăng xuất") {
      logoutHandler();
    } else if (textType === "Tạo mới") {
      setOpen(true);
    } else if (textType === "Trang cá nhân") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Trang chủ") {
      navigate(`/`);
    } else if (textType === "Hộp thư") {
      navigate(`/chat`);
    }
  };

  
const SidebarItems = [
  { icon: <Home />, text: "Trang chủ" },
  { icon: <Search />, text: "Tìm kiếm" },
  { icon: <LucideCompass />, text: "Khám phá" },
  { icon: <MessageCircle />, text: "Hộp thư" },
  { icon: <Heart />, text: "Thông báo" },
  { icon: <PlusSquare />, text: "Tạo mới" },
  {
    icon: (
      <Avatar className="h-6 w-6">
        <AvatarImage src={user?.profilePicture} alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    ),
    text: "Trang cá nhân",
  },
  { icon: <LogOut />, text: "Đăng xuất" },
];
  return (
    <div
      className={`fixed z-10 bg-white border-gray-300 transition-all ${isMobile
        ? "bottom-0 left-0 w-full h-[70px] border-t flex justify-between px-4"
        : "left-0 h-screen w-[16%] border-r px-4"
        }`}
    >
      <div
        className={`flex ${isMobile
          ? "flex-row justify-between items-center w-full"
          : "flex-col items-start"
          }`}
      >
        {!isMobile && (
          <Link to="/" className="flex items-center py-4">
            <img src={instagramSVG} alt="Instagram Logo" className="w-12" />
            <h1 className="font-semibold text-xl ml-2">Instagram</h1>
          </Link>
        )}

        {SidebarItems.map((item, index) => (
          <Popover key={index}>
            <PopoverTrigger asChild>
              <div
                onClick={() => sidebarHandler(item.text)}
                className={`relative flex items-center ${isMobile ? "justify-center" : "gap-3"
                  } hover:bg-gray-100 cursor-pointer rounded-lg ${isMobile ? "text-base mx-2" : "p-2 my-2 text-sm"
                  }`}
              >
                <div className="sidebar-icon relative">
                  {item.icon}
                  {/* Biểu tượng số thông báo */}
                  {item.text === "Thông báo" && likeNotification.length > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {likeNotification.length}
                    </div>
                  )}
                </div>
                {/* Văn bản */}
                <span className="hidden lg:block">
                  {!isMobile && item.text}
                </span>
              </div>
            </PopoverTrigger>
            {item.text === "Thông báo" && (
              <PopoverContent>
                <div className="p-2 max-w-sm">
                  {likeNotification.length === 0 ? (

                    <p className="text-sm text-gray-500">
                      Chưa có thông báo mới
                    </p>
                  ) : (
                    likeNotification.map((notification) => {
                      return (
                        <div
                          className="flex items-center gap-2 my-2"
                        >
                          <Avatar>
                            <AvatarImage
                              src={
                                notification.userDetails
                                  ?.profilePicture
                              }
                            />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <p className="text-sm">
                            <span className="font-bold">
                              {notification.userDetails?.username}
                            </span>{" "}
                            thích bài đăng của bạn
                          </p>

                        </div>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            )}
          </Popover>
        ))}


      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );


};

export default LeftSidebar;

