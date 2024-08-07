import React, { createContext, useEffect, useState } from 'react';
import stompClient from './websocketClient';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    stompClient.onConnect = () => {
      stompClient.subscribe('/topic/records', (message) => {
        const updatedRecord = JSON.parse(message.body);
        setRecords((prevRecords) => {
          const index = prevRecords.findIndex((record) => record.id === updatedRecord.id);
          if (index > -1) {
            return [...prevRecords.slice(0, index), updatedRecord, ...prevRecords.slice(index + 1)];
          } else {
            return [...prevRecords, updatedRecord];
          }
        });
      });
    };

    stompClient.activate();
    return () => stompClient.deactivate();
  }, []);

  return (
    <WebSocketContext.Provider value={{ records }}>
      {children}
    </WebSocketContext.Provider>
  );
};
