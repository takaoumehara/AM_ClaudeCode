'use client';

import { TamaguiProvider } from '@tamagui/core';
import config from '../../../tamagui.config';

export function TamaguiClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      {children}
    </TamaguiProvider>
  );
}