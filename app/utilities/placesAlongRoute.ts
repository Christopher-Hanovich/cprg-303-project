// Utility to collect distinct city names along a route by sampling coordinates
// and reverse-geocoding them via the Google Geocoding API.

export type LatLng = { latitude: number; longitude: number };

type FetchCitiesAlongRouteArgs = {
	points: LatLng[];
	apiKey: string;
	step?: number; // sample every Nth point to reduce API calls
};

// Extracts a city/locality-like name from a geocode result.
const extractCity = (result: any): string | null => {
	if (!result?.address_components) return null;
	const component = result.address_components.find((c: any) =>
		c.types?.includes("locality") || c.types?.includes("administrative_area_level_2")
	);
	return component?.long_name ?? null;
};

const geocodeCity = async (point: LatLng, apiKey: string): Promise<string | null> => {
	const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${point.latitude},${point.longitude}&key=${apiKey}`;
	try {
		const res = await fetch(url);
		const data = await res.json();
		if (data.status !== "OK" || !data.results?.length) return null;
		return extractCity(data.results[0]);
	} catch (err) {
		console.warn("geocodeCity failed", err);
		return null;
	}
};

export const fetchCitiesAlongRoute = async ({ points, apiKey, step = 25 }: FetchCitiesAlongRouteArgs): Promise<string[]> => {
	if (!apiKey) throw new Error("Google API key is required");
	if (!points?.length) return [];

	const sampled: LatLng[] = [];
	for (let i = 0; i < points.length; i += Math.max(1, step)) {
		sampled.push(points[i]);
	}
	// Ensure we include the final point
	if (sampled[sampled.length - 1] !== points[points.length - 1]) {
		sampled.push(points[points.length - 1]);
	}

	const seen = new Set<string>();
	const cities: string[] = [];

	for (const pt of sampled) {
		const city = await geocodeCity(pt, apiKey);
		if (city && !seen.has(city)) {
			seen.add(city);
			cities.push(city);
		}
	}

	return cities;
};

