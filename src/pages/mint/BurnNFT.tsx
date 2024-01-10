import { useCallback, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress, createTransferCheckedInstruction
} from '@solana/spl-token'

import {
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  Connection
} from '@solana/web3.js'
import console from 'console'
import { BURN_NFT_API, PUBLIC_MINT_API, WHITELIST_MINT_API } from '@/config'
import { endpoint } from '@/App'

type BurnNFTProps = {
  nftAddress: string
}

export const BurnNFT = ({ nftAddress }: BurnNFTProps) => {
  const { publicKey, sendTransaction } = useWallet()
  const [Burning, setBurning] = useState(false)

  const recordBurn = useCallback(async (address: string ,tx: string) => {
    return  await fetch(
      BURN_NFT_API,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          txid: tx,
        }),
      }
    ).then((res) => res.json())
  }, [])

  const burn = useCallback(async (nftAddress: string) => {
    if (!publicKey) return
    setBurning(true)
    const connection = new Connection(endpoint)
    const ta = await connection.getTokenAccountsByOwner(publicKey, {mint: new PublicKey(nftAddress)})

    const blackh = '11111111111111111111111111111111'
    const ata = await getAssociatedTokenAddress(new PublicKey(nftAddress), new PublicKey(blackh))
    const tx = new Transaction()
    tx.add(
      createAssociatedTokenAccountInstruction(
        publicKey, // payer
        ata, // ata
        new PublicKey(blackh), // owner
        new PublicKey(nftAddress), // mint
      )
    );
    tx.add(
      createTransferCheckedInstruction(
        ta.value[0].pubkey, // token account
        new PublicKey(nftAddress), // mint
        ata, // to (should be a token account)
        publicKey, // from's owner
        1, // amount, if your deciamls is 8, send 10^8 for 1 token
        0, // decimals
        [publicKey]
      )
    );
    const signature = await sendTransaction(tx, connection, { signers: publicKey })
    console.log(signature)
    await connection.confirmTransaction(signature, 'confirmed')
    console.log('signature', signature)
    await recordBurn(publicKey.toString(), signature)
    setBurning(false)
  }, [])
  return (
    <button onClick={() => burn(nftAddress)}>
      {Burning ? 'Burning...' : 'Burn'}
    </button>
  )
}
