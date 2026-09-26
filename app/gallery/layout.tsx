import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery"
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
