import React, { useState, useEffect, useRef } from 'react';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { MessageInput } from './components/MessageInput';
import { QuickPrompts } from './components/QuickPrompts';
import { TypingIndicator } from './components/TypingIndicator';
import { ErrorMessage } from './components/ErrorMessage';
import type { ChatMessage as ChatMessageType, AvailableSlot } from './types';
import {
  sendChatMessage,
  confirmSlotBooking,
  BookingConflictError,
  BackendOfflineError,
} from './services/api';
import { DEMO_CUSTOMER } from './constants/services';

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

  // Handle user sending free text or selecting a prompt chip directly to POST /api/chat
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
      // Call REAL backend POST /api/chat
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
        assistantMsg.service = response.service;
        assistantMsg.date = response.date;
      }

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      console.error('Chat error:', err);
      if (err instanceof BackendOfflineError) {
        setErrorMessage('Booking service is temporarily unavailable. Please try again.');
      } else {
        const errorText =
          err instanceof Error
            ? err.message
            : 'Booking service is temporarily unavailable. Please try again.';
        setErrorMessage(errorText);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle customer selecting a real availability slot -> POST /api/bookings
  const handleSelectSlot = async (slot: AvailableSlot, parentMessageId: string) => {
    if (isProcessing) return;

    setErrorMessage(null);

    const sourceMessage = messages.find((m) => m.id === parentMessageId);
    const serviceId = sourceMessage?.serviceId || '';
    const serviceName = sourceMessage?.service || 'Haircut';

    // Mark slot as temporarily selected in parent message
    setMessages((prev) =>
      prev.map((m) =>
        m.id === parentMessageId ? { ...m, isSlotSelected: true } : m
      )
    );

    // Display user selection bubble
    const userSelectMsgId = `user-slot-${Date.now()}`;
    const userSelectMsg: ChatMessageType = {
      id: userSelectMsgId,
      sender: 'user',
      text: `Book ${slot.startIST} with ${slot.stylistName}`,
      timestamp: formatCurrentTime(),
    };

    setMessages((prev) => [...prev, userSelectMsg]);
    setIsProcessing(true);

    try {
      // Call REAL POST /api/bookings via api service
      const bookingResult = await confirmSlotBooking({
        slot,
        serviceId,
        serviceName,
        customerName: DEMO_CUSTOMER.name,
        phone: DEMO_CUSTOMER.phone,
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
      console.error('Booking confirmation error:', err);

      // Remove the user's booking bubble since booking was not accepted
      setMessages((prev) => prev.filter((m) => m.id !== userSelectMsgId));

      if (
        err instanceof BookingConflictError ||
        (err instanceof Error && err.message.toLowerCase().includes('taken'))
      ) {
        // Handle 409 conflict: show friendly warning & remove unavailable slot from options
        setErrorMessage('That slot was just taken. Please choose another available slot.');

        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === parentMessageId && m.slots) {
              const remainingSlots = m.slots.filter(
                (s) => !(s.start === slot.start && s.stylistId === slot.stylistId)
              );
              return {
                ...m,
                slots: remainingSlots,
                isSlotSelected: false,
              };
            }
            return m;
          })
        );
      } else if (err instanceof BackendOfflineError) {
        setErrorMessage('Booking service is temporarily unavailable. Please try again.');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === parentMessageId ? { ...m, isSlotSelected: false } : m
          )
        );
      } else {
        const errorText =
          err instanceof Error
            ? err.message
            : 'Booking service is temporarily unavailable. Please try again.';
        setErrorMessage(errorText);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === parentMessageId ? { ...m, isSlotSelected: false } : m
          )
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-layout">
      <div className="chat-container">
        {/* Header */}
        <ChatHeader />

        {/* Error Alert Banner */}
        {errorMessage && (
          <ErrorMessage
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        {/* Chat Messages Feed */}
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

        {/* Footer: Quick Prompts & Message Input */}
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
