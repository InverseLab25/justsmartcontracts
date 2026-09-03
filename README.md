## Description

A web tool for interacting with Ethereum smart contracts: add a contract by
address and ABI, read its properties, call its functions, build and sign
transactions, and search its events.

## Credits

This project is based on [olekon/justsmartcontracts](https://github.com/olekon/justsmartcontracts),
the original [justsmartcontracts.dev](https://justsmartcontracts.dev) built by
Oleg Kondrakhanov and Alexey Kuzmin. All credit for the original tool and its
design goes to them.

[What is justsmartcontracts.dev?](https://medium.com/coinmonks/introducing-justsmartcontracts-dev-web-tool-for-interacting-with-ethereum-smart-contracts-da9b5dfe563c)

## Prerequisites

Node.js 20.9 or newer, and [pnpm](https://pnpm.io).

## Running locally

Download the project and navigate to the root folder (the one with this file),
then execute

`pnpm install`

`pnpm dev`

The website will be accessible on http://localhost:3000

To type check, execute

`pnpm ts`

To build the production bundle, execute

`pnpm build`

## Configuration

One optional setting, read from an environment file in the project root.

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` adds WalletConnect to the wallet
  picker. Without it, only browser wallets and Coinbase Wallet are offered.

Chain data is fetched from [chainid.network](https://chainid.network), with a
bundled snapshot as a fallback when that request fails. RPC endpoints come from
that list, so no API key is needed.

## Contributing

Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for details

## Authors

Original project:

- Oleg Kondrakhanov - [olekon](https://github.com/olekon)
- Alexey Kuzmin - [32kaa](https://github.com/32kaa)

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details
