import sharp from "sharp"
import cloudinary from "../utils/cloudinary.js"
import { Post } from "../models/post.model.js"
import { User } from "../models/user.model.js"
import { Comment } from "../models/comment.model.js"
import { getReceiverSocketId, io } from "../socket/socket.js"

export const addNewPost = async (req, res) => {
    try {
        const {caption} = req.body
        const image = req.file
        const authorId = req.id
        if(!image) {
            return res.status(400).json({
                message: "Yêu cầu hình ảnh",
            })
        }
        const optimizedImageBuffer = await sharp(image.buffer)
        .resize({width: 850, height: 850, fit: 'inside'})
        .toFormat('jpeg', {quality: 80})
        .toBuffer()
        const fileUrl = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUrl)
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        })
        const user = await User.findById(authorId)
        if(user) {
            user.posts.push(post._id)
            await user.save()      
        }
        await post.populate({path: 'author', select: '-password'})
        return res.status(201).json({
            message: 'Thêm bài đăng thành công',
            post,
            success: true
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id 
        const post = await Post.find({author: authorId}).sort({createdAt: -1}).populate({
            path: 'author',
            select: 'username, profilePicture'
        }).populate({
            path: 'comments',
            sort: {createdAt: -1},
            populate: {
                path: 'author',
                select: 'username, profilePicture'
            }
        })
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const likePost = async(req, res) => {
    try {
        const userLikedId = req.id
        const postId = req.params.id
        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({
            message: "Không tìm thấy bài đăng",
            success: false
        })
        await post.updateOne({$addToSet: {likes: userLikedId}})
        await post.save()

        const user = await User.findById(userLikedId).select('username profilePicture')
        const postOwnerId = post.author.toString()
        if(postOwnerId !== userLikedId) {
            const notification = {
                type: 'like',
                userId: userLikedId,
                userDetails: user,
                postId,
                message: 'Có người thích bài viết của bạn'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId)
            io.to(postOwnerSocketId).emit('notification', notification)
        } 

        return res.status(200).json({
            message: 'Đã thích bài đăng', 
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const dislikePost = async(req, res) => {
    try {
        const userLikedId = req.id
        const postId = req.params.id
        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({
            message: "Không tìm thấy bài đăng",
            success: false
        })
        await post.updateOne({$addToSet: {likes: userLikedId}})
        await post.save()

        const user = await User.findById(userLikedId).select('username profilePicture')
        const postOwnerId = post.author.toString()
        if(postOwnerId !== userLikedId) {
            const notification = {
                type: 'dislike',
                userId: userLikedId,
                userDetails: user,
                postId,
                message: 'Có người thích bài viết của bạn'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId)
            io.to(postOwnerId).emit('notification', notification)
        } 

        return res.status(200).json({
            message: 'Không thích bài đăng', 
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const addComment = async(req, res) => {
    try {
        const postId = req.params.id
        const userCommentId = req.id
        const {text} = req.body
        const post = await Post.findById(postId)
        if(!text) return res.status(400).json({
            message: "Không được bỏ trống thông tin",
            success: false
        })
        const comment = await Comment.create({
            text,
            author: userCommentId,
            post: postId
        })
        await comment.populate({
            path: 'author',
            select: "username profilePicture"
        })
        post.comments.push(comment._id)
        await post.save()
        return res.status(201).json({
            message: 'Bình luận thành công', 
            comment, 
            success: true
        })

    } catch (error) {
        console.log(error)
    }
}

export const getCommentsOfPost = async (req, res) => {
    try {
        const postId = req.params.id
        const comments = await Comment.find({post:postId}).populate('author', 'username', 'profilePicture')
        if(!comments) {
            return res.status(404).json({
                message: "Chưa có bình luận nào cho bài đăng này",
                success: false
            })
        }
        return res.status(200).json({
            message: 'Tải bình luận thành công', 
            success: true,
            comments
        })

    } catch (error) {
        console.log(error);
    }
}

export const deletePost = async(req, res) => {
    try {
       const postId = req.params.id
       const authorId = req.id
       const post = await Post.findById(postId) 
       if(!post) {
        return res.status(404).json({
            message: "Không tìm thấy bài đăng",
            success: false
        })
       }
       //kiểm tra xem người dùng có phải chủ bài đăng không
       if(post.author.toString() !== authorId) {
        return res.status(403).json({
            message: "Chưa xác thực"
        })
       }
       await Post.findByIdAndDelete(postId)
       //xóa post id khỏi người dùng
       let user = await User.findById(authorId)
       user.posts = user.posts.filter(id => id.toString() !== postId)
       await user.save()

       //xóa comment trả lời
       await Comment.deleteMany({post: postId})
       return res.status(200).json({
        message: 'Xóa bài đăng thành công', 
        success: true
    })
    } catch (error) {
        console.log(error)
    }
}

export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id
        const authorId = req.id
        const post = await Post.findById(postId)
        if(!post) {
            return res.status(404).json({
                message: "Không tìm thấy bài đăng",
                success: false
            })
        }
        const user = await User.findById(authorId)
        if(user.bookmarks.includes(post._id)){
            //đã lưu thì xóa
            await user.updateOne({$pull: {bookmarks: post._id}})
            await user.save()
            return res.status(200).json({
                type: 'unsaved',
                message: 'Bỏ lưu bài đăng thành công', 
                success: true,
            })
        }
        else {
            await user.updateOne({$addToSet: {bookmarks: post._id}})
            await user.save()
            return res.status(200).json({
                type: 'saved',
                message: 'Lưu lại bài đăng thành công', 
                success: true,
            })
        }
    } catch (error) {
        console.log(error)
    }
}