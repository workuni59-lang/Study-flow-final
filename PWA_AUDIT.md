# StudyFlow PWA Audit Checklist

This checklist covers the verification steps for the StudyFlow PWA upgrade.

## 1. Installability & Manifest
- [ ] **Manifest Presence**: Verify `manifest.webmanifest` exists in `dist/` and is linked in `index.html`.
- [ ] **App Identity**: Check name ("StudyFlow"), short name, and description in the manifest.
- [ ] **Icons**: Ensure icons (192x192, 512x512) are correctly listed and pointing to the logo.
- [ ] **Display Mode**: Verify `display: standalone` is set for a native app feel.
- [ ] **Orientation**: Verify `orientation: portrait` is set.
- [ ] **Theme Color**: Verify `theme_color` matches the branding (#6366f1).

## 2. Offline Behavior & Service Worker
- [ ] **Service Worker Registration**: Check if `sw.js` is registered in the browser (DevTools > Application > Service Workers).
- [ ] **Static Caching**: Verify JS, CSS, and images are cached in the "Workbox Precache".
- [ ] **Offline Launch**: Disable network and reload the app. It should load the shell and static assets.
- [ ] **SPA Routing Fallback**: Navigate to a sub-route (e.g., `/focus`) while offline and refresh. It should still load.
- [ ] **Font Caching**: Verify Google Fonts are cached under `google-fonts-cache`.

## 3. Mobile native feel (iOS/Android)
- [ ] **iOS Standalone Mode**: Verify `apple-mobile-web-app-capable` meta tag is present.
- [ ] **Status Bar**: Check `apple-mobile-web-app-status-bar-style` (set to `black-translucent`).
- [ ] **Safe Areas**: 
    - [ ] TopBar padding (`pt-safe`) handles notches.
    - [ ] BottomBar padding (`pb-safe`) handles home indicators.
- [ ] **Splash Screen**: Verify the custom loading splash hides smoothly once React mounts.
- [ ] **Smooth Transitions**: Check for lack of "white flash" during navigation in standalone mode.

## 4. Performance & Performance
- [ ] **Lighthouse PWA Score**: Run Lighthouse audit in Chrome. Target > 90.
- [ ] **Build Size**: Verify PWA overhead is minimal.
- [ ] **Update Flow**: Verify "immediate update" logic works when new versions are deployed.

## 5. Known Limitations / Future Steps
- [ ] **Maskable Icons**: Current logo is used; a specific maskable icon (padding around logo) is recommended for Android.
- [ ] **Push Notifications**: Not yet implemented; planned for future releases.
- [ ] **Background Sync**: Can be added for syncing offline study sessions once Supabase offline storage is fully configured.
