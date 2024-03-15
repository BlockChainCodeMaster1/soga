import Footer from '@/pages/home/c/Footer'
import Header from '@/pages/home/c/Header'
import Slogan from '@/pages/home/c/Slogan'
import Part2 from '@/pages/home/Part2'
import Part3 from '@/pages/home/Part3'
import * as React from 'react'

function Index() {
  return (
    <div>
      <Header />
      <Slogan />
      <Part2 />
      {/* <Part3 /> */}
      <Footer />
    </div>
  )
}

export default React.memo(Index)
