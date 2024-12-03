/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { AvatarFallback, AvatarImage, Avatar } from './ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import axios from 'axios';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';


const Post = ({ post }) => {
    const [text, setText] = useState("")
    const [open, setOpen] = useState(false)
    const { user } = useSelector(store => store.auth)
    const { posts } = useSelector(store => store.post)
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false)
    const [postLike, setPostLike] = useState(post.likes.length)
    const [comment, setComment] = useState(post?.comments)
    const dispatch = useDispatch()
    const changeEventHandler = (e) => {
        const inputText = e.target.value
        if (inputText.trim()) {
            setText(inputText)
        }
        else {
            setText("")
        }
    }
    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`http://localhost:8000/api/v1/post/${post._id}/${action}`, { withCredentials: true });
            console.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const conmmentHandler = async () => {
        try {
            const res = await axios.post(`http://localhost:8000/api/v1/post/${post?._id}/comment`,
                { text },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            )
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment]
                setComment(updatedCommentData)
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                )
                dispatch(setPosts(updatedPostData))
                setText("")
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }
    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`http://localhost:8000/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem._id !== post._id)
                dispatch(setPosts(updatedPostData))
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message)

        }
    }

    const bookmarHandler = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/v1/post/${post?._id}/bookmark`, { withCredentials: true })
            if (res.data.success) {
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="container my-2 w-full max-w-md mx-25 sm:mx-15 lg:max-w-md lg:mx-0 md:px-4 sm:px-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage src={post.author?.profilePicture} alt="post_image" />
                        <AvatarFallback>IG</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col justify-between">
                        <div className="flex items-center">
                            <h1 className="font-medium mr-2">{post.author?.username}</h1>
                            <p className="text-sm text-gray-500">
                                {post.createdAt &&
                                    formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                            </p>
                        </div>
                        {user?._id === post.author._id && <span className="text-start">Tác giả</span>}
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className="cursor-pointer" />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-center text-sm">
                        {
                            post?.author?._id !== user?._id && <Button variant='ghost' className="cursor-pointer w-fit text-[#ED4956] font-bold">Bỏ theo dõi</Button>
                        }
                        <Button onClick={bookmarHandler} variant='ghost' className="cursor-pointer w-fit">Thêm vào ưa thích</Button>
                        {
                            user && user?._id === post?.author._id && <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-fit">Xóa bài đăng</Button>
                        }
                    </DialogContent>
                </Dialog>
            </div>
            <img
                className="rounded-sm my-2 w-full aspect-square object-cover"
                src={post.image}
            />
            <div className="flex items-center justify-between my-2 font-medium">
                <div className="flex items-center gap-3">
                    {liked ? (
                        <FaHeart
                            onClick={likeOrDislikeHandler}
                            size={"24"}
                            className="cursor-pointer text-red-600"
                        />
                    ) : (
                        <FaRegHeart
                            onClick={likeOrDislikeHandler}
                            size={"22px"}
                            className="cursor-pointer hover:text-gray-600"
                        />
                    )}
                    <MessageCircle
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }}
                        className="cursor-pointer hover:text-gray-600"
                    />
                    <Send className="cursor-pointer hover:text-gray-600" />
                </div>
                <Bookmark onClick={bookmarHandler} className="cursor-pointer hover:text-gray-600" />
            </div>

            <span className="font-medium block mb-2">{post.likes.length} lượt thích</span>
            <p>
                <span className="font-medium mr-2">{post.author?.username}</span>
                {post.caption}
            </p>
            {comment?.length === 0 ? (
                <span className="text-sm text-gray-400">Chưa có bình luận</span>
            ) : (
                <span
                    onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }}
                    className="cursor-pointer text-sm text-gray-400"
                >
                    Xem tất cả {comment?.length} bình luận
                </span>
            )}

            <CommentDialog onClick={() => setOpen(true)} open={open} setOpen={setOpen} />
            <div className="flex items-center justify-between">
                <input
                    name="comment"
                    type="text"
                    placeholder="Thêm bình luận của bạn ..."
                    className="outline-none text-sm w-full my-2"
                    value={text}
                    onChange={changeEventHandler}
                />
                {text && (
                    <span
                        onClick={conmmentHandler}
                        className="text-[#3BADF8] cursor-pointer"
                    >
                        Đăng
                    </span>
                )}
            </div>
        </div>
    );

};

export default Post;
