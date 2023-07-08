import { evmtsContractFactory } from './contract'
import type { Abi, Address } from 'abitype'
import { describe, expect, it } from 'vitest'

describe('evmtsContractFactory', () => {
	const dummyAbi = [
		{
			type: 'function',
			name: 'exampleWrite',
			inputs: [
				{ type: 'string', name: 'str' },
				{ type: 'uint256', name: 'num' },
			],
			outputs: [{ type: 'string', name: '' }],
			stateMutability: 'payable',
		},
		{
			type: 'function',
			name: 'exampleRead',
			inputs: [
				{ type: 'string', name: 'str' },
				{ type: 'uint256', name: 'num' },
			],
			outputs: [{ type: 'string', name: '' }],
			stateMutability: 'pure',
		},
		{
			type: 'function',
			name: 'exampleReadNoArgs',
			inputs: [],
			outputs: [{ type: 'string', name: '' }],
			stateMutability: 'pure',
		},
		{
			type: 'event',
			name: 'exampleEvent',
			inputs: [{ type: 'string', name: 'data', indexed: false }],
		},
	] as const satisfies Abi

	const dummyAddresses = { 1: '0x12345678' } as const satisfies Record<
		number,
		Address
	>

	const contract = evmtsContractFactory({
		abi: dummyAbi,
		name: 'DummyContract',
		addresses: dummyAddresses,
	})

	it('should have correct name', () => {
		expect(contract.name).toBe('DummyContract')
	})

	it('should contain the ABI', () => {
		expect(contract.abi).toEqual(dummyAbi)
	})

	it('should generate human readable ABI', () => {
		expect(contract.humanReadableAbi).toBeDefined()
	})

	it('should contain the addresses', () => {
		expect(contract.addresses).toEqual(dummyAddresses)
	})

	describe('events', () => {
		it('should generate event filter parameters', () => {
			const eventFilterParams = contract.events().exampleEvent({
				fromBlock: 'latest',
				toBlock: 'latest',
				args: {},
				strict: false,
			})
			expect(eventFilterParams.eventName).toMatchInlineSnapshot(
				'"exampleEvent"',
			)
			expect(eventFilterParams.event).toMatchInlineSnapshot('undefined')
			expect(eventFilterParams.address).toMatchInlineSnapshot('"0x12345678"')
			expect(eventFilterParams.args).toMatchInlineSnapshot('{}')
			expect(eventFilterParams.toBlock).toMatchInlineSnapshot('"latest"')
			expect(eventFilterParams.fromBlock).toMatchInlineSnapshot('"latest"')
			expect(eventFilterParams.strict).toMatchInlineSnapshot('false')
			expect(eventFilterParams.abi).toMatchInlineSnapshot(`
        [
          {
            "inputs": [
              {
                "indexed": false,
                "name": "data",
                "type": "string",
              },
            ],
            "name": "exampleEvent",
            "type": "event",
          },
        ]
      `)
		})
	})

	describe('read', () => {
		it('should return information for read function', () => {
			const readInfo = contract.read().exampleRead('data', BigInt(420))
			expect(readInfo.address).toMatchInlineSnapshot('"0x12345678"')
			expect(readInfo.args).toMatchInlineSnapshot(`
				[
				  "data",
				  420n,
				]
			`)
			expect(readInfo.abi).toMatchInlineSnapshot(`
        [
          {
            "inputs": [
              {
                "name": "str",
                "type": "string",
              },
              {
                "name": "num",
                "type": "uint256",
              },
            ],
            "name": "exampleRead",
            "outputs": [
              {
                "name": "",
                "type": "string",
              },
            ],
            "stateMutability": "pure",
            "type": "function",
          },
        ]
      `)
			expect(readInfo.humanReadableAbi).toMatchInlineSnapshot(`
        [
          "function exampleRead(string str, uint256 num) pure returns (string)",
        ]
      `)
		})

		it('should return information for read function with no args', () => {
			const readInfo = contract.read().exampleReadNoArgs()
			expect(readInfo.address).toMatchInlineSnapshot('"0x12345678"')
			expect(readInfo.args).toMatchInlineSnapshot('undefined')
		})
	})

	describe('write', () => {
		it('should return information for write function', () => {
			const writeInfo = contract.write().exampleWrite('data', BigInt(420))
			expect(writeInfo.address).toMatchInlineSnapshot('"0x12345678"')
			expect(writeInfo.args).toMatchInlineSnapshot(`
				[
				  "data",
				  420n,
				]
			`)
			expect(writeInfo.abi).toMatchInlineSnapshot(`
        [
          {
            "inputs": [
              {
                "name": "str",
                "type": "string",
              },
              {
                "name": "num",
                "type": "uint256",
              },
            ],
            "name": "exampleWrite",
            "outputs": [
              {
                "name": "",
                "type": "string",
              },
            ],
            "stateMutability": "payable",
            "type": "function",
          },
        ]
      `)
			expect(writeInfo.humanReadableAbi).toMatchInlineSnapshot(`
        [
          "function exampleWrite(string str, uint256 num) payable returns (string)",
        ]
      `)
		})
	})
})