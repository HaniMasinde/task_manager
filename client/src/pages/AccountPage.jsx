import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCamera, FiLogOut, FiTrash2, FiUser } from 'react-icons/fi'
import { useAuth } from '../context/useAuth.js'
import { deleteAccount, updatePassword, updateProfile } from '../services/accountService.js'

function AccountPage() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    name: user?.name || user?.username || '',
    email: user?.email || '',
    currentPassword: '',
  })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [picture, setPicture] = useState(user?.profile_picture || '')
  const [pictureError, setPictureError] = useState('')
  const [deletePassword, setDeletePassword] = useState('')

  function handlePictureChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setPictureError('')
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setPictureError('Choose a PNG, JPEG, or WebP image.')
      event.target.value = ''
      return
    }
    if (file.size > 1024 * 1024) {
      setPictureError('Choose an image no larger than 1 MB.')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPicture(String(reader.result || ''))
    reader.onerror = () => setPictureError('Could not read this image. Please try another file.')
    reader.readAsDataURL(file)
  }

  async function saveProfile(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!profile.name.trim() || !profile.email.trim()) {
      setError('Complete all profile fields before saving.')
      return
    }
    setBusy(true)
    try {
      const updatedUser = await updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
        profilePicture: picture || null,
        currentPassword: profile.currentPassword,
      })
      setUser(updatedUser)
      setProfile({ name: updatedUser.name, email: updatedUser.email, currentPassword: '' })
      setPicture(updatedUser.profile_picture || '')
      setNotice('Profile updated successfully.')
    } catch (requestError) {
      setError(requestError.message || 'Could not update your profile.')
    } finally {
      setBusy(false)
    }
  }

  async function savePassword(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!passwords.current || passwords.next.length < 8) {
      setError('Enter your current password and a new password with at least 8 characters.')
      return
    }
    if (passwords.next !== passwords.confirm) {
      setError('The new passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await updatePassword({ currentPassword: passwords.current, newPassword: passwords.next })
      setPasswords({ current: '', next: '', confirm: '' })
      setNotice('Password updated successfully.')
    } catch (requestError) {
      setError(requestError.message || 'Could not update your password.')
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    setBusy(true)
    setError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      setError('Could not log out. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    setError('')
    try {
      await deleteAccount(deletePassword)
      setUser(null)
      navigate('/login', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Could not delete your account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="account-page">
      <div className="account-shell">
        <Link className="account-back-link" to="/tasks"><FiArrowLeft aria-hidden="true" /> Back to tasks</Link>
        <header className="account-header">
          <div className="account-avatar" aria-hidden="true"><FiUser /></div>
          <div>
            <p className="account-eyebrow">ACCOUNT SETTINGS</p>
            <h1>Manage your account</h1>
            <p>Update your profile and manage account access.</p>
          </div>
        </header>

        {error && <p className="account-message account-error" role="alert">{error}</p>}
        {notice && <p className="account-message account-success" role="status">{notice}</p>}

        <section className="account-card" aria-labelledby="profile-heading">
          <div className="account-card-heading"><div><h2 id="profile-heading">Profile details</h2><p>Change your display name or email address.</p></div></div>
          <div className="profile-picture-row">
            <div className="profile-picture-preview" aria-label="Profile picture preview">
              {picture ? <img src={picture} alt="Selected profile" /> : <FiUser aria-hidden="true" />}
            </div>
            <div className="profile-picture-controls">
              <strong>Profile picture</strong>
              <p>PNG, JPEG, or WebP. Maximum file size: 1 MB.</p>
              <label className="secondary-button profile-picture-button" htmlFor="profile-picture"><FiCamera aria-hidden="true" /> Choose picture</label>
              <input className="visually-hidden-input" id="profile-picture" type="file" accept="image/*" onChange={handlePictureChange} />
              {pictureError && <p className="form-error" role="alert">{pictureError}</p>}
            </div>
          </div>
          <form className="account-form" onSubmit={saveProfile}>
            <label htmlFor="account-name">Full name</label>
            <input id="account-name" autoComplete="name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required />
            <label htmlFor="account-email">Email address</label>
            <input id="account-email" type="email" autoComplete="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required />
            <label htmlFor="profile-current-password">Current password <span className="account-optional-hint">(required to change email)</span></label>
            <input id="profile-current-password" type="password" autoComplete="current-password" value={profile.currentPassword} onChange={(event) => setProfile({ ...profile, currentPassword: event.target.value })} />
            <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
          </form>
        </section>

        <section className="account-card" aria-labelledby="password-heading">
          <div className="account-card-heading"><div><h2 id="password-heading">Change password</h2><p>Choose a strong password you do not use elsewhere.</p></div></div>
          <form className="account-form" onSubmit={savePassword}>
            <label htmlFor="current-password">Current password</label>
            <input id="current-password" type="password" autoComplete="current-password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required />
            <label htmlFor="new-password">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" minLength={8} value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} required />
            <label htmlFor="confirm-password">Confirm new password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} required />
            <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
          </form>
        </section>

        <section className="account-card account-actions-card" aria-labelledby="security-heading">
          <div className="account-card-heading"><div><h2 id="security-heading">Account access</h2><p>Sign out on this device or permanently delete your account and tasks.</p></div></div>
          <div className="account-access-actions">
            <button className="secondary-button" type="button" onClick={handleLogout} disabled={busy}><FiLogOut aria-hidden="true" /> {busy ? 'Signing out…' : 'Log out'}</button>
            <button className="danger-button" type="button" onClick={() => setShowDelete(true)}><FiTrash2 aria-hidden="true" /> Delete account</button>
          </div>
        </section>
      </div>

      {showDelete && <div className="delete-dialog-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowDelete(false) }}>
        <section className="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="account-delete-title" aria-describedby="account-delete-description">
          <h2 id="account-delete-title">Remove this account?</h2>
          <p id="account-delete-description">This permanently deletes your account and its tasks. Enter your password to confirm.</p>
          <label className="account-delete-password-label" htmlFor="delete-account-password">Current password</label>
          <input className="account-delete-password" id="delete-account-password" type="password" autoComplete="current-password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="delete-dialog-actions"><button className="secondary-button" type="button" disabled={busy} onClick={() => { setShowDelete(false); setDeletePassword('') }}>Cancel</button><button className="delete-confirm-button" type="button" disabled={busy || !deletePassword} onClick={handleDelete}>{busy ? 'Deleting…' : 'Delete account'}</button></div>
        </section>
      </div>}
    </main>
  )
}

export default AccountPage
