import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import { WebSocketProvider } from './WebSocketContext';
import Dashboard from './Dashboard';

function App() {
  return (
    <ApolloProvider client={client}>
      <WebSocketProvider>
        <Dashboard />
      </WebSocketProvider>
    </ApolloProvider>
  );
}

export default App;
