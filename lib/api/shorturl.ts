import axios from "axios";

interface ShortURLResponse {
  alias: string;
  short_url: string;
  long_url: string;
  owner_id: string | null;
  created_at: number;
  status: "ACTIVE" | "INACTIVE";
  private_stats: boolean;
}

interface IsGdResponse {
  shorturl: string;
}

export async function createShortURL(longUrl: string): Promise<string> {
  // Check if URL is localhost - most URL shorteners reject these
  const isLocalhost =
    longUrl.includes("localhost") || longUrl.includes("127.0.0.1");

  if (isLocalhost) {
    throw new Error(
      "Cannot shorten localhost URLs. URL shorteners require public URLs.",
    );
  }

  try {
    const response = await axios.post<ShortURLResponse>(
      "https://spoo.me/api/v1/shorten",
      { long_url: longUrl },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      },
    );

    return response.data.short_url;
  } catch (error) {
    console.error("Failed to create short URL with spoo.me:", error);

    try {
      const fallbackResponse = await axios.get<IsGdResponse>(
        `https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`,
        { timeout: 5000 },
      );
      return fallbackResponse.data.shorturl;
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      throw new Error("Failed to create short URL");
    }
  }
}
