import {
  MintLayout,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddress
} from '@solana/spl-token'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js'
import BigNumber from 'bignumber.js'
import { Buffer } from 'buffer'
import { useCallback, useEffect, useMemo, useState } from 'react'
import * as console from 'console'
import toast from 'react-hot-toast'
import { PUBLIC_MINT_API, WHITELIST_MINT_API } from '@/config'

const CONTRACT_PROGRAM_ID = new PublicKey('4Vm77PDeH3i9nLhfkAjWaSayTFaGCu6fnW5Jo2qCjg4e')
const config_info = new PublicKey('13Z64WtxpYvexwSdicwgzj9iT3ustcpSSCF2nVoCF5o1')
export const collection_mint = new PublicKey('3jiHd3gMyK9LjVFFLkNf2LF2Tw8PxANUyuVNX6sps7Wo')
const collection_metadata = new PublicKey('DEt6GjyEndUzZNUyRrp1AXFhoRfzp1hCnfhhmEw9bawn')
const collection_edition = new PublicKey('HUUnP1YWWnwqe8oXryvFSXrReBK9ncxp9Dy6QKtQHeLz')
const collection_authority_record = new PublicKey('GUmS4sjty1b7tNW1zYbbWEDFKxviygspnyqct8TpitbZ')
const pda_creator = new PublicKey('81JPvLiA5cWgKbwAs1DgufvPTZqfCgeEpmCKSWtPXqoW')
//
// const CONTRACT_PROGRAM_ID = new PublicKey('52WhvjtvnJpUJhbRqHDrXM7YX7CWPmMxeiWaf2t1rbWn')
// const config_info = new PublicKey('7vNH4bvetujckcf9s4tAXnGtiRyHbEhwoEN4JCJH7jBW')
// export const collection_mint = new PublicKey('CdTKgXi6DMsRuvkn4CUTMzQdqvBXa5X6YoNrPveS93Gq')
// const collection_metadata = new PublicKey('Ee44Gyempkhpt7WHLHbtPBncuEH7EgPv1NjyYjYMzEC7')
// const collection_edition = new PublicKey('9bTu8GqSRQTU3YC6iYGtvFWVBxPHYtQRKdLKAX99QGPU')
// const collection_authority_record = new PublicKey('2HbxCayjnysn6NWpn2w42hxyumRW7H1b3xzYrYM7PWRb')
// const pda_creator = new PublicKey('B6cFnaBEL2DExFbEFwkqEwhsLbR3JLx9ENRh4fU4sgJ8')
const charge_address = new PublicKey('9ppiEsLybEazCHHaM1y2AcpEPgHX82aHPZD2E5LuL4ZQ')
const metadata_program = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

type PublicMintNFTProps = {
  isPublicMint: boolean
  isWhiteList?: boolean
  isMinted?: boolean
}

