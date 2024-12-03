// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode } from 'lucide-react';
import axios from 'axios';
import { setMessages } from '@/redux/chatSlice';
import Messages from './Messages';

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState("");
    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
    const { onlineUsers, messages } = useSelector(store => store.chat);
    const dispatch = useDispatch();
    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await axios.post(`http://localhost:8000/api/v1/message/send/${receiverId}`, { textMessage }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
        }
    },[dispatch]);

    return (
<div className='flex ml-[17%] h-screen bg-gray-100'>
    {/* Sidebar */}
    <section className='w-full md:w-[30%] lg:w-[25%] bg-white border-r border-gray-300'>
        <div className='my-6 px-4'>
            <h1 className='font-bold text-xl'>{user?.username}</h1>
        </div>
        <hr className='border-gray-300' />
        <div className='overflow-y-auto h-[calc(100vh-80px)]'>
            {suggestedUsers.map((suggestedUser) => {
                const isOnline = onlineUsers.includes(suggestedUser?._id);
                return (
                    <div
                        key={suggestedUser?._id}
                        onClick={() => dispatch(setSelectedUser(suggestedUser))}
                        className='flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer'
                    >
                        <Avatar className='w-10 h-10'>
                            <AvatarImage src={suggestedUser?.profilePicture} />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span className='font-medium'>{suggestedUser?.username}</span>
                            <span className={`text-xs font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                                {isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    </section>

    {/* Chat Section */}
    {selectedUser ? (

        <section className='flex-1 flex flex-col h-screen'>
            {/* Header */}
            <div className='flex items-center gap-3 px-4 py-3 border-b border-gray-300 bg-white sticky top-0'>
                <Avatar>
                    <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                    <span className='font-medium'>{selectedUser?.username}</span>
                </div>
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4 bg-gray-50'>
                <Messages selectedUser={selectedUser} />
            </div>

            {/* Input Section */}
            <div className='flex items-center gap-2 p-4 border-t border-gray-300 bg-white'>
                <Input
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    type='text'
                    className='flex-1 focus-visible:ring-transparent'
                    placeholder='Nhập tin nhắn'
                />
                <Button onClick={() => sendMessageHandler(selectedUser?._id)}>Gửi</Button>
            </div>
        </section>
    ) : (
        <div className='flex-1 flex flex-col items-center justify-center text-center bg-white'>
            <MessageCircleCode className='w-32 h-32 text-gray-300' />
            <h1 className='font-medium text-lg mt-4'>Tin nhắn của bạn</h1>
            <span className='text-gray-500'>Chọn cuộc trò chuyện để bắt đầu</span>
        </div>
    )}
</div>

    )
}

export default ChatPage