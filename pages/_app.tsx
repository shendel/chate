import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react'
//Disable Inter font - need VPN for me for - uncoment on prod
/*
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
*/

function App({ Component, pageProps }: AppProps<{}>) {
  const [ isLoading, setIsLoading ] = useState(false)
  const [ isLoaded, setIsLoaded ] = useState(false)
  const [ isError, setIsError ] = useState(false)
  const [ appSettings, setAppSettings ] = useState({})
  
  const handleLoadSettings = () => {
    const response = fetch('/settings.json')
      .then((response) => {
        return response.text()
      })
      .then((text) => {
        return JSON.parse(text)
      })
      .then((json) => {
        setAppSettings(json)
        setIsLoaded(true)
        setIsLoading(false)
      })
      .catch((err) => {
        console.log('Fail load app settings. Use default', err)
        setIsError(true)
        setIsLoaded(true)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    if (!isLoaded && !isLoading) {
      setIsLoading(true)
      handleLoadSettings()
    }
  }, [ isLoaded, isLoading ])

  if (isLoading) {
    return (
      <main>
        <div>LOADING</div>
      </main>
    )
  }
  if (isLoaded && !isLoading) {
    return (
      <main>
        <Component {...pageProps} appSettings={appSettings} />
      </main>
    )
  }
}

export default appWithTranslation(App);
