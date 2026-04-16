import { useAuth } from '../hooks/useAuth'

function ProfilePage() {
  const { user } = useAuth()

  return (
    <section className="page">
      <h1>My Profile</h1>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <p>Phone: {user?.phone || '-'}</p>
      <p>Address: {user?.address || '-'}</p>
    </section>
  )
}

export default ProfilePage
