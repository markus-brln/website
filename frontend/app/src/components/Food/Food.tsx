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
    nonRepeatable: string[];
    groceries: string[];
};

type Rules = {
    noSameNonRepeatableConsecutive: boolean;
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
    { id: 'pizza', name: 'Pizza', duration: 1, nonRepeatable: ['salad'], groceries: ['pizza dough', 'tomato sauce', 'cheese'] },
    { id: 'tortillas', name: 'Tortillas', duration: 1, nonRepeatable: ['salad'], groceries: ['tortillas', 'chicken', 'lettuce', 'cheese'] },
    { id: 'burgers', name: 'Burgers', duration: 1, nonRepeatable: ['potatoes'], groceries: ['burger buns', 'ground beef', 'cheese'] },
    { id: 'tortilla-burgers', name: 'Tortilla Burgers', duration: 1, nonRepeatable: ['salad'], groceries: ['tortillas', 'ground beef', 'cheese'] },
    { id: 'poke-bowl', name: 'Poke Bowl', duration: 1, nonRepeatable: ['rice'], groceries: ['rice', 'fish', 'avocado', 'soy sauce'] },

    { id: 'chicken-potatoes', name: 'Chicken & Potatoes', duration: 2, nonRepeatable: ['salad'], groceries: ['chicken', 'potatoes', 'olive oil'] },
    { id: 'chicken-rice', name: 'Chicken & Rice', duration: 2, nonRepeatable: ['vegetables'], groceries: ['chicken', 'rice', 'broccoli'] },
    { id: 'lasagna', name: 'Lasagna', duration: 2, nonRepeatable: ['salad'], groceries: ['pasta sheets', 'tomato sauce', 'cheese', 'minced meat'] },
    { id: 'souvlaki', name: 'Souvlaki', duration: 2, nonRepeatable: ['salad', 'bread'], groceries: ['pork', 'skewers', 'pita bread', 'tomato'] },
    { id: 'chicken-curry', name: 'Chicken Curry', duration: 2, nonRepeatable: ['rice'], groceries: ['chicken', 'curry paste', 'coconut milk'] },
    { id: 'chicken-soup', name: 'Chicken Soup', duration: 2, nonRepeatable: ['bread'], groceries: ['chicken', 'carrot', 'celery', 'noodles'] },
];

/* ───────────── GENERATOR ───────────── */

