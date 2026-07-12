import { LoginClient } from "@/components/auth/LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <LoginClient callbackUrl={callbackUrl || "/"} />;
}
