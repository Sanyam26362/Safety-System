import axios from "axios";

export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon: lng,
          format: "json"
        },
        headers: {
          // Required by Nominatim usage policy
          "User-Agent": "safety-system-backend"
        }
      }
    );

    return response.data.display_name || "Unknown location";
  } catch (error) {
    return "Location unavailable";
  }
};
