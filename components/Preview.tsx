import { useCodelessStore } from '@/stores/codeless'
import { Stack } from '@mui/material'
import axios from 'axios'
import { FC, useCallback, useEffect, useRef } from 'react'

export const Preview: FC = () => {
  const code = useCodelessStore((state) => state.code)
  const setCode = useCodelessStore((state) => state.setCode)

  const id = useCodelessStore((state) => state.id)

  const isLoading = useCodelessStore((state) => state.isLoading)

  const setIsSaving = useCodelessStore((state) => state.setIsSaving)

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const setSnippet = useCodelessStore((state) => state.setSnippet)

  const snippetIsEnabled = useCodelessStore((state) => state.snippetIsEnabled)
  const setSnippetIsEnabled = useCodelessStore(
    (state) => state.setSnippetIsEnabled
  )

  const snippetOutput = useCodelessStore((state) => state.snippetOutput)
  const setSnippetOutput = useCodelessStore((state) => state.setSnippetOutput)

  const setText = useCodelessStore((state) => state.setText)

  const handleCodeUpdate = async (code: string) => {
    setIsSaving(true)
    setSnippetIsEnabled(false)
    setSnippetOutput('')
    setText('')

    await axios({
      method: 'POST',
      url: '/api/project/updateProject',
      data: {
        id,
        code,
      },
    })

    setCode(code)
    setIsSaving(false)
  }

  useEffect(() => {
    if (!iframeRef.current || isLoading) {
      return
    }

    iframeRef.current.contentWindow?.document.open()
    iframeRef.current.contentWindow?.document.write(
      code +
        `
          <div id="codeless-script-injection">
            <style type="text/css">
              #borderOverlay {
                background-color: red;
                opacity: 0.25;
              }
          
              #borderOverlay.clicked {
                background-color: blue;
              }
            </style>
            <div
              id="borderOverlay"
              style="
                cursor: default !important;
                position: fixed;
                pointer-events: none;
                display: none;
              "
            ></div>
          
            <script type="text/javascript">
              document.addEventListener("DOMContentLoaded", () => {
                let isClicked = false;
                let isEnabled = false;
          
                window.addEventListener("message", function (event) {
                  isEnabled = event.data;
                });
          
                const borderOverlay = document.getElementById("borderOverlay");
          
                document.body.addEventListener("scroll", function (e) {
                  isClicked = false;
                  borderOverlay.style.display = "none";
                  e.target.classList.remove("codelessScriptSelected");
                  window.parent.postMessage("", "${process.env.NEXT_PUBLIC_HOST}");
                });
          
                document.body.addEventListener("mouseover", function (e) {
                  if (!isEnabled) return;
                  if (isClicked) return;
          
                  // Avoid targeting the borderOverlay itself or the html and body elements
                  if (
                    e.target === borderOverlay ||
                    e.target.tagName === "HTML" ||
                    e.target.tagName === "BODY"
                  ) {
                    return;
                  }
          
                  const rect = e.target.getBoundingClientRect();
          
                  // Sometimes elements might have zero width or height. We can choose to ignore those.
                  if (rect.width === 0 || rect.height === 0) {
                    borderOverlay.style.display = "none";
                    return;
                  }
          
                  borderOverlay.style.top = rect.top + "px";
                  borderOverlay.style.left = rect.left + "px";
                  borderOverlay.style.width = rect.width + "px";
                  borderOverlay.style.height = rect.height + "px";
                  borderOverlay.style.display = "block";
                  borderOverlay.classList.remove("clicked");
                });
          
                document.body.addEventListener("mouseout", function (e) {
                  if (!isEnabled) return;
                  if (isClicked) return;
          
                  if (
                    e.target === borderOverlay ||
                    e.target.tagName === "HTML" ||
                    e.target.tagName === "BODY"
                  ) {
                    return;
                  }
                  borderOverlay.style.display = "none";
                });
          
                document.body.addEventListener("mousedown", function (e) {
                  if (!isEnabled) return;
                  if (isClicked) {
                    isClicked = false;
                    borderOverlay.style.display = "none";
                    e.target.classList.remove("codelessScriptSelected");
                    window.parent.postMessage("", "${process.env.NEXT_PUBLIC_HOST}");
                    return;
                  }
          
                  // Avoid targeting the borderOverlay itself or the html and body elements
                  if (
                    e.target === borderOverlay ||
                    e.target.tagName === "HTML" ||
                    e.target.tagName === "BODY"
                  ) {
                    return;
                  }
          
                  const rect = e.target.getBoundingClientRect();
          
                  // Sometimes elements might have zero width or height. We can choose to ignore those.
                  if (rect.width === 0 || rect.height === 0) {
                    borderOverlay.style.display = "none";
                    return;
                  }
          
                  borderOverlay.style.top = window.scrollY + rect.top + "px";
                  borderOverlay.style.left = window.scrollX + rect.left + "px";
                  borderOverlay.style.width = rect.width + "px";
                  borderOverlay.style.height = rect.height + "px";
                  borderOverlay.style.display = "block";
                  borderOverlay.classList.add("clicked");
          
                  isClicked = true;
                  e.target.classList.add("codelessScriptSelected");
          
                  window.parent.postMessage(e.target.outerHTML, "${process.env.NEXT_PUBLIC_HOST}");
                });
              });
            </script>
          </div>      
        `
    )
    iframeRef.current.contentWindow?.document.close()
  }, [code, iframeRef, isLoading])

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(snippetIsEnabled)
  }, [iframeRef, snippetIsEnabled])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== process.env.NEXT_PUBLIC_HOST) {
        return
      }
      setSnippet(event.data)
    }

    window.addEventListener('message', handleMessage, false)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [setSnippet])

  useEffect(() => {
    if (!snippetOutput) {
      return
    }

    const element = iframeRef.current?.contentWindow?.document.querySelector(
      '.codelessScriptSelected'
    )
    if (element) {
      element.outerHTML = snippetOutput

      const elements =
        iframeRef.current?.contentWindow?.document.querySelectorAll(
          '.codelessScriptSelected'
        )
      if (elements) {
        for (let i = 0; i < elements.length; i++) {
          elements[i].classList.remove('codelessScriptSelected')
        }
      }
      const script = iframeRef.current?.contentWindow?.document.getElementById(
        'codeless-script-injection'
      )
      if (script) {
        script.remove()
      }

      handleCodeUpdate(
        iframeRef.current?.contentDocument?.documentElement.outerHTML!
      )
    }
  }, [snippetOutput])

  if (!id) {
    return null
  }

  return (
    <Stack
      direction="row"
      height="100%"
      sx={{
        paddingBottom: '20px',
      }}
    >
      <Stack height="100%" width="80vw">
        <iframe
          frameBorder={0}
          ref={iframeRef}
          style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            border: '1px #000 solid',
            height: '100%',
            overflow: 'hidden',
          }}
        />
      </Stack>
    </Stack>
  )
}
