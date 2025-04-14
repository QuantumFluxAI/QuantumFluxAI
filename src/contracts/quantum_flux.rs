use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvar::{clock::Clock, Sysvar},
};
use borsh::{BorshDeserialize, BorshSerialize};
use std::collections::HashMap;

// Define program state structures
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct NodeInfo {
    pub owner: Pubkey,
    pub compute_power: u64,
    pub reputation: u64,
    pub is_active: bool,
    pub last_active: i64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct TaskInfo {
    pub requester: Pubkey,
    pub model_type: String,
    pub compute_required: u64,
    pub reward: u64,
    pub status: TaskStatus,
    pub assigned_node: Option<Pubkey>,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum TaskStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
}

// Program state
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ProgramState {
    pub nodes: HashMap<Pubkey, NodeInfo>,
    pub tasks: HashMap<Pubkey, TaskInfo>,
    pub total_rewards_distributed: u64,
}

// Program instructions
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum ProgramInstruction {
    RegisterNode {
        compute_power: u64,
    },
    CreateTask {
        model_type: String,
        compute_required: u64,
        reward: u64,
    },
    AssignTask {
        task_id: Pubkey,
        node_id: Pubkey,
    },
    CompleteTask {
        task_id: Pubkey,
        result_hash: [u8; 32],
    },
}

// Program entrypoint
entrypoint!(process_instruction);

// Main processing function
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = ProgramInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        ProgramInstruction::RegisterNode { compute_power } => {
            register_node(program_id, accounts, compute_power)
        }
        ProgramInstruction::CreateTask {
            model_type,
            compute_required,
            reward,
        } => create_task(program_id, accounts, model_type, compute_required, reward),
        ProgramInstruction::AssignTask { task_id, node_id } => {
            assign_task(program_id, accounts, task_id, node_id)
        }
        ProgramInstruction::CompleteTask { task_id, result_hash } => {
            complete_task(program_id, accounts, task_id, result_hash)
        }
    }
}

// Node registration function
fn register_node(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    compute_power: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let node_account = next_account_info(account_info_iter)?;
    let owner_account = next_account_info(account_info_iter)?;

    // Verify ownership
    if !owner_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Create node info
    let node_info = NodeInfo {
        owner: *owner_account.key,
        compute_power,
        reputation: 100, // Initial reputation
        is_active: true,
        last_active: Clock::get()?.unix_timestamp,
    };

    // Store node info
    node_info.serialize(&mut &mut node_account.data.borrow_mut()[..])?;

    msg!("Node registered successfully");
    Ok(())
}

// Task creation function
fn create_task(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    model_type: String,
    compute_required: u64,
    reward: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let task_account = next_account_info(account_info_iter)?;
    let requester_account = next_account_info(account_info_iter)?;

    // Verify ownership
    if !requester_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Create task info
    let task_info = TaskInfo {
        requester: *requester_account.key,
        model_type,
        compute_required,
        reward,
        status: TaskStatus::Pending,
        assigned_node: None,
    };

    // Store task info
    task_info.serialize(&mut &mut task_account.data.borrow_mut()[..])?;

    msg!("Task created successfully");
    Ok(())
}

// Task assignment function
fn assign_task(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    task_id: Pubkey,
    node_id: Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let task_account = next_account_info(account_info_iter)?;
    let node_account = next_account_info(account_info_iter)?;

    // Load and update task info
    let mut task_info = TaskInfo::try_from_slice(&task_account.data.borrow())?;
    task_info.status = TaskStatus::InProgress;
    task_info.assigned_node = Some(node_id);

    // Store updated task info
    task_info.serialize(&mut &mut task_account.data.borrow_mut()[..])?;

    msg!("Task assigned successfully");
    Ok(())
}

// Task completion function
fn complete_task(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    task_id: Pubkey,
    result_hash: [u8; 32],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let task_account = next_account_info(account_info_iter)?;
    let node_account = next_account_info(account_info_iter)?;

    // Load and update task info
    let mut task_info = TaskInfo::try_from_slice(&task_account.data.borrow())?;
    task_info.status = TaskStatus::Completed;

    // Store updated task info
    task_info.serialize(&mut &mut task_account.data.borrow_mut()[..])?;

    msg!("Task completed successfully");
    Ok(())
}

// Unit tests
#[cfg(test)]
mod tests {
    use super::*;
    use solana_program::clock::Epoch;

    #[test]
    fn test_node_registration() {
        // TODO: Implement test
        assert_eq!(1, 1);
    }

    #[test]
    fn test_task_creation() {
        // TODO: Implement test
        assert_eq!(1, 1);
    }
} 