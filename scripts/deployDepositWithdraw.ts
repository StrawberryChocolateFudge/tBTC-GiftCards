import { Address, toNano } from '@ton/core';
import { DepositWithdraw } from '../wrappers/DepositWithdraw';
import { compile, NetworkProvider } from '@ton/blueprint';

const TGBTC_TESTNET_JETTON_MASTER = "kQDoy1cUAbGq253vwfoPcqSloODVAWkDBniR12PJFUHnK6Yf";


export async function run(provider: NetworkProvider) {
    const sender = provider.sender()
    const address = sender.address as Address;
    const jetton_master_address = Address.parse(TGBTC_TESTNET_JETTON_MASTER)
    const depositWithdraw = provider.open(
        DepositWithdraw.createFromConfig(
            {
                init: 0,
                jetton_wallet_address: jetton_master_address,
                jetton_wallet_set: 0,
                creator_address: address,
                exact_fee_amount: toNano("0.0000001")
            },
            await compile('DepositWithdraw')
        )
    );

    await depositWithdraw.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(depositWithdraw.address);

    console.log("Contract address: ", depositWithdraw.address);

}
//USES tgBTC on testnet now
// Contract deployed at address EQDW_KLohAhwdPToks0Qvdf13pcMxI5H5Esnh6UubpAymCzU
// You can view it at https://testnet.tonscan.org/address/EQDW_KLohAhwdPToks0Qvdf13pcMxI5H5Esnh6UubpAymCzU
// Contract address:  EQDW_KLohAhwdPToks0Qvdf13pcMxI5H5Esnh6UubpAymCzU