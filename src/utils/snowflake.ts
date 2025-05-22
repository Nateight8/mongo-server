import { Snowflake } from '@theinternetfolks/snowflake';

// Generate a new Snowflake ID
export const generateSnowflakeId = (): string => {
  return Snowflake.generate();
};
