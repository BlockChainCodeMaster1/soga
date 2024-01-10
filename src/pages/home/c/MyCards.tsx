import card from '@/assets/passcard.mp4'
import Swiper, { NormalSwiper } from '@/components/Swiper'
import VideoPlayer from '@/components/Video'
import { times } from 'lodash-es'
import { isMobile } from 'react-device-detect'
import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { collection_mint } from '@/pages/mint/MintNFT'
import { BurnNFT } from '@/pages/mint/BurnNFT'
import { useRootStore } from '@/store/root'

interface NftDetails {
  authorities: any
  id: string
  grouping: Grouping[]
  content: {
    metadata: NFTContent
  }
}

type Grouping = {
  group_key: string
  group_value: string
}

type NFTContent = {
  name: string
  symbol: string
  token_standard: string
}

const MyCards = () => {
  const burnAmount = useRootStore((state) => state.burnAmount)
  const { publicKey } = useWallet()
  const [userSogaList, setUserSogaList] = useState<NftDetails[]>([])
  const getUserNft = useCallback(async () => {
    if (!publicKey) return
    const random = (Math.random() * 1000)
    let api: string
    if (Number(random.toFixed(0)) % 2 === 0) {
      api = 'https://mainnet.helius-rpc.com/?api-key=8559c286-95bc-4327-809f-bdcfaa18e70e'
    } else {
      api = 'https://mainnet.helius-rpc.com/?api-key=57ba98a1-39ea-45f7-be09-649b17fced92'
    }
    try {
      const req = await fetch(
        api,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": "my-id",
            "method": "searchAssets",
            "params": {
              "ownerAddress": publicKey,
              "grouping": [
                "collection",
                "CdTKgXi6DMsRuvkn4CUTMzQdqvBXa5X6YoNrPveS93Gq",
              ],
              "page": 1, // Starts at 1
              "limit": 1000
            }
          }),
        }
      )
      const nftDetails = await req.json()
      const userAllNFT = nftDetails.result.items as NftDetails[]
      const list: NftDetails[] = []
      userAllNFT.forEach((item) => {
        if (new PublicKey(item.grouping[0].group_value).equals(collection_mint)) {
          list.push(item)
        }
      })
      console.log('user soga:', list)
      setUserSogaList(list)
    } catch (e) {
      console.log('get user NFT failed!', e)
    }
  }, [publicKey])

  useEffect(() => {
    getUserNft().then()
    setInterval(() => {
      getUserNft().then()
    }, 30000)
  }, [getUserNft])

  return (
    <>
      <p>Mint NFT item</p>
      <p>My Soga</p>
      <section>
        {isMobile
          ? (<Swiper index={'nft'} limit={7}>
            {times(userSogaList.length, (i) => (
              <div className='swiper-slide' key={i}>
                <div className='card'>
                  <VideoPlayer video={card} />
                  <footer>
                    <em>{userSogaList[i].content.metadata.name}</em>
                    {/*<em>#000000</em>*/}
                    <BurnNFT nftAddress={userSogaList[i].id} />
                  </footer>
                </div>
              </div>
            ))}
          </Swiper>)
          : (<NormalSwiper limit={5} index='nft'>
            {times(userSogaList.length, (i) => (
              <div className='swiper-slide' key={i}>
                <div className='card'>
                  <VideoPlayer video={card} />
                  <footer>
                    <em>{userSogaList[i].content.metadata.name}</em>
                    <BurnNFT nftAddress={userSogaList[i].id} />
                    {/*<button>BURN</button>*/}
                  </footer>
                </div>
              </div>
            ))}
          </NormalSwiper>)}
      </section>
      <p>
        After the NFT mint ends, you can burn it <br />
        within 8 hours and get permission to airdrop $SOGA.
      </p>
      <div className='count'>
        <dl>
          <dd>
            <span>Total</span>
            <em>2000</em>
          </dd>
          <dd>
            <span>Burn</span>
            <em>{burnAmount}</em>
          </dd>
        </dl>
      </div>
    </>
  )
}

export default MyCards
