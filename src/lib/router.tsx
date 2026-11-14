import { useEffect, useState, type AnchorHTMLAttributes } from 'react'

// Tiny hash router: works on any static host with no server config.
function currentPath(): string {
  return window.location.hash.replace(/^#/, '') || '/'
}

export function usePath(): string {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}

export function Link({ to, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={`#${to}`} {...rest} />
}
