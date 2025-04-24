'use client';
import React, { useEffect, useState } from 'react';
import { Moon, Sun, Eye, EyeOff, Edit2, Save, X, User, Mail, Lock } from 'lucide-react';
import bcrypt from 'bcryptjs';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });





    useEffect(() => {
        const token = localStorage.getItem('token');
        const newToken = token?.replace(/['"]+/g, '');

        if (!newToken) {
            setError('User not authenticated.');
            setLoading(false);
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const res = await fetch('/api/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newToken}`,
                    },
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData?.error || 'Failed to fetch user profile');
                }

                const data = await res.json();
                const fetchedUser = data.user && data.user.length > 0 ? data.user[0] : null;
                if (fetchedUser) {
                    setUser(fetchedUser);
                    setFormData({ username: fetchedUser.username, email: fetchedUser.email, password: '' });
                } else {
                    setError('User not found.');
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError(err.message || 'An error occurred while loading the profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token')?.replace(/['"]+/g, '');

            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to update profile');
            }

            const updated = await res.json();
            setUser(updated.user);
            setEditMode(false);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
                    <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin absolute top-2 left-2"></div>
                  </div>
                </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full">
                    <div className="flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 w-16 h-16 mx-auto mb-6">
                        <X className="text-red-600 dark:text-red-300" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">
                        Error Loading Profile
                    </h2>
                    <p className="text-center text-red-500 dark:text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">


            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-bl-full opacity-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-tr-full opacity-10"></div>

                    <div className="relative z-10 px-8 py-10">
                        <div className="flex items-center mb-8">
                            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500">
                                <span className="text-2xl font-bold text-white">
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="ml-6">
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                    {editMode ? 'Edit Profile' : 'User Profile'}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Manage your account information
                                </p>
                            </div>
                        </div>

                        {!editMode ? (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                                                <User className="text-indigo-600 dark:text-indigo-400" size={20} />
                                            </div>
                                            <h3 className="ml-3 font-semibold text-gray-700 dark:text-gray-200">Username</h3>
                                        </div>
                                        <p className="text-lg text-gray-800 dark:text-gray-100">{user.username}</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                                                <Mail className="text-indigo-600 dark:text-indigo-400" size={20} />
                                            </div>
                                            <h3 className="ml-3 font-semibold text-gray-700 dark:text-gray-200">Email</h3>
                                        </div>
                                        <p className="text-lg text-gray-800 dark:text-gray-100 truncate">{user.email}</p>
                                    </div>
                                </div>

                                {/* <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                                                <Lock className="text-indigo-600 dark:text-indigo-400" size={20} />
                                            </div>
                                            <h3 className="ml-3 font-semibold text-gray-700 dark:text-gray-200">Password</h3>
                                        </div>
                                        <button
                                            className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <>
                                                    <EyeOff size={16} className="mr-1" />
                                                    Hide
                                                </>
                                            ) : (
                                                <>
                                                    <Eye size={16} className="mr-1" />
                                                    Show
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-lg text-gray-800 dark:text-gray-100 mt-4">
                                        {showPassword ? showPasswordFunc(use) : '********'}
                                    </p>
                                </div> */}

                                <button
                                    className="mt-6 w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                                    onClick={() => setEditMode(true)}
                                >
                                    <Edit2 size={18} className="mr-2" />
                                    Edit Profile
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                    <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <User className="text-gray-400" size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="username"
                                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-3 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            value={formData.username}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                    <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Mail className="text-gray-400" size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-3 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                    <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Lock className="text-gray-400" size={18} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-3 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Leave empty if you don't want to change"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" size={18} />
                                            ) : (
                                                <Eye className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                    <button
                                        className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                                        onClick={handleUpdate}
                                    >
                                        <Save size={18} className="mr-2" />
                                        Save Changes
                                    </button>
                                    <button
                                        className="flex-1 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                                        onClick={() => setEditMode(false)}
                                    >
                                        <X size={18} className="mr-2" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;