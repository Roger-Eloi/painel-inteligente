# Painel Inteligente Lovable 
<img width="1902" height="946" alt="image" src="https://github.com/user-attachments/assets/c5b746ef-324b-43fd-96e1-5cb5e58ba8ac" />

## Página após os dados serem carregados
<img width="1891" height="947" alt="image" src="https://github.com/user-attachments/assets/5e1c9ec5-de6e-4795-b496-1945e5b80453" />



Painel Inteligente desenvolvido com **Lovable** e integração ao **n8n**, focado na análise avançada de dados e automação para equipes de marketing, produto e negócios.  
[🔗 Acessar o painel](https://painel-inteligente.lovable.app/?utm_source=lovable-editor)


## 🎯 Resumo

O projeto oferece um painel dinâmico para visualização, processamento automatizado e análise de dados de aplicativos, centralizando informações essenciais através de agentes inteligentes integrados via n8n. Permite avaliação de performance, engajamento, satisfação e aquisição de usuários em linguagem natural com análise por categoria.

---

## 💡 O que faz

- Centraliza dashboards e relatórios inteligentes para apps.
- Automatiza o encaminhamento de dados para agentes especializados de Análise, Ativação, Engajamento, Satisfação e Keywords.
- Gera métricas e insights acionáveis para tomada de decisão por áreas de produto, marketing e negócios.

---

## 📦 Requisitos e Dependências

- Conta n8n (servidor cloud) para receber as requisições
- Permissões de autenticação básicas configuradas para o Webhook (lovable -> n8n)

---

## ⚡ Configuração no n8n

### 1. Configure o Webhook
  - 1.1 configure o path do webhook para receber dados do painel Lovable. path: `projeto-1-lovable-painel-inteligente`  
  
  - 1.2 Crie uma credencial básica com
      - username: "produto.rankmyapp.com.br"
      - password: "Mudar123"
### 2. Configure o Modelo OpenIA
  - Criar uma credencial e inserir sua chave no campo `API KEY`  
---

## Decisões técnicas tomadas

- Optei por utilizar a orquestração de tool agents para maior organização do fluxo de agentes
- Transformei os dados json em string para que o lovable enviasse ao n8n, para tratar esses dados
- Após todas as análises dos agente das categorias, passei todos os dados para um agente resume os dados de maneira inteligente
- Não processar arquivos repetidos no painel
- Filtros interativos para cada tipo de seção

---

## Desafios encontrados e como foram resolvidos

- Tive dificuldade em tratar os dados brutos vindo do lovable, mas encontrei uma solução que foi reduzir a quantidade de palavras repetidas como por exemplo: "maxInstals", "createdAt", etc. assim reduzindo a quantidade de informações desnecessárias que serão enviadas ao prompt do agente que fará a analise desses dados.

---

## 🚀 Melhorias futuras
- Trasformar os dados json recebidos e inseri-los em um banco de dados relacional para os agentes conseguirem ler e interpretar os dados com maior rapidez.
- Criar uma chave única por dia para cada cliente, na qual registrará os dados json em um banco de dados relacional com esse id da chave e para futuras consultas nos dados não necessitar que envie todos os arquivos json novamente, com duração de expiração de 2h ou a cada novos arquivos sendo identificados no painel, assim deletando os dados anteriores do banco e registrando novos dados para os agentes passarem a utilizar nas análises.
- Exportação completa de todo o painel para PDF
- Cards abaixo dos gráficos com informações de insights gerados pela IA automaticamente
---

[🔗 Acessar o painel](https://painel-inteligente.lovable.app/?utm_source=lovable-editor)
