import { requireOptionalNativeModule } from "expo";

type RotinaIconNative = {
  setAppIcon(key: string, keys: string[]): Promise<void>;
};

// null quando o módulo nativo não está no app (Expo Go, web ou app ainda sem o rebuild):
// quem usa simplesmente não troca o ícone do launcher.
const RotinaIcon = requireOptionalNativeModule<RotinaIconNative>("RotinaIcon");
export default RotinaIcon;
