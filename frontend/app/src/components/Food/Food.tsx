import {
    Box,
    Button,
    Card,
    Checkbox,
    Flex,
    Group,
    Select,
    SimpleGrid,
    Stack,
    Text,
} from '@mantine/core';
import { useMemo, useState } from 'react';

/* ───────────────── TYPES ───────────────── */

type Food = {
    id: string;
    name: string;
    duration: 1 | 2;
    sides: string[];
};

type Rules = {
    noSameSidesConsecutive: boolean;
    noSameMealPerWeek: boolean;
    noSameMealOverall: boolean;
};

type PlannedMeal = {
    food: Food;
};

/* ───────────────── STATIC DATA ───────────────── */

const DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

const FOODS: Food[] = [
    {
        id: 'chili',
        name: 'Chili con Carne',
        duration: 2,
        sides: ['rice', 'bread'],
    },
    {
        id: 'pasta',
        name: 'Pasta Bolognese',
        duration: 1,
        sides: ['salad'],
    },
    {
        id: 'stirfry',
        name: 'Chicken Stir Fry',
        duration: 1,
        sides: ['rice', 'vegetables'],
    },
    {
        id: 'curry',
        name: 'Vegetable Curry',
        duration: 2,
        sides: ['naan', 'rice'],
    },
    {
        id: 'curry2',
        name: 'Vegetable Curry2',
        duration: 2,
        sides: ['naan2', 'rice2'],
    },
    {
        id: 'curry3',
        name: 'Vegetable Curry3',
        duration: 2,
        sides: ['naan', 'rice'],
    },
    {
        id: 'curry4',
        name: 'Vegetable Curry4',
        duration: 2,
        sides: ['naan', 'rice'],
    }
];

/* ───────────────── GENERATOR LOGIC ───────────────── */

function generatePlan(
    foods: Food[],
    weeks: number,
    rules: Rules,
    twoDayStarts: number[]
) {
    const plan: PlannedMeal[][] = [];
    const usedMeals = new Set<string>();

    for (let w = 0; w < weeks; w++) {
        const week: PlannedMeal[] = [];
        const weeklyMeals = new Set<string>();
        let lastSides: string[] = [];

        for (let d = 0; d < DAYS.length; d++) {
            if (week[d]) continue;

            let candidates = foods.filter((food) => {
                if (rules.noSameMealPerWeek && weeklyMeals.has(food.id)) return false;
                if (rules.noSameMealOverall && usedMeals.has(food.id)) return false;
                if (
                    rules.noSameSidesConsecutive &&
                    lastSides.some((s) => food.sides.includes(s))
                )
                    return false;
                return true;
            });

            if (candidates.length === 0) candidates = foods;

            const food = candidates[Math.floor(Math.random() * candidates.length)];

            week[d] = { food };
            weeklyMeals.add(food.id);
            usedMeals.add(food.id);
            lastSides = food.sides;

            if (food.duration === 2 || twoDayStarts.includes(d)) {
                if (d + 1 < DAYS.length) {
                    week[d + 1] = { food };
                    d++;
                }
            }
        }

        plan.push(week);
    }

    return plan;
}

/* ───────────────── UI SUB-COMPONENTS ───────────────── */

function MealCard({ day, meal }: { day: string; meal?: PlannedMeal }) {
    return (
        <Card shadow="sm" withBorder>
            <Text fw={600}>{day}</Text>
            {meal ? (
                <>
                    <Text size="sm">{meal.food.name}</Text>
                    <Text size="xs" c="dimmed">
                        Sides: {meal.food.sides.join(', ')}
                    </Text>
                </>
            ) : (
                <Text size="xs" c="dimmed">
                    —
                </Text>
            )}
        </Card>
    );
}

/* ───────────────── MAIN COMPONENT ───────────────── */

export default function Food() {
    const [weeks, setWeeks] = useState('1');
    const [twoDayStarts, setTwoDayStarts] = useState<number[]>([]);
    const [rules, setRules] = useState<Rules>({
        noSameSidesConsecutive: true,
        noSameMealPerWeek: true,
        noSameMealOverall: true,
    });

    const plan = useMemo(
        () =>
            generatePlan(
                FOODS,
                Number(weeks),
                rules,
                twoDayStarts
            ),
        [weeks, rules, twoDayStarts]
    );

    return (
        <Flex direction="column" gap="lg" p="md">
            <Text size="lg" fw={700}>
                Weekly Meal Planner
            </Text>

            {/* Controls */}
            <Stack spacing="sm">
                <Select
                    label="Plan weeks ahead"
                    value={weeks}
                    onChange={(v) => v && setWeeks(v)}
                    data={['1', '2', '3', '4']}
                />

                <Group>
                    {DAYS.slice(0, -1).map((day, index) => (
                        <Checkbox
                            key={day}
                            label={`${day} (2 days)`}
                            checked={twoDayStarts.includes(index)}
                            onChange={(e) =>
                                setTwoDayStarts((prev) =>
                                    e.currentTarget.checked
                                        ? [...prev, index]
                                        : prev.filter((i) => i !== index)
                                )
                            }
                        />
                    ))}
                </Group>

                <Checkbox
                    checked={rules.noSameSidesConsecutive}
                    onChange={(e) =>
                        setRules({ ...rules, noSameSidesConsecutive: e.currentTarget.checked })
                    }
                    label="Disallow same sides on consecutive days"
                />

                <Checkbox
                    checked={rules.noSameMealPerWeek}
                    onChange={(e) =>
                        setRules({ ...rules, noSameMealPerWeek: e.currentTarget.checked })
                    }
                    label="Disallow same meal within a week"
                />

                <Checkbox
                    checked={rules.noSameMealOverall}
                    onChange={(e) =>
                        setRules({ ...rules, noSameMealOverall: e.currentTarget.checked })
                    }
                    label="Disallow same meal in whole planning period"
                />
            </Stack>

            {/* Calendar */}
            {plan.map((week, w) => (
                <Box key={w}>
                    <Text fw={600} mb="xs">
                        Week {w + 1}
                    </Text>

                    <SimpleGrid cols={7}>
                        {DAYS.map((day, d) => (
                            <MealCard key={day} day={day} meal={week[d]} />
                        ))}
                    </SimpleGrid>
                </Box>
            ))}
        </Flex>
    );
}
