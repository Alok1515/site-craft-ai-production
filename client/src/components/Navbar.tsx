import { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'
import { UserButton } from '@daveyplate/better-auth-ui'
import api from '@/configs/axios'
import { toast } from 'sonner'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)

  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  const getCredits = async () => {
    try {
      const { data } = await api.get('/api/user/credits')
      setCredits(data.credits)
    } catch (error: any) {
      console.error('Credits fetch failed:', error)
      toast.error('Failed to load credits')
    }
  }

  useEffect(() => {
    if (!isPending && session?.user) {
      // Small delay ensures cookies are attached (important on Render)
      const timer = setTimeout(() => {
        getCredits()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [session?.user, isPending])

  return (
    <>
      <nav className="z-50 flex items-center justify-between w-full py-4 px-4 md:px-16 lg:px-24 xl:px-32 backdrop-blur border-b text-white border-slate-800">
        <Link to="/">
          <img src={assets.logo} alt="logo" className="h-5 sm:h-7" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/">Home</Link>
          <Link to="/projects">My Projects</Link>
          <Link to="/community">Community</Link>
          <Link to="/pricing">Pricing</Link>
        </div>

        <div className="flex items-center gap-3">
          {!session?.user ? (
            <button
              onClick={() => navigate('/auth/signin')}
              className="px-6 py-1.5 max-sm:text-sm bg-indigo-600 hover:bg-indigo-700 transition rounded"
            >
              Get started
            </button>
          ) : (
            <>
              <button className="bg-white/10 px-5 py-1.5 text-xs sm:text-sm border text-gray-200 rounded-full">
                Credits:{' '}
                <span className="text-indigo-300">
                  {credits === null ? '...' : credits}
                </span>
              </button>

              <UserButton size="icon" />
            </>
          )}

          <button
            className="md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 text-white backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/projects" onClick={() => setMenuOpen(false)}>My Projects</Link>
          <Link to="/community" onClick={() => setMenuOpen(false)}>Community</Link>
          <Link to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>

          <button
            className="bg-white text-black px-4 py-2 rounded"
            onClick={() => setMenuOpen(false)}
          >
            Close
          </button>
        </div>
      )}
    </>
  )
}

export default Navbar
