export const saveChatMessage = async (
    userId: string,
    message: string,
    sender: 'user' | 'bot'
  ) => {
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message, sender }),
    });
  };
  
  export const fetchChatHistory = async (userId: string) => {
    const res = await fetch(`/api/chat?userId=${userId}`);
    const data = await res.json();
  
    if (data.chats) {
      return data.chats.map((chat: any) => ({
        sender: chat.sender,
        text: chat.message,
      }));
    }
    return [];
  };
  
  export const createUserIfNotExists = async (
    id: string,
    fullName: string,
    email: string,
    user: any
  ) => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, fullName, email, user }),
    });
  };
  