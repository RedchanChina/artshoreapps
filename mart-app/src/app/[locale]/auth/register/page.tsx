import { RegisterClient } from "@/components/auth/RegisterClient";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <RegisterClient callbackUrl={callbackUrl || "/"} />;
}
