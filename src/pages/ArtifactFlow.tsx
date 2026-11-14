import type { Artifact } from '../types/artifact'

// Phase 2: Find it -> Make the call -> Unlock the story.
export default function ArtifactFlow({ artifact }: { artifact: Artifact }) {
  return (
    <section>
      <h1>{artifact.name}</h1>
      <p>{artifact.story.whatItIs}</p>
    </section>
  )
}
