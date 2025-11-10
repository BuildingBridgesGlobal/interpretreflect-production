// Stub service for Next.js migration
export const termsService = {
  checkTermsStatus: (userId: string) => Promise.resolve({ needsAcceptance: false }),
  acceptTerms: (userId: string) => Promise.resolve(),
};
