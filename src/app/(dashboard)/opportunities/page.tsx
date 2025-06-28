'use client';

// This file's content has been changed to fix a route conflict.
// The main page is at /src/app/opportunities/page.tsx.
// To avoid a Next.js build error "You cannot have two parallel pages that resolve to the same path",
// this page component is not default exported, which prevents Next.js from treating it as a page.
function ConflictingOpportunitiesPage() {
  return null;
}
