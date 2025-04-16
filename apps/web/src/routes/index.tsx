import { createFileRoute, Link } from '@tanstack/react-router';
import logo from '../logo.svg';
import '../App.css';
import { Button } from '@bbook/ui';
import { HelloWorld } from '@bbook/app/components/HelloWorld';
import { useTranslation } from '@bbook/i18n';
import { TestCounter } from '@bbook/app/components/TestCounter';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const { t } = useTranslation();
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        <Button
          size="$6"
          theme="green"
          marginBottom="$4"
          onPress={() => alert('Tamagui works!')}
        >
          Tamagui Button from UI Package
        </Button>
        <HelloWorld />
        <p>{t('welcome')}</p>
        <TestCounter />
        <Link to="/second">GO SECOND</Link>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Reacting
        </a>
        <a
          className="App-link"
          href="https://tanstack.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn TanStack
        </a>
      </header>
    </div>
  );
}
