import React, { useState, useEffect, useRef } from 'react';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { MessageInput } from './components/MessageInput';
import { QuickPrompts } from './components/QuickPrompts';
import { TypingIndicator } from './components/TypingIndicator';
import { ErrorMessage } from './components/ErrorMessage';
import type { ChatMessage as ChatMessageType, AvailableSlot } from './types';
import { sendChatMessage, confirmSlotBooking } from './services/api';

function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "Hi! I'm your BookMyChair booking assistant. I can help you book an appointment in seconds. Try saying: 'haircut kal shaam ko' or 'facial tomorrow'.",
      timestamp: formatCurrentTime(),
      responseType: 'initial',
    },
  ]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Handle user sending free text or selecting a prompt chip
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setErrorMessage(null);

    const userMessageId = `user-${Date.now()}`;
    const newMessages: ChatMessageType[] = [
      ...messages,
      {
        id: userMessageId,
        sender: 'user',
        text: text.trim(),
        timestamp: formatCurrentTime(),
      },
    ];

    setMessages(newMessages);
    setIsProcessing(true);

    try {
      const response = await sendChatMessage(text);

      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMsg: ChatMessageType = {
        id: assistantMessageId,
        sender: 'assistant',
        text: response.message,
        timestamp: formatCurrentTime(),
        responseType: response.type,
      };

      if (response.type === 'slots') {
        assistantMsg.slots = response.slots;
        assistantMsg.serviceId = response.serviceId;
        assistantMsg.serviceName = response.serviceName;
      } else if (response.type === 'confirmed') {
        assistantMsg.booking = response.booking;
      }

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('Something went wrong while connecting. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle user tapping an available slot
  const handleSelectSlot = async (slot: AvailableSlot, parentMessageId: string) => {
    if (isProcessing) return;

    setErrorMessage(null);

    // Find service details from the message that presented the slots
    const sourceMessage = messages.find((m) => m.id === parentMessageId);
    const serviceId = sourceMessage?.serviceId || 'srv-haircut-01';
    const serviceName = sourceMessage?.serviceName || 'Haircut';

    // Mark slot as selected in the original message to avoid re-tapping
    setMessages((prev) =>
      prev.map((m) =>
        m.id === parentMessageId ? { ...m, isSlotSelected: true } : m
      )
    );

    // Add user selection bubble
    const userSelectMsg: ChatMessageType = {
      id: `user-slot-${Date.now()}`,
      sender: 'user',
      text: `Book ${slot.startIST} with ${slot.stylistName}`,
      timestamp: formatCurrentTime(),
    };

    setMessages((prev) => [...prev, userSelectMsg]);
    setIsProcessing(true);

    try {
      const bookingResult = await confirmSlotBooking({
        slot,
        serviceId,
        serviceName,
        customerName: 'Arghyarupa Mishra',
        phone: '9876543210',
      });

      const confirmMsg: ChatMessageType = {
        id: `assistant-confirm-${Date.now()}`,
        sender: 'assistant',
        text: bookingResult.message,
        timestamp: formatCurrentTime(),
        responseType: 'confirmed',
        booking: bookingResult.booking,
      };

      setMessages((prev) => [...prev, confirmMsg]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'That slot was just taken. Please choose another available slot.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-layout">
      <div className="chat-container">
        {/* Header */}
        <ChatHeader />

        {/* Error Alert Banner if any */}
        {errorMessage && (
          <ErrorMessage
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        {/* Chat Messages Scrollable Feed */}
        <main className="chat-body" role="log" aria-live="polite">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onSelectSlot={handleSelectSlot}
              disabled={isProcessing}
            />
          ))}

          {isProcessing && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </main>

        {/* Footer Area: Quick Prompts + Message Input */}
        <footer className="chat-footer">
          <QuickPrompts
            onSelectPrompt={handleSendMessage}
            disabled={isProcessing}
          />
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isProcessing}
            placeholder="Book a haircut tomorrow evening..."
          />
        </footer>
      </div>
    </div>
  );
};

export default App;
