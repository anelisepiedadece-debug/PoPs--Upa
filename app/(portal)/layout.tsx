import { requireUser } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export const dynamic = "force-dynamic";
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <>
      <Header user={user} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
