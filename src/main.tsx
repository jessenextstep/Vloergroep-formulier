import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { brandFavicon } from './lib/brandAssets.ts';
import './index.css';

document.title = 'VloerGroep Groeiscan';

const setHeadLink = (rel: string) => {
  let link = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.type = 'image/png';
  link.href = brandFavicon;
};

setHeadLink('icon');
setHeadLink('apple-touch-icon');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
