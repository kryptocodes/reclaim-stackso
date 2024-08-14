import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {StackClient} from "@stackso/js-core";

import { config } from '../wagmi';

const client = new QueryClient();


export const stack = new StackClient({
  // Get your API key and point system id from the Stack dashboard (stack.so)
  apiKey: process.env.NEXT_PUBLIC_STACK_API_KEY!,
  pointSystemId: 3129,
});


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
