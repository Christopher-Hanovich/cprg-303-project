import React, { createContext, ReactNode, useContext, useState } from 'react';

export type CityData = {
  name: string;
  latitude: number;
  longitude: number;
};

type RouteContextType = {
  routeCities: CityData[];
  setRouteCities: (cities: CityData[]) => void;
  weatherData: Record<string, any>;
  setWeatherData: (data: Record<string, any>) => void;
};

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [routeCities, setRouteCities] = useState<CityData[]>([]);
  const [weatherData, setWeatherData] = useState<Record<string, any>>({});

  return (
    <RouteContext.Provider value={{ 
      routeCities, 
      setRouteCities, 
      weatherData, 
      setWeatherData 
    }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
}