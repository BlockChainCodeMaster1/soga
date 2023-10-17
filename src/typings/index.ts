import { Address } from 'viem'

export enum ChainId {
  MAINNET = 42161,
  TESTNET = 421613
}

export declare type Lang = 'en' | 'zh-CN'

export type Rec = Record<string, any>

export interface ChainIdRec {
  [ChainId.MAINNET]: string | Rec | Address
  [ChainId.TESTNET]: string | Rec | Address
}

export declare type ContractKeys = 'airdrop'

export declare type TokenKeys = 'btc' | 'usdc' | 'lion' | 'esLion' | 'lp'
