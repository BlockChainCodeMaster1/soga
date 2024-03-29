import { useScroll2Top } from '@/hooks/useScroll2Top'
import loadable from '@loadable/component'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { Toaster } from 'react-hot-toast'
import { Navigate, Route, Routes } from 'react-router-dom'

const Home = loadable(() => import('@/pages/home'))
const HomeH5 = loadable(() => import('@/pages/home/h5'))
export const endpoint = 'https://solana-mainnet.g.alchemy.com/v2/wQgTJqxkI3Gkck1SDW54mEiGOu5FeAlV'
function App() {
  useScroll2Top()

  // const network = 'devnet' // 选择 'mainnet-beta', 'testnet', 或 'devnet'
  // const endpoint = clusterApiUrl(network)

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new BackpackWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider autoConnect wallets={wallets}>
        <div>
          <Routes>
            <Route path="/" element={isMobile ? <HomeH5 /> : <Home />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Toaster toastOptions={{ style: { background: '#404040', color: '#fff' } }} />
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
