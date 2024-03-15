import banner3 from '@/assets/Slogan.png'
import tg from '@/assets/tg.svg'
import tw from '@/assets/tw.svg'
import { MEDIA_LINKS } from '@/config'
import { isMobile } from 'react-device-detect'

const Slogan = () => {
  return (
    <div className="soga-part1">
      <section>
        <img src={banner3} alt="soga" />
      </section>
      <h1>OOPS</h1>
      {isMobile ? <p>The first on chain community on the web3</p> : <p>The first on chain community on the web3</p>}

      <nav>
        {/* <img src={tg} alt="soga" onClick={() => window.open(MEDIA_LINKS.tg)} /> */}
        <img src={tw} alt="soga" onClick={() => window.open(MEDIA_LINKS.tw)} />
      </nav>
    </div>
  )
}

export default Slogan
