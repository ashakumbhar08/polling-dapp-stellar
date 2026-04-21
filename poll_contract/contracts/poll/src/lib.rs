#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec};

// ─── Storage key types ────────────────────────────────────────────────────────

/// Key for storing the vote count of a specific option within a poll.
#[contracttype]
pub struct VoteKey {
    pub poll_id: u32,
    pub option: u32,
}

/// Key for recording whether a specific voter has voted in a poll.
#[contracttype]
pub struct VoterKey {
    pub poll_id: u32,
    pub voter: Address,
}

/// Number of options supported per poll.
const NUM_OPTIONS: u32 = 4;

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct PollContract;

#[contractimpl]
impl PollContract {
    /// Cast a vote for `option` (0-indexed) in `poll_id`.
    ///
    /// Errors if:
    /// - `option` is out of range (>= NUM_OPTIONS)
    /// - `voter` has already voted in this poll
    pub fn cast_vote(env: Env, poll_id: u32, option: u32, voter: Address) {
        // Require the voter to authorise this call.
        voter.require_auth();

        assert!(option < NUM_OPTIONS, "invalid option index");

        let voter_key = VoterKey {
            poll_id,
            voter: voter.clone(),
        };

        // Prevent double-voting.
        let already_voted: bool = env
            .storage()
            .persistent()
            .get(&voter_key)
            .unwrap_or(false);
        assert!(!already_voted, "already voted");

        // Increment the vote count for this option.
        let vote_key = VoteKey { poll_id, option };
        let current: u32 = env
            .storage()
            .persistent()
            .get(&vote_key)
            .unwrap_or(0u32);
        env.storage()
            .persistent()
            .set(&vote_key, &(current + 1));

        // Mark voter as having voted.
        env.storage().persistent().set(&voter_key, &true);
    }

    /// Return the vote counts for all options in `poll_id`.
    ///
    /// Returns a Vec of length NUM_OPTIONS where index i is the count for option i.
    pub fn get_results(env: Env, poll_id: u32) -> Vec<u32> {
        let mut counts = Vec::new(&env);
        for option in 0..NUM_OPTIONS {
            let vote_key = VoteKey { poll_id, option };
            let count: u32 = env
                .storage()
                .persistent()
                .get(&vote_key)
                .unwrap_or(0u32);
            counts.push_back(count);
        }
        counts
    }

    /// Return whether `voter` has already voted in `poll_id`.
    pub fn has_voted(env: Env, poll_id: u32, voter: Address) -> bool {
        let voter_key = VoterKey { poll_id, voter };
        env.storage()
            .persistent()
            .get(&voter_key)
            .unwrap_or(false)
    }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_cast_and_get_results() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(PollContract, ());
        let client = PollContractClient::new(&env, &contract_id);

        let voter = Address::generate(&env);

        // Cast a vote for option 1 in poll 0.
        client.cast_vote(&0, &1, &voter);

        let results = client.get_results(&0);
        assert_eq!(results.get(0).unwrap(), 0);
        assert_eq!(results.get(1).unwrap(), 1);
        assert_eq!(results.get(2).unwrap(), 0);
        assert_eq!(results.get(3).unwrap(), 0);
    }

    #[test]
    fn test_has_voted() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(PollContract, ());
        let client = PollContractClient::new(&env, &contract_id);

        let voter = Address::generate(&env);

        assert!(!client.has_voted(&0, &voter));
        client.cast_vote(&0, &2, &voter);
        assert!(client.has_voted(&0, &voter));
    }

    #[test]
    #[should_panic(expected = "already voted")]
    fn test_double_vote_rejected() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(PollContract, ());
        let client = PollContractClient::new(&env, &contract_id);

        let voter = Address::generate(&env);

        client.cast_vote(&0, &0, &voter);
        client.cast_vote(&0, &0, &voter); // should panic
    }
}
