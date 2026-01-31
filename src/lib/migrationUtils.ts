/**
 * Storage Migration Utility
 *
 * Handles localStorage versioning and data migration for the PM Research platform.
 * Provides a centralized way to manage schema changes across contexts.
 */

export interface MigrationConfig<T> {
  /** Current storage key (e.g., "pm-portfolios-v3") */
  currentKey: string;
  /** Current schema version number */
  currentVersion: number;
  /** Legacy keys to check for migration (oldest to newest) */
  legacyKeys: string[];
  /** Default value if no data exists */
  defaultValue: T;
  /** Validate that parsed data matches expected structure */
  validate: (data: unknown) => data is T;
  /** Transform data from older schema versions to current */
  migrations?: Record<number, (data: unknown) => unknown>;
}

export interface MigrationResult<T> {
  /** The migrated data */
  data: T;
  /** Whether a migration was performed */
  didMigrate: boolean;
  /** The source key the data was loaded from (or null if using default) */
  sourceKey: string | null;
  /** Version of the source data (0 if default) */
  sourceVersion: number;
}

/**
 * Extract version number from a storage key
 * e.g., "pm-portfolios-v3" -> 3, "pm-research" -> 1
 */
export function extractVersion(key: string): number {
  const match = key.match(/-v(\d+)$/);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Build a versioned storage key
 * e.g., ("pm-portfolios", 3) -> "pm-portfolios-v3"
 */
export function buildVersionedKey(baseKey: string, version: number): string {
  // Remove existing version suffix if present
  const base = baseKey.replace(/-v\d+$/, '');
  return version === 1 ? base : `${base}-v${version}`;
}

/**
 * Load and migrate data from localStorage
 *
 * This function:
 * 1. Checks for data at the current key first
 * 2. Falls back to legacy keys in reverse order (newest to oldest)
 * 3. Applies migrations if needed
 * 4. Returns the migrated data
 */
export function loadWithMigration<T>(config: MigrationConfig<T>): MigrationResult<T> {
  if (typeof window === 'undefined') {
    return {
      data: config.defaultValue,
      didMigrate: false,
      sourceKey: null,
      sourceVersion: 0,
    };
  }

  // First, try to load from current key
  try {
    const currentData = localStorage.getItem(config.currentKey);
    if (currentData) {
      const parsed = JSON.parse(currentData);
      if (config.validate(parsed)) {
        return {
          data: parsed,
          didMigrate: false,
          sourceKey: config.currentKey,
          sourceVersion: config.currentVersion,
        };
      }
    }
  } catch (error) {
    console.error(`Failed to load from ${config.currentKey}:`, error);
  }

  // Try legacy keys in reverse order (newest to oldest)
  const legacyKeysReversed = [...config.legacyKeys].reverse();
  for (const legacyKey of legacyKeysReversed) {
    try {
      const legacyData = localStorage.getItem(legacyKey);
      if (legacyData) {
        let parsed = JSON.parse(legacyData);
        const sourceVersion = extractVersion(legacyKey);

        // Apply migrations sequentially from source version to current
        if (config.migrations) {
          for (let v = sourceVersion; v < config.currentVersion; v++) {
            const migration = config.migrations[v];
            if (migration) {
              parsed = migration(parsed);
            }
          }
        }

        // Validate the migrated data
        if (config.validate(parsed)) {
          return {
            data: parsed,
            didMigrate: true,
            sourceKey: legacyKey,
            sourceVersion,
          };
        }
      }
    } catch (error) {
      console.error(`Failed to migrate from ${legacyKey}:`, error);
    }
  }

  // No valid data found, return default
  return {
    data: config.defaultValue,
    didMigrate: false,
    sourceKey: null,
    sourceVersion: 0,
  };
}

/**
 * Save data to localStorage and clean up legacy keys
 */
export function saveWithCleanup<T>(
  currentKey: string,
  data: T,
  legacyKeys: string[]
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(currentKey, JSON.stringify(data));

    // Clean up legacy keys after successful save
    for (const legacyKey of legacyKeys) {
      try {
        localStorage.removeItem(legacyKey);
      } catch {
        // Ignore cleanup errors
      }
    }

    return true;
  } catch (error) {
    console.error(`Failed to save to ${currentKey}:`, error);
    return false;
  }
}