const MintNFT = ({ isPublicMint, isWhiteList, isMinted }: PublicMintNFTProps) => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [minting, setMinting] = useState(false)
  const [buttonText, setButtonText] = useState('')

  const recordWhiteListMint = useCallback(async (address: string ,tx: string, isPublicMint: boolean) => {
    return  await fetch(
      isPublicMint ? PUBLIC_MINT_API : WHITELIST_MINT_API,
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

  const mintNFT = useCallback(async () => {
    if (!publicKey) {
      return
    }

    if (!isPublicMint && !isWhiteList && isMinted) {
      toast.error('Your wallet address is not in the whitelist')
      return
    }
    setMinting(true)
    const lamports = await connection.getBalance(publicKey)
    console.log(
      'Balance:',
      BigNumber(lamports)
        .dividedBy(10 ** 9)
        .toString()
    )

    //1、创建一个新的mint 并初始化mint
    const mintTx = new Transaction()
    const mintKey = Keypair.generate()

    mintTx.add(
      SystemProgram.createAccount({
        /** The account that will transfer lamports to the created account */
        fromPubkey: publicKey,
        /** Public key of the created account */
        newAccountPubkey: mintKey.publicKey,
        /** Amount of lamports to transfer to the created account */
        lamports: await connection.getMinimumBalanceForRentExemption(MintLayout.span),
        /** Amount of space in bytes to allocate to the created account */
        space: MintLayout.span,
        /** Public key of the program to assign as the owner of the created account */
        programId: TOKEN_PROGRAM_ID
      })
    )

    mintTx.add(createInitializeMint2Instruction(mintKey.publicKey, 0, publicKey, publicKey, TOKEN_PROGRAM_ID))
    //3、通过seed获取 对应钱包下 相应mint的 token——account；
    const associatedAccount = await getAssociatedTokenAddress(mintKey.publicKey, publicKey)

    mintTx.add(createAssociatedTokenAccountInstruction(publicKey, associatedAccount, publicKey, mintKey.publicKey))

    //2、通过seed['metadata', program id, mint id]生成metadata pda，
    const metadataKey = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), metadata_program.toBuffer(), mintKey.publicKey.toBuffer()],
      metadata_program
    )[0]

    const edition = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), metadata_program.toBuffer(), mintKey.publicKey.toBuffer(), Buffer.from('edition')],
      metadata_program
    )[0]

    const user_info = PublicKey.findProgramAddressSync(
      [CONTRACT_PROGRAM_ID.toBuffer(), publicKey.toBuffer(), Buffer.from('user_info')],
      CONTRACT_PROGRAM_ID
    )[0]

    mintTx.add(createMintToInstruction(mintKey.publicKey, associatedAccount, publicKey, 1, [publicKey, mintKey]))
    // const ata = await getAssociatedTokenAddress(new PublicKey(tokenAddress), wallet.provider.publicKey)
    // console.log('ata', ata.toBase58())
    // const account = await getAccount(connection, ata, new PublicKey(tokenAddress))
    // console.log('account', account)
    // console.log('account address', account.address.toBase58())
    // console.log('account amount', account.amount.toString())
    // console.log('account mint', account.mint.toBase58())
    // console.log('account owner', account.owner.toBase58())

    try {
      const mintInstruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: false },
          { pubkey: config_info, isSigner: false, isWritable: true },
          { pubkey: pda_creator, isSigner: false, isWritable: true },
          { pubkey: mintKey.publicKey, isSigner: true, isWritable: true },
          { pubkey: metadataKey, isSigner: false, isWritable: true },
          { pubkey: edition, isSigner: false, isWritable: true },
          { pubkey: collection_mint, isSigner: false, isWritable: false },
          { pubkey: collection_metadata, isSigner: false, isWritable: true },
          { pubkey: collection_edition, isSigner: false, isWritable: true },
          { pubkey: collection_authority_record, isSigner: false, isWritable: true },
          { pubkey: charge_address, isSigner: false, isWritable: true },
          { pubkey: user_info, isSigner: false, isWritable: true },
          { pubkey: metadata_program, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        programId: CONTRACT_PROGRAM_ID,
        data: Buffer.from([2])
      })
      mintTx.add(mintInstruction)
      const signature = await sendTransaction(mintTx, connection, { signers: [mintKey] })
      console.log(signature)
      await connection.confirmTransaction(signature, 'confirmed')
      console.log('NFT Minted Successfully!')
      toast.success('NFT Minted Successfully!')
      console.log('address', publicKey.toString())
      await recordWhiteListMint(publicKey.toString(), signature, isPublicMint)
    } catch (error) {
      console.error(error)
      console.log('Minting Failed!')
    } finally {
      setMinting(false)
    }
  }, [publicKey, sendTransaction, connection, isWhiteList, isMinted])

  // 定义 WhitelistArgs 的结构和编码方式
  //   function encodeWhitelistArgs(proof: any) {
  //     const proofLayout = struct([u8('length'), ...Array(proof.length).fill(BufferLayout.blob(32))])
  //
  //     const data = Buffer.alloc(1000) // 分配一个足够大的缓冲区
  //     const length = proofLayout.encode(
  //       {
  //         length: proof.length,
  //         ...proof
  //       },
  //       data
  //     )
  //
  //     return data.slice(0, length)
  //   }

    // const whitelistMint = useCallback(
    //   async () => {
    //     if (!publicKey) {
    //       alert('Please connect to a wallet')
    //       return
    //     }
    //
    //     setMinting(true)
    //
    //     try {
    //       // 编码 WhitelistArgs
    //       const args = encodeWhitelistArgs(isWhiteList)
    //       const test = [6]
    //       isWhiteList.forEach((item) => {
    //        test.push(...item)
    //       })
    //       console.log('isWhiteList', test)
    //       const mintTx = new Transaction()
    //       const mintKey = Keypair.generate()
    //
    //       mintTx.add(
    //         SystemProgram.createAccount({
    //           /** The account that will transfer lamports to the created account */
    //           fromPubkey: publicKey,
    //           /** Public key of the created account */
    //           newAccountPubkey: mintKey.publicKey,
    //           /** Amount of lamports to transfer to the created account */
    //           lamports: await connection.getMinimumBalanceForRentExemption(MintLayout.span),
    //           /** Amount of space in bytes to allocate to the created account */
    //           space: MintLayout.span,
    //           /** Public key of the program to assign as the owner of the created account */
    //           programId: TOKEN_PROGRAM_ID
    //         })
    //       )
    //
    //       mintTx.add(createInitializeMint2Instruction(mintKey.publicKey, 0, publicKey, publicKey, TOKEN_PROGRAM_ID))
    //       //3、通过seed获取 对应钱包下 相应mint的 token——account；
    //       const associatedAccount = await getAssociatedTokenAddress(mintKey.publicKey, publicKey)
    //
    //       mintTx.add(createAssociatedTokenAccountInstruction(publicKey, associatedAccount, publicKey, mintKey.publicKey))
    //
    //       //2、通过seed['metadata', program id, mint id]生成metadata pda，
    //       const metadataKey = PublicKey.findProgramAddressSync(
    //         [Buffer.from('metadata'), metadata_program.toBuffer(), mintKey.publicKey.toBuffer()],
    //         metadata_program
    //       )[0]
    //
    //       const edition = PublicKey.findProgramAddressSync(
    //         [Buffer.from('metadata'), metadata_program.toBuffer(), mintKey.publicKey.toBuffer(), Buffer.from('edition')],
    //         metadata_program
    //       )[0]
    //
    //       const user_info = PublicKey.findProgramAddressSync(
    //         [CONTRACT_PROGRAM_ID.toBuffer(), publicKey.toBuffer(), Buffer.from('user_info')],
    //         CONTRACT_PROGRAM_ID
    //       )[0]
    //
    //       mintTx.add(createMintToInstruction(mintKey.publicKey, associatedAccount, publicKey, 1, [publicKey, mintKey]))
    //
    //       // 创建 WhitelistMint 指令
    //       const whitelistMintInstruction = new TransactionInstruction({
    //         keys: [
    //           { pubkey: publicKey, isSigner: true, isWritable: false },
    //           { pubkey: config_info, isSigner: false, isWritable: true },
    //           { pubkey: pda_creator, isSigner: false, isWritable: true },
    //           { pubkey: mintKey.publicKey, isSigner: true, isWritable: true },
    //           { pubkey: metadataKey, isSigner: false, isWritable: true },
    //           { pubkey: edition, isSigner: false, isWritable: true },
    //           { pubkey: collection_mint, isSigner: false, isWritable: false },
    //           { pubkey: collection_metadata, isSigner: false, isWritable: true },
    //           { pubkey: collection_edition, isSigner: false, isWritable: true },
    //           { pubkey: collection_authority_record, isSigner: false, isWritable: true },
    //           { pubkey: charge_address, isSigner: false, isWritable: true },
    //           { pubkey: user_info, isSigner: false, isWritable: true },
    //           { pubkey: metadata_program, isSigner: false, isWritable: false },
    //           { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    //           { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    //           { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    //         ],
    //         programId: CONTRACT_PROGRAM_ID,
    //         data: Buffer.concat([Buffer.from([3]), args]) // WhitelistMint 指令下标和参数
    //       })
    //       // 创建并发送交易
    //       // const transaction = new Transaction().add(whitelistMintInstruction)
    //       mintTx.add(whitelistMintInstruction)
    //       const signature = await sendTransaction(mintTx, connection, { signers: [mintKey] })
    //       console.log(signature)
    //       await connection.confirmTransaction(signature, 'confirmed')
    //       // const signature = await sendTransaction(transaction, connection)
    //       // await connection.confirmTransaction(signature, 'confirmed')
    //       alert('Whitelist NFT Minted Successfully!')
    //     } catch (error) {
    //       console.error(error)
    //       alert('Minting Failed!')
    //     } finally {
    //       setMinting(false)
    //     }
    //   },
    //   [publicKey, sendTransaction, connection, isWhiteList]
    // )

  useEffect(() => {
    if (!publicKey) {
      setButtonText('Connect Wallet')
      return
    }
    if (!isPublicMint && !isWhiteList) {
      setButtonText('You are not in the whitelist')
      return
    }
    if (isPublicMint && isMinted) {
      setButtonText('Max 1 mint per wallet')
      return
    }
    if (isWhiteList && isMinted) {
      setButtonText('Max 1 mint per wallet')
      return
    }
    setButtonText(minting ? 'Minting...' : 'Go To MINT')

  }, [isWhiteList, isPublicMint, isMinted, publicKey])

  return (
    <button
      onClick={mintNFT}
      disabled={(!publicKey || minting) || (!isPublicMint && !isWhiteList) || isMinted}
      // disabled={true}
    >
      {buttonText}
    </button>
  )
}

export default MintNFT
