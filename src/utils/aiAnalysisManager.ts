interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class AIAnalysisManager {
  private activeRequest: Promise<string> | null = null;
  private initialAnalysis: string | null = null;
  private conversationHistory: ChatMessage[] = [];
  private rawDataContext: string[] = [];
  
  // ANÁLISE INICIAL (única vez, com PROMPT_USER vazio)
  async fetchInitialAnalysis(rawJsonStrings: string[]): Promise<string> {
    if (this.initialAnalysis) {
      return this.initialAnalysis; // Retornar cache
    }
    
    if (this.activeRequest) {
      return this.activeRequest; // Aguardar requisição em andamento
    }
    
    this.rawDataContext = rawJsonStrings;
    this.activeRequest = this.makeRequest(rawJsonStrings, "");
    
    try {
      const result = await this.activeRequest;
      this.initialAnalysis = result;
      
      // Adicionar ao histórico
      this.conversationHistory.push({
        role: 'assistant',
        content: result,
        timestamp: new Date()
      });
      
      return result;
    } finally {
      this.activeRequest = null;
    }
  }
  
  // CHAT (perguntas subsequentes, com PROMPT_USER preenchido)
  async sendChatMessage(userMessage: string): Promise<string> {
    // Adicionar mensagem do usuário
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });
    
    const response = await this.makeRequest(this.rawDataContext, userMessage);
    
    // Adicionar resposta ao histórico
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });
    
    return response;
  }
  
  private async makeRequest(rawJsonStrings: string[], promptUser: string): Promise<string> {
    const payload = {
      DADOS: rawJsonStrings,
      PROMPT_USER: promptUser
    };

    const username = "produto.rankmyapp.com.br";
    const password = "Mudar123";
    const credentials = btoa(`${username}:${password}`);

    const response = await fetch(
      "https://webhook.digital-ai.tech/webhook/projeto-1-lovable-painel-inteligente",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const text = result.RESPOSTA || result.teste || "";
    
    if (!text) {
      console.error("Resposta do N8N sem campo RESPOSTA ou teste:", result);
      throw new Error("Formato de resposta inválido do servidor");
    }
    
    return text;
  }
  
  // Getters
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
  
  hasInitialAnalysis(): boolean {
    return this.initialAnalysis !== null;
  }
  
  isLoading(): boolean {
    return this.activeRequest !== null;
  }
  
  // Reset para novos uploads
  reset() {
    this.activeRequest = null;
    this.initialAnalysis = null;
    this.conversationHistory = [];
    this.rawDataContext = [];
  }
}

export const aiAnalysisManager = new AIAnalysisManager();
