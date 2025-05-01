
// src/app/profile/layout.tsx
import type React from 'react';

// This layout can be used for shared elements within the /profile route group,
// like a sidebar or specific header/footer variations.
// For simple route protection, handling it within the page component itself (like in orders/page.tsx)
// is often sufficient.

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Add any profile-specific layout elements here if needed */}
      {/* e.g., <ProfileSidebar /> */}
      {children}
    </>
  );
}
