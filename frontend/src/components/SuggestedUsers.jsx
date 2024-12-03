/* eslint-disable no-unused-vars */
import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector(store => store.auth);
    return (
        <div className='my-8'>
            <div className='flex items-center justify-between text-sm gap-5'>
                <h1 className='font-semibold text-gray-400'>Gợi ý</h1>
                <span className='font-medium cursor-pointer hover:underline'>Xem tất cả</span>
            </div>
            {
                suggestedUsers.map((user) => {
                    return (
                        <div key={user._id} className='flex items-center justify-between my-5 gap-5'>
                            <div className='flex items-center gap-2 text-xs'>
                                <Link to={`/profile/${user?._id}`}>
                                    <Avatar>
                                        <AvatarImage src={user?.profilePicture} alt="post_image" className="" />
                                        <AvatarFallback>IG</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <h1 className='font-semibold '><Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
                                    <span className='text-gray-400 '>{user?.bio || 'Tiểu sử'}</span>
                                </div>
                            </div>
                            <span className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]'>Theo dõi</span>
                        </div>
                    )
                })
            }

        </div>
    )
}

export default SuggestedUsers