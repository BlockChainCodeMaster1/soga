import sogaIcon from '@/assets/logo.png'
import sogaLogo from '@/assets/soga-logo.svg'

import Connect from '@/components/Modals/Connect'
import { NavLink } from 'react-router-dom'
import { isMobile } from 'react-device-detect'

const Header = () => {
  return (
    <div className='soga-header'>
      <div className='logo'>
        <img src={sogaIcon} alt='soga' />
        {/* <img src={sogaLogo} alt='soga' /> */}
      </div>
      {!isMobile && (<nav>
        <NavLink to='/'>Home</NavLink>
      </nav>)}
      <Connect />
    </div>
  )
}

export default Header
