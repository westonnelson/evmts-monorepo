import type {
	Abi,
	Address,
	ExtractAbiEvent,
	ExtractAbiEventNames,
	FormatAbi,
} from 'abitype'
import { CreateEventFilterParameters } from 'viem'
import { MaybeExtractEventArgsFromAbi } from 'viem/dist/types/types/contract'
import { ValueOf } from 'viem/dist/types/types/utils'

export type Events<
	TName extends string,
	TAddresses extends Record<number, Address>,
	TAbi extends Abi,
> = <TChainId extends keyof TAddresses>(options?: {
	chainId?: TChainId | number | undefined
}) => {
	[TEventName in ExtractAbiEventNames<TAbi>]: (<
		TStrict extends boolean = false,
	>(
		params: Pick<
			CreateEventFilterParameters<
				ExtractAbiEvent<TAbi, TEventName>,
				TStrict,
				TAbi,
				TEventName,
				MaybeExtractEventArgsFromAbi<TAbi, TEventName>
			>,
			'fromBlock' | 'toBlock' | 'args' | 'strict'
		>,
	) => CreateEventFilterParameters<
		ExtractAbiEvent<TAbi, TEventName>,
		TStrict,
		TAbi,
		TEventName,
		MaybeExtractEventArgsFromAbi<TAbi, TEventName>
	> & {
		evmtsContractName: TName
		eventName: TEventName
		abi: [ExtractAbiEvent<TAbi, TEventName>]
	}) & {
		address: ValueOf<TAddresses>
		eventName: TEventName
		abi: [ExtractAbiEvent<TAbi, TEventName>]
		humanReadableAbi: FormatAbi<[ExtractAbiEvent<TAbi, TEventName>]>
	}
}