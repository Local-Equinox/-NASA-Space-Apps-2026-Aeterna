import type { ReactNode } from 'react'
import { Link } from '../lib/router'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand">Left Behind</Link>
        <nav aria-label="Main">
          <Link to="/collection">Collection</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <main>{children}</main>
    </>
  )
}
