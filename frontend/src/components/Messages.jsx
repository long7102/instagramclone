/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllMessage from './hooks/useGetAllMessage'
import useGetRTM from './hooks/useGetRTM'
import { formatDistanceToNow } from 'date-fns' // Import date-fns
import { vi } from 'date-fns/locale' // Import ngôn ngữ tiếng Việt

const Messages = ({ selectedUser }) => {
    useGetRTM()
    useGetAllMessage();
    const {messages} = useSelector(store => store.chat);
    const {user} = useSelector(store => store.auth);

    return (    
        <div className='overflow-y-auto flex-1 p-4'>
            <div className='flex justify-center'>
                <div className='flex flex-col items-center justify-center'>
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span>{selectedUser?.username}</span>
                    <Link to={`/profile/${selectedUser?._id}`}>
                        <Button className="h-8 my-2" variant="secondary">Xem trang cá nhân</Button>
                    </Link>
                </div>
            </div>
            <div className='flex flex-col gap-3'>
                {messages && messages.map((msg) => (
                    <div 
                        key={msg._id} 
                        className={`flex flex-col ${msg.senderId === user?._id ? 'items-end' : 'items-start'}`}
                    >
                        {/* Tin nhắn */}
                        <div className={`p-2 rounded-lg max-w-xs break-words ${msg.senderId === user?._id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                            {msg.message}
                        </div>
                        {/* Thời gian bên dưới */}
                        <div className="text-xs text-gray-500 mt-1">
                           đã gửi {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: vi })}
                        </div>
                    </div>
                ))}
            </div>
        </div>  
    )
}

export default Messages
