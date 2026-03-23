import React, { useState } from 'react';
import { useSignup } from '../../contexts/SignupContext';
import { useNavigate } from 'react-router-dom';

const SetupImagePage: React.FC = () => {
  const { serviceProviderData, updateServiceProviderData, nextStep, prevStep, isSubmitting } = useSignup();
  const navigate = useNavigate();
  
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [idFrontPreview, setIdFrontPreview] = useState<string>('');
  const [idBackPreview, setIdBackPreview] = useState<string>('');

  const handleImageUpload = (file: File, type: 'profile' | 'idFront' | 'idBack') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      
      if (type === 'profile') {
        setProfileImagePreview(base64String);
        updateServiceProviderData({ profileImage: base64String });
      } else if (type === 'idFront') {
        setIdFrontPreview(base64String);
        updateServiceProviderData({ idFrontImage: base64String });
      } else if (type === 'idBack') {
        setIdBackPreview(base64String);
        updateServiceProviderData({ idBackImage: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      handleImageUpload(file, 'profile');
    }
  };

  const handleIdFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFrontFile(file);
      handleImageUpload(file, 'idFront');
    }
  };

  const handleIdBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdBackFile(file);
      handleImageUpload(file, 'idBack');
    }
  };

  const skipImages = () => {
    // Use placeholder images or skip entirely
    updateServiceProviderData({
      profileImage: 'placeholder_profile',
      idFrontImage: 'placeholder_id_front',
      idBackImage: 'placeholder_id_back'
    });
    nextStep();
  };

  const handleNext = () => {
    // If no images uploaded, use placeholders
    if (!profileImagePreview) {
      updateServiceProviderData({ profileImage: 'placeholder_profile' });
    }
    if (!idFrontPreview) {
      updateServiceProviderData({ idFrontImage: 'placeholder_id_front' });
    }
    if (!idBackPreview) {
      updateServiceProviderData({ idBackImage: 'placeholder_id_back' });
    }
    nextStep();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Setup Your Images</h2>
          <p className="mt-2 text-gray-600">Upload your profile picture and ID documents</p>
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    step <= 5 ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Profile Picture */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>

        {/* ID Documents */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Identity Document
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID Front */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Front Side</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                {idFrontPreview ? (
                  <img src={idFrontPreview} alt="ID Front" className="w-full h-32 object-cover rounded" />
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm1 18h10a1 1 0 001-1v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a1 1 0 001 1zm9-4a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs">Click to upload front</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIdFrontChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* ID Back */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Back Side</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                {idBackPreview ? (
                  <img src={idBackPreview} alt="ID Back" className="w-full h-32 object-cover rounded" />
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm1 18h10a1 1 0 001-1v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a1 1 0 001 1zm9-4a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs">Click to upload back</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIdBackChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={prevStep}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            Back
          </button>
          
          <button
            onClick={skipImages}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            Skip Images
          </button>

          <button
            onClick={handleNext}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Next'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Images are temporarily stored as base64 strings. 
            Firebase Storage integration will be added later.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupImagePage;