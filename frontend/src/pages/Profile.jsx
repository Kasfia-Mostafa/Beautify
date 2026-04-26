import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function Profile() {
  const { user, setUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Track which sections are in "Edit" mode
  const [editModes, setEditModes] = useState({
    personal: false,
    account: false,
    address: false
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      country: '',
      zipCode: '',
      phone: ''
    }
  });

  // Fetch latest user data from server on load
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/auth/profile/${user.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            password: '',
            confirmPassword: '',
            address: {
              street: data.address?.street || '',
              city: data.address?.city || '',
              country: data.address?.country || data.address?.state || '',
              zipCode: data.address?.zipCode || '',
              phone: data.address?.phone || ''
            }
          });
          // Sync auth context if needed
          setUser(prev => ({ ...prev, ...data, id: data._id }));
        }
      } catch (err) {
        console.error('Fetch User Error:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, [user?.id, setUser]);

  const toggleEdit = (section) => {
    setEditModes(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (section) => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    
    try {
      // Use the built-in updateProfile from AuthContext
      const updatedUser = await updateProfile({
        ...formData,
        userId: user.id
      });
      
      if (updatedUser) {
        toast.success('Profile updated successfully!');
        // Turn off edit mode for this section
        setEditModes(prev => ({ ...prev, [section]: false }));
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      console.error('Update Profile Error:', err);
      toast.error(err.message || 'Update failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-20">
      <div className="space-y-8">
        {/* Personal Information Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative transition-all">
          <h2 className="font-headline-sm text-lg text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-400">person</span>
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-label-caps tracking-widest text-zinc-400 uppercase ml-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!editModes.personal}
                className={`w-full px-5 py-3 rounded-xl border outline-none transition-all ${
                  editModes.personal 
                    ? 'border-rose-300 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-rose-300' 
                    : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed'
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-label-caps tracking-widest text-zinc-400 uppercase ml-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!editModes.personal}
                className={`w-full px-5 py-3 rounded-xl border outline-none transition-all ${
                  editModes.personal 
                    ? 'border-rose-300 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-rose-300' 
                    : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed'
                }`}
              />
            </div>
          </div>
          <button 
            type="button"
            onClick={() => editModes.personal ? handleUpdate('personal') : toggleEdit('personal')}
            className={`absolute top-8 right-8 text-[10px] font-label-caps tracking-widest uppercase px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              editModes.personal 
                ? 'bg-rose-500 text-white border-rose-600 shadow-md' 
                : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white'
            }`}
          >
            {editModes.personal ? (loading ? 'Saving...' : 'Save') : 'Edit'}
          </button>
        </div>

        {/* Account Credentials Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative transition-all">
          <h2 className="font-headline-sm text-lg text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-400">lock</span>
            Account Credentials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-label-caps tracking-widest text-zinc-400 uppercase ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editModes.account}
                className={`w-full px-5 py-3 rounded-xl border outline-none transition-all ${
                  editModes.account 
                    ? 'border-rose-300 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-rose-300' 
                    : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed'
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-label-caps tracking-widest text-zinc-400 uppercase ml-1">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={!editModes.account}
                placeholder={editModes.account ? "Enter new password" : "••••••••"}
                className={`w-full px-5 py-3 rounded-xl border outline-none transition-all ${
                  editModes.account 
                    ? 'border-rose-300 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-rose-300' 
                    : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed'
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-label-caps tracking-widest text-zinc-400 uppercase ml-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={!editModes.account}
                placeholder={editModes.account ? "Confirm new password" : "••••••••"}
                className={`w-full px-5 py-3 rounded-xl border outline-none transition-all ${
                  editModes.account 
                    ? 'border-rose-300 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-rose-300' 
                    : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed'
                }`}
              />
            </div>
          </div>
          <button 
            type="button"
            onClick={() => editModes.account ? handleUpdate('account') : toggleEdit('account')}
            className={`absolute top-8 right-8 text-[10px] font-label-caps tracking-widest uppercase px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              editModes.account 
                ? 'bg-rose-500 text-white border-rose-600 shadow-md' 
                : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white'
            }`}
          >
            {editModes.account ? (loading ? 'Saving...' : 'Save') : 'Edit'}
          </button>
        </div>

        {/* Shipping Address Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative transition-all">
          <h2 className="font-headline-sm text-lg text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-400">local_shipping</span>
            Shipping Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-label-caps tracking-widest text-zinc-400 uppercase ml-1">Street Address</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                disabled={!editModes.address}
                className={`w-full px-5 py-3 rounded-xl border outline-none transition-all ${
                  editModes.address 
                    ? 'border-rose-300 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-rose-300' 
                    : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed'
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-label-caps tracking-widest text-zinc-400 uppercase ml-1">City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                disabled={!editModes.address}
                className={`w-full px-5 py-3 rounded-xl border outline-none transition-all ${
                  editModes.address 
                    ? 'border-rose-300 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-rose-300' 
                    : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed'
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-label-caps tracking-widest text-zinc-400 uppercase ml-1">Country</label>
              <input
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                disabled={!editModes.address}
                className={`w-full px-5 py-3 rounded-xl border outline-none transition-all ${
                  editModes.address 
                    ? 'border-rose-300 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-rose-300' 
                    : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed'
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-label-caps tracking-widest text-zinc-400 uppercase ml-1">Zip Code</label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                disabled={!editModes.address}
                className={`w-full px-5 py-3 rounded-xl border outline-none transition-all ${
                  editModes.address 
                    ? 'border-rose-300 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-rose-300' 
                    : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed'
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-label-caps tracking-widest text-zinc-400 uppercase ml-1">Phone</label>
              <input
                type="text"
                name="address.phone"
                value={formData.address.phone}
                onChange={handleChange}
                disabled={!editModes.address}
                className={`w-full px-5 py-3 rounded-xl border outline-none transition-all ${
                  editModes.address 
                    ? 'border-rose-300 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-rose-300' 
                    : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed'
                }`}
              />
            </div>
          </div>
          <button 
            type="button"
            onClick={() => editModes.address ? handleUpdate('address') : toggleEdit('address')}
            className={`absolute top-8 right-8 text-[10px] font-label-caps tracking-widest uppercase px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              editModes.address 
                ? 'bg-rose-500 text-white border-rose-600 shadow-md' 
                : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white'
            }`}
          >
            {editModes.address ? (loading ? 'Saving...' : 'Save') : 'Edit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
