import Tabs from "@/navigation/Tabs";
import SplashOverlay from "@/components/splash/SplashOverlay";
import { RotinaProvider, useApp } from "@/store/RotinaProvider";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

// mantém a splash nativa até a tela de abertura animada estar pronta (troca sem piscar)
SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { ready } = useApp();
  return (
    <>
      <Tabs />
      <SplashOverlay ready={ready} />
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
