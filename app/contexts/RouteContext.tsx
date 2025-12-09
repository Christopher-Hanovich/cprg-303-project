import React, { createContext, ReactNode, useContext, useState } from 'react';
import { CityData } from '../utilities/placesAlongRoute';

type RouteContextType = {
  routeCities: CityData[];
  setRouteCities: (cities: CityData[]) => void;
};

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [routeCities, setRouteCities] = useState<CityData[]>([]);

  return (
    <RouteContext.Provider value={{ routeCities, setRouteCities }}>
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

