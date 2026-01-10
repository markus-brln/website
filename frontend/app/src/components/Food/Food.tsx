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
    Divider,
} from '@mantine/core';
import { useMemo, useState } from 'react';

/* ───────────── TYPES ───────────── */

type Food = {
    id: string;
    name: string;
    duration: 1 | 2;
    sides: string[];
    groceries: string[];
};

type Rules = {
    noSameSidesConsecutive: boolean;
    noSameMealPerWeek: boolean;
    noSameMealOverall: boolean;
};

type PlannedMeal = {
    food: Food;
};

/* ───────────── STATIC DATA ───────────── */

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
        groceries: ['ground beef', 'beans', 'tomatoes', 'onion'],
    },
    {
        id: 'pasta',
        name: 'Pasta Bolognese',
        duration: 1,
        sides: ['salad'],
        groceries: ['pasta', 'ground beef', 'tomato sauce'],
    },
    {
        id: 'stirfry',
        name: 'Chicken Stir Fry',
        duration: 1,
        sides: ['rice', 'vegetables'],
        groceries: ['chicken', 'bell pepper', 'soy sauce', 'rice'],
    },
    {
        id: 'curry',
        name: 'Vegetable Curry',
        duration: 2,
        sides: ['naan', 'rice'],
        groceries: ['potato', 'carrot', 'curry paste', 'coconut milk'],
    },
    {
        id: 'tacos',
        name: 'Tacos',
        duration: 1,
        sides: ['corn'],
        groceries: ['tortillas', 'ground beef', 'lettuce', 'cheese'],
    },
    {
        id: 'salmon',
        name: 'Baked Salmon',
        duration: 1,
        sides: ['potatoes'],
        groceries: ['salmon', 'potatoes', 'lemon'],
    },
];

/* ───────────── GENERATOR ───────────── */

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

            const forceTwoDay = twoDayStarts.includes(d);
            if ((food.duration === 2 || forceTwoDay) && d + 1 < DAYS.length) {
                week[d + 1] = { food };
                d++;
            }
        }

        plan.push(week);
    }

    return plan;
}

/* ───────────── UI ───────────── */

function MealCard({ day, meal }: { day: string; meal?: PlannedMeal }) {
    return (
        <Card withBorder>
            <Text fw={600} c="gray.3">
                {day}
            </Text>
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

/* ───────────── MAIN ───────────── */

export default function Food() {
    const [weeks, setWeeks] = useState('1');
    const [twoDayStarts, setTwoDayStarts] = useState<number[]>([]);
    const [regenKey, setRegenKey] = useState(0);

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
        [weeks, rules, twoDayStarts, regenKey]
    );

    /* ───────────── GROCERY LIST ───────────── */

    const groceryList = useMemo(() => {
        const map = new Map<string, number>();

        plan.flat().forEach((meal) => {
            meal?.food.groceries.forEach((item) => {
                map.set(item, (map.get(item) ?? 0) + 1);
            });
        });

        return Array.from(map.entries());
    }, [plan]);

    return (
        <Flex direction="column" gap="lg" p="md">
            <Text size="lg" fw={700} c="gray.3">
                Weekly Meal Planner
            </Text>

            <Stack>
                <Select
                    label="Weeks to plan"
                    value={weeks}
                    onChange={(v) => v && setWeeks(v)}
                    data={['1', '2', '3', '4']}
                />

                <Group>
                    {DAYS.slice(0, -1).map((day, index) => {
                        const disabled = twoDayStarts.includes(index - 1);
                        return (
                            <Checkbox
                                key={day}
                                label={`${day} (2 days)`}
                                disabled={disabled}
                                checked={twoDayStarts.includes(index)}
                                onChange={(event) => {
                                    const checked =
                                        event.currentTarget?.checked ?? false;

                                    setTwoDayStarts((prev) =>
                                        checked
                                            ? [...prev, index]
                                            : prev.filter((i) => i !== index)
                                    );
                                }}
                            />
                        );
                    })}
                </Group>

                <Checkbox
                    checked={rules.noSameSidesConsecutive}
                    label="Disallow same sides consecutively"
                    onChange={(e) =>
                        setRules({
                            ...rules,
                            noSameSidesConsecutive:
                                e.currentTarget?.checked ?? true,
                        })
                    }
                />

                <Checkbox
                    checked={rules.noSameMealPerWeek}
                    label="Disallow same meal per week"
                    onChange={(e) =>
                        setRules({
                            ...rules,
                            noSameMealPerWeek:
                                e.currentTarget?.checked ?? true,
                        })
                    }
                />

                <Checkbox
                    checked={rules.noSameMealOverall}
                    label="Disallow same meal overall"
                    onChange={(e) =>
                        setRules({
                            ...rules,
                            noSameMealOverall:
                                e.currentTarget?.checked ?? true,
                        })
                    }
                />

                <Button onClick={() => setRegenKey((k) => k + 1)}>
                    Regenerate plan
                </Button>
            </Stack>

            {plan.map((week, w) => (
                <Box key={w}>
                    <Text fw={600} c="gray.3" mb="xs">
                        Week {w + 1}
                    </Text>
                    <SimpleGrid cols={7}>
                        {DAYS.map((day, d) => (
                            <MealCard key={day} day={day} meal={week[d]} />
                        ))}
                    </SimpleGrid>
                </Box>
            ))}

            <Divider my="md" />

            <Box>
                <Text fw={600} c="gray.3" mb="xs">
                    Grocery List
                </Text>
                {groceryList.map(([item, count]) => (
                    <Text size="sm" key={item} c="gray.2">
                        {item} {count}x
                    </Text>
                ))}
            </Box>
        </Flex>
    );
}
