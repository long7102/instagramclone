/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import useGetUserProfile from './hooks/useGetUserProfile';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle, Save, StickyNote, UsersRound } from 'lucide-react';
import ProfileDetail from './ProfileDetail';
import CommentDialog from './CommentDialog';
import { setSelectedPost } from '@/redux/postSlice';

const Profile = () => {
  const { userProfile, user } = useSelector(store => store.auth)
  const { posts } = useSelector(store => store.post)
  const params = useParams()
  const userId = params.id
  useGetUserProfile(userId)
  const [activeTab, setActiveTab] = useState('posts')
  const [openProfileDetail, setOpenProfileDetail] = useState(false)
  const [open, setOpen] = useState(false)
  const isLoggedInUserProfile = user?._id === userProfile?._id
  const isFollowing = false
  const dispatch = useDispatch()

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks

  return (
    <div className='flex lg:w-[80%] w-full justify-center ml-auto p-8'>
      <div className='flex flex-col gap-28'>
        <div className='grid grid-cols-2'>
          <section className='flex items-center justify-center'>
            <Avatar className='h-32 w-32 cursor-pointer'>
              <AvatarImage onClick={() => setOpenProfileDetail(true)} src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <ProfileDetail onClick={() => setOpenProfileDetail(true)} openProfileDetail={openProfileDetail} setOpenProfileDetail={setOpenProfileDetail} />
          </section>
          <section>
            <div className='flex flex-col gap-5'>
              <div className='flex items-center gap-2'>
                <span>{userProfile?.username}</span>
                {
                  isLoggedInUserProfile ? (
                    <>
                      <Link to="/account/edit"><Button variant='secondary' className='hover:bg-gray-200 h-8'>Chỉnh sửa</Button></Link>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8' onClick={() => handleTabChange('saved')}>Đã lưu</Button>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8'>Cài đặt</Button>
                    </>
                  ) : (
                    isFollowing ? (
                      <>
                        <Button variant='secondary' className='h-8'>Bỏ theo dõi</Button>
                        <Button variant='secondary' className='h-8'>Tin nhắn</Button>
                      </>
                    ) : (
                      <Button className='bg-[#0095F6] hover:bg-[#3192d2] h-8'>Theo dõi</Button>
                    )
                  )
                }
              </div>
              <div className='flex items-center gap-4 '>
                <p><span className='font-semibold'> {userProfile?.posts.length}</span> bài đăng</p>
                <p><span className='font-semibold'> {userProfile?.followers.length}</span> người theo dõi</p>
                <p><span className='font-semibold'> {userProfile?.following.length}</span> đang theo dõi</p>
              </div>
              <div className='flex flex-col gap-1'>
                <span>{userProfile?.bio || ''}</span>
                <a href={`https://www.threads.net/@${userProfile?.username}`} target='blank'>
                  <Badge className="w-fit" variant="secondary"><AtSign className='mr-1' /> {userProfile?.username}</Badge>
                </a>
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span className={`py-3 cursor-pointer flex gap-2 ${activeTab === 'posts' ? 'font-bold' : ''}`} onClick={() => handleTabChange('posts')}>
              <StickyNote />
              Bài viết

            </span>
            <span className={`py-3 cursor-pointer flex gap-2 ${activeTab === 'saved' ? 'font-bold' : ''}`} onClick={() => handleTabChange('saved')}>
              <Save />
              Đã lưu
            </span>
            <span className='py-3 cursor-pointer flex gap-2'>
              <UsersRound />
              Được gắn thẻ
            </span>
          </div>
          <div className='grid grid-cols-3 gap-1'>
            {
              displayedPost?.map((post) => {
                return (
                  <div key={post?._id} className='group cursor-pointer relative' >
                    <img src={post.image} alt='post-image' className=' w-full aspect-square object-cover' />
                    <div onClick={() => {
                      dispatch(setSelectedPost(post));
                      setOpen(true);
                    }}
                    className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <div className='flex items-center text-white space-x-4'>
                      <button className='flex items-center gap-2 hover:text-gray-300 rounded-md aspect-square'>
                        <Heart />
                        <span>{post?.likes.length}</span>
                      </button>
                      <button className='flex items-center gap-2 hover:text-gray-300 rounded-md aspect-square'>
                        <MessageCircle />
                        <span>{post?.comments.length}</span>
                      </button>
                    </div>
                  </div>

                  </div>
          )
              })
            }
          <CommentDialog onClick={() => setOpen(true)} open={open} setOpen={setOpen} />

        </div>
      </div>
    </div>

    </div >
  )

}


export default Profile
