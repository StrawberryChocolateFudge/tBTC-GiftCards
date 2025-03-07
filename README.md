# Jetton Notes Contracts
A smart contract utilizing zkp that allows Jetton deposits and transactions with Account Abstraction.
Designed for POS, Micro transactions, Burner Wallets, Gambling or games with NPC attached balances,
The smart contract allows Jettons to be used without a Wallet smart contract and jetton wallet deployed per account.
The accounts are deterministic and generated from secrets and no smart contract interaction is needed to deposit into them.


# How to works?

The circuttis folder contains the circom circuit used for spending a deposit. The Withdraw template allows verification of withdraw proofs which contain public inputs: `nullifierHash`, `commitmentHash`, `workchain`, `recipient`, `transferto_commitment`, `transferto_amount`, `utxo_commtiment` and private inputs `nullifier` and `secret`

The zkp allows verification of preimage of nullifierHash and commitmentHash by proving the knowledge of the nullifier and secret while the rest of the inputs are used for tamper proofing.


The `commitmentHash` are the account addresses, the `secret` and `nullifier` are the private keys to spend a deposit and the `nullifierHash` is used for nullifying spend. Once a deposit is spent, the address is nullified and can't be used anymore!


## Account Types

There are two account types, one is a burner account with a single secret and nullifier. 
The account secrets are always encoded in a crypto note format like : jettonnotes-tgbtc-<SECRET 512 bit number>

The burner accounts are single use and after they are used they are invalidated.
However there are derived accounts when the first jetton note is never used for deposit, it's used for deriving secrets from it.
So the main note is jettonnotes-masternote-<SECRET> which contains the secret and nullifier and then using BIP32, further secrets and nullifiers are derived from it deterministically.
So it's useful for an HD wallet implementation where the addresses can take deposits until they are spent and then the remaining balances go to a new address.!

## Powers of Tau 

### NOTE!!

The circuits use bls12-381 for which the powers of tau Phase 1 ceremony is not finalized. It's only usable for testnet.

The Verification uses Groth-16 with bls12-381 and the Powers of tau phase 2 is not finalized either.

### Compiling the circuit:

The `compile.sh` file contains the commands to compile the circuits for testnet if they change.
`sh compile.sh` will recreate all the circuits

THE FORKED SNARKJS WITH FUNC SUPPORT MUST BE AVAILABE IN PATH!!

`node ../../snarkjs/build/cli.cjs zkey export funcverifier circuit_final.zkey ./verifier.fc`

The forked snarkjs with the FUNC verifier generator can be found by checking the zkp tutorials for Ton.


# Smart contracts
The smart contract has a generic name DepositWithdraw because that's exactly what it does. You can deposit jettons and withdraw them. The deposited Jettons can be transferred between accounts with account abstraction when no TON fees are needed to transfer them.

## The follwing operations are supported currently:

   `op::transfer_notification`, this is triggered when jettons are deposited into the contracts jetton wallet, it will credit jettons to the `commitment` filed specified in the forward_payload if it doesn't exist the jettons are refunded.
   Each depositWithdraw contract must be deployed separately per Jetton Master Wallet, so each one will refund invalid jettons transferred to it.

   `op::withdraw` this operation verifies a zero knowledge proof and withdraws the deposited jettons to the sender's wallet.
   The address of the sender must be the same as the address in teh zero knowledge proof, this operation is not relayable!

   **transferto_commitment must be zero**
   
   **transferto_amount must be zero**
   
   **utxo_commitmetn must be zero**
   
   **The sender address must be in the proof**

   `op::transfer_note` This operation is relayable and allows the user to withdraw a deposit into another account inside the contract and send the remainder of the transaction to an UTXO account. 
   When an account transfers balance, it's invalidated so it's remainder content is transferred to a new account.
   `transferto_commitment` is the commintment of the account to transfer to
   `transferto_amount` is the amount to transfer
   `utxo_commitment` is the commitment of the account that will get the remainder of the transaction

   **transferto_commitment can't be zero**

   **transferto_amount can't be zero**

   **utxo_commitmetn can't be zero**

   These are important because the other functions with the same ZKP arguments have different requirements, so the function calls can't be mixed with the same proof.


   Example: Account A is deposited 1 tgBTC, then Account A wants to transfer 0.5 to Account B, then it needs to specify account C to receive the remaining 0.5 back.
   There is a relayer fee which can be set by the deployer and it's the same fee for all relayers. Anyone can become a relayer and connect a fee and this allows for total decentralization!

   `op::note_withdraw_to_external_with_utxo` this operation was created to withdraw a part of a note to an external wallet and the remained is transferred to a new UTXO, so users can redeem part of a HD wallet balance while keeping the rest. 

   **The utxo_commitment must be zero else it fails.**

   **The sender address must be in the proof**

   `op::note_withdraw_to_note_no_utxo` This is a relayed operation that allows to sweep a note and transfer it's contents to another note, without utxo output. Designed for sweeping burner wallet into hdwallet.

   **the transferto_commitment can't be zero**

   **The transferto_amount can't be zero and it must equial depositAmount - relayerFee**

   **the utxo_commitment must be zero**


   `op::set_fee_data` is an operation where the deployer can adjust the fee the relayer will receive

   future other operations:
   There will be a future operation to transfer to another Jetton Wallet Relayed, for not the Relayed transactions only work inside Jetton Notes but not to external wallet.


## Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - scripts used by the project, mainly the deployment scripts.


### Build

`npx blueprint build` or `yarn blueprint build`

### Test

`npx blueprint test` or `yarn blueprint test`

### Deploy or run another script

`npx blueprint run` or `yarn blueprint run`

### Add a new contract

`npx blueprint create ContractName` or `yarn blueprint create ContractName`
