# Minha Rotina — port do HTML para React Native

Rode estes comandos na pasta do projeto:

```bash
npx expo install @react-native-async-storage/async-storage expo-notifications
npm install
npx expo start
```

Os dois pacotes novos substituem `localStorage` (AsyncStorage) e as notificações do Capacitor (expo-notifications).
As notificações exigem um development build (`npx expo run:android` / `run:ios`); no Expo Go elas são limitadas.

## Estrutura
- `src/lib/rotina.ts` – tipos, rotina padrão, recorrência (`occ`), caminhos (`act`/`vis`) e layout da timeline (`lay`)
- `src/store/RotinaProvider.tsx` – estado global, persistência, agendamento de notificações e estado dos modais
- `src/screens/Home` e `src/screens/Inbox` – as duas telas
- `src/components/*` – timeline, formulário, visualização, exclusão, caminhos, calendário e roda de horário
- `src/navigator/Tabs.tsx` – barra inferior (substitui `WebRouter.tsx`)

## Expo Go x development build
O Expo Go não inclui o módulo nativo de notificações, então lá o app abre normalmente, só sem lembretes.
Para ter as notificações: `npx expo run:android` (ou `run:ios`) e abra o app instalado, não o Expo Go.

## Ícones e barra de navegação
- Ícones: `@expo/vector-icons` (MaterialCommunityIcons), em `src/components/Icon.tsx`. Os emojis de `IC` em `rotina.ts` seguem como IDs salvos nas tarefas; o mapa `ICN` define o ícone de cada um.
- Barra de navegação transparente: plugin `expo-navigation-bar` com `enforceContrast: false` (precisa rebuild nativo).

## react-native-svg
O anel de progresso dos dias usa `react-native-svg`: `npx expo install react-native-svg` e rebuild (`npx expo run:android`).
