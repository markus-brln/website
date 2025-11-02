import { Flex, Button, Textarea, Text, MediaQuery, Box, Divider, Group } from '@mantine/core';
import { Prism } from '@mantine/prism';
import { useCallback, useState } from 'react';
import GitHubProfile from './GitHubProfile';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [responseText, setResponseText] = useState('');
  const [finalStats, setFinalStats] = useState('');
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const onClickSendRequest = useCallback(() => {
    const url = 'https://bauerlein.dev/chat/api/generate';
    const data = {
      model: 'deepseek-r1:1.5b',
      prompt: prompt,
      stream: true
    };

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(response => response.body)
      .then(body => {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let result = '';
        let stats = '';

        reader.read().then(function processText({ done, value }) {
          if (done) {
            setResponseText(result);
            setFinalStats(stats);
            setIsButtonPressed(false);
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          lines.forEach(line => {
            if (line) {
              const jsonLine = JSON.parse(line);
              if (jsonLine.response) {
                result += jsonLine.response;
                setResponseText(result);
              }
              if (jsonLine.done) {
                stats = Object.entries(jsonLine)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('\n');
                setFinalStats(stats);
              }
            }
          });

          reader.read().then(processText);
        });
      });
  }, [prompt]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setIsButtonPressed(true);
      onClickSendRequest();
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      setIsButtonPressed(false);
    }
  };

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }} // stack on mobile, side-by-side on desktop
      align="flex-start"
      justify="space-between"
      gap="xl"
      style={{ width: '100%', padding: '1rem' }}
    >
      {/* LEFT COLUMN — Chatbot UI */}
      <Box style={{ flex: 2, minWidth: 0 }}>
        <Text style={{ color: 'white', width: '100%' }}>
          Self-hosted AI chatbot using DeepSeek R1 1.5B model
        </Text>

        <Textarea
          placeholder="Enter your prompt here"
          value={prompt}
          onChange={(event) => setPrompt(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          style={{ width: '100%', marginTop: '1rem' }}
          autosize
        />

        <Button
          onClick={onClickSendRequest}
          style={{
            color: 'white',
            width: '100%',
            marginTop: '1rem',
            backgroundColor: isButtonPressed ? '#0053ba' : ''
          }}
        >
          Send Request
        </Button>

        {responseText && (
          <Box
            style={{
              width: '100%',
              backgroundColor: '#25262b',
              padding: '1rem',
              marginTop: '1rem',
              borderRadius: '5px',
              color: 'gray',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '0.8rem'
            }}
          >
            {responseText}
          </Box>
        )}

        {finalStats && (
          <>
            <Text style={{ color: 'white', width: '100%', marginTop: '1rem' }}>
              Final Stats
            </Text>
            <MediaQuery smallerThan="sm" styles={{ fontSize: '0.6rem' }}>
              <Prism language="bash" style={{ width: '100%', wordBreak: 'break-word' }}>
                {finalStats}
              </Prism>
            </MediaQuery>
          </>
        )}
      </Box>

      {/* Divider between sections */}
      <Divider orientation="vertical" visibleFrom="md" />

      {/* RIGHT COLUMN — GitHub Profile */}
      <Box style={{ flex: 1, minWidth: '300px', maxWidth: '400px' }}>
        <GitHubProfile username="markus-brln" />
      </Box>
    </Flex>
  );
}
