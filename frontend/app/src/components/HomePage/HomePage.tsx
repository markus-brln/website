import { Flex, Button, Textarea, Text, MediaQuery } from '@mantine/core';
import { useCallback, useState } from 'react';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [responseText, setResponseText] = useState('');
  const [finalStats, setFinalStats] = useState('');

  const onClickSendRequest = useCallback(() => {
    const url = 'https://bauerlein.dev/chat/api/generate';
    const data = {
      model: 'deepseek-r1:1.5b',
      prompt: prompt,
      stream: true
    };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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

  return (
    <Flex
      mih={50}
      bg="rgba(0, 0, 0, .1)"
      gap="sm"
      justify="center"
      align="center"
      direction="column"
      wrap="nowrap"
      style={{ width: '100%', padding: '1rem' }}
    >
      <Textarea
        placeholder="Enter your prompt here"
        value={prompt}
        onChange={(event) => setPrompt(event.currentTarget.value)}
        style={{ width: '100%' }}
        autosize
      />
      <Button onClick={onClickSendRequest} style={{ width: '100%' }}>Send Request</Button>
      <MediaQuery smallerThan="sm" styles={{ fontSize: '0.5rem' }}>
        <Text style={{ width: '100%', wordBreak: 'break-word' }}>{responseText}</Text>
      </MediaQuery>
      <MediaQuery smallerThan="sm" styles={{ fontSize: '0.5rem' }}>
        <Text style={{ width: '100%', wordBreak: 'break-word' }}>{finalStats}</Text>
      </MediaQuery>
    </Flex>
  );
}