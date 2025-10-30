import React from 'react';
import { LoginModal, RegisterModal } from './AuthModal';
import { PostJobModal, DocumentShareModal, DocumentPreviewModal } from './UploadModal';

export const Modals = ({
  // Auth Modal States
  loginOpen, setLoginOpen,
  registerOpen, setRegisterOpen,
  
  // Upload Modal States
  postJobOpen, setPostJobOpen,
  documentShareOpen, setDocumentShareOpen,
  documentPreview, setDocumentPreview,
  
  // Handlers
  handleLogin, handleRegister, handlePostJob,
  handleAddDocument, handleToggleDocumentShare,
  handleDeleteDocument, handlePreviewDocument,
  showNotification,
  
  // Props
  newJob = {},
  handleNewJobChange = () => {},
  handleImageUpload = () => {},
  userDocuments = [],
  user
}) => {
  const switchToRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  const switchToLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  return (
    <>
      {/* Auth Modals */}
      <LoginModal 
        open={loginOpen} 
        onClose={() => setLoginOpen(false)} 
        handleLogin={handleLogin}
        switchToRegister={switchToRegister}
      />
      
      <RegisterModal 
        open={registerOpen} 
        onClose={() => setRegisterOpen(false)} 
        handleRegister={handleRegister}
        switchToLogin={switchToLogin}
      />

      {/* Upload Modals */}
      <PostJobModal 
        open={postJobOpen} 
        onClose={() => setPostJobOpen(false)} 
        newJob={newJob} 
        handleNewJobChange={handleNewJobChange} 
        handlePostJob={handlePostJob}
        handleImageUpload={handleImageUpload}
        user={user}
      />
      
      <DocumentShareModal 
        open={documentShareOpen}
        onClose={() => setDocumentShareOpen(false)}
        handleAddDocument={handleAddDocument}
        userDocuments={userDocuments}
        handleToggleDocumentShare={handleToggleDocumentShare}
        handleDeleteDocument={handleDeleteDocument}
        handlePreviewDocument={handlePreviewDocument}
        showNotification={showNotification}
      />
      
      <DocumentPreviewModal 
        documentPreview={documentPreview}
        setDocumentPreview={setDocumentPreview}
        handleToggleDocumentShare={handleToggleDocumentShare}
      />
    </>
  );
};