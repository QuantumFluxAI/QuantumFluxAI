use solana_program::{
    account_info::AccountInfo,
    clock::Epoch,
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};
use std::mem;

use crate::{
    ProgramInstruction,
    NodeInfo,
    TaskInfo,
    TaskStatus,
};

// Helper function to create a test account
fn create_test_account<'a>(
    lamports: u64,
    owner: &Pubkey,
    account: &'a mut AccountInfo,
) -> &'a AccountInfo {
    account.key = owner;
    account.lamports = lamports;
    account.owner = owner;
    account.executable = false;
    account.rent_epoch = Epoch::default();
    account
}

#[test]
fn test_node_registration() {
    let program_id = Pubkey::new_unique();
    let node_owner = Pubkey::new_unique();
    let mut node_data = vec![0; mem::size_of::<NodeInfo>()];
    let mut node_account = AccountInfo::new(
        &Pubkey::new_unique(),
        false,
        false,
        &mut 0,
        &mut node_data,
        &program_id,
        false,
        0,
    );

    let instruction = ProgramInstruction::RegisterNode {
        compute_power: 1000,
    };

    let mut instruction_data = vec![];
    instruction.serialize(&mut instruction_data).unwrap();

    let accounts = vec![
        create_test_account(0, &program_id, &mut node_account),
        AccountInfo::new(&node_owner, true, false, &mut 0, &mut [], &program_id, false, 0),
    ];

    // Process the instruction
    crate::process_instruction(&program_id, &accounts, &instruction_data).unwrap();

    // Verify node registration
    let node_info = NodeInfo::try_from_slice(&node_data).unwrap();
    assert_eq!(node_info.owner, node_owner);
    assert_eq!(node_info.compute_power, 1000);
    assert_eq!(node_info.reputation, 100);
    assert!(node_info.is_active);
}

#[test]
fn test_task_creation() {
    let program_id = Pubkey::new_unique();
    let requester = Pubkey::new_unique();
    let mut task_data = vec![0; mem::size_of::<TaskInfo>()];
    let mut task_account = AccountInfo::new(
        &Pubkey::new_unique(),
        false,
        false,
        &mut 0,
        &mut task_data,
        &program_id,
        false,
        0,
    );

    let instruction = ProgramInstruction::CreateTask {
        model_type: "llama2".to_string(),
        compute_required: 500,
        reward: 1000,
    };

    let mut instruction_data = vec![];
    instruction.serialize(&mut instruction_data).unwrap();

    let accounts = vec![
        create_test_account(0, &program_id, &mut task_account),
        AccountInfo::new(&requester, true, false, &mut 0, &mut [], &program_id, false, 0),
    ];

    // Process the instruction
    crate::process_instruction(&program_id, &accounts, &instruction_data).unwrap();

    // Verify task creation
    let task_info = TaskInfo::try_from_slice(&task_data).unwrap();
    assert_eq!(task_info.requester, requester);
    assert_eq!(task_info.model_type, "llama2");
    assert_eq!(task_info.compute_required, 500);
    assert_eq!(task_info.reward, 1000);
    assert!(matches!(task_info.status, TaskStatus::Pending));
    assert!(task_info.assigned_node.is_none());
}

#[test]
fn test_task_assignment() {
    let program_id = Pubkey::new_unique();
    let node_id = Pubkey::new_unique();
    let mut task_data = vec![0; mem::size_of::<TaskInfo>()];
    let mut task_account = AccountInfo::new(
        &Pubkey::new_unique(),
        false,
        false,
        &mut 0,
        &mut task_data,
        &program_id,
        false,
        0,
    );

    let mut node_data = vec![0; mem::size_of::<NodeInfo>()];
    let mut node_account = AccountInfo::new(
        &node_id,
        false,
        false,
        &mut 0,
        &mut node_data,
        &program_id,
        false,
        0,
    );

    // First create a task
    let create_instruction = ProgramInstruction::CreateTask {
        model_type: "llama2".to_string(),
        compute_required: 500,
        reward: 1000,
    };

    let mut create_data = vec![];
    create_instruction.serialize(&mut create_data).unwrap();

    let create_accounts = vec![
        create_test_account(0, &program_id, &mut task_account),
        AccountInfo::new(&Pubkey::new_unique(), true, false, &mut 0, &mut [], &program_id, false, 0),
    ];

    crate::process_instruction(&program_id, &create_accounts, &create_data).unwrap();

    // Then assign the task
    let assign_instruction = ProgramInstruction::AssignTask {
        task_id: *task_account.key,
        node_id,
    };

    let mut assign_data = vec![];
    assign_instruction.serialize(&mut assign_data).unwrap();

    let assign_accounts = vec![
        create_test_account(0, &program_id, &mut task_account),
        create_test_account(0, &program_id, &mut node_account),
    ];

    crate::process_instruction(&program_id, &assign_accounts, &assign_data).unwrap();

    // Verify task assignment
    let task_info = TaskInfo::try_from_slice(&task_data).unwrap();
    assert!(matches!(task_info.status, TaskStatus::InProgress));
    assert_eq!(task_info.assigned_node, Some(node_id));
} 