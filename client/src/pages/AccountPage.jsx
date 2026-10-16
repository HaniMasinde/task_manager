import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCamera, FiEye, FiEyeOff, FiLogOut, FiTrash2, FiUser } from 'react-icons/fi'
import { useAuth } from '../context/useAuth.js'
import { deleteAccount, updatePassword, updateProfile } from '../services/accountService.js'

function PasswordField({ id, label, value, onChange, autoComplete, required = false, minLength, labelClassName = '', inputClassName = '', wrapperClassName = '' }) {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <label className={labelClassName} htmlFor={id}>{label}</label>
      <div className={`account-password-wrap ${wrapperClassName}`.trim()}>
        <input
          className={`account-password-input ${inputClassName}`.trim()}
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
        />
        <button
          className="account-password-toggle"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={`${visible ? 'Hide' : 'Show'} ${typeof label === 'string' ? label.toLowerCase() : 'password'}`}
          aria-pressed={visible}
        >
          {visible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
        </button>
      </div>
    </>
  )
}

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
  const [passwordError, setPasswordError] = useState('')
  const [accessError, setAccessError] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [busyActions, setBusyActions] = useState({ profile: false, password: false, logout: false, delete: false })
  const [picture, setPicture] = useState(user?.profile_picture || '')
  const [pictureError, setPictureError] = useState('')
  const [deletePassword, setDeletePassword] = useState('')

  function setActionBusy(action, busy) {
    setBusyActions((current) => ({ ...current, [action]: busy }))
  }

  function handlePictureChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setPictureError('')
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      event.target.value = ''
      return
    }
    if (file.size > 1024 * 1024) {
      setPictureError('Profile picture must be 1 MB or smaller.')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPicture(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  async function saveProfile(event) {
    event.preventDefault()
    setNotice('')
    if (!profile.name.trim() || !profile.email.trim()) {
      return
    }
    const hasProfileChanges =
      profile.name.trim() !== (user?.name || user?.username || '').trim() ||
      profile.email.trim().toLowerCase() !== (user?.email || '').trim().toLowerCase() ||
      (picture || null) !== (user?.profile_picture || null)
    if (!hasProfileChanges) return

    setActionBusy('profile', true)
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
      if (/picture.*1 mb|1 mb.*picture/i.test(requestError.message || '')) {
        setPictureError(requestError.message)
      }
      // Profile save errors stay text-free unless the image exceeds the size limit.
    } finally {
      setActionBusy('profile', false)
    }
  }

  async function savePassword(event) {
    event.preventDefault()
    setPasswordError('')
    setNotice('')
    if (!passwords.current || passwords.next.length < 8) {
      setPasswordError('Enter your current password and a new password with at least 8 characters.')
      return
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError('The new passwords do not match.')
      return
    }
    setActionBusy('password', true)
    try {
      await updatePassword({ currentPassword: passwords.current, newPassword: passwords.next })
      setPasswords({ current: '', next: '', confirm: '' })
      setNotice('Password updated successfully.')
    } catch (requestError) {
      setPasswordError(requestError.message || 'Could not update your password.')
    } finally {
      setActionBusy('password', false)
    }
  }

  async function handleLogout() {
    setActionBusy('logout', true)
    setAccessError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      setAccessError('Could not log out. Please try again.')
    } finally {
      setActionBusy('logout', false)
    }
  }

  async function handleDelete() {
    setActionBusy('delete', true)
    setAccessError('')
    try {
      await deleteAccount(deletePassword)
      setUser(null)
      navigate('/login', { replace: true })
    } catch (requestError) {
      setAccessError(requestError.message || 'Could not delete your account.')
    } finally {
      setActionBusy('delete', false)
    }
  }

  return (
    <main className="account-page">
      <div className="account-shell">
        <header className="account-header">
          <div className="account-avatar" aria-hidden="true">
            {picture ? <img src={picture} alt="" /> : <FiUser />}
          </div>
          <div>
            <p className="account-eyebrow">YOUR ACCOUNT</p>
            <h1>Account settings</h1>
            <p>Welcome, {user?.name || user?.username || 'there'}. Manage your profile, security, and account access.</p>
          </div>
        </header>

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
              <div className="profile-picture-actions">
                <input className="visually-hidden-input" id="profile-picture" type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePictureChange} />
                <label className="secondary-button profile-picture-button" htmlFor="profile-picture"><FiCamera aria-hidden="true" /> Upload picture</label>
                {picture && <button className="profile-picture-remove" type="button" onClick={() => { setPicture(''); setPictureError('') }}>Remove picture</button>}
              </div>
              {pictureError && <p className="profile-picture-error" role="alert">{pictureError}</p>}
            </div>
          </div>
          <form className="account-form" onSubmit={saveProfile}>
            <label htmlFor="account-name">Full name</label>
            <input id="account-name" autoComplete="name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required />
            <label htmlFor="account-email">Email address</label>
            <input id="account-email" type="email" autoComplete="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required />
            <PasswordField id="profile-current-password" label={<>Current password <span className="account-optional-hint">(required to change email)</span></>} value={profile.currentPassword} onChange={(event) => setProfile({ ...profile, currentPassword: event.target.value })} autoComplete="current-password" />
            <button className="primary-button" type="submit" disabled={busyActions.profile}>{busyActions.profile ? 'Saving...' : 'Save profile'}</button>
          </form>
        </section>

        <section className="account-card" aria-labelledby="password-heading">
          <div className="account-card-heading"><div><h2 id="password-heading">Change password</h2><p>Choose a strong password you do not use elsewhere.</p></div></div>
          <form className="account-form" onSubmit={savePassword}>
            <PasswordField id="current-password" label="Current password" autoComplete="current-password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required />
            <PasswordField id="new-password" label="New password" autoComplete="new-password" value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} minLength={8} required />
            <PasswordField id="confirm-password" label="Confirm new password" autoComplete="new-password" value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} minLength={8} required />
            {passwordError && <p className="form-error" role="alert">{passwordError}</p>}
            <button className="primary-button" type="submit" disabled={busyActions.password}>{busyActions.password ? 'Updating…' : 'Update password'}</button>
          </form>
        </section>

        <section className="account-card account-actions-card" aria-labelledby="security-heading">
          <div className="account-card-heading"><div><p className="account-eyebrow">SECURITY</p><h2 id="security-heading">Account access</h2><p>Sign out on this device or permanently delete your account and tasks.</p></div></div>
          <div className="account-access-actions">
            <button className="secondary-button" type="button" onClick={handleLogout} disabled={busyActions.logout}><FiLogOut aria-hidden="true" /> {busyActions.logout ? 'Signing out…' : 'Log out'}</button>
            <button className="danger-button" type="button" onClick={() => { setAccessError(''); setShowDelete(true) }}><FiTrash2 aria-hidden="true" /> Delete account</button>
          </div>
          {accessError && !showDelete && <p className="form-error account-access-error" role="alert">{accessError}</p>}
        </section>
      </div>

      {showDelete && <div className="delete-dialog-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowDelete(false) }}>
        <section className="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="account-delete-title" aria-describedby="account-delete-description">
          <h2 id="account-delete-title">Remove this account?</h2>
          <p id="account-delete-description">This permanently deletes your account and its tasks. Enter your password to confirm.</p>
          <PasswordField id="delete-account-password" label="Current password" labelClassName="account-delete-password-label" inputClassName="account-delete-password" wrapperClassName="account-delete-password-wrap" autoComplete="current-password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} />
          {accessError && <p className="form-error" role="alert">{accessError}</p>}
          <div className="delete-dialog-actions"><button className="secondary-button" type="button" disabled={busyActions.delete} onClick={() => { setShowDelete(false); setDeletePassword(''); setAccessError('') }}>Cancel</button><button className="delete-confirm-button" type="button" disabled={busyActions.delete || !deletePassword} onClick={handleDelete}>{busyActions.delete ? 'Deleting…' : 'Delete account'}</button></div>
        </section>
      </div>}
    </main>
  )
}

export default AccountPage
