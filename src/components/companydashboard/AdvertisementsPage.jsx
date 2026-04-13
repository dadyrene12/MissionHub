import React, { useState, useEffect } from 'react';
import { Image, Megaphone, RefreshCw, Check, Users, Briefcase, Heart, Package, Calendar, Video, Loader2, X, Plus } from 'lucide-react';
import { apiFetch, LoadingSpinner, Badge } from './CompanyDashboardUtils';

export const AdvertisementsPage = ({ token, user, showToast }) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', duration: 1 });
  const [galleryData, setGalleryData] = useState({ type: 'image', caption: '', tags: '', url: '' });
  const [galleryPosts, setGalleryPosts] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('advertisements');

  useEffect(() => { fetchAdvertisements(); fetchGalleryPosts(); }, []);

  const fetchAdvertisements = async () => {
    setLoading(true);
    const res = await apiFetch('/advertising/my-ads');
    if (res.ok && res.data?.success) setAdvertisements(res.data.advertisements || []);
    setLoading(false);
  };

  const fetchGalleryPosts = async () => {
    const res = await apiFetch('/advertising/gallery');
    if (res.ok && res.data?.success) setGalleryPosts(res.data.posts || []);
  };

  const handleCreateAd = async () => {
    if (!formData.title || !formData.duration) { showToast('Please fill in required fields', 'error'); return; }
    setProcessing(true);
    const res = await apiFetch('/advertising/advertise', { method: 'POST', body: JSON.stringify(formData) });
    if (res.ok && res.data?.success) { showToast('Advertisement created successfully!', 'success'); setShowCreateModal(false); setFormData({ title: '', description: '', duration: 1 }); fetchAdvertisements(); }
    else showToast(res.data?.message || 'Failed to create advertisement', 'error');
    setProcessing(false);
  };

  const handleCreateGalleryPost = async () => {
    if (!galleryData.url && !galleryData.caption) { showToast('Please provide URL or caption', 'error'); return; }
    setProcessing(true);
    const postData = { type: galleryData.type, url: galleryData.url, caption: galleryData.description, tags: galleryData.tags.split(',').map(t => t.trim()).filter(t => t), campaign: galleryData.campaign || 'general' };
    const res = await apiFetch('/advertising/gallery', { method: 'POST', body: JSON.stringify(postData) });
    if (res.ok && res.data?.success) { showToast('Post created successfully!', 'success'); setShowGalleryModal(false); setGalleryData({ type: 'image', caption: '', tags: '', url: '', campaign: '' }); fetchGalleryPosts(); }
    else showToast(res.data?.message || 'Failed to create post', 'error');
    setProcessing(false);
  };

  const handleDeleteGalleryPost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    const res = await apiFetch(`/advertising/gallery/${postId}`, { method: 'DELETE' });
    if (res.ok && res.data?.success) { showToast('Post deleted', 'success'); fetchGalleryPosts(); }
  };

  const adPlans = [{ id: 'basic', name: 'Basic', price: 25000, duration: 30, features: ['Featured in search results', 'Visible for 30 days', 'Email to matching candidates'] }, { id: 'premium', name: 'Premium', price: 50000, duration: 30, features: ['Homepage banner', 'Social media promotion', 'Email to all candidates', 'Featured for 30 days'] }, { id: 'ultimate', name: 'Ultimate', price: 100000, duration: 30, features: ['Homepage takeover', 'All promotion channels', 'Analytics dashboard', 'Priority support'] }];

  const campaignTypes = [{ id: 'hiring', name: 'We Are Hiring', icon: Users }, { id: 'project', name: 'Our Latest Project', icon: Briefcase }, { id: 'culture', name: 'Company Culture', icon: Heart }, { id: 'product', name: 'New Product', icon: Package }, { id: 'event', name: 'Events', icon: Calendar }, { id: 'general', name: 'General', icon: Megaphone }];

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-950">Advertisement & Showcase</h1>
          <p className="text-slate-500">Promote your company and jobs</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowGalleryModal(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all border border-slate-200 text-sm">
            <Image className="w-4 h-4" /> Create Post
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-slate-950 text-white rounded-xl hover:bg-slate-800 transition-all text-sm">
            <Megaphone className="w-4 h-4" /> Create Ad
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-2 mb-4 sm:mb-6 flex-wrap">
        {[{ id: 'advertisements', label: 'Advertisements', icon: Megaphone }, { id: 'gallery', label: 'Gallery & Campaigns', icon: Image }].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
              activeTab === tab.id 
                ? 'bg-slate-950 text-white' 
                : 'bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'advertisements' && (
        <>
          <div className="grid md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {adPlans.map((plan) => (
              <div key={plan.id} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-slate-950 transition-all">
                <h3 className="text-lg font-bold text-slate-950">{plan.name}</h3>
                <p className="text-2xl sm:text-3xl font-bold text-slate-950 mt-2">RWF {plan.price.toLocaleString()}</p>
                <p className="text-sm text-slate-500">{plan.duration} days</p>
                <ul className="space-y-2 mt-3 sm:mt-4 mb-4 sm:mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-slate-600 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => { setFormData({ ...formData, title: `${plan.name} Ad`, duration: plan.duration / 30 }); setShowCreateModal(true); }} 
                  className="w-full py-3 bg-slate-950 text-white rounded-xl font-medium hover:bg-slate-800 transition-all"
                >
                  Purchase
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="font-semibold text-slate-950">Your Advertisements</h3>
              <button onClick={fetchAdvertisements} className="text-sm text-slate-600 hover:text-slate-950 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-slate-950 animate-spin mx-auto mb-3" />
                <p className="text-slate-500">Loading advertisements...</p>
              </div>
            ) : advertisements.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No advertisements yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm text-slate-600">Title</th>
                      <th className="px-4 py-3 text-left text-sm text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left text-sm text-slate-600">Amount</th>
                      <th className="px-4 py-3 text-left text-sm text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {advertisements.map((ad) => (
                      <tr key={ad._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-950">{ad.title || ad.advertiseDetails?.title}</td>
                        <td className="px-4 py-3">
                          <Badge color={ad.status === 'completed' ? 'green' : ad.status === 'pending' ? 'yellow' : 'red'}>
                            {ad.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-950">{ad.amount?.toLocaleString()} RWF</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{new Date(ad.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'gallery' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4 sm:mb-6">
            {campaignTypes.map((campaign) => (
              <button 
                key={campaign.id} 
                onClick={() => { setGalleryData({ ...galleryData, campaign: campaign.id }); setShowGalleryModal(true); }} 
                className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-950 hover:shadow-md transition-all text-center group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 bg-slate-100`}>
                  <campaign.icon className="w-5 h-5 text-slate-700" />
                </div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-slate-950 transition-colors">{campaign.name}</p>
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-950">Your Posts</h3>
            </div>
            {galleryPosts.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No posts yet</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {galleryPosts.map((post) => (
                  <div key={post._id} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                    {post.url && (
                      <div className="aspect-video bg-slate-200 flex items-center justify-center">
                        {post.type === 'video' ? <Video className="w-12 h-12 text-slate-500" /> : <Image className="w-12 h-12 text-slate-500" />}
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge color="gray">{post.type}</Badge>
                        {post.campaign && <Badge color="blue">{post.campaign}</Badge>}
                      </div>
                      <p className="text-sm text-slate-700">{post.caption}</p>
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.map((tag, i) => <Badge key={i} color="purple">#{tag}</Badge>)}
                        </div>
                      )}
                      <button onClick={() => handleDeleteGalleryPost(post._id)} className="mt-2 text-xs text-red-600 hover:text-red-700">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-950">Create Advertisement</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-950 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">Job to Promote *</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                placeholder="Enter job title" 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500" 
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">Description</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Describe your ad..." 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500" 
                rows={3} 
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-2">Duration (months) *</label>
              <select 
                value={formData.duration} 
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value={1}>1 month</option>
                <option value={2}>2 months</option>
                <option value={3}>3 months</option>
              </select>
            </div>
            <button 
              onClick={handleCreateAd} 
              disabled={processing} 
              className="w-full py-3 bg-slate-950 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating...
                </>
              ) : (
                'Create Advertisement'
              )}
            </button>
          </div>
        </div>
      )}

      {showGalleryModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-950">Create Gallery Post</h3>
              <button onClick={() => setShowGalleryModal(false)} className="text-slate-400 hover:text-slate-950 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">Post Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['image', 'video'].map(type => (
                  <button 
                    key={type} 
                    onClick={() => setGalleryData({ ...galleryData, type })} 
                    className={`py-2 px-4 rounded-xl border-2 transition-all ${
                      galleryData.type === type 
                        ? 'border-slate-950 bg-slate-50 text-slate-950' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {type === 'image' ? <Image className="w-4 h-4 inline mr-1" /> : <Video className="w-4 h-4 inline mr-1" />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">Media URL</label>
              <input 
                type="url" 
                value={galleryData.url} 
                onChange={(e) => setGalleryData({ ...galleryData, url: e.target.value })} 
                placeholder="https://..." 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500" 
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">Caption</label>
              <textarea 
                value={galleryData.description} 
                onChange={(e) => setGalleryData({ ...galleryData, description: e.target.value })} 
                placeholder="Write a caption..." 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500" 
                rows={3} 
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">Tags (comma separated)</label>
              <input 
                type="text" 
                value={galleryData.tags} 
                onChange={(e) => setGalleryData({ ...galleryData, tags: e.target.value })} 
                placeholder="tech, construction, jobs" 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500" 
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-2">Campaign Type</label>
              <select 
                value={galleryData.campaign || ''} 
                onChange={(e) => setGalleryData({ ...galleryData, campaign: e.target.value })} 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">Select campaign...</option>
                {campaignTypes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button 
              onClick={handleCreateGalleryPost} 
              disabled={processing} 
              className="w-full py-3 bg-slate-950 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating...
                </>
              ) : (
                'Create Post'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementsPage;
