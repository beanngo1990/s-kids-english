export const firebaseAuthConfig = {
  googleWebClientId: '536861541585-pbk3v0ilmcm6bos8227ovsf78d6eo8qs.apps.googleusercontent.com',
  googleIosClientId: '536861541585-q8rvf6j9co7ktumjfkk0l75mmbmcgv4a.apps.googleusercontent.com',
} as const;

export function hasGoogleWebClientId() {
  return firebaseAuthConfig.googleWebClientId.trim().length > 0;
}

export function hasGoogleIosClientId() {
  return firebaseAuthConfig.googleIosClientId.trim().length > 0;
}
