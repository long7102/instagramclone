import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Signup from './components/Signup'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Home from './components/Home'
import Profile from './components/Profile'
import EditProfile from './components/EditProfile'
import ChatPage from './components/ChatPage'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnSlice'
import { getSocket, initSocket } from './redux/socket'
import ProtectedRoutes from './components/ProtectedRoutes'

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element:  <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      { path: '/', element: <ProtectedRoutes><Home /></ProtectedRoutes>
      },
      { path: '/profile/:id', element:  <ProtectedRoutes> <Profile /></ProtectedRoutes> },
      { path: '/account/edit', element: <ProtectedRoutes><EditProfile /></ProtectedRoutes>
      },
      { path: '/chat', element: <ProtectedRoutes><ChatPage /></ProtectedRoutes>
      },
    ]
  },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  {
    future: {
      v7_skipActionErrorRevalidation: true,
    },
  }
])

function App() {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socket = initSocket(user._id);

      socket.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socket.on('notification', (notification) => {
        dispatch(setLikeNotification(notification));
      });

      return () => {
        socket.close();
      }
    } else {
      const socket = getSocket();
      if (socket) {
        socket.close();
      }
    }
  }, [user, dispatch]);

  return <RouterProvider router={browserRouter} />;
}

export default App;