function generatePlan(
    foods: Food[],
    weeks: number,
    rules: Rules,
    twoDayStarts: number[]
) {
    const plan: PlannedMeal[][] = [];
    const usedMealsOverall = new Set<string>();

    for (let w = 0; w < weeks; w++) {
        const week: PlannedMeal[] = [];
        const usedMealsWeek = new Set<string>();
        let lastNonRepeatable: string[] = [];

        for (let d = 0; d < DAYS.length; d++) {
            if (week[d]) continue;

            // Determine if this day should start a 2-day meal
            const forceTwoDay = twoDayStarts.includes(d);

            let candidates = foods.filter((food) => {
                // Only allow 2-day meals to start if today is selected
                if (food.duration === 2 && !forceTwoDay) return false;
                if (food.duration === 1 && forceTwoDay) return true; // allow 1-day only if not forcing 2-day

                // Consecutive nonRepeatable check
                if (rules.noSameNonRepeatableConsecutive && lastNonRepeatable.some(nr => food.nonRepeatable.includes(nr))) return false;

                // Weekly and overall uniqueness
                if (rules.noSameMealPerWeek && usedMealsWeek.has(food.id)) return false;
                if (rules.noSameMealOverall && usedMealsOverall.has(food.id)) return false;

                return true;
            });

            // Fallback: if no candidates, allow any 1-day meal
            if (candidates.length === 0) candidates = foods.filter(f => f.duration === 1);

            const food = candidates[Math.floor(Math.random() * candidates.length)];
            week[d] = { food };
            usedMealsWeek.add(food.id);
            usedMealsOverall.add(food.id);
            lastNonRepeatable = food.nonRepeatable;

            // Fill second day for 2-day meal
            if (food.duration === 2 && d + 1 < DAYS.length) {
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
            <Text fw={600} c="gray.3">{day}</Text>
            {meal ? (
                <>
                    <Text size="sm">{meal.food.name}</Text>
                    <Text size="xs" c="dimmed">Non-repeatable: {meal.food.nonRepeatable.join(', ')}</Text>
                </>
            ) : <Text size="xs" c="dimmed">—</Text>}
        </Card>
    );
}

/* ───────────── MAIN ───────────── */

export default function Food() {
    const [weeks, setWeeks] = useState('1');
    const [twoDayStarts, setTwoDayStarts] = useState<number[]>([]);
    const [regenKey, setRegenKey] = useState(0);

    const [rules, setRules] = useState<Rules>({
        noSameNonRepeatableConsecutive: true,
        noSameMealPerWeek: true,
        noSameMealOverall: true,
    });

    const plan = useMemo(() => generatePlan(FOODS, Number(weeks), rules, twoDayStarts), [weeks, rules, twoDayStarts, regenKey]);

    const groceryList = useMemo(() => {
        const map = new Map<string, number>();
        plan.flat().forEach((meal) => meal?.food.groceries.forEach((item) => map.set(item, (map.get(item) ?? 0) + 1)));
        return Array.from(map.entries());
    }, [plan]);

    return (
        <Flex direction="column" gap="lg" p="md">
            <Text size="lg" fw={700} c="gray.3">Weekly Meal Planner</Text>

            <Stack spacing="sm">
                <Select label="Weeks to plan" value={weeks} onChange={(v) => v && setWeeks(v)} data={['1','2','3','4']} />

                {/* Responsive 2-day selection */}
                <SimpleGrid cols={2} spacing="sm" breakpoints={[{ maxWidth: 768, cols: 1 }]}>
                    {DAYS.slice(0, -1).map((day, index) => {
                        const disabled = twoDayStarts.includes(index - 1);
                        return (
                            <Checkbox
                                key={day}
                                label={`${day} (2 days)`}
                                disabled={disabled}
                                checked={twoDayStarts.includes(index)}
                                onChange={(e) => {
                                    const checked = e.currentTarget.checked ?? false;
                                    setTwoDayStarts(prev => checked ? [...prev, index] : prev.filter(i => i !== index));
                                }}
                            />
                        );
                    })}
                </SimpleGrid>

                <Checkbox checked={rules.noSameNonRepeatableConsecutive} label="Disallow same non-repeatable consecutively" onChange={(e) => setRules({...rules, noSameNonRepeatableConsecutive: e.currentTarget.checked ?? true})} />
                <Checkbox checked={rules.noSameMealPerWeek} label="Disallow same meal per week" onChange={(e) => setRules({...rules, noSameMealPerWeek: e.currentTarget.checked ?? true})} />
                <Checkbox checked={rules.noSameMealOverall} label="Disallow same meal overall" onChange={(e) => setRules({...rules, noSameMealOverall: e.currentTarget.checked ?? true})} />

                <Button onClick={() => setRegenKey(k => k + 1)}>Regenerate plan</Button>
            </Stack>

            {/* Responsive week grid */}
            {plan.map((week, w) => (
                <Box key={w}>
                    <Text fw={600} c="gray.3" mb="xs">Week {w+1}</Text>
                    <SimpleGrid cols={7} spacing="xs" breakpoints={[
                        { maxWidth: 1024, cols: 4 },
                        { maxWidth: 768, cols: 2 },
                        { maxWidth: 480, cols: 1 },
                    ]}>
                        {DAYS.map((day, d) => <MealCard key={day} day={day} meal={week[d]} />)}
                    </SimpleGrid>
                </Box>
            ))}

            <Divider my="md" />

            <Box>
                <Text fw={600} c="gray.3" mb="xs">Grocery List</Text>
                <Stack spacing="xs">
                    {groceryList.map(([item,count]) => <Text size="sm" key={item} c="gray.2">{item} {count}x</Text>)}
                </Stack>
            </Box>
        </Flex>
    );
}
