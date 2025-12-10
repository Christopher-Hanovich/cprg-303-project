import { Tabs } from "expo-router";
import { RouteProvider } from "../contexts/RouteContext";

export default function RootLayout() {
  return (
    <RouteProvider>
      <Tabs>
        <Tabs.Screen name="index" options={{ title: "Map", headerShown: false }} />
        <Tabs.Screen name="weather" options={{ title: "Weather", headerShown: false }} />
      </Tabs>
    </RouteProvider>
  );
}