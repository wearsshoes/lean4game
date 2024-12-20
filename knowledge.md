# RPC Context and Interface Modes Refactor

## Current State
- TypewriterInterface has a wrapper component to handle RPC initialization
- EditorInterface copies similar initialization code
- RPC context not consistently passed through component tree

## Required Changes

### Phase 1: Revert and Stabilize
2. Verify RPC and editor functionality working in both editor and typewriter modes

### Phase 2: Create Base Abstractions
1. Create a custom hook `useGameServer` that handles:
   - Server version checking
   - RPC session initialization
   - Editor model initialization
   - Document close notifications
2. Create a base ProofInterface component that:
   - Uses useGameServer hook
   - Provides common proof state management
   - Handles shared UI elements (exercise statement, etc)

### Phase 3: Refactor Existing Interfaces
1. Refactor TypewriterInterface to:
   - Remove wrapper component
   - Use base abstractions
   - Keep typewriter-specific logic only
2. Refactor EditorInterface similarly
3. Verify both modes working with new abstractions

### Phase 4: Add DragDrop Mode
1. Create DragDropInterface using new abstractions
2. Implement drag-drop specific logic only
3. Add to mode switching logic in base interface

## Key Principles
- Each interface mode should focus only on its specific interaction logic
- Server/RPC initialization should be handled once at a high level
- Clear separation between proof state management and UI rendering
- Consistent error handling across all modes

## Anti-patterns to Avoid
- Duplicating initialization code
- Wrapper components just for context handling
- Direct editor model access without proper null checks
- Mode-specific code in base components

## Testing Strategy
1. Verify each mode works independently after refactor
2. Test mode switching
3. Verify RPC communication in each mode
4. Check error handling and loading states
