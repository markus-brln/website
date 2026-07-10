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
    Textarea,
    Badge,
} from '@mantine/core';
import { useMemo, useState, useEffect } from 'react';

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

/* ───────────── STATIC FALLBACK DATA ───────────── */

const DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

const DEFAULT_FOODS: Food[] = [
    { "id": "pizza", "name": "Pizza", "duration": 1, "nonRepeatable": ["bread"], "groceries": ["flour", "baking powder", "tomato sauce", "cheese", "tomatoes", "mushrooms", "courgette", "bacon", "rucola", "mozzarella"] },
    { "id": "fajitas", "name": "Fajitas", "duration": 1, "nonRepeatable": ["chicken"], "groceries": ["tortillas", "chicken", "cheese", "paprika", "mushrooms", "onion", "beans", "corn"] },
    { "id": "burgers", "name": "Burgers", "duration": 1, "nonRepeatable": ["potatoes", "bread", "burger", "minced meat"], "groceries": ["burger buns", "minced meat", "cheese", "onion", "lettuce", "tomatoes", "pickles", "potatoes"] },
    { "id": "tortilla-burgers", "name": "Tortilla Burgers", "duration": 1, "nonRepeatable": ["burger", "minced meat"], "groceries": ["tortillas", "minced meat", "cheese", "pickles", "corn", "rucola"] },
    { "id": "poke-bowl-fish", "name": "Poke Bowl Fish", "duration": 1, "nonRepeatable": ["rice", "fish"], "groceries": ["rice", "salmon", "avocado", "soy sauce", "cucumber", "mango", "carrots", "sesame seeds"] },
    { "id": "poke-bowl-chicken", "name": "Poke Bowl Chicken", "duration": 1, "nonRepeatable": ["rice", "chicken"], "groceries": ["rice", "chicken", "avocado", "soy sauce", "cucumber", "mango", "carrots", "sesame seeds"] },
    { "id": "nachos", "name": "Nachos", "duration": 1, "nonRepeatable": ["nachos", "corn"], "groceries": ["nachos", "corn", "beans", "salsa", "cheese", "sour cream", "guacamole"] },
    { "id": "fish-sticks", "name": "Fish sticks with potatoes", "duration": 1, "nonRepeatable": ["fish", "potatoes"], "groceries": ["potatoes", "fish sticks"] },
    { "id": "omelette-with-potatoes", "name": "Omelette with potatoes", "duration": 1, "nonRepeatable": ["potatoes", "egg"], "groceries": ["potatoes", "egg", "paprika", "zucchini", "mushrooms"] },
    { "id": "bolognese", "name": "Bolognese", "duration": 2, "nonRepeatable": ["pasta", "minced meat"], "groceries": ["minced meat", "pasta", "tomato sauce", "onion", "carrots", "parmesan cheese"] },
    { "id": "chicken-potatoes", "name": "Chicken & Potatoes", "duration": 2, "nonRepeatable": ["chicken", "potatoes"], "groceries": ["chicken", "potatoes", "olive oil", "rosemary", "lemon"] },
    { "id": "lasagna", "name": "Lasagna", "duration": 2, "nonRepeatable": ["pasta", "minced meat"], "groceries": ["lasagna", "tomato sauce", "cheese", "minced meat", "onion", "milk", "butter", "flour", "paprika"] },
    { "id": "souvlaki", "name": "Souvlaki", "duration": 2, "nonRepeatable": ["pork", "bread"], "groceries": ["pork", "skewers", "pita bread", "tomatoes", "onion", "yoghurt", "cucumber", "lemon"] },
    { "id": "chicken-curry", "name": "Chicken Curry", "duration": 2, "nonRepeatable": ["rice", "chicken"], "groceries": ["chicken", "coconut milk", "rice", "paprika", "onion", "ginger", "cream", "broccoli"] },
    { "id": "chicken-soup", "name": "Chicken Soup", "duration": 2, "nonRepeatable": ["rice", "chicken"], "groceries": ["chicken", "carrots", "rice", "onion", "chicken stock", "carrots"] },
    { "id": "loaded-fries", "name": "Loaded Fries", "duration": 1, "nonRepeatable": ["minced meat", "potatoes"], "groceries": ["minced meat", "fries", "cheese", "mayonnaise", "spring onion"] },
    { "id": "chicken-salad", "name": "Chicken Salad", "duration": 2, "nonRepeatable": ["chicken", "pasta"], "groceries": ["chicken", "pasta", "capers", "pickles", "salad", "cucumber", "tomatoes", "mayonnaise", "corn"] },
    { "id": "gnocchi-asian", "name": "Gnocchi Asian", "duration": 2, "nonRepeatable": ["potatoes", "chicken"], "groceries": ["chicken", "paprika", "gnocchi", "mushrooms", "teriyaki sauce", "spring onion", "sesame oil", "broccoli"] },
    { "id": "gnocchi-pesto-salmon", "name": "Gnocchi Pesto Salmon", "duration": 1, "nonRepeatable": ["fish", "potatoes", "pesto"], "groceries": ["gnocchi", "pesto", "salmon", "tomatoes", "parmesan cheese"] },
    { "id": "tortellini-pesto", "name": "Tortellini Pesto", "duration": 1, "nonRepeatable": ["pasta", "pesto"], "groceries": ["pesto", "tortellini", "tomatoes", "parmesan cheese"] },
    { "id": "duck-filet", "name": "Duck Filet Pasta", "duration": 1, "nonRepeatable": ["chicken", "pasta"], "groceries": ["duck filet", "pasta", "cream"] },
];

