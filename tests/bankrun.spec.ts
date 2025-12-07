import { describe, it } from "node:test";

import IDL from '../target/idl/lending.json';
import { Lending } from "../target/types/lending";
import { ProgramTestContext, startAnchor } from "solana-bankrun";
import { Connection, PublicKey } from "@solana/web3.js";
import { BankrunProvider } from "anchor-bankrun";

describe("Lending Smart Contract Tests", async () => {

 let context: ProgramTestContext;
 let provider: BankrunProvider;

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

});