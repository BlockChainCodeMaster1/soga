import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useState } from 'react'
import MintNFT from '@/pages/mint/MintNFT'
import { OVERVIEW_API } from '@/config'
import { useRootStore } from '@/store/root'

export interface WhiteListApi {
  minted: boolean
  whiteList: boolean
}

export interface OverviewApi {
  public: number
  whitelist: number
  burn: number
}

const Features = () => {
  const { publicKey } = useWallet()
  const [proof, setPoof] = useState(false)
  const [isMinted, setIsMinted] = useState(true)
  const [totalPublicMint, setTotalPublicMint] = useState(0)
  const [totalWhiteListMint, setTotalWhiteListMint] = useState(0)
  const setBurnAmount = useRootStore((state) => state.setBurnAmount)
  const getProof = useCallback(async () => {
    if (!publicKey) return
    try {
      const req = await fetch('/api/getWhiteListAuth/' + publicKey)
      const rep = await req.json()
      const repData = rep.data as WhiteListApi
      setPoof(repData.whiteList)
      setIsMinted(repData.minted)
    } catch (e) {
      console.error('get proof failed!', e)
    }
  }, [publicKey])

  const getTotalOverView = useCallback(async () => {
    try {
      const req = await fetch(OVERVIEW_API)
      const rep = await req.json()
      const repData = rep.data as OverviewApi
      console.log('repData', repData)
      setTotalPublicMint(repData.public)
      setTotalWhiteListMint(repData.whitelist)
      setBurnAmount(repData.burn)
    } catch (e) {
      console.error('get total overView!', e)
    }
  }, [])

  useEffect(() => {
    getProof().then()
  }, [getProof])

  useEffect(() => {
    getTotalOverView().then()
    const interval = setInterval(() => {
      getTotalOverView().then()
    }, 30000)
    return () => clearInterval(interval)
  }, [getTotalOverView])

  return (
    <div>
      <p>
        Features for <br />
        the Future
      </p>

      <section>
        <div>
          <span>Whitelist</span>
          <span>
            <em>{totalWhiteListMint}</em>
            <i>/1500</i>
          </span>
        </div>
        <div>
          <span />
          <span style={{ width: `${totalWhiteListMint / 1500 * 100}%` }} />
          <em>{(totalWhiteListMint / 1500 * 100).toFixed(2)}%</em>
        </div>
        <ul>
          <li>
            <span>Supply</span>
            <em>1500</em>
          </li>
          <li>
            <span>Mint Price</span>
            <em>1 Sol</em>
          </li>
          <li>
            <span>Balance</span>
            <em>0 Sol</em>
          </li>
        </ul>
        <MintNFT isPublicMint={false} isWhiteList={proof} isMinted={isMinted} />
        <small>Max 1 mint per wallet</small>
      </section>

      <section>
        <div>
          <span>Public Sale</span>
          <span>
            <em>{totalPublicMint}</em>
            <i>/500</i>
          </span>
        </div>
        <div>
          <span />
          <span style={{ width: `${totalPublicMint / 500 * 100}%` }} />
          <em>{(totalPublicMint / 500 * 100).toFixed(2)}%</em>
        </div>
        <ul>
          <li>
            <span>Supply</span>
            <em>500</em>
          </li>
          <li>
            <span>Mint Price</span>
            <em>1 Sol</em>
          </li>
          <li>
            <span>Balance</span>
            <em>0 Sol</em>
          </li>
        </ul>
        <MintNFT isPublicMint={true} />
        <small>Max 1 mint per wallet</small>
      </section>
    </div>
  )
}

export default Features
