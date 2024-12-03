import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";

export const register = async (req,res) => {
    try {
        const {username, email, password} = req.body;
        if(!username || !email || !password) {
            return res.status(401).json({
                message: "Lỗi",
                success: false
            })
        }
        const user = await User.findOne({email})
        if(user){
            return res.status(401).json({
                message: "Người dùng này đã tồn tại",
                success: false
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        await User.create({
            username,
            email,
            password: hashedPassword,
        })
        return res.status(201).json({
            message: "Tạo mới tài khoản thành công",
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const login = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!username || !password) {
            return res.status(401).json({
                message: "Không được bỏ trống thông tin",
                success: false
            });
        }
        let user = await User.findOne({
            $or: [{ email: email || '' }, { username: username || '' }]
        });
        if (!user) {
            return res.status(401).json({
                message: "Vui lòng kiểm tra lại thông tin đã nhập",
                success: false
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Vui lòng kiểm tra lại tên đăng nhập và mật khẩu",
                success: false
            });
        }
        
        // const populatedPosts = await Promise.all(
        //     user.posts.map( async (postId) => {
        //         const post = await Post.findById(postId);
        //         if(post.author.equals(user._id)){
        //             return post;
        //         }
        //         return null;
        //     })
        // )
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: user.posts
        };
        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '15d' });
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Chào mừng bạn đã quay trở lại ${user.username}`,
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Có lỗi xảy ra",
            success: false
        });
    }
};


export const logout = async(_, res) => {
    try {
        return res.cookie("token", "", {maxAge:0}).json({
            message: "Đăng xuất thành công",
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const getProfile = async(req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({path: 'posts', createdAt: -1}).populate('bookmarks')
        return res.status(200).json({
            user,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const editProfile = async(req, res) => {
    try {
        const userId = req.id
        const {bio, gender} = req.body
        const profilePicture = req.file
        let cloudResponse
        if(profilePicture) {
            const fileUri = getDataUri(profilePicture)
            cloudResponse = await cloudinary.uploader.upload(fileUri)
        }
        const user = await User.findById(userId).select('-password')
        if(!user) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng",
                success: false
            })
        }
        if(bio) {
            user.bio = bio
        }
        if(gender) {
            user.gender = gender
        }
        if(profilePicture) {
            user.profilePicture = cloudResponse.secure_url
        }
        await user.save()
        return res.status(200).json({
            message: "Cập nhật thông tin thành công",
            success: true,
            user
        })
    } catch (error) {
        console.log(error)
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Chưa có người dùng nào',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
    }
};

export const followOrUnfollow = async (req, res) => {
    try {
        const follower = req.id; 
        const targetUserId = req.params.id; 
        if (follower === targetUserId) {
            return res.status(400).json({
                message: 'Bạn không thể tự làm vậy với bản thân',
                success: false
            });
        }

        const user = await User.findById(follower);
        const targetUser = await User.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'Không tìm thấy người dùng',
                success: false
            });
        }

        const isFollowing = user.following.includes(targetUserId);
        if (isFollowing) {
            await Promise.all([
                User.updateOne({ _id: follower }, { $pull: { following: targetUserId } }),
                User.updateOne({ _id: targetUserId }, { $pull: { followers: follower } }),
            ])
            return res.status(200).json({ message: 'Bỏ theo dõi thành công', success: true });
        } else {
            await Promise.all([
                User.updateOne({ _id: follower }, { $push: { following: targetUserId } }),
                User.updateOne({ _id: targetUserId }, { $push: { followers: follower } }),
            ])
            return res.status(200).json({ message: 'Theo dõi thành công', success: true });
        }
    } catch (error) {
        console.log(error);
    }
}

export const blockOrUnblockUser = async (req, res) => {
    try {
        const blocker = req.id; // người chặn
        const targetUserId = req.params.id; // người bị chặn

        if (blocker === targetUserId) {
            return res.status(400).json({
                message: 'Bạn không thể tự chặn bản thân',
                success: false
            });
        }

        const user = await User.findById(blocker);
        const targetUser = await User.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'Không tìm thấy người dùng',
                success: false
            });
        }

        // Kiểm tra xem người dùng đã bị chặn chưa
        const isBlocked = user.blockedUsers.includes(targetUserId);
        if (isBlocked) {
            // Logic bỏ chặn
            await User.updateOne({ _id: blocker }, { $pull: { blockedUsers: targetUserId } });
            return res.status(200).json({ message: 'Bỏ chặn thành công', success: true });
        } else {
            // Logic chặn
            await User.updateOne({ _id: blocker }, { $push: { blockedUsers: targetUserId } });
            return res.status(200).json({ message: 'Chặn thành công', success: true });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Lỗi xảy ra khi thực hiện yêu cầu',
            success: false
        });
    }
}
