/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import React, { useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { readFileAsDataURL } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setPosts } from '@/redux/postSlice'

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef()
  const [file, setFile] = useState("")
  const [caption, setCaption] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useSelector(store => store.auth);
  const {posts} = useSelector(store => store.post)

  const dispatch = useDispatch()
  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      const dataUrl = await readFileAsDataURL(file)
      setImagePreview(dataUrl)
    }
  }

  const createPostHandler = async (e) => {
    const formData = new FormData()
    formData.append("caption", caption)
    if (imagePreview) {
      formData.append("image", file)
    }
    try {
      setLoading(true)
      const res = await axios.post('http://localhost:8000/api/v1/post/addpost', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      })
      if (res.data.success) {
        dispatch(setPosts([ res.data.post, ...posts]))
        toast.success(res.data.message)
        setCaption("")
        setFile("")
        setImagePreview("")
        setOpen(false)
      }
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      setLoading(false)

    }
  }


  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader className='text-center font-semibold'>Tạo bài đăng mới</DialogHeader>
        <div className='flex gap-3 items-center'>
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="img" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='font-semibold text-xs'>{user?.username}</h1>
            <span className='text-gray-600 text-xs'>{user?.bio}</span>
          </div>
        </div>
        <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} className="focus-visible:ring-transparent border-none"placeholder='Nhập nội dung bài đăng' />
        {imagePreview && (
          <div className="w-full h-auto max-h-64 flex items-center justify-center mb-4">
            <img
              src={imagePreview}
              alt="preview_img"
              className="object-cover rounded-md max-h-64 w-full"
              style={{ maxHeight: '256px' }}
            />
          </div>
        )}
        <input ref={imageRef} type='file' className='hidden' onChange={fileChangeHandler}  />
        <Button onClick={() => imageRef.current.click()} className='w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf] '>Chọn file từ máy tính</Button>
        {
          imagePreview && (
            loading ? (
              <Button>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Vui lòng đợi
              </Button>
            ) : (
              <Button onClick={createPostHandler} type="submit" className="w-full">Đăng</Button>
            )
          )
        }
      </DialogContent>
    </Dialog>
  )
}

export default CreatePost
