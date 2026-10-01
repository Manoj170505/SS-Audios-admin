import React, { useState, useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ss-audios-backend.vercel.app/api';

const DEFAULT_CATEGORIES = [
    "Wedding",
    "Orchestra",
    "Audios&Lightings",
    "Corporate & Colleges",
    "Welcome Dance",
    "DJ Events",
    "Instrumentals",
    "Raga Studio",
    "Sampoorna Academy"
];

const isImageMedia = (url) => {
    if (!url || typeof url !== 'string') return false;
    const clean = url.split('?')[0].toLowerCase();
    return /\.(jpe?g|png|gif|webp|svg|bmp|avif|tiff)$/i.test(clean) || clean.includes('images.unsplash.com') || clean.includes('format=');
};

const isVideoMedia = (url) => {
    if (!url || typeof url !== 'string') return false;
    const clean = url.split('?')[0].toLowerCase();
    return /\.(mp4|webm|ogg|mov|m4v|mkv)$/i.test(clean) || clean.includes('assets.mixkit.co/videos') || (!isImageMedia(url) && !url.endsWith('/'));
};

const MediaManager = ({ onLogout }) => {
    // Navigation Tabs: 'gallery' | 'add' | 'services' | 'plans' | 'inquiries'
    const [activeTab, setActiveTab] = useState('gallery');
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [mediaTypeFilter, setMediaTypeFilter] = useState('all'); // 'all' | 'image' | 'video'

    // Server & notification state
    const [serverStatus, setServerStatus] = useState('checking'); // 'online' | 'fallback' | 'checking'
    const [notification, setNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Data lists
    const [mediaList, setMediaList] = useState([]);
    const [services, setServices] = useState([]);
    const [plans, setPlans] = useState([]);
    const [inquiries, setInquiries] = useState([]);

    // Service filter
    const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All');

    // Loading states
    const [isSavingService, setIsSavingService] = useState(false);
    const [isSavingPlan, setIsSavingPlan] = useState(false);
    const [isUploadingServiceImage, setIsUploadingServiceImage] = useState(false);
    const [isUploadingPlanMedia, setIsUploadingPlanMedia] = useState(false);
    const [isDirectUploading, setIsDirectUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Upload & URL inputs
    const [planMediaUrlInput, setPlanMediaUrlInput] = useState('');
    const [editPlanMediaUrlInput, setEditPlanMediaUrlInput] = useState('');
    const [quickMediaUrlInput, setQuickMediaUrlInput] = useState('');

    // Editing modal states
    const [editingMedia, setEditingMedia] = useState(null);
    const [editingService, setEditingService] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);
    const [previewMediaModal, setPreviewMediaModal] = useState(null);

    // Create modal states
    const [isAddingService, setIsAddingService] = useState(false);
    const [newService, setNewService] = useState({
        title: '',
        category: 'DJ Events',
        price: '₹25,000',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600',
        description: 'Electrifying DJ and live remix performance designed to keep the crowd energetic and dance floors packed all night.',
        featuresStr: 'Live Stem Remixing\nFestival-Grade Sound Array\nSynchronized Visuals\nDedicated Sound Tech'
    });

    const [isAddingPlan, setIsAddingPlan] = useState(false);
    const [newPlan, setNewPlan] = useState({
        name: '',
        badge: 'SPECIAL TIER',
        price: '₹25,000',
        monthlyPrice: '₹25,000',
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

    // Upload Form State (Tab 2)
    const [uploadFormData, setUploadFormData] = useState({
        title: '',
        category: 'Wedding',
        customCategory: '',
        type: 'image',
        selectedFile: null,
        filePreview: null
    });

    // Notification toast helper
    const showNotification = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3500);
    };

    // Prevent background page scrolling when any modal is active
    useEffect(() => {
        const hasOpenModal = Boolean(
            isAddingService ||
            editingService ||
            isAddingPlan ||
            editingPlan ||
            previewMediaModal ||
            editingMedia
        );

        if (hasOpenModal) {
            const originalOverflow = document.body.style.overflow;
            const originalTouchAction = document.body.style.touchAction;
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';

            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.touchAction = originalTouchAction;
            };
        }
    }, [isAddingService, editingService, isAddingPlan, editingPlan, previewMediaModal, editingMedia]);

    // -------------------------------------------------------------
    // INITIAL FETCH DATA
    // -------------------------------------------------------------
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchMedia(),
            fetchServices(),
            fetchPlans(),
            fetchInquiries()
        ]);
        setIsLoading(false);
    };

    const fetchMedia = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/media`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setMediaList(data.data);
                setServerStatus('online');
            } else {
                setServerStatus('fallback');
            }
        } catch (err) {
            console.warn('API /media fallback:', err.message);
            setServerStatus('fallback');
        }
    };

    const fetchServices = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/services`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setServices(data.data);
            }
        } catch (err) {
            console.warn('API /services fallback:', err.message);
        }
    };

    const fetchPlans = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/plans`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setPlans(data.data);
            }
        } catch (err) {
            console.warn('API /plans fallback:', err.message);
        }
    };

    const fetchInquiries = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/inquiries`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setInquiries(data.data);
            }
        } catch (err) {
            console.warn('API /inquiries fallback:', err.message);
        }
    };

    // -------------------------------------------------------------
    // FILE UPLOAD HELPER (Direct multipart upload)
    // -------------------------------------------------------------
    const handleUploadMediaFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'Uploaded');
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

        const res = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.success && data.data?.url) {
            return data.data.url;
        } else if (data.url) {
            return data.url;
        } else {
            throw new Error(data.message || 'File upload failed');
        }
    };

    // -------------------------------------------------------------
    // DIRECT GALLERY MEDIA HANDLERS
    // -------------------------------------------------------------
    const handleDirectUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFormData.selectedFile && !quickMediaUrlInput.trim()) {
            alert('Please select a file to upload or enter a media URL.');
            return;
        }

        setIsDirectUploading(true);
        setUploadProgress(20);

        try {
            let mediaUrl = quickMediaUrlInput.trim();
            const finalCategory = uploadFormData.category === 'Custom'
                ? (uploadFormData.customCategory.trim() || 'General')
                : uploadFormData.category;

            if (uploadFormData.selectedFile) {
                setUploadProgress(50);
                const formData = new FormData();
                formData.append('file', uploadFormData.selectedFile);
                formData.append('title', uploadFormData.title.trim() || uploadFormData.selectedFile.name);
                formData.append('category', finalCategory);
                formData.append('type', uploadFormData.type);

                const res = await fetch(`${API_BASE_URL}/upload`, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    showNotification('Media asset uploaded and published to gallery!');
                    setUploadFormData({
                        title: '',
                        category: 'Wedding',
                        customCategory: '',
                        type: 'image',
                        selectedFile: null,
                        filePreview: null
                    });
                    setQuickMediaUrlInput('');
                    fetchMedia();
                    setActiveTab('gallery');
                    return;
                } else {
                    throw new Error(data.message || 'Upload failed');
                }
            } else if (mediaUrl) {
                // Post as URL media
                setUploadProgress(70);
                const res = await fetch(`${API_BASE_URL}/media`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: uploadFormData.title.trim() || 'Media Item',
                        category: finalCategory,
                        type: uploadFormData.type,
                        url: mediaUrl,
                        createdAt: new Date().toISOString()
                    })
                });
                const data = await res.json();
                if (data.success) {
                    showNotification('Media URL added to gallery!');
                    setUploadFormData({
                        title: '',
                        category: 'Wedding',
                        customCategory: '',
                        type: 'image',
                        selectedFile: null,
                        filePreview: null
                    });
                    setQuickMediaUrlInput('');
                    fetchMedia();
                    setActiveTab('gallery');
                } else {
                    throw new Error(data.message || 'Failed to save media URL');
                }
            }
        } catch (err) {
            console.error('Upload Error:', err);
            alert('Upload failed: ' + err.message);
        } finally {
            setIsDirectUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDeleteMedia = async (item) => {
        if (!window.confirm(`Are you sure you want to delete "${item.title || 'this media item'}"?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/media/${item.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setMediaList(prev => prev.filter(m => m.id !== item.id));
                showNotification('Media item removed.');
            } else {
                alert(data.message || 'Failed to delete media');
            }
        } catch (err) {
            console.error('Delete media error:', err);
            alert('Error deleting media from server.');
        }
    };

    const handleUpdateMedia = async (e) => {
        e.preventDefault();
        if (!editingMedia) return;
        try {
            const res = await fetch(`${API_BASE_URL}/media/${editingMedia.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingMedia)
            });
            const data = await res.json();
            if (data.success) {
                setMediaList(prev => prev.map(m => m.id === editingMedia.id ? data.data : m));
                setEditingMedia(null);
                showNotification('Media updated successfully!');
            } else {
                alert(data.message || 'Failed to update media');
            }
        } catch (err) {
            alert('Error updating media');
        }
    };

    // -------------------------------------------------------------
    // SERVICES & COURSES HANDLERS
    // -------------------------------------------------------------
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
                .filter(Boolean);

            const payload = {
                title: newService.title,
                category: newService.category || 'DJ Events',
                price: newService.price || '₹25,000',
                image: newService.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600',
                description: newService.description || '',
                features: features.length > 0 ? features : ['Live Performance', 'High-End Audio Setup']
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
                    category: 'DJ Events',
                    price: '₹25,000',
                    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600',
                    description: 'Electrifying DJ and live remix performance designed to keep the crowd energetic and dance floors packed all night.',
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
            const res = await fetch(`${API_BASE_URL}/services/${service.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setServices(prev => prev.filter(s => s.id !== service.id));
                showNotification(`Service "${service.title}" deleted.`);
            } else {
                alert(data.message || 'Failed to delete service');
            }
        } catch (err) {
            console.error('Delete service error:', err);
            alert('Error deleting service.');
        }
    };

    const handleResetServices = async () => {
        if (!window.confirm('Reset all signature DJ, Studio & Academy services to defaults?')) return;
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

    // -------------------------------------------------------------
    // PRICING PLANS HANDLERS
    // -------------------------------------------------------------
    const handleCreatePlan = async (e) => {
        e.preventDefault();
        if (!newPlan.name) {
            alert('Please provide a plan name');
            return;
        }
        setIsSavingPlan(true);
        try {
            const planPrice = (newPlan.price || newPlan.monthlyPrice || '₹25,000').trim();
            const validVideos = (newPlan.videos || []).filter(Boolean);
            const payload = {
                ...newPlan,
                price: planPrice,
                monthlyPrice: planPrice,
                videos: validVideos.length > 0 ? validVideos : [newPlan.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-dj-playing-music-at-a-party-41338-large.mp4']
            };

            const res = await fetch(`${API_BASE_URL}/plans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setPlans(prev => [...prev, data.data]);
                setIsAddingPlan(false);
                setNewPlan({
                    name: '',
                    badge: 'SPECIAL TIER',
                    price: '₹25,000',
                    monthlyPrice: '₹25,000',
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
            alert('Error saving pricing plan.');
        } finally {
            setIsSavingPlan(false);
        }
    };

    const handleDeletePlan = async (plan) => {
        const planId = plan.id || plan.name;
        if (!window.confirm(`Are you sure you want to delete the pricing plan "${plan.name}"?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/plans/${planId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setPlans(prev => prev.filter(p => (p.id !== plan.id && p.name !== plan.name)));
                showNotification(`Pricing plan "${plan.name}" deleted.`);
            } else {
                alert(data.message || 'Failed to delete plan');
            }
        } catch (err) {
            console.error('Delete plan error:', err);
            alert('Error deleting plan.');
        }
    };

    const handleResetPlans = async () => {
        if (!window.confirm('Reset all event pricing plans to defaults?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/plans/reset`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setPlans(data.data);
                showNotification('All pricing plans reset to defaults!');
            }
        } catch (err) {
            alert('Failed to reset plans');
        }
    };

    // -------------------------------------------------------------
    // INQUIRIES HANDLERS
    // -------------------------------------------------------------
    const handleDeleteInquiry = async (id) => {
        if (!window.confirm('Are you sure you want to remove this inquiry?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/inquiries/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setInquiries(prev => prev.filter(i => i.id !== id));
                showNotification('Inquiry removed.');
            }
        } catch (err) {
            alert('Failed to delete inquiry');
        }
    };

    // -------------------------------------------------------------
    // FILTERED LISTS
    // -------------------------------------------------------------
    const filteredMedia = mediaList.filter(item => {
        const matchCat = filterCategory === 'All' || item.category === filterCategory;
        const matchSearch = !searchQuery || (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) || (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
        const isImg = isImageMedia(item.url || item.key);
        const matchType = mediaTypeFilter === 'all'
            ? true
            : mediaTypeFilter === 'image' ? isImg : !isImg;
        return matchCat && matchSearch && matchType;
    });

    const filteredServices = services.filter(service => {
        if (serviceCategoryFilter === 'All') return true;
        if (serviceCategoryFilter === 'DJ Events') return !service.category || service.category === 'DJ Events' || service.category === 'Audios&Lightings';
        if (serviceCategoryFilter === 'Raga Studio') return service.category === 'Raga Studio';
        if (serviceCategoryFilter === 'Sampoorna Academy') return service.category === 'Sampoorna Academy';
        return service.category === serviceCategoryFilter;
    });

    // Stats calculations
    const stats = {
        totalMedia: mediaList.length,
        totalServices: services.length,
        totalPlans: plans.length,
        totalInquiries: inquiries.length
    };

    return (
        <div className="min-h-screen bg-[#000000] text-gray-100 flex flex-col font-sans pb-24 md:pb-10 selection:bg-[#FF5D16] selection:text-white">
            {/* Custom Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FF5D16]/10 rounded-full blur-[140px] transform -translate-y-1/2"></div>
                <div className="absolute bottom-1/3 right-10 w-[450px] h-[450px] bg-[#FF8A00]/10 rounded-full blur-[140px]"></div>
                <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-[#6366F1]/10 rounded-full blur-[120px]"></div>
            </div>

            {/* FLOATING TOAST NOTIFICATION */}
            {notification && (
                <div className="fixed top-5 right-5 z-[200] max-w-sm w-full animate-bounce">
                    <div className="bg-[#0c0c0c] border border-[#FF5D16] text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
                        <span className="text-xl">✨</span>
                        <p className="text-xs font-semibold flex-1">{notification.msg}</p>
                        <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-white text-sm font-bold">✕</button>
                    </div>
                </div>
            )}

            {/* TOP HEADER */}
            <header className="sticky top-0 z-40 bg-[#000000]/90 backdrop-blur-xl border-b border-[#1a1a1a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center">
                            <div className="bg-[#FDFDFC] p-1.5 rounded-xl shadow-[0_0_15px_rgba(255,93,22,0.35)] flex items-center justify-center">
                                <img
                                    src="/ss-audios-logo.png"
                                    alt="SS Audios"
                                    className="h-7 sm:h-8 w-auto object-contain"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-white">
                                    SS AUDIOS & DJ EVENTS
                                </h1>
                                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-[#FF5D16]/20 text-[#FF5D16] border border-[#FF5D16]/40 rounded-full">
                                    Admin Studio
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                                <span className="text-[11px] text-gray-400 font-medium">
                                    {serverStatus === 'online' ? 'Cloud Synced' : 'Ready (Local Cache)'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions & Profile */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <a
                            href="http://localhost:5173/"
                            target="_blank"
                            rel="noreferrer"
                            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-all"
                        >
                            <span>🌐</span> Live Client Site ↗
                        </a>

                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c0c0c] border border-[#222222]">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF5D16] to-[#E04B0A] flex items-center justify-center text-[10px] font-bold text-white">
                                SS
                            </div>
                            <span className="text-xs font-semibold text-gray-300">ssaudios25</span>
                        </div>

                        <button
                            onClick={onLogout}
                            className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>🚪</span> Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1 z-10">
                {/* DASHBOARD STATS ROW */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
                    <div
                        onClick={() => setActiveTab('gallery')}
                        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer ${activeTab === 'gallery' ? 'bg-[#0c0c0c] border-[#FF5D16]/60 shadow-lg shadow-[#FF5D16]/10' : 'bg-[#0c0c0c] border-[#202020] hover:border-[#FF5D16]/30'}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-2xl sm:text-3xl">📸</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Media Vault</span>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalMedia}</span>
                            <p className="text-[11px] text-gray-400 mt-0.5">Photos & Videos in Gallery</p>
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveTab('services')}
                        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer ${activeTab === 'services' ? 'bg-[#0c0c0c] border-[#FF5D16]/60 shadow-lg shadow-[#FF5D16]/10' : 'bg-[#0c0c0c] border-[#202020] hover:border-[#FF5D16]/30'}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-2xl sm:text-3xl">🎛️</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Services & Courses</span>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalServices}</span>
                            <p className="text-[11px] text-gray-400 mt-0.5">DJ, Studio & Academy Offerings</p>
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveTab('plans')}
                        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer ${activeTab === 'plans' ? 'bg-[#0c0c0c] border-[#FF5D16]/60 shadow-lg shadow-[#FF5D16]/10' : 'bg-[#0c0c0c] border-[#202020] hover:border-[#FF5D16]/30'}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-2xl sm:text-3xl">⚡</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Event Tiers</span>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalPlans}</span>
                            <p className="text-[11px] text-gray-400 mt-0.5">Custom Pricing Packages</p>
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveTab('inquiries')}
                        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer ${activeTab === 'inquiries' ? 'bg-[#0c0c0c] border-[#FF5D16]/60 shadow-lg shadow-[#FF5D16]/10' : 'bg-[#0c0c0c] border-[#202020] hover:border-[#FF5D16]/30'}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-2xl sm:text-3xl">📬</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Client Inquiries</span>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalInquiries}</span>
                            <p className="text-[11px] text-gray-400 mt-0.5">Direct Booking Requests</p>
                        </div>
                    </div>
                </div>

                {/* DESKTOP / TABLET SEGMENTED TAB BAR */}
                <div className="flex items-center gap-2 p-1.5 bg-[#000000] border border-[#202020] rounded-2xl mb-6 overflow-x-auto scrollbar-none">
                    <button
                        onClick={() => setActiveTab('gallery')}
                        className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'gallery' ? 'bg-[#FF5D16] text-white shadow-lg shadow-[#FF5D16]/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span>📸</span> Gallery & Media
                    </button>
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'add' ? 'bg-[#FF5D16] text-white shadow-lg shadow-[#FF5D16]/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span>🚀</span> Quick Upload
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'services' ? 'bg-[#FF5D16] text-white shadow-lg shadow-[#FF5D16]/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span>🎛️</span> Services & Academy ({services.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'plans' ? 'bg-[#FF5D16] text-white shadow-lg shadow-[#FF5D16]/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span>🎚️</span> Pricing Packages ({plans.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('inquiries')}
                        className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'inquiries' ? 'bg-[#FF5D16] text-white shadow-lg shadow-[#FF5D16]/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <span>📬</span> Inquiries ({inquiries.length})
                    </button>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* TAB 1: GALLERY & MEDIA VAULT */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'gallery' && (
                    <div className="space-y-6">
                        {/* Control bar: Search + Category filter + Type filter */}
                        <div className="bg-[#0c0c0c] p-4 sm:p-5 rounded-3xl border border-[#202020] space-y-4">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search media by title or tag..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-[#000000] border border-[#222222] rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5D16]"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Media Type Filter (All / Images / Videos) */}
                                <div className="flex items-center gap-1 bg-[#000000] p-1 border border-[#222222] rounded-2xl shrink-0">
                                    <button
                                        onClick={() => setMediaTypeFilter('all')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${mediaTypeFilter === 'all' ? 'bg-[#FF5D16] text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setMediaTypeFilter('image')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${mediaTypeFilter === 'image' ? 'bg-[#FF5D16] text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        🖼️ Images
                                    </button>
                                    <button
                                        onClick={() => setMediaTypeFilter('video')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${mediaTypeFilter === 'video' ? 'bg-[#FF5D16] text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        🎬 Videos
                                    </button>
                                </div>

                                <button
                                    onClick={fetchMedia}
                                    className="px-4 py-2.5 bg-[#0c0c0c] hover:bg-[#202020] border border-[#222222] rounded-2xl text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                                >
                                    <span>↻</span> Refresh
                                </button>
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                <button
                                    onClick={() => setFilterCategory('All')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${filterCategory === 'All' ? 'bg-[#FF5D16] text-white shadow-md shadow-[#FF5D16]/20' : 'bg-[#000000] text-gray-400 hover:text-white border border-[#222222]'}`}
                                >
                                    All Categories ({mediaList.length})
                                </button>
                                {DEFAULT_CATEGORIES.map((cat, idx) => {
                                    const count = mediaList.filter(m => m.category === cat).length;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setFilterCategory(cat)}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${filterCategory === cat ? 'bg-[#FF5D16] text-white shadow-md shadow-[#FF5D16]/20' : 'bg-[#000000] text-gray-400 hover:text-white border border-[#222222]'}`}
                                        >
                                            {cat} {count > 0 && `(${count})`}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Gallery Media Grid */}
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-3">
                                <div className="w-10 h-10 border-4 border-[#FF5D16] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-xs text-gray-400 font-semibold">Loading media assets...</p>
                            </div>
                        ) : filteredMedia.length === 0 ? (
                            <div className="bg-[#0c0c0c] border border-[#202020] rounded-3xl p-12 text-center space-y-3">
                                <span className="text-4xl">📂</span>
                                <h3 className="text-base font-bold text-white">No media found in this category</h3>
                                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                    Upload photos and videos for this category or select "All Categories".
                                </p>
                                <button
                                    onClick={() => setActiveTab('add')}
                                    className="px-5 py-2.5 bg-[#FF5D16] hover:bg-[#E04B0A] text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                                >
                                    + Upload Media Now
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                                {filteredMedia.map((item) => {
                                    const isImg = isImageMedia(item.url || item.key);
                                    return (
                                        <div
                                            key={item.id || item.key}
                                            className="group bg-[#0c0c0c] rounded-2xl sm:rounded-3xl border border-[#202020] hover:border-[#FF5D16]/50 overflow-hidden shadow-lg transition-all flex flex-col justify-between"
                                        >
                                            {/* Media Box */}
                                            <div
                                                onClick={() => setPreviewMediaModal(item)}
                                                className="relative aspect-video sm:aspect-square bg-black overflow-hidden cursor-pointer"
                                            >
                                                {isImg ? (
                                                    <img
                                                        src={item.url}
                                                        alt={item.title || 'Gallery item'}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <video
                                                        src={item.url}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                        loop
                                                        playsInline
                                                        onMouseEnter={(e) => e.target.play().catch(() => { })}
                                                        onMouseLeave={(e) => e.target.pause()}
                                                    />
                                                )}

                                                {/* Top Badges */}
                                                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider ${isImg ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40' : 'bg-pink-950/90 text-pink-300 border border-pink-500/40'}`}>
                                                        {isImg ? 'IMAGE' : 'VIDEO'}
                                                    </span>
                                                </div>

                                                <div className="absolute top-2 right-2">
                                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/80 text-gray-300 border border-white/10 backdrop-blur-sm">
                                                        {item.category || 'General'}
                                                    </span>
                                                </div>

                                                {/* Hover Overlay preview indicator */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="px-3 py-1 bg-black/70 border border-white/20 rounded-xl text-xs font-semibold text-white">
                                                        🔍 Preview
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Details & Actions */}
                                            <div className="p-3.5 space-y-2">
                                                <h4 className="text-xs font-bold text-white truncate">
                                                    {item.title || 'Untitled Asset'}
                                                </h4>

                                                <div className="flex items-center justify-between pt-2 border-t border-[#202020]">
                                                    <button
                                                        onClick={() => setEditingMedia(item)}
                                                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                                                    >
                                                        ✏️ Edit Tag
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMedia(item)}
                                                        className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 2: DIRECT UPLOAD & MEDIA PUBLISHER */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'add' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-[#0c0c0c] border border-[#202020] rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl">
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                                    <span>🚀</span> Direct Media Publisher
                                </h2>
                                <p className="text-gray-400 text-xs mt-1">
                                    Upload event photos, stage lighting videos, or link high-resolution showcase URLs to the live client gallery.
                                </p>
                            </div>

                            <form onSubmit={handleDirectUploadSubmit} className="space-y-5">
                                {/* Drag & Drop or Browse Box */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">
                                        Select Media File
                                    </label>
                                    <label className="border-2 border-dashed border-[#222222] hover:border-[#FF5D16] rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#000000]/60 hover:bg-[#000000] group">
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const isVid = file.type.startsWith('video');
                                                    setUploadFormData(prev => ({
                                                        ...prev,
                                                        selectedFile: file,
                                                        type: isVid ? 'video' : 'image',
                                                        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
                                                        filePreview: URL.createObjectURL(file)
                                                    }));
                                                }
                                            }}
                                        />
                                        {uploadFormData.filePreview ? (
                                            <div className="space-y-3 text-center">
                                                <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto bg-black border border-white/20">
                                                    {uploadFormData.type === 'video' ? (
                                                        <video src={uploadFormData.filePreview} className="w-full h-full object-cover" muted autoPlay loop />
                                                    ) : (
                                                        <img src={uploadFormData.filePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-[#FF5D16]">
                                                    {uploadFormData.selectedFile?.name}
                                                </p>
                                                <span className="text-[10px] text-gray-400">Click to change file</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 text-center">
                                                <span className="text-3xl group-hover:scale-110 transition-transform inline-block">📁</span>
                                                <p className="text-xs sm:text-sm font-bold text-gray-200">
                                                    Drag & drop photo or video here, or <span className="text-[#FF5D16] underline">browse files</span>
                                                </p>
                                                <p className="text-[11px] text-gray-500">
                                                    Supports JPG, PNG, WEBP, MP4, MOV (Up to 100MB)
                                                </p>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                {/* OR Direct Media URL Input */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1 uppercase tracking-wider">
                                        Or External Media URL
                                    </label>
                                    <input
                                        type="url"
                                        value={quickMediaUrlInput}
                                        onChange={(e) => setQuickMediaUrlInput(e.target.value)}
                                        placeholder="https://images.unsplash.com/... or https://assets.mixkit.co/..."
                                        className="w-full px-3.5 py-2.5 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                    />
                                </div>

                                {/* Title & Category Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-300 mb-1">
                                            Asset Title
                                        </label>
                                        <input
                                            type="text"
                                            value={uploadFormData.title}
                                            onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                                            placeholder="e.g. Royal Palace Wedding DJ Setup"
                                            className="w-full px-3.5 py-2.5 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-300 mb-1">
                                            Target Gallery Category
                                        </label>
                                        <select
                                            value={uploadFormData.category}
                                            onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                        >
                                            {DEFAULT_CATEGORIES.map((cat, i) => (
                                                <option key={i} value={cat}>{cat}</option>
                                            ))}
                                            <option value="Custom">+ Custom Category</option>
                                        </select>
                                    </div>
                                </div>

                                {uploadFormData.category === 'Custom' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-300 mb-1">
                                            Custom Category Name
                                        </label>
                                        <input
                                            type="text"
                                            value={uploadFormData.customCategory}
                                            onChange={(e) => setUploadFormData({ ...uploadFormData, customCategory: e.target.value })}
                                            placeholder="e.g. Sangeet & Haldi Night"
                                            className="w-full px-3.5 py-2.5 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                            required
                                        />
                                    </div>
                                )}

                                {/* Progress Bar */}
                                {isDirectUploading && (
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>Uploading asset to cloud vault...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-[#222222] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#FF5D16] to-[#FF8A00] transition-all duration-300"
                                                style={{ width: `${uploadProgress || 60}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={isDirectUploading}
                                    className="w-full py-3.5 rounded-2xl bg-[#FF5D16] hover:bg-[#E04B0A] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-[#FF5D16]/25 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {isDirectUploading ? 'Publishing Asset...' : 'Upload & Publish to Live Gallery'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 3: SERVICES, STUDIO & ACADEMY MANAGER */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'services' && (
                    <div className="space-y-6">
                        {/* Header Box */}
                        <div className="bg-[#0c0c0c] p-4 sm:p-6 rounded-3xl border border-[#202020] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                                    <span>🎛️</span> Services, Studio & Academy Offerings
                                </h2>
                                <p className="text-gray-400 text-xs mt-1">
                                    Manage DJ event packages, Raga Studio session modules, and Sampoorna Academy courses.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsAddingService(true)}
                                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-[#FF5D16] hover:bg-[#E04B0A] text-white text-xs font-bold shadow-lg shadow-[#FF5D16]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <span>+</span> Add Offering
                                </button>
                                <button
                                    onClick={fetchServices}
                                    className="px-3.5 py-2.5 rounded-2xl bg-[#000000] border border-[#222222] text-gray-300 hover:text-white text-xs font-semibold cursor-pointer"
                                >
                                    ↻ Refresh
                                </button>
                                <button
                                    onClick={handleResetServices}
                                    className="px-3.5 py-2.5 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-300 hover:bg-red-900/50 text-xs font-semibold cursor-pointer"
                                >
                                    Reset Defaults
                                </button>
                            </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            <button
                                onClick={() => setServiceCategoryFilter('All')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${serviceCategoryFilter === 'All' ? 'bg-[#FF5D16] text-white shadow-md' : 'bg-[#0c0c0c] text-gray-400 hover:text-white border border-[#202020]'}`}
                            >
                                All Offerings ({services.length})
                            </button>
                            <button
                                onClick={() => setServiceCategoryFilter('DJ Events')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${serviceCategoryFilter === 'DJ Events' ? 'bg-[#FF5D16] text-white shadow-md' : 'bg-[#0c0c0c] text-gray-400 hover:text-white border border-[#202020]'}`}
                            >
                                🎧 DJ & Event Sound
                            </button>
                            <button
                                onClick={() => setServiceCategoryFilter('Raga Studio')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${serviceCategoryFilter === 'Raga Studio' ? 'bg-[#FF5D16] text-white shadow-md' : 'bg-[#0c0c0c] text-gray-400 hover:text-white border border-[#202020]'}`}
                            >
                                🎙️ Raga Studio
                            </button>
                            <button
                                onClick={() => setServiceCategoryFilter('Sampoorna Academy')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${serviceCategoryFilter === 'Sampoorna Academy' ? 'bg-[#FF5D16] text-white shadow-md' : 'bg-[#0c0c0c] text-gray-400 hover:text-white border border-[#202020]'}`}
                            >
                                🎼 Sampoorna Academy
                            </button>
                        </div>

                        {/* Services Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                            {filteredServices.map((service, idx) => (
                                <div
                                    key={service.id || idx}
                                    className="bg-[#0c0c0c] rounded-3xl border border-[#202020] hover:border-[#FF5D16]/50 overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
                                >
                                    <div>
                                        {/* Image banner */}
                                        <div className="relative h-44 sm:h-48 w-full bg-black overflow-hidden">
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent"></div>

                                            <div className="absolute top-3 left-3">
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/80 border border-white/20 text-[#FF5D16] backdrop-blur-md">
                                                    {service.category || 'DJ Service'}
                                                </span>
                                            </div>

                                            <div className="absolute bottom-3 right-3">
                                                <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#FF5D16] text-white shadow-lg">
                                                    {service.price}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 sm:p-5 space-y-3">
                                            <h3 className="text-base sm:text-lg font-bold text-white">
                                                {service.title}
                                            </h3>

                                            <p className="text-xs text-gray-400 font-light leading-relaxed min-h-[36px]">
                                                {service.description}
                                            </p>

                                            {/* Features tags */}
                                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#202020]">
                                                {(service.features || []).map((feat, fIdx) => (
                                                    <span
                                                        key={fIdx}
                                                        className="px-2 py-0.5 rounded-md bg-[#000000] border border-[#222222] text-[10px] text-gray-300 font-medium"
                                                    >
                                                        ✓ {feat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
                                        <button
                                            onClick={() => setEditingService(JSON.parse(JSON.stringify(service)))}
                                            className="flex-1 py-2.5 bg-[#000000] hover:bg-[#FF5D16] text-gray-200 hover:text-white border border-[#222222] hover:border-[#FF5D16] rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                                        >
                                            ✏️ Edit Offering
                                        </button>
                                        <button
                                            onClick={() => handleDeleteService(service)}
                                            className="px-3 py-2.5 bg-red-950/30 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                            title="Delete service"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 4: EVENT PRICING PLANS & TIERS */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'plans' && (
                    <div className="space-y-6">
                        {/* Header Box */}
                        <div className="bg-[#0c0c0c] p-4 sm:p-6 rounded-3xl border border-[#202020] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                                    <span>🎚️</span> Event Pricing Packages & Tiers
                                </h2>
                                <p className="text-gray-400 text-xs mt-1">
                                    Manage concert sound packages, wedding DJ rates, badge highlights, video feeds, and feature sets.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsAddingPlan(true)}
                                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-[#FF5D16] hover:bg-[#E04B0A] text-white text-xs font-bold shadow-lg shadow-[#FF5D16]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <span>+</span> Add Pricing Tier
                                </button>
                                <button
                                    onClick={fetchPlans}
                                    className="px-3.5 py-2.5 rounded-2xl bg-[#000000] border border-[#222222] text-gray-300 hover:text-white text-xs font-semibold cursor-pointer"
                                >
                                    ↻ Refresh
                                </button>
                                <button
                                    onClick={handleResetPlans}
                                    className="px-3.5 py-2.5 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-300 hover:bg-red-900/50 text-xs font-semibold cursor-pointer"
                                >
                                    Reset Defaults
                                </button>
                            </div>
                        </div>

                        {/* Plans Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plans.map((plan, idx) => (
                                <div
                                    key={idx}
                                    className={`rounded-3xl p-5 sm:p-6 border shadow-2xl flex flex-col justify-between transition-all ${plan.theme === 'silver'
                                        ? 'border-slate-300/40 bg-gradient-to-b from-[#1C1F24] to-[#000000]'
                                        : plan.theme === 'gold'
                                            ? 'border-amber-400/40 bg-gradient-to-b from-[#241E14] to-[#000000]'
                                            : 'border-[#202020] bg-[#0c0c0c] hover:border-[#FF5D16]/50'
                                        }`}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-black/60 border border-white/10 text-gray-200">
                                                {plan.badge}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Theme: <strong className="text-white">{plan.theme || 'standard'}</strong>
                                            </span>
                                        </div>

                                        {/* Multi-Media Feeds Preview */}
                                        {((plan.videos && plan.videos.length > 0) || plan.videoUrl) && (
                                            <div className="bg-black/60 border border-white/10 rounded-2xl p-2 space-y-2">
                                                <div className="flex items-center justify-between px-1 text-[10px] font-bold text-gray-300">
                                                    <span className="text-[#FF5D16] flex items-center gap-1">
                                                        <span>🎬</span> {plan.videos?.length || 1} Media Feed(s)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                                    {(plan.videos && plan.videos.length > 0 ? plan.videos : [plan.videoUrl]).map((vSrc, vidIdx) => {
                                                        const isImg = isImageMedia(vSrc);
                                                        return (
                                                            <div key={vidIdx} className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black">
                                                                {isImg ? (
                                                                    <img src={vSrc} alt={`Media ${vidIdx + 1}`} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <video src={vSrc} className="w-full h-full object-cover" muted loop playsInline autoPlay />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                                                {plan.name}
                                            </h3>
                                            <p className="text-xs text-gray-400 font-light mt-1">
                                                {plan.desc}
                                            </p>
                                        </div>

                                        <div className="p-3 bg-[#000000] rounded-2xl border border-white/5 flex items-center justify-between">
                                            <span className="text-gray-400 text-xs">Event Package Rate:</span>
                                            <span className="font-black text-[#FF5D16] text-base">{plan.price || plan.monthlyPrice}</span>
                                        </div>

                                        {/* Features List */}
                                        <div className="space-y-1.5 pt-2 border-t border-[#202020]">
                                            {plan.features?.map((feat, fIdx) => (
                                                <div key={fIdx} className="flex items-center gap-2 text-xs">
                                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${feat.included ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
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
                                    <div className="pt-4 mt-4 border-t border-[#202020] flex items-center gap-2">
                                        <button
                                            onClick={() => setEditingPlan(JSON.parse(JSON.stringify(plan)))}
                                            className="flex-1 py-2.5 bg-[#FF5D16] hover:bg-[#E04B0A] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer text-center"
                                        >
                                            ✏️ Edit Tier
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan(plan)}
                                            className="px-3 py-2.5 bg-red-950/30 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                                            title="Delete plan"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 5: CLIENT BOOKING INQUIRIES */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'inquiries' && (
                    <div className="space-y-6">
                        <div className="bg-[#0c0c0c] p-4 sm:p-6 rounded-3xl border border-[#202020] flex items-center justify-between">
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                                    <span>📬</span> Direct Booking Inquiries & Leads
                                </h2>
                                <p className="text-gray-400 text-xs mt-1">
                                    Clients who contacted through the website for wedding DJs, orchestra, Raga Studio recordings, or Academy courses.
                                </p>
                            </div>
                            <button
                                onClick={fetchInquiries}
                                className="px-4 py-2.5 rounded-2xl bg-[#000000] border border-[#222222] text-gray-300 hover:text-white text-xs font-semibold cursor-pointer"
                            >
                                ↻ Refresh
                            </button>
                        </div>

                        {inquiries.length === 0 ? (
                            <div className="bg-[#0c0c0c] border border-[#202020] rounded-3xl p-12 text-center space-y-3">
                                <span className="text-4xl">📭</span>
                                <h3 className="text-base font-bold text-white">No Inquiries Received Yet</h3>
                                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                    When clients submit event details or course applications, they will appear here with one-click WhatsApp links.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                                {inquiries.map((inq, idx) => {
                                    const cleanPhone = (inq.phone || '').replace(/[^0-9]/g, '');
                                    const waNumber = cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone;
                                    const waText = encodeURIComponent(`Hello ${inq.name || 'Client'}, thank you for inquiring with SS Audios & DJ Events regarding your ${inq.service || 'event'}! How can we assist you?`);

                                    return (
                                        <div key={inq.id || idx} className="bg-[#0c0c0c] border border-[#202020] rounded-3xl p-5 space-y-3 flex flex-col justify-between shadow-xl">
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#FF5D16]/20 text-[#FF5D16] border border-[#FF5D16]/30">
                                                        {inq.service || 'Event Booking'}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500">
                                                        {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'Recent'}
                                                    </span>
                                                </div>

                                                <h3 className="text-base font-bold text-white">{inq.name}</h3>

                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                                                    <p>📞 <strong className="text-white">{inq.phone}</strong></p>
                                                    <p>✉️ <span className="text-gray-400 truncate">{inq.email || 'N/A'}</span></p>
                                                    {inq.eventDate && <p>📅 Date: {inq.eventDate}</p>}
                                                    {inq.location && <p>📍 Venue: {inq.location}</p>}
                                                </div>

                                                {inq.message && (
                                                    <p className="text-xs text-gray-400 bg-[#000000] p-3 rounded-xl border border-white/5 italic">
                                                        "{inq.message}"
                                                    </p>
                                                )}
                                            </div>

                                            <div className="pt-3 border-t border-[#202020] flex items-center gap-2">
                                                {cleanPhone && (
                                                    <a
                                                        href={`https://wa.me/${waNumber}?text=${waText}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                                    >
                                                        <span>💬</span> Chat on WhatsApp
                                                    </a>
                                                )}
                                                {inq.phone && (
                                                    <a
                                                        href={`tel:${inq.phone}`}
                                                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors"
                                                    >
                                                        📞 Call
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteInquiry(inq.id)}
                                                    className="px-3 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 text-xs font-bold transition-colors cursor-pointer"
                                                    title="Delete inquiry"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ------------------------------------------------------------- */}
            {/* MOBILE FIXED BOTTOM NAVIGATION DOCK */}
            {/* ------------------------------------------------------------- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#000000]/95 backdrop-blur-xl border-t border-[#1a1a1a] px-2 py-2 flex items-center justify-around shadow-2xl">
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'gallery' ? 'text-[#FF5D16]' : 'text-gray-400'}`}
                >
                    <span className="text-lg">📸</span>
                    <span className="text-[10px] font-bold">Gallery</span>
                </button>
                <button
                    onClick={() => setActiveTab('add')}
                    className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'add' ? 'text-[#FF5D16]' : 'text-gray-400'}`}
                >
                    <span className="text-lg">🚀</span>
                    <span className="text-[10px] font-bold">Upload</span>
                </button>
                <button
                    onClick={() => setActiveTab('services')}
                    className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'services' ? 'text-[#FF5D16]' : 'text-gray-400'}`}
                >
                    <span className="text-lg">🎛️</span>
                    <span className="text-[10px] font-bold">Services</span>
                </button>
                <button
                    onClick={() => setActiveTab('plans')}
                    className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'plans' ? 'text-[#FF5D16]' : 'text-gray-400'}`}
                >
                    <span className="text-lg">🎚️</span>
                    <span className="text-[10px] font-bold">Plans</span>
                </button>
                <button
                    onClick={() => setActiveTab('inquiries')}
                    className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'inquiries' ? 'text-[#FF5D16]' : 'text-gray-400'}`}
                >
                    <span className="text-lg">📬</span>
                    <span className="text-[10px] font-bold">Inquiries</span>
                </button>
            </div>

            {/* 1. ADD SERVICE MODAL */}
            {isAddingService && (
                <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
                    <div className="bg-[#0f0f0f] border border-[#222222] sm:border-[#FF5D16]/40 rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
                        {/* Fixed Modal Header */}
                        <div className="shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 border-b border-[#222222] flex items-center justify-between bg-[#000000]">
                            <div>
                                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                                    <span>✨</span> Add Service, Studio Offering or Course
                                </h3>
                                <p className="text-[10px] text-gray-400">Configure offerings published live to client site.</p>
                            </div>
                            <button
                                onClick={() => setIsAddingService(false)}
                                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Quick Presets Bar */}
                        <div className="shrink-0 px-4 py-1.5 sm:px-5 sm:py-2 bg-[#100D0D] border-b border-[#1a1a1a] flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
                            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 shrink-0">Preset:</span>
                            <button
                                type="button"
                                onClick={() => setNewService({
                                    title: 'Live DJ & Concert Sound',
                                    category: 'DJ Events',
                                    price: 'Starting from ₹15,000',
                                    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600',
                                    description: 'Electrifying DJ and live remix performance designed to keep the crowd energetic and dance floors packed all night.',
                                    featuresStr: 'Live Stem Remixing\nFestival-Grade Sound Array\nSynchronized Visuals\nDedicated Sound Tech'
                                })}
                                className="px-2 py-0.5 rounded-lg bg-[#0f0f0f] hover:bg-[#E04B0A]/30 border border-[#222222] text-[10px] sm:text-[11px] font-semibold text-gray-300 hover:text-white shrink-0 cursor-pointer"
                            >
                                🎧 DJ Event
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewService({
                                    title: 'Raga Studio - Live Tracks & Mixing',
                                    category: 'Raga Studio',
                                    price: '₹2,500 / session',
                                    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600',
                                    description: 'Zero-latency multi-track acoustic capture, live vocal coaching, tuning, and radio-ready audio production.',
                                    featuresStr: 'Zero-Latency Monitoring\n16-Channel Simultaneous Tracking\nTube Preamp Saturation\nStem Audio Export'
                                })}
                                className="px-2 py-0.5 rounded-lg bg-[#0f0f0f] hover:bg-[#E04B0A]/30 border border-[#222222] text-[10px] sm:text-[11px] font-semibold text-[#FF5D16] hover:text-white shrink-0 cursor-pointer"
                            >
                                🎙️ Raga Studio
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewService({
                                    title: 'Sampoorna Academy - Music Course',
                                    category: 'Sampoorna Academy',
                                    price: '₹3,500 / month',
                                    image: 'https://images.unsplash.com/photo-1520523839898-5071282543e2?auto=format&fit=crop&q=80&w=600',
                                    description: 'Curriculum-based mentorship in Singing, Keyboard, Flute, or Tabla with individual practice feedback.',
                                    featuresStr: '1-on-1 Artist Mentorship\nWeekend & Weekday Batches\nLive Studio Simulation\nPerformance Certification'
                                })}
                                className="px-2 py-0.5 rounded-lg bg-[#0f0f0f] hover:bg-[#E04B0A]/30 border border-[#222222] text-[10px] sm:text-[11px] font-semibold text-amber-400 hover:text-white shrink-0 cursor-pointer"
                            >
                                🎼 Academy Course
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <form onSubmit={handleCreateService} id="createServiceForm" className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-3 sm:space-y-4 touch-pan-y">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Service / Course Title</label>
                                    <input
                                        type="text"
                                        value={newService.title}
                                        onChange={e => setNewService({ ...newService, title: e.target.value })}
                                        placeholder="e.g. Vocal Training or Live DJ"
                                        className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Category / Section</label>
                                    <select
                                        value={newService.category || 'DJ Events'}
                                        onChange={e => setNewService({ ...newService, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                    >
                                        <option value="DJ Events">DJ Events & Sound</option>
                                        <option value="Raga Studio">Raga Studio</option>
                                        <option value="Sampoorna Academy">Sampoorna Academy</option>
                                        <option value="Wedding">Wedding</option>
                                        <option value="Orchestra">Orchestra</option>
                                        <option value="Audios&Lightings">Audios & Lightings</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-300 mb-1">Price Tag</label>
                                <input
                                    type="text"
                                    value={newService.price}
                                    onChange={e => setNewService({ ...newService, price: e.target.value })}
                                    placeholder="e.g. ₹25,000 or ₹2,500 / session"
                                    className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                    required
                                />
                            </div>

                            {/* Image Showcase Upload */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-300 mb-1">Showcase Image</label>
                                <div className="flex items-center gap-2.5">
                                    {newService.image && (
                                        <div className="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-black">
                                            <img src={newService.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#000000] hover:bg-[#000000] border border-dashed border-gray-600 hover:border-[#FF5D16] rounded-xl text-[11px] font-semibold text-gray-300 hover:text-white cursor-pointer transition-all">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={isUploadingServiceImage}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    try {
                                                        setIsUploadingServiceImage(true);
                                                        const url = await handleUploadMediaFile(file);
                                                        setNewService(prev => ({ ...prev, image: url }));
                                                        showNotification('Image uploaded successfully!');
                                                    } catch (err) {
                                                        alert('Failed to upload image: ' + err.message);
                                                    } finally {
                                                        setIsUploadingServiceImage(false);
                                                    }
                                                }}
                                            />
                                            {isUploadingServiceImage ? (
                                                <span className="text-[#FF5D16] font-bold">Uploading image...</span>
                                            ) : (
                                                <>
                                                    <span>📁</span>
                                                    <span>{newService.image ? 'Change Image from Files' : 'Upload Image from Files'}</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-300 mb-1">Service Description</label>
                                <textarea
                                    rows="2"
                                    value={newService.description}
                                    onChange={e => setNewService({ ...newService, description: e.target.value })}
                                    placeholder="Describe the audio performance, curriculum, or studio gear..."
                                    className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-300 mb-1">Key Features (One item per line)</label>
                                <textarea
                                    rows="3"
                                    value={newService.featuresStr}
                                    onChange={e => setNewService({ ...newService, featuresStr: e.target.value })}
                                    placeholder="Live Stem Remixing&#10;Festival-Grade Sound Array&#10;Synchronized Visuals"
                                    className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                />
                            </div>
                        </form>

                        {/* Fixed Sticky Action Bar */}
                        <div className="shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 bg-[#000000] border-t border-[#222222] flex items-center justify-end gap-2.5 sm:gap-3 z-10">
                            <button
                                type="button"
                                onClick={() => setIsAddingService(false)}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-gray-700 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="createServiceForm"
                                disabled={isSavingService || isUploadingServiceImage}
                                className="px-5 py-2 rounded-xl bg-[#FF5D16] hover:bg-[#E04B0A] text-white text-xs font-bold shadow-lg shadow-[#FF5D16]/25 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {isSavingService ? 'Saving...' : 'Add & Publish Live'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. EDIT SERVICE MODAL */}
            {editingService && (
                <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
                    <div className="bg-[#0f0f0f] border border-[#222222] sm:border-[#FF5D16]/40 rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
                        {/* Fixed Header */}
                        <div className="shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 border-b border-[#222222] flex items-center justify-between bg-[#000000]">
                            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                                <span>✏️</span> Edit Offering: {editingService.title}
                            </h3>
                            <button
                                onClick={() => setEditingService(null)}
                                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <form onSubmit={handleSaveService} id="editServiceForm" className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-3 sm:space-y-4 touch-pan-y">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Service Title</label>
                                    <input
                                        type="text"
                                        value={editingService.title}
                                        onChange={e => setEditingService({ ...editingService, title: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Category</label>
                                    <select
                                        value={editingService.category || 'DJ Events'}
                                        onChange={e => setEditingService({ ...editingService, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                    >
                                        <option value="DJ Events">DJ Events & Sound</option>
                                        <option value="Raga Studio">Raga Studio</option>
                                        <option value="Sampoorna Academy">Sampoorna Academy</option>
                                        <option value="Wedding">Wedding</option>
                                        <option value="Orchestra">Orchestra</option>
                                        <option value="Audios&Lightings">Audios & Lightings</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-300 mb-1">Price Tag</label>
                                <input
                                    type="text"
                                    value={editingService.price}
                                    onChange={e => setEditingService({ ...editingService, price: e.target.value })}
                                    className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                    required
                                />
                            </div>

                            {/* Image Showcase Upload */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-300 mb-1">Showcase Image</label>
                                <div className="flex items-center gap-2.5">
                                    {editingService.image && (
                                        <div className="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-black">
                                            <img src={editingService.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#000000] hover:bg-[#000000] border border-dashed border-gray-600 hover:border-[#FF5D16] rounded-xl text-[11px] font-semibold text-gray-300 hover:text-white cursor-pointer transition-all">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={isUploadingServiceImage}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    try {
                                                        setIsUploadingServiceImage(true);
                                                        const url = await handleUploadMediaFile(file);
                                                        setEditingService(prev => ({ ...prev, image: url }));
                                                        showNotification('Image updated successfully!');
                                                    } catch (err) {
                                                        alert('Failed to upload image: ' + err.message);
                                                    } finally {
                                                        setIsUploadingServiceImage(false);
                                                    }
                                                }}
                                            />
                                            {isUploadingServiceImage ? (
                                                <span className="text-[#FF5D16] font-bold">Uploading image...</span>
                                            ) : (
                                                <>
                                                    <span>📁</span>
                                                    <span>Change Image from Files</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-300 mb-1">Service Description</label>
                                <textarea
                                    rows="2"
                                    value={editingService.description}
                                    onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-300 mb-1">Features (One per line)</label>
                                <textarea
                                    rows="3"
                                    value={editingService.featuresStr || (editingService.features || []).join('\n')}
                                    onChange={e => {
                                        const val = e.target.value;
                                        const feats = val.split('\n').filter(s => s.trim().length > 0);
                                        setEditingService({ ...editingService, featuresStr: val, features: feats });
                                    }}
                                    className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                />
                            </div>
                        </form>

                        {/* Fixed Sticky Action Bar */}
                        <div className="shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 bg-[#000000] border-t border-[#222222] flex items-center justify-end gap-2.5 sm:gap-3 z-10">
                            <button
                                type="button"
                                onClick={() => setEditingService(null)}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-gray-700 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="editServiceForm"
                                disabled={isSavingService || isUploadingServiceImage}
                                className="px-5 py-2 rounded-xl bg-[#FF5D16] hover:bg-[#E04B0A] text-white text-xs font-bold shadow-lg shadow-[#FF5D16]/25 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {isSavingService ? 'Saving...' : 'Save & Publish Live'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. ADD PRICING PLAN MODAL */}
            {isAddingPlan && (
                <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
                    <div className="bg-[#0f0f0f] border border-[#222222] sm:border-[#FF5D16]/40 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
                        <div className="shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 border-b border-[#222222] flex items-center justify-between bg-[#000000]">
                            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                                <span>✨</span> Add New Pricing Package
                            </h3>
                            <button
                                onClick={() => setIsAddingPlan(false)}
                                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreatePlan} id="createPlanForm" className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-3 sm:space-y-4 touch-pan-y">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Plan Name</label>
                                    <input
                                        type="text"
                                        value={newPlan.name}
                                        onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                                        placeholder="e.g. VIP Headliner Concert"
                                        className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Badge Tag</label>
                                    <input
                                        type="text"
                                        value={newPlan.badge}
                                        onChange={e => setNewPlan({ ...newPlan, badge: e.target.value })}
                                        placeholder="e.g. MOST POPULAR, VIP, FESTIVAL"
                                        className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Price</label>
                                    <input
                                        type="text"
                                        value={newPlan.price || newPlan.monthlyPrice || ''}
                                        onChange={e => setNewPlan({ ...newPlan, price: e.target.value, monthlyPrice: e.target.value })}
                                        placeholder="e.g. ₹25,000 or $499"
                                        className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Theme Accent</label>
                                    <select
                                        value={newPlan.theme || 'standard'}
                                        onChange={e => setNewPlan({ ...newPlan, theme: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                    >
                                        <option value="standard">Standard Neon</option>
                                        <option value="silver">Silver Glow</option>
                                        <option value="gold">Gold VIP</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-300 mb-1">Description</label>
                                <textarea
                                    rows="2"
                                    value={newPlan.desc}
                                    onChange={e => setNewPlan({ ...newPlan, desc: e.target.value })}
                                    placeholder="Brief overview of what this tier delivers..."
                                    className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                    required
                                />
                            </div>

                            {/* Media Section */}
                            <div className="p-3 bg-[#000000] border border-[#222222] rounded-2xl space-y-2">
                                <label className="block text-[11px] font-bold text-white flex items-center justify-between">
                                    <span>🎬 Showcase Media Feeds (Videos & Images)</span>
                                    <span className="text-[#FF5D16] text-[10px]">{(newPlan.videos || []).length} Configured</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={planMediaUrlInput}
                                        onChange={e => setPlanMediaUrlInput(e.target.value)}
                                        placeholder="Paste image/video URL..."
                                        className="flex-1 px-3 py-1.5 bg-black/60 border border-gray-700 rounded-xl text-xs text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!planMediaUrlInput.trim()) return;
                                            const current = (newPlan.videos || []).filter(Boolean);
                                            setNewPlan(prev => ({
                                                ...prev,
                                                videos: [...current, planMediaUrlInput.trim()],
                                                videoUrl: current[0] || planMediaUrlInput.trim()
                                            }));
                                            setPlanMediaUrlInput('');
                                        }}
                                        className="px-3 py-1.5 bg-[#FF5D16] text-white rounded-xl text-xs font-bold cursor-pointer"
                                    >
                                        + Add
                                    </button>
                                </div>
                            </div>

                            {/* Features toggles */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[11px] font-bold text-gray-300">Feature Inclusions</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const feats = newPlan.features || [];
                                            setNewPlan({
                                                ...newPlan,
                                                features: [...feats, { text: 'New Feature Item', included: true }]
                                            });
                                        }}
                                        className="text-[10px] text-[#FF5D16] font-bold hover:underline cursor-pointer"
                                    >
                                        + Add Feature
                                    </button>
                                </div>

                                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                    {newPlan.features?.map((feat, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-2 bg-[#000000] p-1.5 rounded-xl border border-[#222222]">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = [...newPlan.features];
                                                    updated[fIdx].included = !updated[fIdx].included;
                                                    setNewPlan({ ...newPlan, features: updated });
                                                }}
                                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer ${feat.included ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}
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
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>

                        <div className="shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 bg-[#000000] border-t border-[#222222] flex items-center justify-end gap-2.5 sm:gap-3 z-10">
                            <button
                                type="button"
                                onClick={() => setIsAddingPlan(false)}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-gray-700 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="createPlanForm"
                                disabled={isSavingPlan}
                                className="px-5 py-2 rounded-xl bg-[#FF5D16] hover:bg-[#E04B0A] text-white text-xs font-bold shadow-lg shadow-[#FF5D16]/25 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {isSavingPlan ? 'Saving...' : 'Add & Publish Tier'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. EDIT PRICING PLAN MODAL */}
            {editingPlan && (
                <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
                    <div className="bg-[#0f0f0f] border border-[#222222] sm:border-[#FF5D16]/40 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
                        <div className="shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 border-b border-[#222222] flex items-center justify-between bg-[#000000]">
                            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                                <span>🎚️</span> Edit Package: {editingPlan.name}
                            </h3>
                            <button
                                onClick={() => setEditingPlan(null)}
                                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSavePlan} id="editPlanForm" className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-3 sm:space-y-4 touch-pan-y">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Plan Name</label>
                                    <input
                                        type="text"
                                        value={editingPlan.name}
                                        onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Badge</label>
                                    <input
                                        type="text"
                                        value={editingPlan.badge}
                                        onChange={e => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Price</label>
                                    <input
                                        type="text"
                                        value={editingPlan.price || editingPlan.monthlyPrice || ''}
                                        onChange={e => setEditingPlan({ ...editingPlan, price: e.target.value, monthlyPrice: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Theme</label>
                                    <select
                                        value={editingPlan.theme || 'standard'}
                                        onChange={e => setEditingPlan({ ...editingPlan, theme: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                    >
                                        <option value="standard">Standard Neon</option>
                                        <option value="silver">Silver Glow</option>
                                        <option value="gold">Gold VIP</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-300 mb-1">Description</label>
                                <textarea
                                    rows="2"
                                    value={editingPlan.desc}
                                    onChange={e => setEditingPlan({ ...editingPlan, desc: e.target.value })}
                                    className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5D16]"
                                    required
                                />
                            </div>

                            {/* Media Feeds */}
                            <div className="p-3 bg-[#000000] border border-[#222222] rounded-2xl space-y-2">
                                <label className="block text-[11px] font-bold text-white flex items-center justify-between">
                                    <span>🎬 Showcase Media Feeds</span>
                                    <span className="text-[#FF5D16] text-[10px]">{(editingPlan.videos || []).length} Configured</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={editPlanMediaUrlInput}
                                        onChange={e => setEditPlanMediaUrlInput(e.target.value)}
                                        placeholder="Paste image/video URL..."
                                        className="flex-1 px-3 py-1.5 bg-black/60 border border-gray-700 rounded-xl text-xs text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!editPlanMediaUrlInput.trim()) return;
                                            const current = (editingPlan.videos || []).filter(Boolean);
                                            setEditingPlan(prev => ({
                                                ...prev,
                                                videos: [...current, editPlanMediaUrlInput.trim()],
                                                videoUrl: current[0] || editPlanMediaUrlInput.trim()
                                            }));
                                            setEditPlanMediaUrlInput('');
                                        }}
                                        className="px-3 py-1.5 bg-[#FF5D16] text-white rounded-xl text-xs font-bold cursor-pointer"
                                    >
                                        + Add
                                    </button>
                                </div>
                            </div>

                            {/* Features toggles */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[11px] font-bold text-gray-300">Feature Inclusions</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const feats = editingPlan.features || [];
                                            setEditingPlan({
                                                ...editingPlan,
                                                features: [...feats, { text: 'New Feature Item', included: true }]
                                            });
                                        }}
                                        className="text-[10px] text-[#FF5D16] font-bold hover:underline cursor-pointer"
                                    >
                                        + Add Feature
                                    </button>
                                </div>

                                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                    {editingPlan.features?.map((feat, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-2 bg-[#000000] p-1.5 rounded-xl border border-[#222222]">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = [...editingPlan.features];
                                                    updated[fIdx].included = !updated[fIdx].included;
                                                    setEditingPlan({ ...editingPlan, features: updated });
                                                }}
                                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer ${feat.included ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}
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
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>

                        <div className="shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 bg-[#000000] border-t border-[#222222] flex items-center justify-end gap-2.5 sm:gap-3 z-10">
                            <button
                                type="button"
                                onClick={() => setEditingPlan(null)}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-gray-700 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="editPlanForm"
                                disabled={isSavingPlan}
                                className="px-5 py-2 rounded-xl bg-[#FF5D16] hover:bg-[#E04B0A] text-white text-xs font-bold shadow-lg shadow-[#FF5D16]/25 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {isSavingPlan ? 'Saving...' : 'Save & Publish Live'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. FULL PREVIEW MEDIA MODAL */}
            {previewMediaModal && (
                <div
                    onClick={() => setPreviewMediaModal(null)}
                    className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer"
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="relative max-w-4xl w-full bg-[#0f0f0f] border border-[#222222] rounded-3xl overflow-hidden shadow-2xl space-y-3 p-4"
                    >
                        <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
                            <div>
                                <h3 className="text-sm font-bold text-white">{previewMediaModal.title || 'Media Asset'}</h3>
                                <span className="text-[11px] text-[#FF5D16]">{previewMediaModal.category}</span>
                            </div>
                            <button
                                onClick={() => setPreviewMediaModal(null)}
                                className="w-8 h-8 rounded-full bg-white/10 text-white font-bold flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                            {isImageMedia(previewMediaModal.url || previewMediaModal.key) ? (
                                <img src={previewMediaModal.url} alt="Preview" className="max-h-[70vh] w-auto object-contain" />
                            ) : (
                                <video src={previewMediaModal.url} controls autoPlay className="max-h-[70vh] w-full object-contain" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 6. EDIT MEDIA MODAL */}
            {editingMedia && (
                <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-[#222222] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                            <h3 className="text-base font-bold text-white">Edit Media Tag</h3>
                            <button onClick={() => setEditingMedia(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleUpdateMedia} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editingMedia.title || ''}
                                    onChange={e => setEditingMedia({ ...editingMedia, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-1">Category</label>
                                <select
                                    value={editingMedia.category || 'Wedding'}
                                    onChange={e => setEditingMedia({ ...editingMedia, category: e.target.value })}
                                    className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-xl text-xs text-white"
                                >
                                    {DEFAULT_CATEGORIES.map((cat, i) => (
                                        <option key={i} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingMedia(null)}
                                    className="px-4 py-2 rounded-xl text-xs text-gray-400 border border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-[#FF5D16] text-white font-bold text-xs rounded-xl"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaManager;