import { DocumentPosition, discardMethodNotFound } from '../../../../node_modules/lean4-infoview/src/infoview/util';
import { RpcSessionAtPos, getInteractiveTermGoal, Widget_getWidgets, getInteractiveDiagnostics, InteractiveDiagnostic } from '@leanprover/infoview-api';
import { ProofState, InteractiveGoals } from './rpc_api';
import { UserWidgetInstance } from '@leanprover/infoview-api';

export class RpcService {
  private rpcSess: RpcSessionAtPos;
  private uri: string;

  constructor(rpcSess: RpcSessionAtPos, uri: string) {
    if (!rpcSess || !uri) {
      throw new Error('RpcService requires valid rpcSess and uri')
    }
    this.rpcSess = rpcSess;
    this.uri = uri;
  }

  /**
   * Get the current proof state
   */
  async getProofState(pos: DocumentPosition = { line: 0, character: 0, uri: this.uri }): Promise<ProofState> {
    if (!this.rpcSess || !this.uri) {
      throw new Error('RPC session not initialized')
    }
    
    console.debug('Sending RPC request to load proof state');
    try {
      const proof: ProofState = await this.rpcSess.call('Game.getProofState', DocumentPosition.toTdpp(pos));
      if (typeof proof === 'undefined') {
        console.warn('Received undefined proof state');
        throw new Error('Undefined proof state');
      }
      console.debug('Received proof state');
      return proof;
    } catch (error) {
      console.warn('Failed to get proof state:', error);
      throw error;
    }
  }

  /**
   * Get interactive goals at position
   */
  async getInteractiveGoals(pos: DocumentPosition): Promise<InteractiveGoals> {
    if (!this.rpcSess) {
      throw new Error('RPC session not initialized')
    }
    return await this.rpcSess.call('Game.getInteractiveGoals', DocumentPosition.toTdpp(pos));
  }

  /**
   * Get interactive term goal at position
   */
  async getInteractiveTermGoal(pos: DocumentPosition) {
    if (!this.rpcSess) {
      throw new Error('RPC session not initialized')
    }
    return await getInteractiveTermGoal(this.rpcSess, DocumentPosition.toTdpp(pos));
  }

  /**
   * Get widgets at position
   */
  async getWidgets(pos: DocumentPosition) {
    if (!this.rpcSess) {
      throw new Error('RPC session not initialized')
    }
    return await Widget_getWidgets(this.rpcSess, pos).catch(discardMethodNotFound);
  }

  /**
   * Get diagnostics for line range
   */
  async getDiagnostics(startLine: number, endLine: number): Promise<InteractiveDiagnostic[]> {
    if (!this.rpcSess) {
      throw new Error('RPC session not initialized')
    }
    return await getInteractiveDiagnostics(this.rpcSess, {start: startLine, end: endLine});
  }

  /**
   * Update the RPC session and URI
   */
  updateSession(rpcSess: RpcSessionAtPos, uri: string) {
    if (!rpcSess || !uri) {
      throw new Error('updateSession requires valid rpcSess and uri')
    }
    this.rpcSess = rpcSess;
    this.uri = uri;
  }
}
