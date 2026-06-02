/// SuiDocs — Document NFT Contract
/// Stores Walrus blob IDs on-chain as NFTs.
/// Owner controls: mint, share access, revoke access, burn.
module suidocs::document_nft {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::event;
    use sui::vec_set::{Self, VecSet};

    // ─── Errors ──────────────────────────────────────────────────
    const ENotOwner: u64 = 1;
    const EAlreadyShared: u64 = 2;
    const ENotShared: u64 = 3;

    // ─── Objects ─────────────────────────────────────────────────

    /// A Document NFT. Holds a reference to a Walrus blob.
    public struct DocumentNFT has key, store {
        id: UID,
        /// The Walrus blob ID — permanent address on the Walrus network.
        blob_id: String,
        /// Human-readable file name.
        name: String,
        /// MIME type (e.g. "application/pdf").
        mime_type: String,
        /// File size in bytes.
        file_size: u64,
        /// Unix timestamp (ms) when this NFT was minted.
        created_at: u64,
        /// Addresses explicitly granted read access.
        shared_with: VecSet<address>,
    }

    // ─── Events ──────────────────────────────────────────────────

    public struct DocumentMinted has copy, drop {
        nft_id: address,
        blob_id: String,
        name: String,
        owner: address,
    }

    public struct AccessGranted has copy, drop {
        nft_id: address,
        recipient: address,
    }

    public struct AccessRevoked has copy, drop {
        nft_id: address,
        recipient: address,
    }

    // ─── Entry functions ─────────────────────────────────────────

    /// Mint a new Document NFT linked to a Walrus blob.
    public entry fun mint_document(
        blob_id: vector<u8>,
        name: vector<u8>,
        mime_type: vector<u8>,
        file_size: u64,
        created_at: u64,
        ctx: &mut TxContext
    ) {
        let nft = DocumentNFT {
            id: object::new(ctx),
            blob_id: string::utf8(blob_id),
            name: string::utf8(name),
            mime_type: string::utf8(mime_type),
            file_size,
            created_at,
            shared_with: vec_set::empty(),
        };

        event::emit(DocumentMinted {
            nft_id: object::uid_to_address(&nft.id),
            blob_id: nft.blob_id,
            name: nft.name,
            owner: tx_context::sender(ctx),
        });

        transfer::public_transfer(nft, tx_context::sender(ctx));
    }

    /// Grant read access to a recipient address.
    public entry fun share_document(
        nft: &mut DocumentNFT,
        recipient: address,
        _ctx: &mut TxContext
    ) {
        assert!(!vec_set::contains(&nft.shared_with, &recipient), EAlreadyShared);
        vec_set::insert(&mut nft.shared_with, recipient);
        event::emit(AccessGranted {
            nft_id: object::uid_to_address(&nft.id),
            recipient,
        });
    }

    /// Revoke read access from a recipient.
    public entry fun revoke_access(
        nft: &mut DocumentNFT,
        recipient: address,
        _ctx: &mut TxContext
    ) {
        assert!(vec_set::contains(&nft.shared_with, &recipient), ENotShared);
        vec_set::remove(&mut nft.shared_with, &recipient);
        event::emit(AccessRevoked {
            nft_id: object::uid_to_address(&nft.id),
            recipient,
        });
    }

    /// Permanently burn the NFT. The Walrus blob is NOT deleted.
    public entry fun burn(nft: DocumentNFT, _ctx: &mut TxContext) {
        let DocumentNFT { id, blob_id: _, name: _, mime_type: _, file_size: _, created_at: _, shared_with: _ } = nft;
        object::delete(id);
    }

    // ─── View functions ──────────────────────────────────────────

    public fun blob_id(nft: &DocumentNFT): &String  { &nft.blob_id   }
    public fun name(nft: &DocumentNFT): &String      { &nft.name      }
    public fun mime_type(nft: &DocumentNFT): &String { &nft.mime_type }
    public fun file_size(nft: &DocumentNFT): u64     { nft.file_size  }
    public fun created_at(nft: &DocumentNFT): u64    { nft.created_at }

    public fun has_access(nft: &DocumentNFT, addr: address): bool {
        vec_set::contains(&nft.shared_with, &addr)
    }
}
