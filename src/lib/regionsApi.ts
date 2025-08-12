// Indonesian Regions API Client
export interface Region {
  id: string;
  code: string;
  name: string;
  level: number;
  provinceCode?: string;
  provinceName?: string;
  regencyCode?: string;
  regencyName?: string;
  districtCode?: string;
  districtName?: string;
  villageCode?: string;
  villageName?: string;
  displayName?: string; // Hierarchical display name
  latitude?: number;
  longitude?: number;
  timezone?: string;
  hasWeatherData: boolean;
  isActive: boolean;
}

export interface RegionsListResponse {
  data: Region[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RegionsSearchParams {
  level?: number;
  provinceCode?: string;
  regencyCode?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://eamagineweather-production.up.railway.app/api/v1';

class RegionsApiClient {
  // Get regions with filtering and pagination
  async getRegions(params: RegionsSearchParams = {}): Promise<RegionsListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.level) searchParams.append('level', params.level.toString());
    if (params.provinceCode) searchParams.append('provinceCode', params.provinceCode);
    if (params.regencyCode) searchParams.append('regencyCode', params.regencyCode);
    if (params.search) searchParams.append('search', params.search);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${BASE_URL}/regions?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch regions: ${response.statusText}`);
    }
    return response.json();
  }

  // Get all provinces
  async getProvinces(): Promise<{ data: Region[]; total: number }> {
    const response = await fetch(`${BASE_URL}/regions/provinces`);
    if (!response.ok) {
      throw new Error(`Failed to fetch provinces: ${response.statusText}`);
    }
    return response.json();
  }

  // Get regencies by province
  async getRegenciesByProvince(provinceCode: string): Promise<{ data: Region[]; total: number }> {
    const response = await fetch(`${BASE_URL}/regions/regencies/${provinceCode}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch regencies: ${response.statusText}`);
    }
    return response.json();
  }

  // Get villages with weather data by regency (paginated)
  async getVillagesByRegency(
    regencyCode: string,
    page = 1,
    limit = 20
  ): Promise<RegionsListResponse> {
    const response = await fetch(
      `${BASE_URL}/regions/villages/${regencyCode}?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch villages: ${response.statusText}`);
    }
    return response.json();
  }

  // Search regions
  async searchRegions(
    query: string,
    level?: number,
    limit = 20
  ): Promise<{ data: Region[]; total: number }> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    if (level) searchParams.append('level', level.toString());
    searchParams.append('limit', limit.toString());

    const response = await fetch(`${BASE_URL}/regions/search?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to search regions: ${response.statusText}`);
    }
    return response.json();
  }

  // Get weather data for a specific village
  async getWeatherData(regionCode: string) {
    const response = await fetch(`${BASE_URL}/weather/current/${regionCode}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }
    return response.json();
  }

  // Batch get weather data for multiple regions
  async batchGetWeatherData(regionCodes: string[]) {
    const weatherPromises = regionCodes.map(code => 
      this.getWeatherData(code).catch(error => {
        console.warn(`Failed to fetch weather for ${code}:`, error);
        return null;
      })
    );
    
    const results = await Promise.all(weatherPromises);
    
    // Return a Map for easy lookup
    const weatherMap = new Map();
    regionCodes.forEach((code, index) => {
      if (results[index]) {
        weatherMap.set(code, results[index]);
      }
    });
    
    return weatherMap;
  }
}

export const regionsApi = new RegionsApiClient();
export default regionsApi;