/**
 * Clean up old storage keys without saving
 * Useful when migration has already been performed
 */
export function cleanupLegacyKeys(legacyKeys: string[]): void {
  if (typeof window === 'undefined') return;

  for (const key of legacyKeys) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Get all PM Research related keys from localStorage
 * Useful for debugging and manual cleanup
 */
export function getPMResearchKeys(): string[] {
  if (typeof window === 'undefined') return [];

  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('pm-')) {
      keys.push(key);
    }
  }
  return keys.sort();
}

// ============================================================================
// Type Validators
// ============================================================================

/**
 * Validate Portfolio array structure
 */
export function isValidPortfolioArray(data: unknown): data is Array<{
  id: string;
  name: string;
  description: string;
  positions: Array<{ ticker: string; weight: number }>;
}> {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return true; // Empty array is valid

  // Check first item has expected structure
  const first = data[0];
  return (
    typeof first === 'object' &&
    first !== null &&
    typeof first.id === 'string' &&
    typeof first.name === 'string' &&
    Array.isArray(first.positions)
  );
}

/**
 * Validate ResearchNote array structure
 */
export function isValidResearchArray(data: unknown): data is Array<{
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  date: string;
  pmScore: number;
  category: string;
  readTime: string;
}> {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return true;

  const first = data[0];
  return (
    typeof first === 'object' &&
    first !== null &&
    typeof first.id === 'string' &&
    typeof first.title === 'string' &&
    typeof first.pmScore === 'number'
  );
}

/**
 * Validate StockData record structure
 */
export function isValidStockDbRecord(data: unknown): data is Record<string, {
  ticker: string;
  name: string;
  assetClass: string;
  sector: string;
  yearlyClose: number;
  pmScore: number;
  lastUpdated: string;
}> {
  if (typeof data !== 'object' || data === null) return false;
  if (Array.isArray(data)) return false;

  // Check if it's an empty object or has valid stock entries
  const entries = Object.entries(data);
  if (entries.length === 0) return true;

  const [, first] = entries[0];
  return (
    typeof first === 'object' &&
    first !== null &&
    typeof (first as Record<string, unknown>).ticker === 'string' &&
    typeof (first as Record<string, unknown>).yearlyClose === 'number'
  );
}

// ============================================================================
// Migration Definitions
// ============================================================================

/**
 * Portfolio migrations from v1 -> v2 -> v3
 */
export const portfolioMigrations: Record<number, (data: unknown) => unknown> = {
  // v1 -> v2: Add description field if missing
  1: (data: unknown) => {
    if (!Array.isArray(data)) return data;
    return data.map((portfolio) => ({
      ...portfolio,
      description: portfolio.description || '',
    }));
  },
  // v2 -> v3: Normalize ticker symbols to uppercase
  2: (data: unknown) => {
    if (!Array.isArray(data)) return data;
    return data.map((portfolio) => ({
      ...portfolio,
      positions: Array.isArray(portfolio.positions)
        ? portfolio.positions.map((pos: { ticker: string; weight: number }) => ({
            ...pos,
            ticker: pos.ticker?.toUpperCase() || pos.ticker,
          }))
        : portfolio.positions,
    }));
  },
};

/**
 * StockDatabase migrations from v1 -> v2
 */
export const stockDbMigrations: Record<number, (data: unknown) => unknown> = {
  // v1 -> v2: Update yearlyClose field name from ytdBaseline
  1: (data: unknown) => {
    if (typeof data !== 'object' || data === null) return data;
    const result: Record<string, unknown> = {};
    for (const [ticker, stock] of Object.entries(data as Record<string, Record<string, unknown>>)) {
      result[ticker] = {
        ...stock,
        yearlyClose: stock.yearlyClose ?? stock.ytdBaseline ?? stock.ytdClose ?? 0,
      };
    }
    return result;
  },
};

/**
 * Research migrations (currently at v1, no migrations needed)
 */
export const researchMigrations: Record<number, (data: unknown) => unknown> = {
  // No migrations needed yet
};
