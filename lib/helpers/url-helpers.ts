export function generateShareURL(
  name: string,
  description: string | undefined,
  appIds: string[],
  customTokens: string[],
): string {
  const allPackages = [...appIds, ...customTokens];
  const params = new URLSearchParams({
    name: name.trim(),
    packages: allPackages.join(","),
  });

  if (description?.trim()) {
    params.append("description", description.trim());
  }

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://installkit.app";

  return `${baseUrl}?${params.toString()}`;
}
