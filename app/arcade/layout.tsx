import React from "react";

export default function ArcadeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout patterns are now handled at the app level
  return <>{children}</>;
}
