import { AppShell, Navbar, Header, Button, MantineProvider, Group, Image, Text } from '@mantine/core';
import HomePage from '../HomePage/HomePage';

export default function App() {
  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      <AppShell
        padding="md"
        navbar={
          <Navbar width={{ base: 100 }} height={500} p="xs">
            <Button component="a" href="https://bauerlein.dev/video" target="_blank">
              Video
            </Button>
          </Navbar>
        }
        header={
          <Header height={60} p="xs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1a1a1a' }}>
            <Group>
              <Image src="/icon.svg" alt="Logo" width={40} height={40} />
              <Text size="xl" weight={1000} color="white">Bäuerlein</Text>
            </Group>
          </Header>
        }
        styles={(theme) => ({
          main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
        })}
      >
        <HomePage />
      </AppShell>
    </MantineProvider>
  );
}
