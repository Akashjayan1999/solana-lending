import { describe, it } from "node:test";

import IDL from '../target/idl/lending.json';
import { Lending } from "../target/types/lending";
import { BanksClient, ProgramTestContext, startAnchor } from "solana-bankrun";
import { Connection, PublicKey } from "@solana/web3.js";
import { BankrunProvider } from "anchor-bankrun";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import { BankrunContextWrapper } from "../bankrun-utils/bankrunConnection";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { createMint } from "spl-token-bankrun";

describe("Lending Smart Contract Tests", async () => {
  let signer: Keypair;
 let program: Program<Lending>;
 let context: ProgramTestContext;
 let provider: BankrunProvider;
 let bankrunContextWrapper: BankrunContextWrapper;
 let banksClient: BanksClient;
 let usdcBankAccount: PublicKey;
  let solBankAccount: PublicKey;

  let solTokenAccount: PublicKey;

 //get the address from solana-fm
 const pyth = new PublicKey("7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE");

  const devnetConnection = new Connection("https://api.devnet.solana.com");
  const accountInfo = await devnetConnection.getAccountInfo(pyth);
 context = await startAnchor(
    "",
    [{ name: "lending", programId: new PublicKey(IDL.address) }],
    [
      {
        address: pyth,
        info: accountInfo,
      },
    ]
  );
  provider = new BankrunProvider(context);

  bankrunContextWrapper = new BankrunContextWrapper(context);

  const connection = bankrunContextWrapper.connection.toConnection();

  const pythSolanaReceiver = new PythSolanaReceiver({
    connection,
    wallet: provider.wallet,
  });


  const SOL_PRICE_FEED_ID =
    "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a";


  const solUsdPriceFeedAccount = pythSolanaReceiver
    .getPriceFeedAccountAddress(0, SOL_PRICE_FEED_ID)
    .toBase58();

  const solUsdPriceFeedAccountPubkey = new PublicKey(solUsdPriceFeedAccount);
  const feedAccountInfo = await devnetConnection.getAccountInfo(
    solUsdPriceFeedAccountPubkey
  );

  context.setAccount(solUsdPriceFeedAccountPubkey, feedAccountInfo);

  console.log("pricefeed:", solUsdPriceFeedAccount);

  console.log("Pyth Account Info:", accountInfo);


  program = new Program<Lending>(IDL as Lending, provider);
  banksClient = context.banksClient;

  signer = provider.wallet.payer;

  const mintUSDC = await createMint(
    // @ts-ignore
    banksClient,
    signer,
    signer.publicKey,
    null,
    2
  );

  const mintSOL = await createMint(
    // @ts-ignore
    banksClient,
    signer,
    signer.publicKey,
    null,
    2
  );


   [usdcBankAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), mintUSDC.toBuffer()],
    program.programId
  );// usdc token account

  [solBankAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), mintSOL.toBuffer()],
    program.programId
  ); //sol token account

  // [solTokenAccount] = PublicKey.findProgramAddressSync(
  //   [Buffer.from("treasury"), mintSOL.toBuffer()],
  //   program.programId
  // );

  console.log("USDC Bank Account", usdcBankAccount.toBase58());

  console.log("SOL Bank Account", solBankAccount.toBase58());
});

 