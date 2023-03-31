import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
//Disable Inter font - need VPN for me for - uncoment on prod
/*
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
*/

function App({ Component, pageProps }: AppProps<{}>) {
  return (
    <main>
      <Component {...pageProps} />
    </main>
  );
  /*
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
  */
}

export default appWithTranslation(App);
