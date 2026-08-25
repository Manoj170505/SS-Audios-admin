import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ss-audios-backend-production.up.railway.app/api';

const MediaManager = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'add' | 'services' | 'plans'
    const [filterCategory, setFilterCategory] = useState('All');
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [notification, setNotification] = useState(null);
    const [serverStatus, setServerStatus] = useState('checking');

    // Gallery Items fetched from Backend
    const [mediaList, setMediaList] = useState([]);

    // Services & Plans state
    const [services, setServices] = useState([]);
    const [plans, setPlans] = useState([]);
    const [isSavingService, setIsSavingService] = useState(false);
    const [isSavingPlan, setIsSavingPlan] = useState(false);

    // Editing modal states
    const [editingService, setEditingService] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);

    // Create modal states
    const [isAddingService, setIsAddingService] = useState(false);
    const [newService, setNewService] = useState({
        title: '',
        price: '₹25,000',
        category: 'Club & Festival',
        tag: 'Live DJ Experience',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600',
        description: 'Electrifying DJ and live remix performance designed to keep the crowd energetic and dance floors packed.',
        featuresStr: 'Live Stem Remixing\nFestival-Grade Sound Array\nSynchronized Visuals\nDedicated Sound Tech'
    });

    const [isAddingPlan, setIsAddingPlan] = useState(false);
    const [newPlan, setNewPlan] = useState({
        name: '',
        badge: 'SPECIAL TIER',
        monthlyPrice: '$499',
        yearlyPrice: '$399',
        period: '/ event',
        buttonText: 'Choose Plan',
        theme: 'standard',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dj-playing-music-at-a-party-41338-large.mp4',
        videos: [
            'https://assets.mixkit.co/videos/preview/mixkit-dj-playing-music-at-a-party-41338-large.mp4'
        ],
        desc: 'Custom live DJ and concert sound production package tailored to your venue.',
        features: [
            { text: "Live DJ Performance (4h)", included: true },
            { text: "Pro Sound Array (3,000W)", included: true },
            { text: "Dynamic Lighting & FX", included: true },
            { text: "Wireless Mic & Host", included: false },
            { text: "Custom 3D Visual Mapping", included: false }
        ]
    });

    // Direct File Upload Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'Ambient',
        type: 'image',
        selectedFile: null
    });

    const [editFormData, setEditFormData] = useState({ title: '', category: '' });

    // Show temporary notification toast
    const showNotification = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    // Fetch media from backend
    const fetchMedia = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/media`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setMediaList(data.data);
                setServerStatus('connected');
            } else {
                setServerStatus('error');
            }
        } catch (err) {
            console.error('Failed to connect to backend:', err);
            setServerStatus('offline');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch services from backend
    const fetchServices = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/services`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setServices(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch services:', err);
        }
    };

    // Fetch plans from backend
    const fetchPlans = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/plans`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setPlans(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch plans:', err);
        }
    };

    // Booking Inquiries State
    const [inquiries, setInquiries] = useState([]);
    const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);

    // Fetch inquiries from backend
    const fetchInquiries = async () => {
        setIsLoadingInquiries(true);
        try {
            const res = await fetch(`${API_BASE_URL}/inquiries`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setInquiries(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch inquiries:', err);
        } finally {
            setIsLoadingInquiries(false);
        }
    };

    const handleDeleteInquiry = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking inquiry?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/inquiries/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setInquiries(prev => prev.filter(inq => inq.id !== id));
                showNotification('Inquiry deleted successfully');
            }
        } catch (err) {
            showNotification('Failed to delete inquiry', 'error');
        }
    };

    useEffect(() => {
        fetchMedia();
        fetchServices();
        fetchPlans();
        fetchInquiries();
    }, []);

    // Handle Local File Selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                selectedFile: file,
                title: prev.title ? prev.title : file.name.replace(/\.[^/.]+$/, '')
            }));
            setUploadError('');
        }
    };

    // Handle Form Inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Add Item to Gallery via Backend S3 & DynamoDB Upload
    const handleAddMedia = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.selectedFile) {
            setUploadError('Please select a file and provide a title.');
            return;
        }

        setIsUploading(true);
        setUploadError('');

        try {
            const uploadPayload = new FormData();
            uploadPayload.append('file', formData.selectedFile);
            uploadPayload.append('title', formData.title);
            uploadPayload.append('category', formData.category);
            uploadPayload.append('type', formData.type);

            const response = await fetch(`${API_BASE_URL}/media`, {
                method: 'POST',
                body: uploadPayload
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to upload media');
            }

            setMediaList(prev => [result.data, ...prev]);
            setFormData({ title: '', category: 'Ambient', type: 'image', selectedFile: null });

            if (e.target) {
                e.target.reset();
            }

            showNotification(`"${result.data.title}" uploaded & synced to website!`);
            setActiveTab('gallery');
        } catch (err) {
            console.error('Upload error:', err);
            setUploadError(err.message || 'An error occurred during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this media item?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/media/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setMediaList(prev => prev.filter(item => item.id !== id));
                showNotification('Media asset deleted.');
            } else {
                alert(data.message || 'Failed to delete');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error connecting to backend server.');
        }
    };

    const startEditing = (item) => {
        setEditingId(item.id);
        setEditFormData({ title: item.title, category: item.category });
    };

    const saveEdit = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/media/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData)
            });
            const data = await res.json();
            if (data.success) {
                setMediaList(prev =>
                    prev.map(item =>
                        item.id === id ? { ...item, title: editFormData.title, category: editFormData.category } : item
                    )
                );
                setEditingId(null);
                showNotification('Item metadata updated successfully.');
            } else {
                alert(data.message || 'Failed to update');
            }
        } catch (err) {
            console.error('Edit error:', err);
            alert('Error updating item on backend server.');
        }
    };

    // --- SERVICE CREATE, SAVE & DELETE HANDLERS ---
    const handleCreateService = async (e) => {
        e.preventDefault();
        if (!newService.title) {
            alert('Please provide a service title');
            return;
        }
        setIsSavingService(true);
        try {
            const features = (newService.featuresStr || '')
                .split('\n')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const payload = {
                ...newService,
                features
            };

            const res = await fetch(`${API_BASE_URL}/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setServices(prev => [...prev, data.data]);
                setIsAddingService(false);
                setNewService({
                    title: '',
                    price: '₹25,000',
                    category: 'Club & Festival',
                    tag: 'Live DJ Experience',
                    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600',
                    description: 'Electrifying DJ and live remix performance designed to keep the crowd energetic and dance floors packed.',
                    featuresStr: 'Live Stem Remixing\nFestival-Grade Sound Array\nSynchronized Visuals\nDedicated Sound Tech'
                });
                showNotification(`Service "${data.data.title}" added & published live!`);
            } else {
                alert(data.message || 'Failed to create service');
            }
        } catch (err) {
            console.error('Create service error:', err);
            alert('Error saving service to backend server.');
        } finally {
            setIsSavingService(false);
        }
    };

    const handleSaveService = async (e) => {
        e.preventDefault();
        if (!editingService) return;
        setIsSavingService(true);
        try {
            const res = await fetch(`${API_BASE_URL}/services/${editingService.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingService)
            });
            const data = await res.json();
            if (data.success) {
                setServices(prev => prev.map(s => s.id === editingService.id ? data.data : s));
                setEditingService(null);
                showNotification(`Service "${data.data.title}" updated successfully!`);
            } else {
                alert(data.message || 'Failed to update service');
            }
        } catch (err) {
            console.error('Service update error:', err);
            alert('Error saving service to backend server.');
        } finally {
            setIsSavingService(false);
        }
    };

    const handleDeleteService = async (service) => {
        if (!window.confirm(`Are you sure you want to delete the service "${service.title}"?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/services/${service.id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setServices(prev => prev.filter(s => s.id !== service.id));
                showNotification(`Service "${service.title}" deleted.`);
            } else {
                alert(data.message || 'Failed to delete service');
            }
        } catch (err) {
            console.error('Delete service error:', err);
            alert('Error deleting service from backend server.');
        }
    };

    const handleResetServices = async () => {
        if (!window.confirm('Reset all signature DJ services to default prices and descriptions?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/services/reset`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setServices(data.data);
                showNotification('All services reset to defaults!');
            }
        } catch (err) {
            alert('Failed to reset services');
        }
    };

    // --- PRICING PLAN CREATE, SAVE & DELETE HANDLERS ---
    const handleCreatePlan = async (e) => {
        e.preventDefault();
        if (!newPlan.name) {
            alert('Please provide a plan name');
            return;
        }
        setIsSavingPlan(true);
        try {
            const res = await fetch(`${API_BASE_URL}/plans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPlan)
            });
            const data = await res.json();
            if (data.success) {
                setPlans(prev => [...prev, data.data]);
                setIsAddingPlan(false);
                setNewPlan({
                    name: '',
                    badge: 'SPECIAL TIER',
                    monthlyPrice: '$499',
                    yearlyPrice: '$399',
                    period: '/ event',
                    buttonText: 'Choose Plan',
                    theme: 'standard',
                    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dj-playing-music-at-a-party-41338-large.mp4',
                    videos: [
                        'https://assets.mixkit.co/videos/preview/mixkit-dj-playing-music-at-a-party-41338-large.mp4'
                    ],
                    desc: 'Custom live DJ and concert sound production package tailored to your venue.',
                    features: [
                        { text: "Live DJ Performance (4h)", included: true },
                        { text: "Pro Sound Array (3,000W)", included: true },
                        { text: "Dynamic Lighting & FX", included: true },
                        { text: "Wireless Mic & Host", included: false },
                        { text: "Custom 3D Visual Mapping", included: false }
                    ]
                });
                showNotification(`Pricing plan "${data.data.name}" added & published live!`);
            } else {
                alert(data.message || 'Failed to create plan');
            }
        } catch (err) {
            console.error('Create plan error:', err);
            alert('Error saving plan to backend server.');
        } finally {
            setIsSavingPlan(false);
        }
    };

    const handleSavePlan = async (e) => {
        e.preventDefault();
        if (!editingPlan) return;
        setIsSavingPlan(true);
        try {
            const planId = editingPlan.id || editingPlan.name;
            const res = await fetch(`${API_BASE_URL}/plans/${planId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingPlan)
            });
            const data = await res.json();
            if (data.success) {
                setPlans(prev => prev.map(p => (p.id === editingPlan.id || p.name === editingPlan.name) ? data.data : p));
                setEditingPlan(null);
                showNotification(`Plan "${data.data.name}" updated successfully!`);
            } else {
                alert(data.message || 'Failed to update plan');
            }
        } catch (err) {
            console.error('Plan update error:', err);
            alert('Error saving pricing plan to backend server.');
        } finally {
            setIsSavingPlan(false);
        }
    };

    const handleDeletePlan = async (plan) => {
        const planId = plan.id || plan.name;
        if (!window.confirm(`Are you sure you want to delete the pricing plan "${plan.name}"?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/plans/${planId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setPlans(prev => prev.filter(p => (p.id !== plan.id && p.name !== plan.name)));
                showNotification(`Pricing plan "${plan.name}" deleted.`);
            } else {
                alert(data.message || 'Failed to delete plan');
            }
        } catch (err) {
            console.error('Delete plan error:', err);
            alert('Error deleting plan from backend server.');
        }
    };

    const handleResetPlans = async () => {
        if (!window.confirm('Reset all event pricing plans to default prices and features?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/plans/reset`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setPlans(data.data);
                showNotification('All pricing plans reset to defaults!');
            }
        } catch (err) {
            alert('Failed to reset pricing plans');
        }
    };

    const filteredMedia = filterCategory === 'All'
        ? mediaList
        : mediaList.filter(item => item.category?.toLowerCase() === filterCategory.toLowerCase());

    const getAcceptType = () => {
        if (formData.type === 'image') return 'image/*';
        if (formData.type === 'video') return 'video/*';
        if (formData.type === 'audio') return 'audio/*';
        return '*/*';
    };

    return (
        <div className="min-h-screen bg-[#141010] text-white font-sans p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Toast Notification */}
                {notification && (
                    <div className="fixed top-6 right-6 z-50 bg-[#f70776] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/20 animate-bounce">
                        <span className="text-lg">✨</span>
                        <span className="text-xs font-bold">{notification.msg}</span>
                    </div>
                )}

                {/* Top Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 border-b border-[#c3195d]/30 pb-4 gap-4">
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f70776] tracking-wide">
                                SOUNDSCAPE <span className="text-white text-base font-normal">Admin Studio</span>
                            </h1>
                            {serverStatus === 'connected' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                    Backend Connected
                                </span>
                            )}
                            {serverStatus === 'offline' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                    Backend Offline
                                </span>
                            )}
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">
                            Live event management, DJ services, custom pricing tiers, and media vault sync.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex flex-wrap gap-1 bg-[#1C1717] p-1 border border-[#c3195d]/30 rounded-xl">
                            <button
                                onClick={() => setActiveTab('gallery')}
                                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'gallery'
                                    ? 'bg-[#f70776] text-white shadow-lg shadow-[#f70776]/30'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Gallery ({mediaList.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('add')}
                                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'add'
                                    ? 'bg-[#f70776] text-white shadow-lg shadow-[#f70776]/30'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                + Upload
                            </button>
                            <button
                                onClick={() => setActiveTab('services')}
                                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'services'
                                    ? 'bg-[#f70776] text-white shadow-lg shadow-[#f70776]/30'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Services & DJ Rates ({services.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('plans')}
                                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'plans'
                                    ? 'bg-[#f70776] text-white shadow-lg shadow-[#f70776]/30'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Pricing Plans ({plans.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('inquiries')}
                                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'inquiries'
                                    ? 'bg-[#f70776] text-white shadow-lg shadow-[#f70776]/30'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <span>📥 Inquiries</span>
                                {inquiries.length > 0 && (
                                    <span className="bg-[#f70776]/40 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                                        {inquiries.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-red-400 border border-gray-800 hover:border-red-500/40 rounded-xl transition-colors"
                                title="Sign out of admin session"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>

                {/* TAB 1: GALLERY & ASSET MANAGER */}
                {activeTab === 'gallery' && (
                    <div>
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                                <span className="text-xs text-gray-400 mr-2 font-semibold">Filter:</span>
                                {['All', 'Ambient', 'Stage', 'Club', 'Festival', 'Orchestra', 'Weddings'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilterCategory(cat)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${filterCategory.toLowerCase() === cat.toLowerCase()
                                            ? 'bg-[#c3195d]/20 border-[#f70776] text-[#f70776]'
                                            : 'border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={fetchMedia}
                                className="text-xs text-gray-400 hover:text-[#f70776] flex items-center space-x-1"
                                title="Refresh list"
                            >
                                <span>↻</span>
                                <span>Refresh</span>
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-20 bg-[#141010] border border-[#c3195d]/20 rounded-2xl">
                                <div className="w-8 h-8 border-2 border-[#f70776] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-gray-400 text-xs">Loading media vault from server...</p>
                            </div>
                        ) : filteredMedia.length === 0 ? (
                            <div className="text-center py-16 bg-[#141010] border border-[#c3195d]/20 rounded-2xl">
                                <p className="text-gray-400 text-sm">No assets found in this category.</p>
                                <button
                                    onClick={() => setActiveTab('add')}
                                    className="mt-4 px-4 py-2 bg-[#f70776] text-white text-xs font-bold rounded-lg hover:bg-[#c3195d] transition-colors"
                                >
                                    Upload First Asset
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {filteredMedia.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-[#1C1717] border border-[#2B2323] hover:border-[#f70776]/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between group"
                                    >
                                        {/* Media Preview Frame */}
                                        <div className="relative aspect-video bg-black/50 overflow-hidden flex items-center justify-center">
                                            {item.type === 'video' ? (
                                                <video
                                                    src={item.url}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    loop
                                                    onMouseOver={e => e.target.play().catch(() => { })}
                                                    onMouseOut={e => e.target.pause()}
                                                />
                                            ) : item.type === 'audio' ? (
                                                <div className="flex flex-col items-center justify-center p-4 text-center">
                                                    <div className="w-12 h-12 rounded-full bg-[#f70776]/20 text-[#f70776] flex items-center justify-center mb-2">
                                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                                        </svg>
                                                    </div>
                                                    <audio src={item.url} controls className="w-full h-8 scale-90" />
                                                </div>
                                            ) : (
                                                <img
                                                    src={item.url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            )}

                                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/10">
                                                {item.type}
                                            </span>
                                        </div>

                                        {/* Details and Actions */}
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            {editingId === item.id ? (
                                                <div className="space-y-2 mb-3">
                                                    <input
                                                        type="text"
                                                        value={editFormData.title}
                                                        onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                                                        className="w-full px-2 py-1 bg-black/60 border border-gray-700 rounded text-xs text-white"
                                                        placeholder="Asset title"
                                                    />
                                                    <select
                                                        value={editFormData.category}
                                                        onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                                                        className="w-full px-2 py-1 bg-black/60 border border-gray-700 rounded text-xs text-white"
                                                    >
                                                        <option value="Ambient">Ambient</option>
                                                        <option value="Stage">Stage</option>
                                                        <option value="Club">Club</option>
                                                        <option value="Festival">Festival</option>
                                                        <option value="Orchestra">Orchestra</option>
                                                        <option value="Weddings">Weddings</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="mb-3">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#f70776]">
                                                        {item.category || 'General'}
                                                    </span>
                                                    <h3 className="text-sm font-bold text-white truncate" title={item.title}>
                                                        {item.title}
                                                    </h3>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                                                {editingId === item.id ? (
                                                    <div className="flex space-x-2 w-full">
                                                        <button
                                                            onClick={() => saveEdit(item.id)}
                                                            className="flex-1 py-1 bg-[#f70776] text-white text-xs font-bold rounded hover:bg-[#c3195d]"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded hover:bg-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => startEditing(item)}
                                                            className="text-xs text-gray-400 hover:text-white flex items-center space-x-1"
                                                        >
                                                            <span>✏️</span>
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1"
                                                        >
                                                            <span>🗑️</span>
                                                            <span>Delete</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: DIRECT FILE UPLOAD FORM */}
                {activeTab === 'add' && (
                    <div className="max-w-2xl mx-auto bg-[#1C1717] border border-[#c3195d]/30 p-6 sm:p-8 rounded-2xl shadow-xl">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-3">
                            <h2 className="text-xl font-bold text-white">
                                Upload Asset to your Gallery
                            </h2>
                        </div>

                        {uploadError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                                {uploadError}
                            </div>
                        )}

                        <form onSubmit={handleAddMedia} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-2">Asset Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Club Night Visual Backdrop"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f70776] transition-colors"
                                    required
                                    disabled={isUploading}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-2">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776] transition-colors"
                                        disabled={isUploading}
                                    >
                                        <option value="Ambient">Ambient</option>
                                        <option value="Stage">Stage Visuals</option>
                                        <option value="Club">Club Night</option>
                                        <option value="Festival">Festival</option>
                                        <option value="Orchestra">Orchestra</option>
                                        <option value="Weddings">Weddings</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-2">Media Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776] transition-colors"
                                        disabled={isUploading}
                                    >
                                        <option value="image">Photo / Image</option>
                                        <option value="video">Video Clip</option>
                                        <option value="audio">Audio Track</option>
                                    </select>
                                </div>
                            </div>

                            {/* Direct File Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-2">
                                    Choose File from Device
                                </label>
                                <div className="border-2 border-dashed border-gray-700 hover:border-[#f70776] rounded-xl p-6 text-center transition-colors bg-black/20">
                                    <input
                                        type="file"
                                        accept={getAcceptType()}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload-input"
                                        disabled={isUploading}
                                        required
                                    />
                                    <label
                                        htmlFor="file-upload-input"
                                        className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                                    >
                                        <div className="p-3 bg-[#f70776]/10 rounded-full text-[#f70776]">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold text-white">
                                            {formData.selectedFile ? formData.selectedFile.name : 'Click to select file'}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {formData.selectedFile
                                                ? `${(formData.selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                                                : `Select a ${formData.type} from local storage`}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!formData.selectedFile || isUploading}
                                className="w-full py-3.5 bg-[#f70776] hover:bg-[#c3195d] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-[#f70776]/20 transition-all duration-200 mt-4 flex items-center justify-center space-x-2"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Uploading to Server...</span>
                                    </>
                                ) : (
                                    <span>Upload & Sync to Soundscape</span>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* TAB 3: SERVICES & DJ PRICING MANAGER */}
                {activeTab === 'services' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#1C1717] p-5 rounded-2xl border border-[#2B2323]">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>🎧</span> Manage Signature Services & DJ Rates
                                </h2>
                                <p className="text-gray-400 text-xs mt-1">
                                    Add, edit, or remove showcase event cards, starting rates, descriptions, and feature capabilities.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => setIsAddingService(true)}
                                    className="px-4 py-2 rounded-xl bg-[#f70776] hover:bg-[#c3195d] text-white text-xs font-bold shadow-lg shadow-[#f70776]/25 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span>+</span> Add New Service
                                </button>
                                <button
                                    onClick={fetchServices}
                                    className="px-3 py-2 rounded-xl border border-gray-700 text-gray-300 hover:text-white text-xs font-semibold cursor-pointer"
                                >
                                    ↻ Refresh
                                </button>
                                <button
                                    onClick={handleResetServices}
                                    className="px-3 py-2 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/60 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Reset to Defaults
                                </button>
                            </div>
                        </div>

                        {/* Services Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    className="bg-[#1C1717] border border-[#2B2323] hover:border-[#f70776]/60 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 group"
                                >
                                    {/* Image & Price Header */}
                                    <div className="relative h-44 w-full bg-black/40 overflow-hidden">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1717] via-transparent to-black/60" />
                                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-white border border-white/10">
                                                0{service.id} • {service.category}
                                            </span>
                                            <span className="text-xs font-black px-3 py-1 rounded-full bg-[#f70776] text-white shadow-lg">
                                                {service.price}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-2 left-4 right-4">
                                            <h3 className="text-base font-bold text-white truncate">
                                                {service.title}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Description & Features */}
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                        <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                                            {service.description}
                                        </p>

                                        {/* Features List */}
                                        <div className="space-y-1 pt-2 border-t border-[#2B2323]">
                                            {service.features?.map((f, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                                    <span className="text-[#f70776] font-bold">✓</span>
                                                    <span>{f}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="pt-3 border-t border-[#2B2323] flex items-center justify-between gap-2">
                                            <span className="text-[11px] text-gray-400 uppercase tracking-wider truncate">
                                                Tag: <strong className="text-white">{service.tag}</strong>
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditingService({ ...service, featuresStr: (service.features || []).join('\n') })}
                                                    className="px-3 py-1.5 bg-[#f70776] hover:bg-[#c3195d] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteService(service)}
                                                    className="px-2.5 py-1.5 bg-red-900/30 hover:bg-red-800/60 border border-red-500/30 text-red-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                                                    title="Delete service"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CREATE SERVICE MODAL */}
                        {isAddingService && (
                            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                                <div className="bg-[#1C1717] border border-[#f70776]/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 my-8">
                                    <div className="flex items-center justify-between border-b border-[#2B2323] pb-3">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span>✨</span> Add New DJ Service
                                        </h3>
                                        <button
                                            onClick={() => setIsAddingService(false)}
                                            className="text-gray-400 hover:text-white text-lg font-bold cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <form onSubmit={handleCreateService} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Service Title</label>
                                                <input
                                                    type="text"
                                                    value={newService.title}
                                                    onChange={e => setNewService({ ...newService, title: e.target.value })}
                                                    placeholder="e.g. Festival EDM & DJ Beats"
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Price Tag</label>
                                                <input
                                                    type="text"
                                                    value={newService.price}
                                                    onChange={e => setNewService({ ...newService, price: e.target.value })}
                                                    placeholder="e.g. ₹25,000 or $399"
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                                                <input
                                                    type="text"
                                                    value={newService.category}
                                                    onChange={e => setNewService({ ...newService, category: e.target.value })}
                                                    placeholder="e.g. Club & Festival, Weddings, Staging"
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Tag / Sub-badge</label>
                                                <input
                                                    type="text"
                                                    value={newService.tag}
                                                    onChange={e => setNewService({ ...newService, tag: e.target.value })}
                                                    placeholder="e.g. Live Stem Remixing"
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">Image URL</label>
                                            <input
                                                type="text"
                                                value={newService.image}
                                                onChange={e => setNewService({ ...newService, image: e.target.value })}
                                                placeholder="https://images.unsplash.com/photo-..."
                                                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">Service Description</label>
                                            <textarea
                                                rows="3"
                                                value={newService.description}
                                                onChange={e => setNewService({ ...newService, description: e.target.value })}
                                                placeholder="Describe the audio-visual performance and energy..."
                                                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">Features (One per line)</label>
                                            <textarea
                                                rows="3"
                                                value={newService.featuresStr}
                                                onChange={e => setNewService({ ...newService, featuresStr: e.target.value })}
                                                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                placeholder="Precision Acoustic Tuning&#10;Tour-Grade Wireless Sound&#10;Ambient Staging"
                                            />
                                        </div>

                                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2323]">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingService(false)}
                                                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-gray-700 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSavingService}
                                                className="px-6 py-2 rounded-xl bg-[#f70776] hover:bg-[#c3195d] text-white text-xs font-bold shadow-lg shadow-[#f70776]/25 transition-all disabled:opacity-50 cursor-pointer"
                                            >
                                                {isSavingService ? 'Saving...' : 'Add & Publish Service'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* EDIT SERVICE MODAL */}
                        {editingService && (
                            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                                <div className="bg-[#1C1717] border border-[#f70776]/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 my-8">
                                    <div className="flex items-center justify-between border-b border-[#2B2323] pb-3">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span>✏️</span> Edit Service: {editingService.title}
                                        </h3>
                                        <button
                                            onClick={() => setEditingService(null)}
                                            className="text-gray-400 hover:text-white text-lg font-bold cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <form onSubmit={handleSaveService} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Service Title</label>
                                                <input
                                                    type="text"
                                                    value={editingService.title}
                                                    onChange={e => setEditingService({ ...editingService, title: e.target.value })}
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Price Tag (e.g. ₹25,000)</label>
                                                <input
                                                    type="text"
                                                    value={editingService.price}
                                                    onChange={e => setEditingService({ ...editingService, price: e.target.value })}
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                                                <input
                                                    type="text"
                                                    value={editingService.category}
                                                    onChange={e => setEditingService({ ...editingService, category: e.target.value })}
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Tag / Sub-badge</label>
                                                <input
                                                    type="text"
                                                    value={editingService.tag}
                                                    onChange={e => setEditingService({ ...editingService, tag: e.target.value })}
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">Image URL</label>
                                            <input
                                                type="text"
                                                value={editingService.image}
                                                onChange={e => setEditingService({ ...editingService, image: e.target.value })}
                                                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">Service Description</label>
                                            <textarea
                                                rows="3"
                                                value={editingService.description}
                                                onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                                                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">Features (One per line)</label>
                                            <textarea
                                                rows="3"
                                                value={editingService.featuresStr}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    const feats = val.split('\n').filter(s => s.trim().length > 0);
                                                    setEditingService({ ...editingService, featuresStr: val, features: feats });
                                                }}
                                                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                placeholder="Precision Acoustic Tuning&#10;Tour-Grade Wireless Sound&#10;Ambient Staging"
                                            />
                                        </div>

                                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2323]">
                                            <button
                                                type="button"
                                                onClick={() => setEditingService(null)}
                                                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-gray-700 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSavingService}
                                                className="px-6 py-2 rounded-xl bg-[#f70776] hover:bg-[#c3195d] text-white text-xs font-bold shadow-lg shadow-[#f70776]/25 transition-all disabled:opacity-50 cursor-pointer"
                                            >
                                                {isSavingService ? 'Saving...' : 'Save & Publish Live'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: PRICING PLANS MANAGER */}
                {activeTab === 'plans' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#1C1717] p-5 rounded-2xl border border-[#2B2323]">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>🎚️</span> Manage Event Pricing Plans & Tiers
                                </h2>
                                <p className="text-gray-400 text-xs mt-1">
                                    Add custom packages, edit single event / tour rates, badge highlights, and features.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => setIsAddingPlan(true)}
                                    className="px-4 py-2 rounded-xl bg-[#f70776] hover:bg-[#c3195d] text-white text-xs font-bold shadow-lg shadow-[#f70776]/25 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span>+</span> Add New Plan
                                </button>
                                <button
                                    onClick={fetchPlans}
                                    className="px-3 py-2 rounded-xl border border-gray-700 text-gray-300 hover:text-white text-xs font-semibold cursor-pointer"
                                >
                                    ↻ Refresh
                                </button>
                                <button
                                    onClick={handleResetPlans}
                                    className="px-3 py-2 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/60 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Reset to Defaults
                                </button>
                            </div>
                        </div>

                        {/* Plans Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plans.map((plan, idx) => (
                                <div
                                    key={idx}
                                    className={`bg-[#1C1717] rounded-3xl p-6 border shadow-xl flex flex-col justify-between transition-all ${plan.theme === 'silver'
                                        ? 'border-slate-300/40 bg-gradient-to-b from-[#22252A] to-[#1C1717]'
                                        : plan.theme === 'gold'
                                            ? 'border-amber-400/40 bg-gradient-to-b from-[#2A2315] to-[#1C1717]'
                                            : 'border-[#2B2323] hover:border-[#f70776]/50'
                                        }`}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#141010] border border-white/10 text-gray-300">
                                                {plan.badge}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Theme: <strong className="text-white">{plan.theme}</strong>
                                            </span>
                                        </div>

                                        {/* Multi-Video Preview Frame */}
                                        {((plan.videos && plan.videos.length > 0) || plan.videoUrl) && (
                                            <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-white/10 p-2 space-y-2 group">
                                                <div className="flex items-center justify-between px-1 text-[10px] font-bold text-gray-300">
                                                    <span className="text-[#f70776] flex items-center gap-1">
                                                        <span>🎬</span> {plan.videos?.length || 1} Stage Videos
                                                    </span>
                                                    <span className="text-gray-400">Autoplaying Left-to-Right</span>
                                                </div>
                                                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                                                    {(plan.videos && plan.videos.length > 0 ? plan.videos : [plan.videoUrl]).map((vSrc, vidIdx) => (
                                                        <div key={vidIdx} className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black">
                                                            <video
                                                                src={vSrc}
                                                                className="w-full h-full object-cover"
                                                                muted
                                                                loop
                                                                playsInline
                                                                autoPlay
                                                            />
                                                            <span className="absolute bottom-0.5 right-1 text-[8px] bg-black/80 text-white px-1 rounded">
                                                                #{vidIdx + 1}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                                                {plan.name}
                                            </h3>
                                            <p className="text-xs text-gray-400 font-light mt-1 min-h-[32px]">
                                                {plan.desc}
                                            </p>
                                        </div>

                                        {/* Pricing Display */}
                                        <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-400">Single Event Rate:</span>
                                                <span className="font-extrabold text-white text-sm">{plan.monthlyPrice}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-400">Tour / Season Rate:</span>
                                                <span className="font-extrabold text-[#f70776] text-sm">{plan.yearlyPrice}</span>
                                            </div>
                                        </div>

                                        {/* Features List Preview */}
                                        <div className="space-y-1.5 pt-2 border-t border-[#2B2323]">
                                            {plan.features?.map((feat, fIdx) => (
                                                <div key={fIdx} className="flex items-center gap-2 text-xs">
                                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${feat.included ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                                                        {feat.included ? '✓' : '—'}
                                                    </span>
                                                    <span className={feat.included ? 'text-gray-200' : 'text-gray-500 line-through'}>
                                                        {feat.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 mt-4 border-t border-[#2B2323] flex items-center gap-2">
                                        <button
                                            onClick={() => setEditingPlan(JSON.parse(JSON.stringify(plan)))}
                                            className="flex-1 py-2.5 bg-[#f70776] hover:bg-[#c3195d] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer text-center"
                                        >
                                            Edit Plan & Video
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan(plan)}
                                            className="px-3 py-2.5 bg-red-900/30 hover:bg-red-800/60 border border-red-500/30 text-red-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                                            title="Delete plan"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CREATE PRICING PLAN MODAL */}
                        {isAddingPlan && (
                            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                                <div className="bg-[#1C1717] border border-[#f70776]/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 my-8">
                                    <div className="flex items-center justify-between border-b border-[#2B2323] pb-3">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span>✨</span> Add New Pricing Plan
                                        </h3>
                                        <button
                                            onClick={() => setIsAddingPlan(false)}
                                            className="text-gray-400 hover:text-white text-lg font-bold cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <form onSubmit={handleCreatePlan} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Plan Name</label>
                                                <input
                                                    type="text"
                                                    value={newPlan.name}
                                                    onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                                                    placeholder="e.g. Festival VIP Headliner"
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Badge</label>
                                                <input
                                                    type="text"
                                                    value={newPlan.badge}
                                                    onChange={e => setNewPlan({ ...newPlan, badge: e.target.value })}
                                                    placeholder="e.g. MOST POPULAR, VIP, FESTIVAL"
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Single Event Rate</label>
                                                <input
                                                    type="text"
                                                    value={newPlan.monthlyPrice}
                                                    onChange={e => setNewPlan({ ...newPlan, monthlyPrice: e.target.value })}
                                                    placeholder="$1,299"
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Tour Rate (Save 20%)</label>
                                                <input
                                                    type="text"
                                                    value={newPlan.yearlyPrice}
                                                    onChange={e => setNewPlan({ ...newPlan, yearlyPrice: e.target.value })}
                                                    placeholder="$1,039"
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Theme Accent</label>
                                                <select
                                                    value={newPlan.theme || 'standard'}
                                                    onChange={e => setNewPlan({ ...newPlan, theme: e.target.value })}
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                >
                                                    <option value="standard">Standard</option>
                                                    <option value="silver">Silver Glow</option>
                                                    <option value="gold">Gold VIP</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* MULTI-VIDEO MANAGEMENT SECTION */}
                                        <div className="p-4 bg-black/40 border border-[#f70776]/30 rounded-2xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                                                    <span>🎬</span> Card Videos (4 to 5 Continuous Autoplay Feeds)
                                                </label>
                                                <span className="text-[10px] text-[#f70776] font-semibold">
                                                    {(newPlan.videos || []).length} Videos Configured
                                                </span>
                                            </div>

                                            {/* List of Video URLs */}
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                {(newPlan.videos && newPlan.videos.length > 0 ? newPlan.videos : ['']).map((vUrl, vIdx) => (
                                                    <div key={vIdx} className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-gray-400 w-4">#{vIdx + 1}</span>
                                                        <input
                                                            type="url"
                                                            value={vUrl}
                                                            onChange={e => {
                                                                const updated = [...(newPlan.videos || [])];
                                                                updated[vIdx] = e.target.value;
                                                                setNewPlan({
                                                                    ...newPlan,
                                                                    videos: updated,
                                                                    videoUrl: updated[0] || ''
                                                                });
                                                            }}
                                                            placeholder={`Video URL #${vIdx + 1} (e.g. https://assets.mixkit.co/...mp4)`}
                                                            className="flex-1 px-3 py-1.5 bg-black/60 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#f70776]"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = (newPlan.videos || []).filter((_, idx) => idx !== vIdx);
                                                                setNewPlan({
                                                                    ...newPlan,
                                                                    videos: updated,
                                                                    videoUrl: updated[0] || ''
                                                                });
                                                            }}
                                                            className="px-2 py-1 bg-red-900/30 hover:bg-red-800/60 text-red-300 rounded-lg text-xs cursor-pointer"
                                                            title="Remove this video"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const current = newPlan.videos || [];
                                                        setNewPlan({
                                                            ...newPlan,
                                                            videos: [...current, '']
                                                        });
                                                    }}
                                                    className="px-3 py-1.5 bg-[#2B2323] hover:bg-[#f70776]/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <span>+</span> Add Another Video URL
                                                </button>

                                                {/* Pick from Vault/Gallery Videos */}
                                                {mediaList.filter(m => m.type === 'video').length > 0 && (
                                                    <select
                                                        onChange={e => {
                                                            if (e.target.value) {
                                                                const current = newPlan.videos || [];
                                                                const updated = [...current, e.target.value];
                                                                setNewPlan({
                                                                    ...newPlan,
                                                                    videos: updated,
                                                                    videoUrl: updated[0] || ''
                                                                });
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                        className="px-2.5 py-1.5 bg-black/80 border border-gray-800 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-[#f70776]"
                                                    >
                                                        <option value="">+ Insert from Vault...</option>
                                                        {mediaList.filter(m => m.type === 'video').map(v => (
                                                            <option key={v.id} value={v.url}>
                                                                {v.title} ({v.category || 'General'})
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>

                                            {/* Mini Live Preview Track */}
                                            {(newPlan.videos || []).filter(Boolean).length > 0 && (
                                                <div className="pt-2 border-t border-gray-800">
                                                    <span className="text-[10px] font-semibold text-gray-400 block mb-1.5">Live Preview Carousel:</span>
                                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                                        {(newPlan.videos || []).filter(Boolean).map((vSrc, pIdx) => (
                                                            <div key={pIdx} className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0 border border-white/20 bg-black">
                                                                <video
                                                                    src={vSrc}
                                                                    className="w-full h-full object-cover"
                                                                    muted
                                                                    loop
                                                                    autoPlay
                                                                    playsInline
                                                                />
                                                                <span className="absolute top-1 left-1 text-[8px] bg-black/80 text-white px-1 rounded">
                                                                    Cam #{pIdx + 1}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">Plan Description</label>
                                            <textarea
                                                rows="2"
                                                value={newPlan.desc}
                                                onChange={e => setNewPlan({ ...newPlan, desc: e.target.value })}
                                                placeholder="Brief overview of what this tier delivers..."
                                                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                required
                                            />
                                        </div>

                                        {/* Features List Editor with Toggles */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-xs font-semibold text-gray-300">Feature Inclusions</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const feats = newPlan.features || [];
                                                        setNewPlan({
                                                            ...newPlan,
                                                            features: [...feats, { text: 'New Feature Item', included: true }]
                                                        });
                                                    }}
                                                    className="text-[11px] text-[#f70776] hover:underline font-bold cursor-pointer"
                                                >
                                                    + Add Feature
                                                </button>
                                            </div>

                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                {newPlan.features?.map((feat, fIdx) => (
                                                    <div key={fIdx} className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-gray-800">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = [...newPlan.features];
                                                                updated[fIdx].included = !updated[fIdx].included;
                                                                setNewPlan({ ...newPlan, features: updated });
                                                            }}
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${feat.included ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}
                                                            title="Toggle included/excluded"
                                                        >
                                                            {feat.included ? 'Included' : 'Excluded'}
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={feat.text}
                                                            onChange={e => {
                                                                const updated = [...newPlan.features];
                                                                updated[fIdx].text = e.target.value;
                                                                setNewPlan({ ...newPlan, features: updated });
                                                            }}
                                                            className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = newPlan.features.filter((_, idx) => idx !== fIdx);
                                                                setNewPlan({ ...newPlan, features: updated });
                                                            }}
                                                            className="text-red-400 hover:text-red-300 text-xs px-1 cursor-pointer"
                                                            title="Remove feature"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2323]">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingPlan(false)}
                                                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-gray-700 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSavingPlan}
                                                className="px-6 py-2 rounded-xl bg-[#f70776] hover:bg-[#c3195d] text-white text-xs font-bold shadow-lg shadow-[#f70776]/25 transition-all disabled:opacity-50 cursor-pointer"
                                            >
                                                {isSavingPlan ? 'Saving...' : 'Add & Publish Plan'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* EDIT PRICING PLAN MODAL */}
                        {editingPlan && (
                            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                                <div className="bg-[#1C1717] border border-[#f70776]/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 my-8">
                                    <div className="flex items-center justify-between border-b border-[#2B2323] pb-3">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span>🎚️</span> Edit Plan: {editingPlan.name}
                                        </h3>
                                        <button
                                            onClick={() => setEditingPlan(null)}
                                            className="text-gray-400 hover:text-white text-lg font-bold cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <form onSubmit={handleSavePlan} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Plan Name</label>
                                                <input
                                                    type="text"
                                                    value={editingPlan.name}
                                                    onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Badge</label>
                                                <input
                                                    type="text"
                                                    value={editingPlan.badge}
                                                    onChange={e => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Single Event Rate</label>
                                                <input
                                                    type="text"
                                                    value={editingPlan.monthlyPrice}
                                                    onChange={e => setEditingPlan({ ...editingPlan, monthlyPrice: e.target.value })}
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    placeholder="$1,299"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Tour Rate (Save 20%)</label>
                                                <input
                                                    type="text"
                                                    value={editingPlan.yearlyPrice}
                                                    onChange={e => setEditingPlan({ ...editingPlan, yearlyPrice: e.target.value })}
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                    placeholder="$1,039"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-300 mb-1">Theme Accent</label>
                                                <select
                                                    value={editingPlan.theme || 'standard'}
                                                    onChange={e => setEditingPlan({ ...editingPlan, theme: e.target.value })}
                                                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                >
                                                    <option value="standard">Standard</option>
                                                    <option value="silver">Silver Glow</option>
                                                    <option value="gold">Gold VIP</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* MULTI-VIDEO MANAGEMENT SECTION IN EDIT MODAL */}
                                        <div className="p-4 bg-black/40 border border-[#f70776]/30 rounded-2xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                                                    <span>🎬</span> Card Videos (4 to 5 Continuous Autoplay Feeds)
                                                </label>
                                                <span className="text-[10px] text-[#f70776] font-semibold">
                                                    {(editingPlan.videos || (editingPlan.videoUrl ? [editingPlan.videoUrl] : [])).length} Videos Configured
                                                </span>
                                            </div>

                                            {/* List of Video URLs */}
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                {(editingPlan.videos && editingPlan.videos.length > 0
                                                    ? editingPlan.videos
                                                    : editingPlan.videoUrl ? [editingPlan.videoUrl] : ['']
                                                ).map((vUrl, vIdx) => (
                                                    <div key={vIdx} className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-gray-400 w-4">#{vIdx + 1}</span>
                                                        <input
                                                            type="url"
                                                            value={vUrl}
                                                            onChange={e => {
                                                                const currentList = editingPlan.videos && editingPlan.videos.length > 0
                                                                    ? [...editingPlan.videos]
                                                                    : [editingPlan.videoUrl || ''];
                                                                currentList[vIdx] = e.target.value;
                                                                setEditingPlan({
                                                                    ...editingPlan,
                                                                    videos: currentList,
                                                                    videoUrl: currentList[0] || ''
                                                                });
                                                            }}
                                                            placeholder={`Video URL #${vIdx + 1} (e.g. https://assets.mixkit.co/...mp4)`}
                                                            className="flex-1 px-3 py-1.5 bg-black/60 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#f70776]"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const currentList = editingPlan.videos && editingPlan.videos.length > 0
                                                                    ? [...editingPlan.videos]
                                                                    : [editingPlan.videoUrl || ''];
                                                                const updated = currentList.filter((_, idx) => idx !== vIdx);
                                                                setEditingPlan({
                                                                    ...editingPlan,
                                                                    videos: updated,
                                                                    videoUrl: updated[0] || ''
                                                                });
                                                            }}
                                                            className="px-2 py-1 bg-red-900/30 hover:bg-red-800/60 text-red-300 rounded-lg text-xs cursor-pointer"
                                                            title="Remove this video"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const currentList = editingPlan.videos && editingPlan.videos.length > 0
                                                            ? [...editingPlan.videos]
                                                            : editingPlan.videoUrl ? [editingPlan.videoUrl] : [];
                                                        setEditingPlan({
                                                            ...editingPlan,
                                                            videos: [...currentList, '']
                                                        });
                                                    }}
                                                    className="px-3 py-1.5 bg-[#2B2323] hover:bg-[#f70776]/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <span>+</span> Add Another Video URL
                                                </button>

                                                {/* Pick from Vault/Gallery Videos */}
                                                {mediaList.filter(m => m.type === 'video').length > 0 && (
                                                    <select
                                                        onChange={e => {
                                                            if (e.target.value) {
                                                                const currentList = editingPlan.videos && editingPlan.videos.length > 0
                                                                    ? [...editingPlan.videos]
                                                                    : editingPlan.videoUrl ? [editingPlan.videoUrl] : [];
                                                                const updated = [...currentList, e.target.value];
                                                                setEditingPlan({
                                                                    ...editingPlan,
                                                                    videos: updated,
                                                                    videoUrl: updated[0] || ''
                                                                });
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                        className="px-2.5 py-1.5 bg-black/80 border border-gray-800 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-[#f70776]"
                                                    >
                                                        <option value="">+ Insert from Vault...</option>
                                                        {mediaList.filter(m => m.type === 'video').map(v => (
                                                            <option key={v.id} value={v.url}>
                                                                {v.title} ({v.category || 'General'})
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>

                                            {/* Mini Live Preview Track */}
                                            {(editingPlan.videos || (editingPlan.videoUrl ? [editingPlan.videoUrl] : [])).filter(Boolean).length > 0 && (
                                                <div className="pt-2 border-t border-gray-800">
                                                    <span className="text-[10px] font-semibold text-gray-400 block mb-1.5">Live Preview Carousel:</span>
                                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                                        {(editingPlan.videos || (editingPlan.videoUrl ? [editingPlan.videoUrl] : [])).filter(Boolean).map((vSrc, pIdx) => (
                                                            <div key={pIdx} className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0 border border-white/20 bg-black">
                                                                <video
                                                                    src={vSrc}
                                                                    className="w-full h-full object-cover"
                                                                    muted
                                                                    loop
                                                                    autoPlay
                                                                    playsInline
                                                                />
                                                                <span className="absolute top-1 left-1 text-[8px] bg-black/80 text-white px-1 rounded">
                                                                    Cam #{pIdx + 1}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">Plan Description</label>
                                            <textarea
                                                rows="2"
                                                value={editingPlan.desc}
                                                onChange={e => setEditingPlan({ ...editingPlan, desc: e.target.value })}
                                                className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f70776]"
                                                required
                                            />
                                        </div>

                                        {/* Features List Editor with Toggles */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-xs font-semibold text-gray-300">Feature Capabilities & Inclusions</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const feats = editingPlan.features || [];
                                                        setEditingPlan({
                                                            ...editingPlan,
                                                            features: [...feats, { text: 'New Feature Item', included: true }]
                                                        });
                                                    }}
                                                    className="text-[11px] text-[#f70776] hover:underline font-bold cursor-pointer"
                                                >
                                                    + Add Feature
                                                </button>
                                            </div>

                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                {editingPlan.features?.map((feat, fIdx) => (
                                                    <div key={fIdx} className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-gray-800">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = [...editingPlan.features];
                                                                updated[fIdx].included = !updated[fIdx].included;
                                                                setEditingPlan({ ...editingPlan, features: updated });
                                                            }}
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${feat.included ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}
                                                            title="Toggle included/excluded"
                                                        >
                                                            {feat.included ? 'Included' : 'Excluded'}
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={feat.text}
                                                            onChange={e => {
                                                                const updated = [...editingPlan.features];
                                                                updated[fIdx].text = e.target.value;
                                                                setEditingPlan({ ...editingPlan, features: updated });
                                                            }}
                                                            className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = editingPlan.features.filter((_, idx) => idx !== fIdx);
                                                                setEditingPlan({ ...editingPlan, features: updated });
                                                            }}
                                                            className="text-red-400 hover:text-red-300 text-xs px-1 cursor-pointer"
                                                            title="Remove feature"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2323]">
                                            <button
                                                type="button"
                                                onClick={() => setEditingPlan(null)}
                                                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-gray-700 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSavingPlan}
                                                className="px-6 py-2 rounded-xl bg-[#f70776] hover:bg-[#c3195d] text-white text-xs font-bold shadow-lg shadow-[#f70776]/25 transition-all disabled:opacity-50 cursor-pointer"
                                            >
                                                {isSavingPlan ? 'Saving...' : 'Save & Publish Live'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 5: CLIENT BOOKING INQUIRIES */}
                {activeTab === 'inquiries' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#2B2323] pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>📥</span> Client Inquiries & Booking Requests
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    Direct leads submitted from the Soundscape website contact form.
                                </p>
                            </div>
                            <button
                                onClick={fetchInquiries}
                                className="px-3 py-1.5 bg-[#1C1717] hover:bg-[#2B2323] border border-[#2B2323] text-gray-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <span>↻</span> Refresh Inquiries
                            </button>
                        </div>

                        {isLoadingInquiries ? (
                            <div className="text-center py-20 bg-[#141010] border border-[#c3195d]/20 rounded-2xl">
                                <div className="w-8 h-8 border-2 border-[#f70776] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-gray-400 text-xs">Loading inquiries from server...</p>
                            </div>
                        ) : inquiries.length === 0 ? (
                            <div className="text-center py-20 bg-[#141010] border border-[#2B2323] rounded-3xl space-y-3">
                                <div className="text-4xl">📬</div>
                                <h4 className="text-base font-bold text-white">No Inquiries Received Yet</h4>
                                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                    When clients submit the booking inquiry form on your website, their requests will appear here instantly.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {inquiries.map((inq) => (
                                    <div
                                        key={inq.id}
                                        className="bg-[#1C1717] border border-[#2B2323] hover:border-[#f70776]/40 rounded-3xl p-6 shadow-xl space-y-4 transition-all"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h4 className="text-lg font-black text-white">{inq.fullName}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f70776]/20 text-[#f70776] border border-[#f70776]/30 px-2.5 py-0.5 rounded-full">
                                                        {inq.eventType || 'Event'}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400">
                                                        {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : 'Recent'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteInquiry(inq.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                                                title="Delete Inquiry"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {/* Contact Badges */}
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <a
                                                href={`mailto:${inq.email}`}
                                                className="px-3 py-1 bg-black/40 border border-gray-800 hover:border-[#f70776]/60 rounded-xl text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
                                            >
                                                <span>✉️</span> {inq.email}
                                            </a>
                                            {inq.phone && (
                                                <a
                                                    href={`tel:${inq.phone}`}
                                                    className="px-3 py-1 bg-black/40 border border-gray-800 hover:border-[#f70776]/60 rounded-xl text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
                                                >
                                                    <span>📞</span> {inq.phone}
                                                </a>
                                            )}
                                        </div>

                                        {/* Required Services */}
                                        {Array.isArray(inq.services) && inq.services.length > 0 && (
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Required Services:</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {inq.services.map((srv, sIdx) => (
                                                        <span key={sIdx} className="text-[10px] font-semibold bg-[#2B2323] text-gray-300 px-2 py-0.5 rounded-md">
                                                            {srv}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Message Body */}
                                        {inq.message && (
                                            <div className="p-3 bg-black/40 border border-gray-800 rounded-xl text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                {inq.message}
                                            </div>
                                        )}

                                        {/* Action Bar */}
                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2B2323]">
                                            {inq.phone && (
                                                <a
                                                    href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${inq.fullName}, thank you for contacting Soundscape! We received your booking request for ${inq.eventType}.`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                                                >
                                                    <span>💬 WhatsApp</span>
                                                </a>
                                            )}
                                            <a
                                                href={`mailto:${inq.email}?subject=${encodeURIComponent(`Soundscape Booking: ${inq.eventType}`)}`}
                                                className="px-4 py-1.5 bg-[#f70776] hover:bg-[#c3195d] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                                            >
                                                <span>Reply via Email</span>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MediaManager;