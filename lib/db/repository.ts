import type {
  BlockRow,
  FareEstimateRow,
  MatchRecommendationRow,
  PointLedgerRow,
  ReportRow,
  SettlementRow,
  TripGroupRow,
  TripParticipantRow,
  UserRow,
} from './schema'

export interface TransactionContext {
  getUserById(id: string): Promise<UserRow | null>
  upsertUser(user: Pick<UserRow, 'id' | 'phoneNumber' | 'name' | 'gender' | 'universityEmail'>): Promise<UserRow>
  getTripGroupById(id: string): Promise<TripGroupRow | null>
  listOpenTripGroups(): Promise<TripGroupRow[]>
  listParticipantsByTripGroupId(tripGroupId: string): Promise<TripParticipantRow[]>
  saveFareEstimate(row: Omit<FareEstimateRow, 'id' | 'calculatedAt'>): Promise<FareEstimateRow>
  saveMatchRecommendation(row: Omit<MatchRecommendationRow, 'id' | 'calculatedAt'>): Promise<MatchRecommendationRow>
  saveSettlement(row: Omit<SettlementRow, 'id' | 'createdAt' | 'updatedAt'>): Promise<SettlementRow>
  appendPointLedgerEntry(row: Omit<PointLedgerRow, 'id' | 'createdAt'>): Promise<PointLedgerRow>
  createReport(row: Omit<ReportRow, 'id' | 'createdAt' | 'resolvedAt'>): Promise<ReportRow>
  createBlock(row: Omit<BlockRow, 'id' | 'createdAt' | 'liftedAt'>): Promise<BlockRow>
}

export interface TaxiTaRepository {
  transaction<T>(handler: (tx: TransactionContext) => Promise<T>): Promise<T>
}

export interface RepositoryConfiguration {
  databaseUrl: string
  target: 'development' | 'preview' | 'production'
}
