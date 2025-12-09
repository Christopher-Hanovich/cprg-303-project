import { Tabs } from "expo-router";

export default function RootLayout() {
  return <Tabs>
      <Tabs.Screen name="index" options={{ title: "Map", headerShown: false }} />
      <Tabs.Screen name="weather" options={{ title: "Weather", headerShown: false }} />
    </Tabs>
}
