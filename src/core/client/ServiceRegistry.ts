/** Registratie van langlevende diensten (bv. stats-updates). */
export interface ServiceRegistry {
  /** Stop alle actieve diensten (intervallen etc.) bij shutdown. */
  stopAll(): void;
}
