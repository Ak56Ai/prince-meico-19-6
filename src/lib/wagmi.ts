import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygon, polygonMumbai, bsc, arbitrum, base } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, polygonMumbai, bsc, arbitrum, base],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'evmico',
        description: 'ICO Marketplace Platform',
        url: 'https://meico.site',
        icons: ['https://meico.site/icon.png']
      }
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
  ssr: false,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}