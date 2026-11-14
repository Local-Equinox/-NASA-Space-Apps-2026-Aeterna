import { artifacts } from '../data/artifacts'

export default function Collection() {
  return (
    <section>
      <h1>Collection</h1>
      <p>0 of {artifacts.length} recovered</p>
    </section>
  )
}
