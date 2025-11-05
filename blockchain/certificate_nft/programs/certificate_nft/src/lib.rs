use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::DataV2,
        CreateMetadataAccountsV3, Metadata,
    },
    token::{mint_to, set_authority, Mint, MintTo, SetAuthority, Token, TokenAccount},
};

declare_id!("GvuS3kn4uNWSJmbL7svXcsQ8S3m89FZQo3PfEJsg24Fm");

#[program]
pub mod certificate_nft {
    use super::*;

    /// Issues a soulbound certificate NFT to a student
    /// The NFT is non-transferable (soulbound) and represents course completion
    pub fn issue_certificate(
        ctx: Context<IssueCertificate>,
        metadata_uri: String,
        name: String,
        symbol: String,
        vc_hash: String,
    ) -> Result<()> {
        msg!("Issuing certificate NFT to: {}", ctx.accounts.recipient.key());
        msg!("VC Hash: {}", vc_hash);

        mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
            ),
            1,
        )?;

        create_metadata_accounts_v3(
            CpiContext::new(
                ctx.accounts.metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.metadata.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    mint_authority: ctx.accounts.mint_authority.to_account_info(),
                    update_authority: ctx.accounts.mint_authority.to_account_info(),
                    payer: ctx.accounts.mint_authority.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            DataV2 {
                name,
                symbol,
                uri: metadata_uri,
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            },
            true,  // is_mutable
            true,  // update_authority_is_signer
            None,  // collection_details
        )?;

        // Make it soulbound by removing mint authority
        // This prevents minting additional tokens
        set_authority(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                SetAuthority {
                    current_authority: ctx.accounts.mint_authority.to_account_info(),
                    account_or_mint: ctx.accounts.mint.to_account_info(),
                },
            ),
            anchor_spl::token::spl_token::instruction::AuthorityType::MintTokens,
            None,
        )?;

        // Freeze the token account to make it non-transferable (soulbound)
        set_authority(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                SetAuthority {
                    current_authority: ctx.accounts.mint_authority.to_account_info(),
                    account_or_mint: ctx.accounts.mint.to_account_info(),
                },
            ),
            anchor_spl::token::spl_token::instruction::AuthorityType::FreezeAccount,
            Some(ctx.accounts.mint_authority.key()),
        )?;

        // Freeze the token account
        anchor_spl::token::freeze_account(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::FreezeAccount {
                    account: ctx.accounts.token_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
            ),
        )?;

        msg!("Certificate NFT issued successfully!");
        msg!("Mint: {}", ctx.accounts.mint.key());
        msg!("Recipient: {}", ctx.accounts.recipient.key());

        Ok(())
    }

}

#[derive(Accounts)]
pub struct IssueCertificate<'info> {
    /// The mint account for the NFT (must be created before calling this instruction)
    #[account(
        init,
        payer = mint_authority,
        mint::decimals = 0,
        mint::authority = mint_authority,
        mint::freeze_authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,

    /// The recipient's wallet (student receiving the certificate)
    /// CHECK: This is safe because we only use it as a reference for the token account
    pub recipient: AccountInfo<'info>,

    /// The associated token account for the recipient
    #[account(
        init_if_needed,
        payer = mint_authority,
        associated_token::mint = mint,
        associated_token::authority = recipient,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// The mint authority (issuer's wallet)
    #[account(mut)]
    pub mint_authority: Signer<'info>,

    /// Metadata account PDA
    /// CHECK: This account is validated by the Metaplex program
    #[account(mut)]
    pub metadata: AccountInfo<'info>,

    /// Metaplex Token Metadata program
    pub metadata_program: Program<'info, Metadata>,

    /// SPL Token program
    pub token_program: Program<'info, Token>,

    /// Associated Token program
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// System program
    pub system_program: Program<'info, System>,

    /// Rent sysvar
    pub rent: Sysvar<'info, Rent>,
}
