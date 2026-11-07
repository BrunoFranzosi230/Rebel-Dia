import Tabs from "@/navigation/Tabs";
import SplashOverlay from "@/components/splash/SplashOverlay";
import { FONT_FILES } from "@/fonts";
import { RotinaProvider, useApp } from "@/store/RotinaProvider";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

// mantém a splash nativa até a tela de abertura animada estar pronta (troca sem piscar)
SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { ready } = useApp();
  const [fontsLoaded, fontError] = useFonts(FONT_FILES);
  return (
    <>
      <Tabs />
      <SplashOverlay ready={ready && (fontsLoaded || !!fontError)} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <RotinaProvider>
          <StatusBar style="auto" />
          <Root />
        </RotinaProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
