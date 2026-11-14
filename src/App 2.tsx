import { usePath } from './lib/router'
import { artifacts } from './data/artifacts'
import Layout from './components/Layout'
import Home from './pages/Home'
import SiteMap from './pages/SiteMap'
import ArtifactFlow from './pages/ArtifactFlow'
import Collection from './pages/Collection'
import About from './pages/About'
import NotFound from './pages/NotFound'

export default function App() {
  const path = usePath()
  const parts = path.split('/').filter(Boolean)

  let page = <NotFound />
  if (parts.length === 0) page = <Home />
  else if (parts[0] === 'world' && (parts[1] === 'moon' || parts[1] === 'mars')) page = <SiteMap world={parts[1]} />
  else if (parts[0] === 'artifact' && parts[1]) {
    const artifact = artifacts.find((a) => a.id === parts[1])
    if (artifact) page = <ArtifactFlow artifact={artifact} />
  } else if (parts[0] === 'collection') page = <Collection />
  else if (parts[0] === 'about') page = <About />

  return <Layout>{page}</Layout>
}
