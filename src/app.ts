import { ReactNode } from 'react';

import './app.scss';

interface AppProps {
  children?: ReactNode;
}

const App = ({ children }: AppProps) => {
  return children as ReactNode;
};

export default App;
