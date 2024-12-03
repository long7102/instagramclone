/* eslint-disable no-unused-vars */
import React from 'react';
import { useSelector } from 'react-redux';
import { Dialog, DialogContent } from './ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';

const ProfileDetail = ({ openProfileDetail, setOpenProfileDetail }) => {
    const { userProfile } = useSelector(store => store.auth);

    return (
        <Dialog open={openProfileDetail}>
            <DialogContent
                onInteractOutside={() => setOpenProfileDetail(false)}
                className="max-w-3xl p-6 bg-white rounded-lg shadow-lg"
            >
                <div className="flex flex-col items-center space-y-6">
                    {/* User Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {userProfile?.profilePicture ? (
                            <img
                                src={userProfile.profilePicture}
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-500 text-lg">No Avatar</span>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-gray-800">
                            {userProfile?.username || 'Tên không có'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Email: {userProfile?.email || 'Không có thông tin'}
                        </p>
                    </div>

                    {/* Account Details */}
                    <div className="w-full bg-gray-100 p-4 rounded-lg">
                        <h2 className="text-lg font-medium text-gray-700 mb-2">
                            Thông tin tài khoản
                        </h2>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Ngày tạo tài khoản:
                                {userProfile?.createdAt
                                    ? format(new Date(userProfile.createdAt), " dd/MM/yyyy 'lúc' HH:mm", { locale: vi })
                                    : 'Không xác định'}
                            </span>
                            <span className="text-gray-800 font-medium">
                                {userProfile?.createdAt
                                    ? formatDistanceToNow(new Date(userProfile.createdAt), {
                                        addSuffix: true,
                                        locale: vi,
                                    })
                                    : 'Không xác định'}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileDetail;
