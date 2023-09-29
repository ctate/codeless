/* eslint-disable react/no-unescaped-entities */

import { Button, Container, Drawer, Stack, Typography } from '@mui/material'
import { FC, useState } from 'react'
import { ExternalLink } from '../ExternalLink'
import { Lightbulb } from '@mui/icons-material'

export const Tips: FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: 'none',
          cursor: 'pointer',
          color: 'white',
          margin: 0,
          padding: 0,
          border: 'none',
        }}
      >
        <Stack alignItems="center" direction="row" gap={1}>
          <Lightbulb />
          <Typography variant="body2">Tips &amp; Tricks</Typography>
        </Stack>
      </button>
      <Drawer anchor="bottom" open={isOpen} onClose={() => setIsOpen(false)}>
        <Container maxWidth="md">
          <Stack px={2} py={4} gap={2}>
            <Typography variant="h3">Tips &amp; Tricks</Typography>
            <Typography variant="h6">1. It takes more than 1 prompt</Typography>

            <p>
              If you expect to just say make me a “landing page for my SaaS
              platform” and have it generate the perfect landing page you've
              envisioned in a single go, you'll be disappointed.
            </p>

            <p>
              Instead, just like traditional development, you've got to iterate.
              It usually takes me 10-20 prompts to get something I like. That's
              what makes Codeless great. You can keep shaping the results until
              it matches the image in your head.
            </p>

            <p>
              Example (in multiple prompts):{' '}
              <em>
                "Create a button". "Center it". "Give it rounder edges". "Give
                it a gradient background". "Make it say 'Explore Now'". "Add a
                heading and tagline above it that says something about exploring
                the world".
              </em>
            </p>

            <Typography variant="h6">2. It's ugly out-of-the box</Typography>

            <p>
              Besides some basic Tailwind, there's not a lot of styling. You'll
              need to tell it what colors you like, whether you want it to use a
              dark or light theme, if you want rounded corners, how rounded
              those corners should be, that you want all buttons to have a
              gradient, if you want the background to have an animated
              background and anything else you need to match your aesthetic.
            </p>

            <Typography variant="h6">3. It's slow</Typography>

            <p>
              Depending on what you're asking for, it can take a long time to
              get results back. With that in mind, it's often a good idea to add
              as many changes in each prompt to try to bundle the changes and
              get more done in less iterations.
            </p>

            <p>
              Example:{' '}
              <em>
                “Center the content. Make the heading text white, bigger and
                give it a text shadow. Give the button rounder edges. Change all
                text to use the ‘Lato' font family.”
              </em>
            </p>

            <p>
              Stay patient! In future updates, Codeless will get much faster but
              this should help for now.
            </p>

            <Typography variant="h6">
              4. It can make anything functional — if you ask for it
            </Typography>

            <p>
              Codeless can produce code that makes API calls, makes games
              playable, animates 3D objects, lets you draw on the screen and
              almost anything BUT you need to ask for it.
            </p>

            <p>
              If you ask it to recreate Pong, it'll likely return something that
              just looks like Pong with a black background and white
              paddles/ball. But if you ask it to “recreate Pong, enable user to
              use their mouse to control the left paddle only if the mouse
              pointer is locked, use AI to control the right paddle”; most
              likely it will make you a fully functional game of Pong. (Remember
              #1 tho: keep iterating if you don't get the results you want at
              first)
            </p>

            <Typography variant="h6">5. Need more help??</Typography>

            <p>
              Open an{' '}
              <ExternalLink href="https://github.com/ctate/codeless/issues">
                issue
              </ExternalLink>{' '}
              or start a{' '}
              <ExternalLink href="https://github.com/ctate/codeless/discussions">
                discussion
              </ExternalLink>{' '}
              on GitHub. You can also reach out on{' '}
              <ExternalLink href="https://x.com/CodelessAI">X</ExternalLink>.
            </p>

            <p>- Chris</p>

            <Button
              onClick={() => setIsOpen(false)}
              variant="contained"
              sx={{ backgroundColor: 'black' }}
            >
              Got it!
            </Button>
          </Stack>
        </Container>
      </Drawer>
    </>
  )
}
