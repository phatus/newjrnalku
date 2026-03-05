import { describe, it, expect } from 'vitest';
import { parseActivityMonth, calculateMonthlyCounts } from './date-utils';

describe('date-utils', () => {
    describe('parseActivityMonth', () => {
        it('should parse ISO date strings', () => {
            expect(parseActivityMonth('2024-01-15')).toBe(0);
            expect(parseActivityMonth('2024-12-31')).toBe(11);
        });

        it('should parse ISO datetime strings', () => {
            expect(parseActivityMonth('2024-05-20T10:00:00Z')).toBe(4);
        });

        it('should handle fallback for non-standard formats', () => {
            expect(parseActivityMonth('2024-06-10')).toBe(5);
        });

        it('should return null for invalid dates', () => {
            expect(parseActivityMonth('')).toBeNull();
            expect(parseActivityMonth('not-a-date')).toBeNull();
            expect(parseActivityMonth('2024-13-01')).toBeNull();
        });
    });

    describe('calculateMonthlyCounts', () => {
        it('should correctly count activities per month', () => {
            const activities = [
                { activity_date: '2024-01-01' },
                { activity_date: '2024-01-15' },
                { activity_date: '2024-02-10' },
                { activity_date: '2024-12-25' },
            ];
            const counts = calculateMonthlyCounts(activities);
            expect(counts[0]).toBe(2);
            expect(counts[1]).toBe(1);
            expect(counts[11]).toBe(1);
            expect(counts[5]).toBe(0);
        });
    });
});
