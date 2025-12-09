use anchor_lang::prelude::*;


// Challenge: How would you update the user state to save "all_deposited_assets" and "all_borrowed_assets" to accommodate for several asset listings?  
#[account]
#[derive(InitSpace)]
pub struct User {
    /// Pubkey of the user's wallet 
    pub owner: Pubkey,
    /// User's deposited tokens in the SOL bank
    pub deposited_sol: u64,
    /// User's deposited shares in the SOL bank 
    pub deposited_sol_shares: u64,
    /// User's borrowed tokens in the SOL bank
    pub borrowed_sol: u64,
    /// User's borrowed shares in the SOL bank
    pub borrowed_sol_shares: u64, 
    /// User's deposited tokens in the USDC bank
    pub deposited_usdc: u64,
    /// User's deposited shares in the USDC bank 
    pub deposited_usdc_shares: u64, 
    /// User's borrowed tokens in the USDC bank
    pub borrowed_usdc: u64,
    /// User's borrowed shares in the USDC bank
    pub borrowed_usdc_shares: u64, 
    /// USDC mint address // used for checking if user is depositing USDC or SOL nothing else
    pub usdc_address: Pubkey,
    /// Current health factor of the user
    pub health_factor: u64,
    /// Last updated timestamp
    pub last_updated: i64,
    /// Last updated timestamp for borrows
    pub last_updated_borrow: i64,

}

#[account]
#[derive(InitSpace)]
pub struct Bank {
    /// Authority to make changes to Bank State
    pub authority: Pubkey,
    /// Mint address of the asset 
    pub mint_address: Pubkey,
    /// Current number of tokens in the bank
    pub total_deposits: u64,
    /// Current number of deposit shares in the bank
    pub total_deposit_shares: u64,
    // Current number of borrowed tokens in the bank
    pub total_borrowed: u64,
    /// Current number of borrowed shares in the bank
    pub total_borrowed_shares: u64,
    /// LTV at which the loan is defined as under collateralized and can be liquidated 
    pub liquidation_threshold: u64,
    /// Bonus percentage of collateral that can be liquidated
    pub liquidation_bonus: u64,
    /// Percentage of collateral that can be liquidated
    pub liquidation_close_factor: u64,
    /// Max percentage of collateral that can be borrowed
    pub max_ltv: u64,
    /// Last updated timestamp
    pub last_updated: i64,
    pub interest_rate: f64,
}




// use anchor_lang::prelude::*;

// #[account]
// #[derive(InitSpace)]
// pub struct User {
//     /// Pubkey of the user's wallet 
//     pub owner: Pubkey,
    
//     /// All deposited assets (bank_pubkey -> UserAssetPosition)
//     #[max_len(10)] // Maximum 10 different deposited assets
//     pub deposited_assets: Vec<UserAssetPosition>,
    
//     /// All borrowed assets (bank_pubkey -> UserAssetPosition)
//     #[max_len(10)] // Maximum 10 different borrowed assets
//     pub borrowed_assets: Vec<UserAssetPosition>,
    
//     /// Current health factor of the user
//     pub health_factor: u64,
    
//     /// Last updated timestamp
//     pub last_updated: i64,
// }

// #[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
// pub struct UserAssetPosition {
//     /// Bank account pubkey for this asset
//     pub bank: Pubkey,
//     /// User's deposited/borrowed tokens in this bank
//     pub amount: u64,
//     /// User's deposited/borrowed shares in this bank
//     pub shares: u64,
// }

// #[account]
// #[derive(InitSpace)]
// pub struct Bank {
//     pub authority: Pubkey,
//     pub mint_address: Pubkey,
//     pub total_deposits: u64,
//     pub total_deposit_shares: u64,
//     pub total_borrowed: u64,
//     pub total_borrowed_shares: u64,
//     pub liquidation_threshold: u64,
//     pub liquidation_bonus: u64,
//     pub liquidation_close_factor: u64,
//     pub max_ltv: u64,
//     pub last_updated: i64,
//     pub interest_rate: u64,
// }

// // Helper methods for User
// impl User {
//     pub fn get_deposit_position(&self, bank: &Pubkey) -> Option<&UserAssetPosition> {
//         self.deposited_assets.iter().find(|p| &p.bank == bank)
//     }
    
//     pub fn get_borrow_position(&self, bank: &Pubkey) -> Option<&UserAssetPosition> {
//         self.borrowed_assets.iter().find(|p| &p.bank == bank)
//     }
    
//     pub fn update_deposit_position(&mut self, bank: Pubkey, amount: u64, shares: u64) -> Result<()> {
//         if let Some(pos) = self.deposited_assets.iter_mut().find(|p| p.bank == bank) {
//             pos.amount = amount;
//             pos.shares = shares;
//         } else {
//             require!(self.deposited_assets.len() < 10, ErrorCode::TooManyPositions);
//             self.deposited_assets.push(UserAssetPosition { bank, amount, shares });
//         }
//         Ok(())
//     }
    
//     pub fn update_borrow_position(&mut self, bank: Pubkey, amount: u64, shares: u64) -> Result<()> {
//         if let Some(pos) = self.borrowed_assets.iter_mut().find(|p| p.bank == bank) {
//             pos.amount = amount;
//             pos.shares = shares;
//         } else {
//             require!(self.borrowed_assets.len() < 10, ErrorCode::TooManyPositions);
//             self.borrowed_assets.push(UserAssetPosition { bank, amount, shares });
//         }
//         Ok(())
//     }
// }

// #[error_code]
// pub enum ErrorCode {
//     #[msg("Too many positions")]
//     TooManyPositions,
// }