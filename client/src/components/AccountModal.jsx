import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import PresetAvatarGrid, { AvatarDisplay } from './PresetAvatarGrid';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import axiosClient from '../api/axiosClient';

const AccountModal = () => {
  const {
    accountModalOpen,
    setAccountModalOpen,
    accountTab,
    setAccountTab,
    user,
    updateProfile,
    updateUsername,
    changePassword,
    requestEmailChange,
    setPresetAvatar,
    uploadCustomAvatar,
    deleteCustomAvatar,
    deleteAccount,
    logoutAll,
    resendVerification,
    setVerifyModalOpen
  } = useAuth();

  const { showToast } = useApp();

  // Profile Form State
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [cookingLevel, setCookingLevel] = useState('beginner');
  const [favCuisines, setFavCuisines] = useState('');
  const [dietaryPrefs, setDietaryPrefs] = useState('');
  const [allergies, setAllergies] = useState('');
  const [favIngredients, setFavIngredients] = useState('');
  const [socialGithub, setSocialGithub] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');

  // Security Form State
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [deletePhrase, setDeletePhrase] = useState('');

  // Availability State
  const [usernameStatus, setUsernameStatus] = useState(null);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setWebsite(user.website || '');
      setCookingLevel(user.cookingLevel || 'beginner');
      setFavCuisines(user.favoriteCuisines ? user.favoriteCuisines.join(', ') : '');
      setDietaryPrefs(user.dietaryPreferences ? user.dietaryPreferences.join(', ') : '');
      setAllergies(user.allergies ? user.allergies.join(', ') : '');
      setFavIngredients(user.favoriteIngredients ? user.favoriteIngredients.join(', ') : '');
      setSocialGithub(user.socialLinks?.github || '');
      setSocialInstagram(user.socialLinks?.instagram || '');
      setSocialTwitter(user.socialLinks?.twitter || '');
      setSocialYoutube(user.socialLinks?.youtube || '');
    }
  }, [user, accountModalOpen]);

  // Debounced Username check inside Account modal
  useEffect(() => {
    if (!username.trim() || (user && username.trim().toLowerCase() === user.usernameNormalized)) {
      setUsernameStatus(null);
      return;
    }

    setUsernameStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await axiosClient.get(`/auth/check-username?username=${encodeURIComponent(username.trim())}`);
        setUsernameStatus({ checking: false, available: res.data.available, reason: res.data.reason });
      } catch (err) {
        setUsernameStatus(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, user]);

  const handleVerifyNow = async () => {
    try {
      await resendVerification(user.email);
      showToast('Sent 6-digit verification code to your email!');
      setVerifyModalOpen(true);
    } catch (err) {
      showToast('Error sending verification code.');
    }
  };

  if (!accountModalOpen || !user) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      // 1. Update username if changed
      if (username.trim().toLowerCase() !== user.usernameNormalized) {
        await updateUsername(username.trim());
      }

      // 2. Update general profile fields
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
        cookingLevel,
        favoriteCuisines: favCuisines.split(',').map(s => s.trim()).filter(Boolean),
        dietaryPreferences: dietaryPrefs.split(',').map(s => s.trim()).filter(Boolean),
        allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
        favoriteIngredients: favIngredients.split(',').map(s => s.trim()).filter(Boolean),
        socialLinks: {
          github: socialGithub.trim(),
          instagram: socialInstagram.trim(),
          twitter: socialTwitter.trim(),
          youtube: socialYoutube.trim()
        }
      });

      setSuccessMsg('Profile saved successfully!');
      showToast('Profile updated!');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await changePassword(currentPassword, newPassword);
      setSuccessMsg(res.message);
      setCurrentPassword('');
      setNewPassword('');
      showToast('Password changed!');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChangeSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await requestEmailChange(newEmail, emailPassword);
      setSuccessMsg(res.message);
      setNewEmail('');
      setEmailPassword('');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Email change request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5 MB.');
      return;
    }

    setLoading(true);
    try {
      await uploadCustomAvatar(file);
      showToast('Custom avatar uploaded!');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to upload avatar image.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    if (deletePhrase !== 'DELETE MY ACCOUNT') return;

    setErrorMsg(null);
    setLoading(true);

    try {
      await deleteAccount(deletePassword, deletePhrase);
      showToast('Your account has been deleted permanently.');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Account deletion failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-modal-backdrop" onClick={() => setAccountModalOpen(false)}>
      <div className="modal-content-custom" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        {/* Profile Banner Header */}
        <div className="p-4 border-bottom border-dark bg-white">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <AvatarDisplay avatar={user.avatar} size={72} />
              <div>
                <h3 className="fw-bold mb-0 text-dark" style={{ fontFamily: 'var(--font-heading)' }}>
                  {user.displayName || user.username}
                </h3>
                <div className="d-flex align-items-center gap-2 flex-wrap text-muted small">
                  <span>@{user.username}</span>
                  <span>&bull;</span>
                  <span className="badge bg-warning text-dark fw-bold">{user.cookingLevel || 'Beginner'}</span>
                  <span>&bull;</span>
                  {user.emailVerified ? (
                    <span className="badge bg-success"><i className="bi bi-patch-check-fill me-1"></i>Verified</span>
                  ) : (
                    <div className="d-inline-flex align-items-center gap-1">
                      <span className="badge bg-secondary"><i className="bi bi-exclamation-circle me-1"></i>Unverified</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-warning text-dark fw-bold rounded-pill py-0 px-2 border-dark"
                        style={{ fontSize: '0.75rem', boxShadow: '1px 1px 0px #111' }}
                        onClick={handleVerifyNow}
                      >
                        <i className="bi bi-patch-check me-1"></i>Verify Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button type="button" className="btn-close" onClick={() => setAccountModalOpen(false)} aria-label="Close"></button>
          </div>

          {/* Account Tabs */}
          <div className="d-flex gap-2 mt-4 border-top pt-3 flex-wrap">
            <button
              type="button"
              className={`btn btn-sm rounded-pill fw-bold ${accountTab === 'profile' ? 'btn-black' : 'btn-outline-dark'}`}
              onClick={() => setAccountTab('profile')}
            >
              <i className="bi bi-person-circle me-1"></i> Profile & Avatars
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill fw-bold ${accountTab === 'security' ? 'btn-orange' : 'btn-outline-dark'}`}
              onClick={() => setAccountTab('security')}
            >
              <i className="bi bi-shield-lock-fill me-1"></i> Security & Password
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill fw-bold ${accountTab === 'preferences' ? 'btn-black' : 'btn-outline-dark'}`}
              onClick={() => setAccountTab('preferences')}
            >
              <i className="bi bi-sliders me-1"></i> Culinary Preferences
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="modal-body p-4" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {errorMsg && (
            <div className="alert alert-danger border border-dark rounded-3 p-2 small mb-3">
              <i className="bi bi-exclamation-triangle-fill me-1"></i> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success border border-dark rounded-3 p-2 small mb-3">
              <i className="bi bi-check-circle-fill me-1"></i> {successMsg}
            </div>
          )}

          {/* 1. PROFILE & AVATAR TAB */}
          {accountTab === 'profile' && (
            <form onSubmit={handleProfileSubmit}>
              {/* Avatar Selection */}
              <div className="card p-3 border-dark mb-4 bg-light shadow-sm">
                <h6 className="fw-bold border-bottom border-dark pb-2 mb-3">
                  <i className="bi bi-image-fill me-1 text-warning"></i>Choose Your Avatar
                </h6>
                <PresetAvatarGrid
                  selectedPresetId={user.avatar?.type === 'preset' ? user.avatar?.presetId : null}
                  onSelect={(presetId) => setPresetAvatar(presetId)}
                />

                <div className="d-flex align-items-center gap-3 mt-3 pt-3 border-top border-secondary-subtle flex-wrap">
                  <label className="btn btn-sm btn-outline-dark rounded-pill fw-bold mb-0">
                    <i className="bi bi-upload me-1"></i> Upload Custom Photo
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="d-none" onChange={handleFileUpload} />
                  </label>
                  {user.avatar?.type === 'custom' && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-pill fw-bold"
                      onClick={deleteCustomAvatar}
                    >
                      <i className="bi bi-trash me-1"></i> Remove Custom Photo
                    </button>
                  )}
                  <small className="text-muted">JPEG, PNG, or WebP under 5 MB.</small>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Display Name</label>
                  <input
                    type="text"
                    className="form-control border-dark"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Username</label>
                  <input
                    type="text"
                    className="form-control border-dark"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {usernameStatus && (
                    <small className={`d-block mt-1 ${usernameStatus.checking ? 'text-muted' : usernameStatus.available ? 'text-success fw-bold' : 'text-danger'}`}>
                      {usernameStatus.checking ? 'Checking availability...' : usernameStatus.reason}
                    </small>
                  )}
                </div>

                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-bold mb-0">Bio</label>
                    <small className="text-muted">{bio.length}/250</small>
                  </div>
                  <textarea
                    className="form-control border-dark"
                    rows="2"
                    maxLength={250}
                    placeholder="Tell fellow home cooks about your culinary style..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  ></textarea>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Location</label>
                  <input
                    type="text"
                    className="form-control border-dark"
                    placeholder="e.g. San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Website / Blog</label>
                  <input
                    type="url"
                    className="form-control border-dark"
                    placeholder="https://myfoodblog.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>

              {/* Social Links */}
              <h6 className="fw-bold border-bottom border-dark pb-2 mb-3 mt-4">
                <i className="bi bi-share-fill me-1 text-primary"></i>Social Profiles (Allowlisted)
              </h6>
              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-dark"><i className="bi bi-github"></i></span>
                    <input
                      type="url"
                      className="form-control border-dark"
                      placeholder="https://github.com/username"
                      value={socialGithub}
                      onChange={(e) => setSocialGithub(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-dark"><i className="bi bi-instagram"></i></span>
                    <input
                      type="url"
                      className="form-control border-dark"
                      placeholder="https://instagram.com/username"
                      value={socialInstagram}
                      onChange={(e) => setSocialInstagram(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-dark"><i className="bi bi-twitter-x"></i></span>
                    <input
                      type="url"
                      className="form-control border-dark"
                      placeholder="https://x.com/username"
                      value={socialTwitter}
                      onChange={(e) => setSocialTwitter(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-dark"><i className="bi bi-youtube"></i></span>
                    <input
                      type="url"
                      className="form-control border-dark"
                      placeholder="https://youtube.com/@channel"
                      value={socialYoutube}
                      onChange={(e) => setSocialYoutube(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-dark">
                <button type="submit" className="btn btn-orange" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* 2. SECURITY & PASSWORD TAB */}
          {accountTab === 'security' && (
            <div>
              {/* Email Address & Verification */}
              <div className="card p-3 border-dark mb-4 bg-white shadow-sm">
                <h6 className="fw-bold border-bottom border-dark pb-2 mb-3">
                  <i className="bi bi-envelope-check-fill me-1 text-success"></i>Email & Verification
                </h6>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <div>
                    <span className="fw-bold d-block">{user.email}</span>
                    <small className="text-muted">
                      Status: {user.emailVerified ? (
                        <span className="text-success fw-bold"><i className="bi bi-check-circle-fill me-1"></i>Verified</span>
                      ) : (
                        <span className="d-inline-flex align-items-center gap-2">
                          <span className="text-warning fw-bold"><i className="bi bi-exclamation-circle me-1"></i>Unverified</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-warning text-dark fw-bold rounded-pill py-0 px-2 border-dark"
                            style={{ fontSize: '0.75rem', boxShadow: '1px 1px 0px #111' }}
                            onClick={handleVerifyNow}
                          >
                            <i className="bi bi-patch-check me-1"></i>Verify Now
                          </button>
                        </span>
                      )}
                    </small>
                  </div>
                </div>

                {/* Change Email Form */}
                <form onSubmit={handleEmailChangeSubmit} className="border-top pt-3">
                  <label className="form-label fw-bold small text-uppercase">Change Email Address</label>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <input
                        type="email"
                        className="form-control border-dark"
                        required
                        placeholder="New email address"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="password"
                        className="form-control border-dark"
                        required
                        placeholder="Confirm with current password"
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-sm btn-black mt-2" disabled={loading}>
                    Send Email Change Verification
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="card p-3 border-dark mb-4 bg-white shadow-sm">
                <h6 className="fw-bold border-bottom border-dark pb-2 mb-3">
                  <i className="bi bi-key-fill me-1 text-warning"></i>Change Password
                </h6>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Current Password</label>
                    <input
                      type="password"
                      className="form-control border-dark"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">New Password</label>
                    <input
                      type="password"
                      className="form-control border-dark"
                      required
                      placeholder="At least 12 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <PasswordStrengthMeter password={newPassword} />
                  </div>

                  <button type="submit" className="btn btn-sm btn-orange" disabled={loading}>
                    Update Password
                  </button>
                </form>
              </div>

              {/* Sign Out Everywhere */}
              <div className="card p-3 border-dark mb-4 bg-light shadow-sm">
                <h6 className="fw-bold mb-1">Active Sessions & Devices</h6>
                <p className="text-muted small mb-3">Sign out of all browsers and mobile sessions across all devices.</p>
                <div>
                  <button type="button" className="btn btn-sm btn-outline-dark fw-bold rounded-pill" onClick={logoutAll}>
                    <i className="bi bi-box-arrow-right me-1"></i> Sign Out of All Sessions
                  </button>
                </div>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="card p-3 border-danger mb-2 bg-light shadow-sm">
                <h6 className="fw-bold text-danger mb-1"><i className="bi bi-exclamation-triangle-fill me-1"></i>Danger Zone: Delete Account</h6>
                <p className="text-muted small mb-3">Permanently delete your WhiskedAway account, custom recipes, saved cookbook items, and profile details.</p>

                <form onSubmit={handleDeleteAccountSubmit}>
                  <div className="row g-2 mb-2">
                    <div className="col-md-6">
                      <input
                        type="password"
                        className="form-control border-danger"
                        required
                        placeholder="Current password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control border-danger"
                        required
                        placeholder='Type "DELETE MY ACCOUNT"'
                        value={deletePhrase}
                        onChange={(e) => setDeletePhrase(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-sm btn-danger fw-bold rounded-pill"
                    disabled={deletePhrase !== 'DELETE MY ACCOUNT' || loading}
                  >
                    Permanently Delete Account
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 3. CULINARY PREFERENCES TAB */}
          {accountTab === 'preferences' && (
            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Cooking Skill Level</label>
                  <select
                    className="form-select border-dark"
                    value={cookingLevel}
                    onChange={(e) => setCookingLevel(e.target.value)}
                  >
                    <option value="beginner">Beginner Home Cook</option>
                    <option value="intermediate">Intermediate Foodie</option>
                    <option value="advanced">Advanced Culinary Hobbyist</option>
                    <option value="professional">Professional Chef</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Favorite Cuisines</label>
                  <input
                    type="text"
                    className="form-control border-dark"
                    placeholder="e.g. Italian, Mexican, Asian, Indian"
                    value={favCuisines}
                    onChange={(e) => setFavCuisines(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Dietary Preferences</label>
                  <input
                    type="text"
                    className="form-control border-dark"
                    placeholder="e.g. Vegetarian, Vegan, Gluten-Free"
                    value={dietaryPrefs}
                    onChange={(e) => setDietaryPrefs(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Allergies & Sensitivities</label>
                  <input
                    type="text"
                    className="form-control border-dark"
                    placeholder="e.g. Peanuts, Shellfish, Dairy"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold">Favorite Go-To Pantry Ingredients</label>
                  <input
                    type="text"
                    className="form-control border-dark"
                    placeholder="e.g. Garlic, Olive Oil, Avocado, Eggs"
                    value={favIngredients}
                    onChange={(e) => setFavIngredients(e.target.value)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-dark">
                <button type="submit" className="btn btn-orange" disabled={loading}>
                  Save Preferences
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
