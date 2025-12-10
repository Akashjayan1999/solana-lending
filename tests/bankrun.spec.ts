import { describe, it } from "node:test";

import IDL from '../target/idl/lending.json';
import { Lending } from "../target/types/lending";
import { BanksClient, ProgramTestContext, startAnchor } from "solana-bankrun";
import { Connection, PublicKey } from "@solana/web3.js";
import { BankrunProvider } from "anchor-bankrun";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import { BankrunContextWrapper } from "../bankrun-utils/bankrunConnection";
import { BN,Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { createAccount, createMint, mintTo } from "spl-token-bankrun";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

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

  it("Test Init User", async () => {
    const initUserTx = await program.methods
      .initUser(mintUSDC)
      .accounts({
        signer: signer.publicKey,
      })
      .rpc({ commitment: "confirmed" });

    console.log("Create User Account", initUserTx);
  });



  it("Test Init and Fund USDC Bank", async () => {
    const initUSDCBankTx = await program.methods
      .initBank(new BN(1), new BN(1))
      .accounts({
        signer: signer.publicKey,
        mint: mintUSDC,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    console.log("Create USDC Bank Account", initUSDCBankTx);

    const amount = 10_000 * 10 ** 9;
    const mintTx = await mintTo(
      // @ts-ignores
      banksClient,
      signer,
      mintUSDC,
      usdcBankAccount,
      signer,
      amount
    );

    console.log("Mint to USDC Bank Signature:", mintTx);
  });


  it("Test Init amd Fund SOL Bank", async () => {
    const initSOLBankTx = await program.methods
      .initBank(new BN(1), new BN(1))
      .accounts({
        signer: signer.publicKey,
        mint: mintSOL,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    console.log("Create SOL Bank Account", initSOLBankTx);

    const amount = 10_000 * 10 ** 9;
    const mintSOLTx = await mintTo(
      // @ts-ignores
      banksClient,
      signer,
      mintSOL,
      solBankAccount,
      signer,
      amount
    );
   console.log("Mint to SOL Bank Signature:", mintSOLTx);
  });


  it("Create and Fund Token Account", async () => {
    const USDCTokenAccount = await createAccount(
      // @ts-ignores
      banksClient,
      signer,
      mintUSDC,
      signer.publicKey
    );

    console.log("USDC Token Account Created:", USDCTokenAccount);

    const amount = 10_000 * 10 ** 9;
    const mintUSDCTx = await mintTo(
      // @ts-ignores
      banksClient,
      signer,
      mintUSDC,
      USDCTokenAccount,
      signer,
      amount
    );

    console.log("Mint to USDC Bank Signature:", mintUSDCTx);
  });

  it("Test Deposit", async () => {
    const depositUSDC = await program.methods
      .deposit(new BN(100000000000))
      .accounts({
        signer: signer.publicKey,
        mint: mintUSDC,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    console.log("Deposit USDC", depositUSDC);
  });

  it("Test Borrow", async () => {
    const borrowSOL = await program.methods
      .borrow(new BN(1))
      .accounts({
        signer: signer.publicKey,
        mint: mintSOL,
        tokenProgram: TOKEN_PROGRAM_ID,
        priceUpdate: solUsdPriceFeedAccount,
      })
      .rpc({ commitment: "confirmed" });

    console.log("Borrow SOL", borrowSOL);
  });


  it("Test Repay", async () => {
    const repaySOL = await program.methods
      .repay(new BN(1))
      .accounts({
        signer: signer.publicKey,
        mint: mintSOL,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    console.log("Repay SOL", repaySOL);
  });

  it("Test Withdraw", async () => {
    const withdrawUSDC = await program.methods
      .withdraw(new BN(100))
      .accounts({
        signer: signer.publicKey,
        mint: mintUSDC,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    console.log("Withdraw USDC", withdrawUSDC);
  });

});

 