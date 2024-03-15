import sogaIcon from '@/assets/logo.png'
import sogaLogo from '@/assets/logo.png'

import tg from '@/assets/tg.svg'
import tw from '@/assets/tw.svg'
import { MEDIA_LINKS } from '@/config'

const Header = () => {
  return (
    <div className="soga-footer">
      <section className="inner">
        <div className="logo">
          <img src={sogaIcon} alt="soga" />
          {/* <img src={sogaLogo} alt="soga" /> */}
        </div>
        <nav>
          {/* <img src={tg} alt="soga" onClick={() => window.open(MEDIA_LINKS.tg)} /> */}
          <img src={tw} alt="soga" onClick={() => window.open(MEDIA_LINKS.tw)} />
        </nav>
      </section>
    </div>
  )
}

export default Header
