// Single source of truth for "what visual represents this project".
//
// Resolution order, so any project can be upgraded without touching components:
//   1. `poster`  — an explicit image in /public (use for projects with no video,
//                  e.g. the live mobile titles once screenshots exist)
//   2. `youtube` — derive the thumbnail from the video id
//   3. null      — caller renders a typographic fallback tile
//
// `preview` is an optional short muted loop (webm/mp4) that may replace the
// still on hover / in view. Absent for now; wired in step 1.4.

const YT = 'https://i.ytimg.com/vi'

export function posterFor(project) {
  if (project.poster) return project.poster
  // maxres is 1280x720; not every upload has it, hence posterFallbackFor
  if (project.youtube) return `${YT}/${project.youtube}/maxresdefault.jpg`
  return null
}

// YouTube answers a missing size with HTTP 200 and a 120x90 grey placeholder
// body, so `onError` never fires — callers detect it by natural width instead
// and swap to this. sddefault (640x480) exists for every video we use.
export function posterFallbackFor(project) {
  if (project.youtube) return `${YT}/${project.youtube}/sddefault.jpg`
  return null
}

export const PLACEHOLDER_MAX_WIDTH = 200

// Short muted loops live in /public/previews/<slug>.webm, generated from each
// project's own video — so a project has a preview exactly when it has a video.
export function previewFor(project) {
  if (project.preview) return project.preview
  // BASE_URL so it resolves under a /repo/ subpath on GitHub Pages
  if (project.youtube) return `${import.meta.env.BASE_URL}previews/${project.slug}.webm`
  return null
}
