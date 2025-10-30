// src/components/Adverse.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, ChevronDown, ChevronUp, Clock, Eye, EyeOff, Zap } from 'lucide-react';

const Adverse = ({ user, showNotification }) => {
  const [adVisible, setAdVisible] = useState(false);
  const [adClosed, setAdClosed] = useState(false);
  const [adViewed, setAdViewed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [timer, setTimer] = useState(60);
  const [adClosedPermanently, setAdClosedPermanently] = useState(false);
  const [position, setPosition] = useState({ 
    top: 'auto', 
    right: '20px', 
    bottom: '20px', 
    left: 'auto' 
  });
  const timerRef = useRef(null);
  const viewTimerRef = useRef(null);
  const adRotationRef = useRef(null);
  const intervalRef = useRef(null);
  const adRef = useRef(null);

  // Advertisement content
  const advertisements = [
    {
      id: 1,
      title: "🚀 Premium Career Services",
      description: "Get your resume reviewed by industry experts and boost your interview chances by 70%",
      cta: "Learn More",
      url: "#premium",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      duration: 30,
      category: "career",
      type: "premium"
    },
    {
      id: 2,
      title: "📚 Skill Development Courses",
      description: "Master in-demand skills with our curated learning paths. Limited time discount available!",
      cta: "Explore Courses",
      url: "#courses",
      image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      duration: 25,
      category: "education",
      type: "learning"
    },
    {
      id: 3,
      title: "💼 Professional Networking",
      description: "Connect with industry leaders and expand your professional network",
      cta: "Join Network",
      url: "#network",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      duration: 20,
      category: "networking",
      type: "community"
    }
  ];

  const [currentAd, setCurrentAd] = useState(0);
  const [adsQueue, setAdsQueue] = useState([]);

  // Initialize ads queue
  useEffect(() => {
    const shuffledAds = [...advertisements].sort(() => Math.random() - 0.5);
    setAdsQueue(shuffledAds);
  }, []);

  // Smart positioning system
  useEffect(() => {
    const updatePosition = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      
      if (isMobile) {
        setPosition({
          top: 'auto',
          right: '10px',
          bottom: '80px',
          left: 'auto',
          transform: 'none'
        });
      } else if (isTablet) {
        setPosition({
          top: '120px',
          right: '20px',
          bottom: 'auto',
          left: 'auto'
        });
      } else {
        setPosition({
          top: '100px',
          right: '30px',
          bottom: 'auto',
          left: 'auto'
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  // Start advertisement system
  useEffect(() => {
    const storedAdClosed = localStorage.getItem('adClosedPermanently');
    if (storedAdClosed === 'true') {
      setAdClosedPermanently(true);
      return;
    }

    if (adsQueue.length > 0 && !adClosedPermanently) {
      // Initial delay for first ad
      const initialDelay = setTimeout(() => {
        setAdVisible(true);
        startAdCycle();
      }, 30000); // Show first ad after 30 seconds

      // Set up recurring interval for ads
      intervalRef.current = setInterval(() => {
        if (!adClosedPermanently) {
          setAdVisible(true);
          startAdCycle();
        }
      }, 180000); // Show ad every 3 minutes

      return () => {
        clearTimeout(initialDelay);
        clearInterval(intervalRef.current);
        clearTimeout(timerRef.current);
        clearTimeout(viewTimerRef.current);
        clearInterval(adRotationRef.current);
      };
    }
  }, [adsQueue.length, adClosedPermanently]);

  const startAdCycle = () => {
    // Clear any existing timers
    clearTimeout(timerRef.current);
    clearTimeout(viewTimerRef.current);

    // Show ad for duration
    const currentAdDuration = adsQueue[currentAd]?.duration || 30;
    viewTimerRef.current = setTimeout(() => {
      setAdViewed(true);
    }, currentAdDuration * 1000);

    // Auto-hide ad after duration
    timerRef.current = setTimeout(() => {
      setAdVisible(false);
      setAdViewed(false);
      setExpanded(false);
      
      // Rotate to next ad
      setCurrentAd(prev => (prev + 1) % adsQueue.length);
    }, currentAdDuration * 1000);
  };

  const handleCloseAd = () => {
    setAdVisible(false);
    setAdClosed(true);
    clearTimeout(viewTimerRef.current);
    clearTimeout(timerRef.current);
    
    setTimeout(() => {
      setAdClosed(false);
    }, 1000);
  };

  const handleClosePermanently = () => {
    setAdVisible(false);
    setAdClosedPermanently(true);
    localStorage.setItem('adClosedPermanently', 'true');
    clearTimeout(viewTimerRef.current);
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
    showNotification('Ads disabled permanently', 'info');
  };

  const handleAdClick = (url) => {
    setAdViewed(true);
    showNotification('Redirecting to advertisement...', 'info');
    console.log('Ad clicked, would redirect to:', url);
  };

  const handleViewToggle = () => {
    setExpanded(!expanded);
  };

  const handleNextAd = () => {
    setCurrentAd(prev => {
      const nextAd = (prev + 1) % adsQueue.length;
      setAdViewed(false);
      return nextAd;
    });
  };

  // Don't render anything if ads are permanently closed
  if (adClosedPermanently) return null;

  const ad = adsQueue[currentAd];
  if (!ad) return null;

  return (
    <>
      {/* Floating Ad Notification */}
      {adVisible && (
        <div 
          ref={adRef}
          className="fixed z-40 animate-scaleIn"
          style={position}
        >
          <div className="w-80 bg-white rounded-xl shadow-2xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl backdrop-blur-sm bg-white/95">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  {user ? 'Exclusive Offer' : 'Special Offer'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleViewToggle}
                  className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                  title={expanded ? "Collapse" : "Expand"}
                >
                  {expanded ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
                </button>
                <button
                  onClick={handleCloseAd}
                  className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                  title="Close advertisement"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* Advertisement Content */}
            <div className="p-4">
              {/* Image */}
              <div 
                className="w-full h-32 bg-cover bg-center rounded-lg mb-3 cursor-pointer relative group"
                style={{ backgroundImage: `url(${ad.image})` }}
                onClick={() => handleAdClick(ad.url)}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-all duration-300">
                  <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  {ad.category}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{ad.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {ad.description}
                </p>

                {expanded && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Sponsored • {ad.category}</span>
                      <div className="flex items-center space-x-1">
                        {adViewed ? (
                          <>
                            <Eye className="w-3 h-3 text-green-500" />
                            <span className="text-green-500">Viewed</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-gray-400" />
                            <span>Viewing...</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <button
                        onClick={handleClosePermanently}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Disable ads
                      </button>
                      <button
                        onClick={handleNextAd}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                      >
                        Next offer
                      </button>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => handleAdClick(ad.url)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>{ad.cta}</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Offer {currentAd + 1} of {adsQueue.length}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 text-xs">
                    {user ? 'Member benefits' : 'Guest access'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Adverse;