/* ───────────── COOKIE HELPERS ───────────── */

function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
    return null;
}

function setCookie(name: string, value: string, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Strict`;
}

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

            const forceTwoDay = twoDayStarts.includes(d);

            // Filter foods according to rules
            let candidates = foods.filter((food) => {
                // 2-day meal rules
                if (forceTwoDay && food.duration !== 2) return false;
                if (!forceTwoDay && food.duration === 2) return false;

                // Non-repeatable consecutive check
                if (rules.noSameNonRepeatableConsecutive && lastNonRepeatable.some(nr => food.nonRepeatable.includes(nr))) return false;

                // Weekly and overall uniqueness
                if (rules.noSameMealPerWeek && usedMealsWeek.has(food.id)) return false;
                if (rules.noSameMealOverall && usedMealsOverall.has(food.id)) return false;

                return true;
            });

            // Fallback: if no candidates, allow any 1-day meal
            if (candidates.length === 0) candidates = foods.filter(f => f.duration === 1);
            if (candidates.length === 0) return plan; // Safety catch if completely empty

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

/* ───────────── UI COMPONENTS ───────────── */

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

    // Dynamic foods state initialized from cookie or default fallback
    const [foods, setFoods] = useState<Food[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = getCookie('saved_foods');
            if (saved) {
                try { return JSON.parse(saved); } catch (e) { console.error(e); }
            }
        }
        return DEFAULT_FOODS;
    });

    // Local raw text state for the Textarea input
    const [rawJson, setRawJson] = useState(() => JSON.stringify(foods, null, 2));
    const [jsonError, setJsonError] = useState<string | null>(null);

    const [rules, setRules] = useState<Rules>({
        noSameNonRepeatableConsecutive: true,
        noSameMealPerWeek: true,
        noSameMealOverall: true,
    });

    const plan = useMemo(() => generatePlan(foods, Number(weeks), rules, twoDayStarts), [foods, weeks, rules, twoDayStarts, regenKey]);

    const groceryList = useMemo(() => {
        const map = new Map<string, number>();
        plan.flat().forEach((meal) => meal?.food.groceries.forEach((item) => map.set(item, (map.get(item) ?? 0) + 1)));
        return Array.from(map.entries());
    }, [plan]);

    // Handle updates in the textarea box
    const handleJsonChange = (val: string) => {
        setRawJson(val);
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
                setFoods(parsed);
                setCookie('saved_foods', JSON.stringify(parsed));
                setJsonError(null);
            } else {
                setJsonError('JSON must be a valid array of food objects.');
            }
        } catch (e: any) {
            setJsonError(`Invalid JSON format: ${e.message}`);
        }
    };

    return (
        <Flex direction="column" gap="lg" p="md">
            <Text size="lg" fw={700} c="gray.3">Weekly Meal Planner</Text>

            <Stack spacing="sm">
                <Select label="Weeks to plan" value={weeks} onChange={(v) => v && setWeeks(v)} data={['1','2','3','4']} />

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

            <Divider my="md" />

            {/* ───────────── EDITABLE FOOD DATA LIST ───────────── */}
            <Box>
                <Group position="apart" mb="xs">
                    <Text fw={600} c="gray.3">Database Settings (Editable Foods List)</Text>
                    {jsonError && <Badge color="red" variant="filled">Syntax Error</Badge>}
                </Group>
                <Text size="xs" c="dimmed" mb="sm">
                    Modify the database structure below. Changes apply instantly and save to cookies. Ensure you maintain correct object formatting.
                </Text>
                <Textarea
                    autosize
                    minRows={10}
                    maxRows={25}
                    styles={{ input: { fontFamily: 'monospace', fontSize: '12px' } }}
                    value={rawJson}
                    onChange={(e) => handleJsonChange(e.currentTarget.value)}
                    error={jsonError}
                />
            </Box>
        </Flex>
    );
}
